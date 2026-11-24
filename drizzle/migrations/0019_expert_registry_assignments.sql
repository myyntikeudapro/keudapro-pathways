ALTER TABLE public.prod_sessions ADD COLUMN IF NOT EXISTS delivery_mode text NOT NULL DEFAULT 'lähi' CHECK (delivery_mode IN ('lähi','etä')),
  ADD COLUMN IF NOT EXISTS region text;

CREATE TABLE public.exp_experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('sisäinen','ulkoinen')),
  region text NOT NULL,
  remote_ok boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'aktiivinen' CHECK (status IN ('aktiivinen','passiivinen')),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exp_skills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.exp_expert_skills (
  expert_id uuid NOT NULL REFERENCES public.exp_experts(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.exp_skills(id),
  level integer NOT NULL CHECK (level BETWEEN 1 AND 3),
  PRIMARY KEY (expert_id, skill_id)
);
CREATE TABLE public.exp_template_fit (
  expert_id uuid NOT NULL REFERENCES public.exp_experts(id) ON DELETE CASCADE,
  template_key text NOT NULL REFERENCES public.prod_templates(key),
  status text NOT NULL CHECK (status IN ('hyväksytty','ei sovellu')),
  approved_by uuid DEFAULT auth.uid(),
  approved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (expert_id, template_key)
);
CREATE TABLE public.exp_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL REFERENCES public.exp_experts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('käytettävissä','estynyt')),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  note text, created_by uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE TABLE public.exp_commercial_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL REFERENCES public.exp_experts(id) ON DELETE CASCADE,
  day_rate numeric, hour_rate numeric,
  contract_ref text, valid_from date, valid_to date, note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exp_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.prod_sessions(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL REFERENCES public.exp_experts(id),
  status text NOT NULL DEFAULT 'pyydetty' CHECK (status IN ('pyydetty','vahvistettu','hylätty','peruttu')),
  needs_approval boolean NOT NULL DEFAULT false,
  conflict_reasons text[] NOT NULL DEFAULT '{}',
  approved_by uuid, approved_at timestamptz, approval_reason text,
  expert_accepted_at timestamptz,
  requested_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX exp_assignments_active_uq ON public.exp_assignments(session_id, expert_id) WHERE status IN ('pyydetty','vahvistettu');
CREATE TABLE public.exp_assignment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.exp_assignments(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_id uuid,
  reason text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exp_experts, public.exp_skills, public.exp_expert_skills, public.exp_template_fit, public.exp_availability, public.exp_commercial_terms TO authenticated;
GRANT SELECT ON public.exp_assignments, public.exp_assignment_events TO authenticated;
GRANT ALL ON public.exp_experts, public.exp_skills, public.exp_expert_skills, public.exp_template_fit, public.exp_availability, public.exp_commercial_terms, public.exp_assignments, public.exp_assignment_events TO service_role;

ALTER TABLE public.exp_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_expert_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_template_fit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_commercial_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exp_assignment_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.exp_is_own_expert(_expert uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user,'trainer') AND EXISTS (SELECT 1 FROM public.exp_experts WHERE id=_expert AND user_id=_user) $$;
REVOKE EXECUTE ON FUNCTION public.exp_is_own_expert(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.exp_is_own_expert(uuid, uuid) TO authenticated;

CREATE POLICY "staff experts" ON public.exp_experts FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer own profile" ON public.exp_experts FOR SELECT TO authenticated USING (user_id = auth.uid() AND public.has_role(auth.uid(),'trainer'));
CREATE POLICY "staff skills" ON public.exp_skills FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff expert skills" ON public.exp_expert_skills FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer own skills" ON public.exp_expert_skills FOR SELECT TO authenticated USING (public.exp_is_own_expert(expert_id, auth.uid()));
CREATE POLICY "staff fit" ON public.exp_template_fit FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()) AND approved_by = auth.uid());
CREATE POLICY "staff availability" ON public.exp_availability FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "trainer read own availability" ON public.exp_availability FOR SELECT TO authenticated USING (public.exp_is_own_expert(expert_id, auth.uid()));
CREATE POLICY "trainer add own availability" ON public.exp_availability FOR INSERT TO authenticated WITH CHECK (public.exp_is_own_expert(expert_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "admin commercial terms" ON public.exp_commercial_terms FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "staff read assignments" ON public.exp_assignments FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff read assignment events" ON public.exp_assignment_events FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.exp_events_append_only() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Hyväksyntähistoriaa ei voi muuttaa tai poistaa'; END $$;
CREATE TRIGGER exp_events_no_update BEFORE UPDATE OR DELETE ON public.exp_assignment_events FOR EACH ROW EXECUTE FUNCTION public.exp_events_append_only();

CREATE TRIGGER exp_experts_updated BEFORE UPDATE ON public.exp_experts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_exp_experts AFTER INSERT OR UPDATE OR DELETE ON public.exp_experts FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_exp_commercial AFTER INSERT OR UPDATE OR DELETE ON public.exp_commercial_terms FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();

CREATE OR REPLACE FUNCTION public.exp_evaluate(p_session uuid, p_expert uuid, p_exclude uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.prod_sessions; e public.exp_experts; tkey text; hard boolean := false; reasons text[] := '{}';
BEGIN
  SELECT * INTO s FROM public.prod_sessions WHERE id=p_session;
  SELECT * INTO e FROM public.exp_experts WHERE id=p_expert;
  SELECT template_key INTO tkey FROM public.prod_deliveries WHERE id=s.delivery_id;
  IF EXISTS (SELECT 1 FROM public.exp_assignments a JOIN public.prod_sessions o ON o.id=a.session_id
             WHERE a.expert_id=p_expert AND a.status='vahvistettu' AND a.id IS DISTINCT FROM p_exclude
               AND o.starts_at < s.ends_at AND o.ends_at > s.starts_at) THEN hard := true; END IF;
  IF EXISTS (SELECT 1 FROM public.exp_assignments a JOIN public.prod_sessions o ON o.id=a.session_id
             WHERE a.expert_id=p_expert AND a.status='pyydetty' AND a.id IS DISTINCT FROM p_exclude AND a.session_id<>p_session
               AND o.starts_at < s.ends_at AND o.ends_at > s.starts_at) THEN reasons := array_append(reasons, 'päällekkäinen pyyntö'); END IF;
  IF EXISTS (SELECT 1 FROM public.exp_availability v WHERE v.expert_id=p_expert AND v.kind='estynyt' AND v.starts_at < s.ends_at AND v.ends_at > s.starts_at) THEN reasons := array_append(reasons, 'merkitty estyneeksi'); END IF;
  IF s.delivery_mode='lähi' AND EXISTS (SELECT 1 FROM public.exp_assignments a JOIN public.prod_sessions o ON o.id=a.session_id
             WHERE a.expert_id=p_expert AND a.status IN ('pyydetty','vahvistettu') AND a.id IS DISTINCT FROM p_exclude AND a.session_id<>p_session
               AND o.delivery_mode='lähi' AND coalesce(o.region,'') <> coalesce(s.region,'')
               AND o.starts_at < s.ends_at + interval '2 hours' AND o.ends_at > s.starts_at - interval '2 hours'
               AND NOT (o.starts_at < s.ends_at AND o.ends_at > s.starts_at)) THEN reasons := array_append(reasons, 'siirtymäaika alle 2 h'); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.exp_template_fit f WHERE f.expert_id=p_expert AND f.template_key=tkey AND f.status='hyväksytty') THEN reasons := array_append(reasons, 'soveltuvuutta ei hyväksytty'); END IF;
  IF s.delivery_mode='etä' AND NOT e.remote_ok THEN reasons := array_append(reasons, 'ei etätoteutuksia'); END IF;
  IF s.delivery_mode='lähi' AND s.region IS NOT NULL AND s.region <> e.region THEN reasons := array_append(reasons, 'eri alue'); END IF;
  IF e.status <> 'aktiivinen' THEN reasons := array_append(reasons, 'asiantuntija passiivinen'); END IF;
  RETURN jsonb_build_object('hard', hard, 'reasons', to_jsonb(reasons));
END $$;
REVOKE EXECUTE ON FUNCTION public.exp_evaluate(uuid, uuid, uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.exp_log(p_assignment uuid, p_action text, p_reason text, p_details jsonb) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.exp_assignment_events(assignment_id, action, actor_id, reason, details) VALUES (p_assignment, p_action, auth.uid(), p_reason, coalesce(p_details,'{}')) $$;
REVOKE EXECUTE ON FUNCTION public.exp_log(uuid, text, text, jsonb) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.exp_try_confirm(p_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.exp_assignments; ev jsonb; uid uuid;
BEGIN
  SELECT * INTO a FROM public.exp_assignments WHERE id=p_id;
  PERFORM 1 FROM public.exp_experts WHERE id=a.expert_id FOR UPDATE;
  SELECT * INTO a FROM public.exp_assignments WHERE id=p_id;
  IF a.status <> 'pyydetty' OR a.expert_accepted_at IS NULL OR (a.needs_approval AND a.approved_at IS NULL) THEN RETURN a.status; END IF;
  ev := public.exp_evaluate(a.session_id, a.expert_id, a.id);
  IF (ev->>'hard')::boolean THEN RAISE EXCEPTION 'Päällekkäinen vahvistettu toimeksianto estää vahvistuksen'; END IF;
  UPDATE public.exp_assignments SET status='vahvistettu', updated_at=now() WHERE id=p_id;
  PERFORM public.exp_log(p_id, 'vahvistettu', NULL, '{}');
  SELECT user_id INTO uid FROM public.exp_experts WHERE id=a.expert_id;
  IF uid IS NOT NULL AND (public.has_role(uid,'trainer') OR public.is_editor_or_admin(uid)) THEN
    INSERT INTO public.prod_trainer_bookings(session_id, trainer_id, status) VALUES (a.session_id, uid, 'vahvistettu')
    ON CONFLICT (session_id, trainer_id) DO UPDATE SET status='vahvistettu';
  END IF;
  RETURN 'vahvistettu';
END $$;
REVOKE EXECUTE ON FUNCTION public.exp_try_confirm(uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.exp_request_assignment(p_session uuid, p_expert uuid, p_note text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev jsonb; nid uuid; reasons text[];
BEGIN
  IF NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei oikeutta' USING ERRCODE='42501'; END IF;
  PERFORM 1 FROM public.exp_experts WHERE id=p_expert FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Asiantuntijaa ei löydy'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.prod_sessions WHERE id=p_session) THEN RAISE EXCEPTION 'Sessiota ei löydy'; END IF;
  ev := public.exp_evaluate(p_session, p_expert, NULL);
  IF (ev->>'hard')::boolean THEN RAISE EXCEPTION 'Asiantuntijalla on jo vahvistettu toimeksianto samaan aikaan'; END IF;
  SELECT array(SELECT jsonb_array_elements_text(ev->'reasons')) INTO reasons;
  INSERT INTO public.exp_assignments(session_id, expert_id, needs_approval, conflict_reasons, requested_by)
  VALUES (p_session, p_expert, cardinality(reasons) > 0, reasons, auth.uid()) RETURNING id INTO nid;
  PERFORM public.exp_log(nid, 'pyydetty', p_note, jsonb_build_object('conflicts', to_jsonb(reasons)));
  RETURN nid;
END $$;

CREATE OR REPLACE FUNCTION public.exp_respond_assignment(p_id uuid, p_accept boolean, p_note text DEFAULT NULL) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.exp_assignments;
BEGIN
  SELECT * INTO a FROM public.exp_assignments WHERE id=p_id;
  IF NOT FOUND OR NOT (public.exp_is_own_expert(a.expert_id, auth.uid()) OR public.is_editor_or_admin(auth.uid())) THEN RAISE EXCEPTION 'Ei oikeutta' USING ERRCODE='42501'; END IF;
  IF a.status <> 'pyydetty' THEN RAISE EXCEPTION 'Toimeksianto ei odota vastausta'; END IF;
  IF NOT p_accept THEN
    UPDATE public.exp_assignments SET status='hylätty', updated_at=now() WHERE id=p_id;
    PERFORM public.exp_log(p_id, 'hylätty', p_note, '{}'); RETURN 'hylätty';
  END IF;
  UPDATE public.exp_assignments SET expert_accepted_at=now(), updated_at=now() WHERE id=p_id;
  PERFORM public.exp_log(p_id, 'asiantuntija hyväksyi', p_note, '{}');
  RETURN public.exp_try_confirm(p_id);
END $$;

CREATE OR REPLACE FUNCTION public.exp_approve_conflict(p_id uuid, p_reason text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.exp_assignments;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Vain pääkäyttäjä voi hyväksyä poikkeaman' USING ERRCODE='42501'; END IF;
  IF coalesce(length(trim(p_reason)),0) < 5 THEN RAISE EXCEPTION 'Perustelu vaaditaan'; END IF;
  SELECT * INTO a FROM public.exp_assignments WHERE id=p_id;
  IF NOT FOUND OR a.status <> 'pyydetty' OR NOT a.needs_approval OR a.approved_at IS NOT NULL THEN RAISE EXCEPTION 'Ei hyväksyttävää poikkeamaa'; END IF;
  UPDATE public.exp_assignments SET approved_by=auth.uid(), approved_at=now(), approval_reason=p_reason, updated_at=now() WHERE id=p_id;
  PERFORM public.exp_log(p_id, 'poikkeama hyväksytty', p_reason, jsonb_build_object('conflicts', to_jsonb(a.conflict_reasons)));
  RETURN public.exp_try_confirm(p_id);
END $$;

CREATE OR REPLACE FUNCTION public.exp_cancel_assignment(p_id uuid, p_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.exp_assignments; uid uuid;
BEGIN
  IF NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei oikeutta' USING ERRCODE='42501'; END IF;
  SELECT * INTO a FROM public.exp_assignments WHERE id=p_id;
  IF NOT FOUND OR a.status NOT IN ('pyydetty','vahvistettu') THEN RAISE EXCEPTION 'Toimeksiantoa ei voi perua'; END IF;
  UPDATE public.exp_assignments SET status='peruttu', updated_at=now() WHERE id=p_id;
  SELECT user_id INTO uid FROM public.exp_experts WHERE id=a.expert_id;
  IF uid IS NOT NULL THEN UPDATE public.prod_trainer_bookings SET status='peruttu' WHERE session_id=a.session_id AND trainer_id=uid; END IF;
  PERFORM public.exp_log(p_id, 'peruttu', p_reason, '{}');
END $$;

CREATE OR REPLACE FUNCTION public.exp_my_assignments() RETURNS TABLE(assignment_id uuid, status text, needs_response boolean, session_title text, delivery_title text, starts_at timestamptz, ends_at timestamptz, delivery_mode text, location text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.status, (a.status='pyydetty' AND a.expert_accepted_at IS NULL), s.title, d.title, s.starts_at, s.ends_at, s.delivery_mode, s.location
  FROM public.exp_assignments a JOIN public.exp_experts e ON e.id=a.expert_id JOIN public.prod_sessions s ON s.id=a.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id
  WHERE e.user_id = auth.uid() AND public.has_role(auth.uid(),'trainer') AND a.status IN ('pyydetty','vahvistettu')
  ORDER BY s.starts_at $$;

CREATE OR REPLACE FUNCTION public.exp_my_session_participants(p_session uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE did uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.exp_assignments a JOIN public.exp_experts e ON e.id=a.expert_id
                 WHERE a.session_id=p_session AND a.status='vahvistettu' AND e.user_id=auth.uid() AND public.has_role(auth.uid(),'trainer'))
  THEN RAISE EXCEPTION 'Ei oikeutta' USING ERRCODE='42501'; END IF;
  SELECT delivery_id INTO did FROM public.prod_sessions WHERE id=p_session;
  RETURN (SELECT jsonb_build_object('count', count(*), 'first_names', coalesce(jsonb_agg(split_part(name,' ',1) ORDER BY name), '[]'::jsonb))
          FROM public.prod_participants WHERE delivery_id=did);
END $$;

REVOKE EXECUTE ON FUNCTION public.exp_request_assignment(uuid, uuid, text), public.exp_respond_assignment(uuid, boolean, text), public.exp_approve_conflict(uuid, text), public.exp_cancel_assignment(uuid, text), public.exp_my_assignments(), public.exp_my_session_participants(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.exp_request_assignment(uuid, uuid, text), public.exp_respond_assignment(uuid, boolean, text), public.exp_approve_conflict(uuid, text), public.exp_cancel_assignment(uuid, text), public.exp_my_assignments(), public.exp_my_session_participants(uuid) TO authenticated;