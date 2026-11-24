CREATE TABLE public.prod_templates (key text PRIMARY KEY, name text NOT NULL, description text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_template_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text REFERENCES public.prod_templates(key),
  scope text NOT NULL CHECK (scope IN ('general','specific')),
  code text NOT NULL UNIQUE, title text NOT NULL,
  owner_role text NOT NULL CHECK (owner_role IN ('production','sales','trainer')),
  anchor text NOT NULL CHECK (anchor IN ('created','first_session','last_session')),
  offset_days integer NOT NULL, blocks_start boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0,
  CHECK ((scope='general') = (template_key IS NULL))
);
CREATE TABLE public.prod_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.crm_orders(id),
  template_key text NOT NULL REFERENCES public.prod_templates(key),
  title text NOT NULL,
  production_status text NOT NULL DEFAULT 'suunnittelu' CHECK (production_status IN ('suunnittelu','käynnissä','päättynyt','peruttu')),
  production_owner_id uuid NOT NULL, sales_owner_id uuid NOT NULL,
  created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.prod_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE,
  seq integer NOT NULL, title text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, location text,
  created_at timestamptz NOT NULL DEFAULT now(), CHECK (ends_at > starts_at), UNIQUE (delivery_id, seq)
);
CREATE TABLE public.prod_trainer_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.prod_sessions(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL, status text NOT NULL DEFAULT 'varattu' CHECK (status IN ('varattu','vahvistettu','peruttu')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (session_id, trainer_id)
);
CREATE TABLE public.prod_resources (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, kind text NOT NULL CHECK (kind IN ('tila','laite','materiaali','muu')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_resource_bookings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES public.prod_sessions(id) ON DELETE CASCADE, resource_id uuid NOT NULL REFERENCES public.prod_resources(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (session_id, resource_id));
CREATE TABLE public.prod_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE,
  template_task_id uuid REFERENCES public.prod_template_tasks(id),
  code text NOT NULL, title text NOT NULL, scope text NOT NULL, owner_role text NOT NULL, anchor text NOT NULL, offset_days integer NOT NULL,
  blocks_start boolean NOT NULL, owner_id uuid, due_at timestamptz,
  completed_at timestamptz, completed_by uuid, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (delivery_id, code)
);
CREATE TABLE public.prod_blockers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE, description text NOT NULL, owner_id uuid NOT NULL, resolved_at timestamptz, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_quality_issues (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE, session_id uuid REFERENCES public.prod_sessions(id), severity text NOT NULL CHECK (severity IN ('matala','keskitaso','korkea')), description text NOT NULL, owner_id uuid NOT NULL, corrective_action text, closed_at timestamptz, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_participants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE, name text NOT NULL, email text,
  completion_status text NOT NULL DEFAULT 'ilmoittautunut' CHECK (completion_status IN ('ilmoittautunut','kesken','suoritettu','keskeytynyt')),
  certificate_status text NOT NULL DEFAULT 'ei_aloitettu' CHECK (certificate_status IN ('ei_aloitettu','valmisteilla','myönnetty','ei_oikeutta')),
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_message_drafts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE, audience text NOT NULL, subject text NOT NULL, body text NOT NULL,
  created_by uuid, approved_by uuid, approved_at timestamptz,
  send_state text NOT NULL DEFAULT 'luonnos' CHECK (send_state IN ('luonnos','hyväksytty_ei_lähetetty')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_actuals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL UNIQUE REFERENCES public.prod_sessions(id) ON DELETE CASCADE, held boolean NOT NULL, hours numeric NOT NULL CHECK (hours >= 0), attendees integer NOT NULL CHECK (attendees >= 0), note text, recorded_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_feedback (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES public.prod_deliveries(id) ON DELETE CASCADE, session_id uuid REFERENCES public.prod_sessions(id), score integer NOT NULL CHECK (score BETWEEN 1 AND 5), comment text, recorded_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.prod_billing_readiness (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL UNIQUE REFERENCES public.prod_deliveries(id) ON DELETE CASCADE,
  billing_ready boolean NOT NULL DEFAULT false, checked_by uuid, checked_at timestamptz,
  payment_status text NOT NULL DEFAULT 'ei_laskutettu' CHECK (payment_status IN ('ei_laskutettu','laskutettu','maksettu')), note text, updated_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.prod_templates, public.prod_template_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prod_sessions, public.prod_trainer_bookings, public.prod_resources, public.prod_resource_bookings, public.prod_blockers, public.prod_quality_issues, public.prod_participants, public.prod_message_drafts, public.prod_actuals, public.prod_feedback TO authenticated;
GRANT SELECT, UPDATE ON public.prod_deliveries, public.prod_tasks, public.prod_billing_readiness TO authenticated;
GRANT ALL ON public.prod_templates, public.prod_template_tasks, public.prod_deliveries, public.prod_sessions, public.prod_trainer_bookings, public.prod_resources, public.prod_resource_bookings, public.prod_tasks, public.prod_blockers, public.prod_quality_issues, public.prod_participants, public.prod_message_drafts, public.prod_actuals, public.prod_feedback, public.prod_billing_readiness TO service_role;

ALTER TABLE public.prod_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_trainer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prod_billing_readiness ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.prod_is_session_trainer(_session uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user,'trainer') AND EXISTS (SELECT 1 FROM public.prod_trainer_bookings WHERE session_id=_session AND trainer_id=_user AND status<>'peruttu') $$;

CREATE POLICY "staff read templates" ON public.prod_templates FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff read template tasks" ON public.prod_template_tasks FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff deliveries" ON public.prod_deliveries FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff update deliveries" ON public.prod_deliveries FOR UPDATE TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff sessions" ON public.prod_sessions FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer own sessions" ON public.prod_sessions FOR SELECT TO authenticated USING (public.prod_is_session_trainer(id, auth.uid()));
CREATE POLICY "staff bookings" ON public.prod_trainer_bookings FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer own bookings" ON public.prod_trainer_bookings FOR SELECT TO authenticated USING (trainer_id = auth.uid() AND public.has_role(auth.uid(),'trainer'));
CREATE POLICY "staff resources" ON public.prod_resources FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff resource bookings" ON public.prod_resource_bookings FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff tasks" ON public.prod_tasks FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer own tasks" ON public.prod_tasks FOR SELECT TO authenticated USING (owner_id = auth.uid() AND public.has_role(auth.uid(),'trainer'));
CREATE POLICY "complete tasks" ON public.prod_tasks FOR UPDATE TO authenticated USING (public.is_editor_or_admin(auth.uid()) OR (owner_id = auth.uid() AND public.has_role(auth.uid(),'trainer'))) WITH CHECK (public.is_editor_or_admin(auth.uid()) OR (owner_id = auth.uid() AND public.has_role(auth.uid(),'trainer')));
CREATE POLICY "staff blockers" ON public.prod_blockers FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff quality" ON public.prod_quality_issues FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff participants" ON public.prod_participants FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff drafts" ON public.prod_message_drafts FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff actuals" ON public.prod_actuals FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer read own actuals" ON public.prod_actuals FOR SELECT TO authenticated USING (public.prod_is_session_trainer(session_id, auth.uid()));
CREATE POLICY "trainer record own actuals" ON public.prod_actuals FOR INSERT TO authenticated WITH CHECK (public.prod_is_session_trainer(session_id, auth.uid()) AND recorded_by = auth.uid());
CREATE POLICY "staff feedback" ON public.prod_feedback FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer record own feedback" ON public.prod_feedback FOR INSERT TO authenticated WITH CHECK (session_id IS NOT NULL AND public.prod_is_session_trainer(session_id, auth.uid()) AND recorded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.prod_sessions s WHERE s.id = session_id AND s.delivery_id = prod_feedback.delivery_id));
CREATE POLICY "staff billing" ON public.prod_billing_readiness FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff update billing" ON public.prod_billing_readiness FOR UPDATE TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE VIEW public.prod_trainer_sessions AS
  SELECT s.id AS session_id, s.seq, s.title AS session_title, s.starts_at, s.ends_at, s.location, d.title AS delivery_title, b.status AS booking_status
  FROM public.prod_trainer_bookings b JOIN public.prod_sessions s ON s.id=b.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id
  WHERE b.trainer_id = auth.uid() AND b.status <> 'peruttu' AND public.has_role(auth.uid(),'trainer');
REVOKE ALL ON public.prod_trainer_sessions FROM anon, public;
GRANT SELECT ON public.prod_trainer_sessions TO authenticated;

CREATE OR REPLACE FUNCTION public.prod_recompute(_delivery uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d public.prod_deliveries; first_s timestamptz; last_s timestamptz; first_trainer uuid;
BEGIN
  SELECT * INTO d FROM public.prod_deliveries WHERE id=_delivery; IF NOT FOUND THEN RETURN; END IF;
  SELECT min(starts_at), max(ends_at) INTO first_s, last_s FROM public.prod_sessions WHERE delivery_id=_delivery;
  SELECT b.trainer_id INTO first_trainer FROM public.prod_sessions s JOIN public.prod_trainer_bookings b ON b.session_id=s.id AND b.status<>'peruttu' WHERE s.delivery_id=_delivery ORDER BY s.starts_at, b.created_at LIMIT 1;
  PERFORM set_config('prod.recompute','on',true);
  UPDATE public.prod_tasks t SET
    due_at = CASE t.anchor WHEN 'created' THEN d.created_at WHEN 'first_session' THEN first_s ELSE last_s END + make_interval(days => t.offset_days),
    owner_id = CASE t.owner_role WHEN 'production' THEN d.production_owner_id WHEN 'sales' THEN d.sales_owner_id ELSE first_trainer END
  WHERE t.delivery_id=_delivery AND t.completed_at IS NULL;
  PERFORM set_config('prod.recompute','off',true);
END $$;
REVOKE EXECUTE ON FUNCTION public.prod_recompute(uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.prod_recompute_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE did uuid;
BEGIN
  IF TG_TABLE_NAME='prod_sessions' THEN did := CASE WHEN TG_OP='DELETE' THEN OLD.delivery_id ELSE NEW.delivery_id END;
  ELSE SELECT delivery_id INTO did FROM public.prod_sessions WHERE id = CASE WHEN TG_OP='DELETE' THEN OLD.session_id ELSE NEW.session_id END; END IF;
  PERFORM public.prod_recompute(did); RETURN NULL;
END $$;
CREATE TRIGGER prod_sessions_recompute AFTER INSERT OR UPDATE OR DELETE ON public.prod_sessions FOR EACH ROW EXECUTE FUNCTION public.prod_recompute_trigger();
CREATE TRIGGER prod_bookings_recompute AFTER INSERT OR UPDATE OR DELETE ON public.prod_trainer_bookings FOR EACH ROW EXECUTE FUNCTION public.prod_recompute_trigger();
CREATE OR REPLACE FUNCTION public.prod_delivery_owners_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.order_id IS DISTINCT FROM OLD.order_id OR NEW.template_key IS DISTINCT FROM OLD.template_key OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Toteutuksen tilausta, pohjaa tai luontiaikaa ei voi muuttaa'; END IF;
  IF NOT public.is_editor_or_admin(NEW.production_owner_id) OR NOT public.is_editor_or_admin(NEW.sales_owner_id) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  NEW.updated_at := now(); RETURN NEW;
END $$;
CREATE TRIGGER prod_delivery_guard BEFORE UPDATE ON public.prod_deliveries FOR EACH ROW EXECUTE FUNCTION public.prod_delivery_owners_changed();
CREATE OR REPLACE FUNCTION public.prod_delivery_after_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.production_owner_id IS DISTINCT FROM OLD.production_owner_id OR NEW.sales_owner_id IS DISTINCT FROM OLD.sales_owner_id THEN PERFORM public.prod_recompute(NEW.id); END IF; RETURN NULL; END $$;
CREATE TRIGGER prod_delivery_recompute AFTER UPDATE ON public.prod_deliveries FOR EACH ROW EXECUTE FUNCTION public.prod_delivery_after_update();

CREATE OR REPLACE FUNCTION public.prod_validate_booking() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NOT public.has_role(NEW.trainer_id,'trainer') AND NOT public.is_editor_or_admin(NEW.trainer_id) THEN RAISE EXCEPTION 'Varattavalla henkilöllä on oltava kouluttajan tai henkilöstön rooli'; END IF; RETURN NEW; END $$;
CREATE TRIGGER prod_booking_validate BEFORE INSERT OR UPDATE ON public.prod_trainer_bookings FOR EACH ROW EXECUTE FUNCTION public.prod_validate_booking();

CREATE OR REPLACE FUNCTION public.prod_task_complete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('prod.recompute', true) = 'on' THEN RETURN NEW; END IF;
  NEW.delivery_id := OLD.delivery_id; NEW.template_task_id := OLD.template_task_id; NEW.code := OLD.code; NEW.title := OLD.title; NEW.scope := OLD.scope;
  NEW.owner_role := OLD.owner_role; NEW.anchor := OLD.anchor; NEW.offset_days := OLD.offset_days; NEW.blocks_start := OLD.blocks_start;
  NEW.owner_id := OLD.owner_id; NEW.due_at := OLD.due_at; NEW.created_at := OLD.created_at;
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN NEW.completed_at := now(); NEW.completed_by := auth.uid();
  ELSIF NEW.completed_at IS NULL THEN NEW.completed_by := NULL;
  ELSE NEW.completed_at := OLD.completed_at; NEW.completed_by := OLD.completed_by; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER prod_task_guard BEFORE UPDATE ON public.prod_tasks FOR EACH ROW EXECUTE FUNCTION public.prod_task_complete_guard();

CREATE OR REPLACE FUNCTION public.prod_guard_draft() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP='INSERT' THEN NEW.created_by := auth.uid(); NEW.approved_by := NULL; NEW.approved_at := NULL; NEW.send_state := 'luonnos'; RETURN NEW; END IF;
  IF OLD.approved_at IS NOT NULL THEN RAISE EXCEPTION 'Hyväksyttyä viestiä ei voi muuttaa; tee uusi luonnos'; END IF;
  NEW.created_by := OLD.created_by; NEW.delivery_id := OLD.delivery_id;
  IF NEW.approved_at IS NOT NULL THEN
    IF auth.uid() = OLD.created_by AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Luonnoksen hyväksyy toinen henkilö tai pääkäyttäjä'; END IF;
    NEW.approved_by := auth.uid(); NEW.approved_at := now(); NEW.send_state := 'hyväksytty_ei_lähetetty';
  ELSE NEW.approved_by := NULL; NEW.send_state := 'luonnos'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER prod_draft_guard BEFORE INSERT OR UPDATE ON public.prod_message_drafts FOR EACH ROW EXECUTE FUNCTION public.prod_guard_draft();

CREATE OR REPLACE FUNCTION public.prod_guard_billing() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.delivery_id := OLD.delivery_id;
  IF NEW.billing_ready IS DISTINCT FROM OLD.billing_ready THEN NEW.checked_by := auth.uid(); NEW.checked_at := now(); ELSE NEW.checked_by := OLD.checked_by; NEW.checked_at := OLD.checked_at; END IF;
  NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER prod_billing_guard BEFORE UPDATE ON public.prod_billing_readiness FOR EACH ROW EXECUTE FUNCTION public.prod_guard_billing();

CREATE OR REPLACE FUNCTION public.prod_stamp_recorder() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.recorded_by := coalesce(auth.uid(), NEW.recorded_by); RETURN NEW; END $$;
CREATE TRIGGER prod_actuals_stamp BEFORE INSERT ON public.prod_actuals FOR EACH ROW EXECUTE FUNCTION public.prod_stamp_recorder();
CREATE TRIGGER prod_feedback_stamp BEFORE INSERT ON public.prod_feedback FOR EACH ROW EXECUTE FUNCTION public.prod_stamp_recorder();
CREATE OR REPLACE FUNCTION public.prod_stamp_creator() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.created_by := coalesce(auth.uid(), NEW.created_by); RETURN NEW; END $$;
CREATE TRIGGER prod_blockers_stamp BEFORE INSERT ON public.prod_blockers FOR EACH ROW EXECUTE FUNCTION public.prod_stamp_creator();
CREATE TRIGGER prod_quality_stamp BEFORE INSERT ON public.prod_quality_issues FOR EACH ROW EXECUTE FUNCTION public.prod_stamp_creator();

CREATE OR REPLACE FUNCTION public.prod_create_delivery(p_order_id uuid, p_template_key text, p_production_owner uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.crm_orders; existing uuid; new_id uuid; prod_owner uuid; org_name text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  SELECT * INTO o FROM public.crm_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Vahvistettua tilausta ei löydy'; END IF;
  SELECT id INTO existing FROM public.prod_deliveries WHERE order_id=p_order_id;
  IF existing IS NOT NULL THEN RETURN existing; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.prod_templates WHERE key=p_template_key) THEN RAISE EXCEPTION 'Tuntematon toteutuspohja'; END IF;
  SELECT production_owner_id INTO prod_owner FROM public.crm_production_handoffs WHERE order_id=p_order_id AND cancelled_at IS NULL ORDER BY handed_at DESC LIMIT 1;
  prod_owner := coalesce(p_production_owner, prod_owner, auth.uid());
  IF NOT public.is_editor_or_admin(prod_owner) THEN RAISE EXCEPTION 'Tuotannon vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  SELECT name INTO org_name FROM public.crm_organizations WHERE id=o.organization_id;
  INSERT INTO public.prod_deliveries(order_id, template_key, title, production_owner_id, sales_owner_id, created_by)
  VALUES (o.id, p_template_key, coalesce(org_name,'Asiakas') || ' · ' || (SELECT name FROM public.prod_templates WHERE key=p_template_key), prod_owner, o.owner_id, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO public.prod_tasks(delivery_id, template_task_id, code, title, scope, owner_role, anchor, offset_days, blocks_start)
  SELECT new_id, t.id, t.code, t.title, t.scope, t.owner_role, t.anchor, t.offset_days, t.blocks_start
  FROM public.prod_template_tasks t WHERE t.template_key IS NULL OR t.template_key=p_template_key ORDER BY t.scope, t.sort_order;
  INSERT INTO public.prod_billing_readiness(delivery_id) VALUES (new_id);
  PERFORM public.prod_recompute(new_id);
  RETURN new_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.prod_create_delivery(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.prod_create_delivery(uuid,text,uuid) TO authenticated;

CREATE TRIGGER audit_prod_deliveries AFTER INSERT OR UPDATE OR DELETE ON public.prod_deliveries FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_sessions AFTER INSERT OR UPDATE OR DELETE ON public.prod_sessions FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_bookings AFTER INSERT OR UPDATE OR DELETE ON public.prod_trainer_bookings FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_resource_bookings AFTER INSERT OR UPDATE OR DELETE ON public.prod_resource_bookings FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_tasks AFTER UPDATE ON public.prod_tasks FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_blockers AFTER INSERT OR UPDATE OR DELETE ON public.prod_blockers FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_quality AFTER INSERT OR UPDATE OR DELETE ON public.prod_quality_issues FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_participants AFTER INSERT OR UPDATE OR DELETE ON public.prod_participants FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_drafts AFTER INSERT OR UPDATE OR DELETE ON public.prod_message_drafts FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_actuals AFTER INSERT OR UPDATE OR DELETE ON public.prod_actuals FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_feedback AFTER INSERT OR UPDATE OR DELETE ON public.prod_feedback FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_prod_billing AFTER INSERT OR UPDATE ON public.prod_billing_readiness FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();

REVOKE EXECUTE ON FUNCTION public.prod_recompute_trigger(), public.prod_delivery_owners_changed(), public.prod_delivery_after_update(), public.prod_validate_booking() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prod_is_session_trainer(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.prod_is_session_trainer(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.prod_create_delivery(uuid,text,uuid) FROM anon;