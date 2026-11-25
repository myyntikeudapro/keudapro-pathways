ALTER TABLE public.prod_tasks ADD COLUMN IF NOT EXISTS due_manual boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.prod_recompute(_delivery uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d public.prod_deliveries; first_s timestamptz; last_s timestamptz; first_trainer uuid;
BEGIN
  SELECT * INTO d FROM public.prod_deliveries WHERE id=_delivery; IF NOT FOUND THEN RETURN; END IF;
  SELECT min(starts_at), max(ends_at) INTO first_s, last_s FROM public.prod_sessions WHERE delivery_id=_delivery;
  SELECT b.trainer_id INTO first_trainer FROM public.prod_sessions s JOIN public.prod_trainer_bookings b ON b.session_id=s.id AND b.status<>'peruttu' WHERE s.delivery_id=_delivery ORDER BY s.starts_at, b.created_at LIMIT 1;
  PERFORM set_config('prod.recompute','on',true);
  UPDATE public.prod_tasks t SET
    due_at = CASE WHEN t.due_manual THEN t.due_at ELSE CASE t.anchor WHEN 'created' THEN d.created_at WHEN 'first_session' THEN first_s ELSE last_s END + make_interval(days => t.offset_days) END,
    owner_id = CASE t.owner_role WHEN 'production' THEN d.production_owner_id WHEN 'sales' THEN d.sales_owner_id ELSE first_trainer END
  WHERE t.delivery_id=_delivery AND t.completed_at IS NULL;
  PERFORM set_config('prod.recompute','off',true);
END $$;
REVOKE EXECUTE ON FUNCTION public.prod_recompute(uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.prod_task_complete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE manual_change boolean;
BEGIN
  IF current_setting('prod.recompute', true) = 'on' THEN RETURN NEW; END IF;
  manual_change := NEW.due_at IS DISTINCT FROM OLD.due_at AND public.is_editor_or_admin(auth.uid());
  NEW.delivery_id := OLD.delivery_id; NEW.template_task_id := OLD.template_task_id; NEW.code := OLD.code; NEW.title := OLD.title; NEW.scope := OLD.scope;
  NEW.owner_role := OLD.owner_role; NEW.anchor := OLD.anchor; NEW.offset_days := OLD.offset_days; NEW.blocks_start := OLD.blocks_start;
  NEW.owner_id := OLD.owner_id; NEW.created_at := OLD.created_at;
  IF manual_change THEN NEW.due_manual := NEW.due_at IS NOT NULL;
  ELSE NEW.due_at := OLD.due_at; NEW.due_manual := OLD.due_manual; END IF;
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN NEW.completed_at := now(); NEW.completed_by := auth.uid();
  ELSIF NEW.completed_at IS NULL THEN NEW.completed_by := NULL;
  ELSE NEW.completed_at := OLD.completed_at; NEW.completed_by := OLD.completed_by; END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.prod_tasks_after_manual_reset() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('prod.recompute', true) IS DISTINCT FROM 'on' AND OLD.due_manual AND NOT NEW.due_manual THEN PERFORM public.prod_recompute(NEW.delivery_id); END IF;
  RETURN NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.prod_tasks_after_manual_reset() FROM public, anon, authenticated;
CREATE TRIGGER prod_tasks_manual_reset AFTER UPDATE ON public.prod_tasks FOR EACH ROW EXECUTE FUNCTION public.prod_tasks_after_manual_reset();

CREATE OR REPLACE FUNCTION public.prod_auto_billing_ready() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE did uuid;
BEGIN
  SELECT delivery_id INTO did FROM public.prod_sessions WHERE id = NEW.session_id;
  IF did IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.prod_sessions s LEFT JOIN public.prod_actuals a ON a.session_id = s.id WHERE s.delivery_id = did AND a.id IS NULL) THEN
    UPDATE public.prod_billing_readiness SET billing_ready = true WHERE delivery_id = did AND NOT billing_ready;
  END IF;
  RETURN NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.prod_auto_billing_ready() FROM public, anon, authenticated;
CREATE TRIGGER prod_actuals_auto_billing AFTER INSERT ON public.prod_actuals FOR EACH ROW EXECUTE FUNCTION public.prod_auto_billing_ready();