CREATE OR REPLACE FUNCTION public.staff_user_has_role(_user_id uuid, _role app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION public.staff_user_has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.prod_validate_booking()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN IF NOT public.staff_user_has_role(NEW.trainer_id,'trainer') AND NOT public.staff_has_editor_role(NEW.trainer_id) THEN RAISE EXCEPTION 'Varattavalla henkilöllä on oltava kouluttajan tai henkilöstön rooli'; END IF; RETURN NEW; END $function$;

CREATE OR REPLACE FUNCTION public.exp_try_confirm(p_id uuid)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  IF uid IS NOT NULL AND (public.staff_user_has_role(uid,'trainer') OR public.staff_has_editor_role(uid)) THEN
    INSERT INTO public.prod_trainer_bookings(session_id, trainer_id, status) VALUES (a.session_id, uid, 'vahvistettu')
    ON CONFLICT (session_id, trainer_id) DO UPDATE SET status='vahvistettu';
  END IF;
  RETURN 'vahvistettu';
END $function$;