CREATE OR REPLACE FUNCTION public.staff_has_editor_role(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;
REVOKE ALL ON FUNCTION public.staff_has_editor_role(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.assign_new_booking()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE rule public.crm_assignment_rules; eligible uuid[]; position bigint; BEGIN
 IF NEW.owner_id IS NOT NULL THEN RETURN NEW; END IF;
 SELECT * INTO rule FROM public.crm_assignment_rules WHERE service_key=coalesce(NEW.service_key,'muu') FOR UPDATE;
 IF NOT FOUND THEN SELECT * INTO rule FROM public.crm_assignment_rules WHERE service_key='all' FOR UPDATE; END IF;
 IF rule.service_key IS NULL OR NOT rule.enabled THEN RETURN NEW; END IF;
 SELECT array_agg(m.id ORDER BY m.ord) INTO eligible FROM unnest(rule.member_ids) WITH ORDINALITY m(id,ord) WHERE public.staff_has_editor_role(m.id);
 IF coalesce(cardinality(eligible),0)=0 THEN RETURN NEW; END IF;
 INSERT INTO public.crm_assignment_cursors(service_key,next_index) VALUES(rule.service_key,1) ON CONFLICT(service_key) DO UPDATE SET next_index=public.crm_assignment_cursors.next_index+1 RETURNING next_index-1 INTO position;
 NEW.owner_id=eligible[(position % cardinality(eligible))::integer+1]; RETURN NEW; END $function$;

CREATE OR REPLACE FUNCTION public.cat_guard_product()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.staff_has_editor_role(NEW.sales_owner_id) OR NOT public.staff_has_editor_role(NEW.production_owner_id) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  IF TG_OP = 'INSERT' THEN NEW.published_by := NULL; NEW.published_at := NULL; IF NEW.status = 'julkaistu' THEN RAISE EXCEPTION 'Tuote julkaistaan vasta tallentamisen jälkeen'; END IF; RETURN NEW; END IF;
  NEW.id := OLD.id; NEW.created_at := OLD.created_at; NEW.updated_at := now();
  IF NEW.status = 'julkaistu' AND OLD.status <> 'julkaistu' THEN NEW.published_by := auth.uid(); NEW.published_at := now();
  ELSE NEW.published_by := OLD.published_by; NEW.published_at := OLD.published_at; END IF;
  RETURN NEW;
END $function$;

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
  IF uid IS NOT NULL AND (public.has_role(uid,'trainer') OR public.staff_has_editor_role(uid)) THEN
    INSERT INTO public.prod_trainer_bookings(session_id, trainer_id, status) VALUES (a.session_id, uid, 'vahvistettu')
    ON CONFLICT (session_id, trainer_id) DO UPDATE SET status='vahvistettu';
  END IF;
  RETURN 'vahvistettu';
END $function$;

CREATE OR REPLACE FUNCTION public.prod_create_delivery(p_order_id uuid, p_template_key text, p_production_owner uuid DEFAULT NULL::uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  IF NOT public.staff_has_editor_role(prod_owner) THEN RAISE EXCEPTION 'Tuotannon vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
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
END $function$;

CREATE OR REPLACE FUNCTION public.prod_create_group_delivery(p_offering uuid, p_production_owner uuid DEFAULT NULL::uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE k text := public.cat_group_key(p_offering); f public.cat_offerings; c public.cat_products; existing uuid; new_id uuid; owner uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  PERFORM 1 FROM public.cat_offerings WHERE coalesce(group_key,'offering:'||id::text)=k ORDER BY id FOR UPDATE;
  SELECT * INTO f FROM public.cat_offerings WHERE id=p_offering;
  IF NOT FOUND THEN RAISE EXCEPTION 'Toteutuskertaa ei löydy'; END IF;
  SELECT id INTO existing FROM public.prod_deliveries WHERE offering_group=k;
  IF existing IS NOT NULL THEN RETURN existing; END IF;
  IF f.go_status <> 'toteutuu' THEN RAISE EXCEPTION 'Koulutustoteutus luodaan vasta, kun ryhmä toteutuu'; END IF;
  SELECT * INTO c FROM public.cat_products WHERE id=f.product_id;
  IF c.template_key IS NULL OR NOT EXISTS (SELECT 1 FROM public.prod_templates WHERE key=c.template_key) THEN RAISE EXCEPTION 'Tuotteelta puuttuu toteutuspohja'; END IF;
  owner := coalesce(p_production_owner, c.production_owner_id);
  IF NOT public.staff_has_editor_role(owner) THEN RAISE EXCEPTION 'Tuotannon vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  INSERT INTO public.prod_deliveries(order_id, offering_group, template_key, title, production_owner_id, sales_owner_id, created_by)
  VALUES (NULL, k, c.template_key, 'Avoin ryhmä · '||c.name||' '||to_char(f.starts_at AT TIME ZONE 'Europe/Helsinki','DD.MM.YYYY'), owner, c.sales_owner_id, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO public.prod_tasks(delivery_id, template_task_id, code, title, scope, owner_role, anchor, offset_days, blocks_start)
  SELECT new_id, t.id, t.code, t.title, t.scope, t.owner_role, t.anchor, t.offset_days, t.blocks_start
  FROM public.prod_template_tasks t WHERE t.template_key IS NULL OR t.template_key=c.template_key ORDER BY t.scope, t.sort_order;
  INSERT INTO public.prod_billing_readiness(delivery_id) VALUES (new_id) ON CONFLICT DO NOTHING;
  UPDATE public.cat_offerings SET delivery_id=new_id WHERE coalesce(group_key,'offering:'||id::text)=k AND delivery_id IS NULL;
  PERFORM public.prod_recompute(new_id);
  RETURN new_id;
END $function$;

CREATE OR REPLACE FUNCTION public.prod_delivery_owners_changed()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.order_id IS DISTINCT FROM OLD.order_id OR NEW.template_key IS DISTINCT FROM OLD.template_key OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Toteutuksen tilausta, pohjaa tai luontiaikaa ei voi muuttaa'; END IF;
  IF NOT public.staff_has_editor_role(NEW.production_owner_id) OR NOT public.staff_has_editor_role(NEW.sales_owner_id) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  NEW.updated_at := now(); RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.prod_validate_booking()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN IF NOT public.has_role(NEW.trainer_id,'trainer') AND NOT public.staff_has_editor_role(NEW.trainer_id) THEN RAISE EXCEPTION 'Varattavalla henkilöllä on oltava kouluttajan tai henkilöstön rooli'; END IF; RETURN NEW; END $function$;

CREATE OR REPLACE FUNCTION public.validate_assignment_rule()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE member uuid; BEGIN
 IF array_position(NEW.member_ids,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Virheellinen vastuuhenkilö'; END IF;
 IF cardinality(NEW.member_ids)<>(SELECT count(DISTINCT x) FROM unnest(NEW.member_ids) x) THEN RAISE EXCEPTION 'Vastuuhenkilö saa esiintyä vain kerran'; END IF;
 FOREACH member IN ARRAY NEW.member_ids LOOP IF NOT public.staff_has_editor_role(member) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava myynnin käyttöoikeus'; END IF; END LOOP;
 NEW.updated_at=now(); RETURN NEW; END $function$;

CREATE OR REPLACE FUNCTION public.validate_crm_owner()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN IF NEW.owner_id IS NOT NULL AND NOT public.staff_has_editor_role(NEW.owner_id) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava myynnin käyttöoikeus'; END IF; RETURN NEW; END $function$;