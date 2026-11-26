CREATE OR REPLACE FUNCTION public.prod_has_completed_sessions(p_delivery uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.prod_sessions WHERE delivery_id=p_delivery) AND NOT EXISTS(SELECT 1 FROM public.prod_sessions s LEFT JOIN public.prod_actuals a ON a.session_id=s.id WHERE s.delivery_id=p_delivery AND (s.ends_at>now() OR a.id IS NULL OR a.held IS DISTINCT FROM true));
$$;
REVOKE ALL ON FUNCTION public.prod_has_completed_sessions(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.prod_guard_actual_time() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE end_time timestamptz;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041);
 SELECT ends_at INTO end_time FROM public.prod_sessions WHERE id=NEW.session_id;
 IF NEW.held AND (end_time IS NULL OR end_time>now()) THEN RAISE EXCEPTION 'PROD_SESSION_NOT_ENDED' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.prod_guard_actual_time() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER prod_actual_time_guard BEFORE INSERT OR UPDATE ON public.prod_actuals FOR EACH ROW EXECUTE FUNCTION public.prod_guard_actual_time();

CREATE OR REPLACE FUNCTION public.prod_guard_billing() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(7311041);
 NEW.delivery_id:=OLD.delivery_id;
 IF NEW.billing_ready AND NOT public.prod_has_completed_sessions(OLD.delivery_id) THEN RAISE EXCEPTION 'PROD_BILLING_ACTUALS_REQUIRED' USING ERRCODE='23514'; END IF;
 IF NEW.billing_ready IS DISTINCT FROM OLD.billing_ready THEN NEW.checked_by:=auth.uid(); NEW.checked_at:=now(); ELSE NEW.checked_by:=OLD.checked_by; NEW.checked_at:=OLD.checked_at; END IF;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.prod_guard_billing() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.prod_auto_billing_ready() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE did uuid; old_did uuid; ready boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041);
 IF TG_TABLE_NAME='prod_sessions' THEN
  IF TG_OP<>'DELETE' THEN did:=NEW.delivery_id; END IF;
  IF TG_OP<>'INSERT' THEN old_did:=OLD.delivery_id; END IF;
 ELSE
  IF TG_OP<>'DELETE' THEN SELECT delivery_id INTO did FROM public.prod_sessions WHERE id=NEW.session_id; END IF;
  IF TG_OP<>'INSERT' THEN SELECT delivery_id INTO old_did FROM public.prod_sessions WHERE id=OLD.session_id; END IF;
 END IF;
 IF did IS NOT NULL THEN
  ready:=public.prod_has_completed_sessions(did);
  UPDATE public.prod_billing_readiness SET billing_ready=ready WHERE delivery_id=did AND billing_ready IS DISTINCT FROM ready;
 END IF;
 IF old_did IS NOT NULL AND old_did IS DISTINCT FROM did THEN
  ready:=public.prod_has_completed_sessions(old_did);
  UPDATE public.prod_billing_readiness SET billing_ready=ready WHERE delivery_id=old_did AND billing_ready IS DISTINCT FROM ready;
 END IF;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.prod_auto_billing_ready() FROM PUBLIC,anon,authenticated;
DROP TRIGGER prod_actuals_auto_billing ON public.prod_actuals;
CREATE TRIGGER prod_actuals_auto_billing AFTER INSERT OR UPDATE OR DELETE ON public.prod_actuals FOR EACH ROW EXECUTE FUNCTION public.prod_auto_billing_ready();
CREATE TRIGGER prod_sessions_auto_billing AFTER INSERT OR UPDATE OR DELETE ON public.prod_sessions FOR EACH ROW EXECUTE FUNCTION public.prod_auto_billing_ready();