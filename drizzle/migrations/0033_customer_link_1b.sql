
CREATE OR REPLACE FUNCTION public.crm_normalize_business_id(p text) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE s text := regexp_replace(coalesce(p,''), '\s', '', 'g'); w int[] := ARRAY[7,9,10,5,8,4,2]; t int := 0; r int; c int;
BEGIN
  IF s ~ '^[0-9]{8}$' THEN s := substr(s,1,7)||'-'||substr(s,8,1); END IF;
  IF s !~ '^[0-9]{7}-[0-9]$' THEN RETURN NULL; END IF;
  FOR i IN 1..7 LOOP t := t + substr(s,i,1)::int * w[i]; END LOOP;
  r := t % 11;
  IF r = 1 THEN RETURN NULL; END IF;
  c := CASE WHEN r = 0 THEN 0 ELSE 11 - r END;
  IF c <> substr(s,9,1)::int THEN RETURN NULL; END IF;
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.crm_guard_organization() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.business_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.business_id IS DISTINCT FROM OLD.business_id) THEN
    NEW.business_id := public.crm_normalize_business_id(NEW.business_id);
    IF NEW.business_id IS NULL THEN RAISE EXCEPTION 'INVALID_BUSINESS_ID' USING ERRCODE = '22023'; END IF;
  END IF;
  IF NEW.owner_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.owner_id IS DISTINCT FROM OLD.owner_id)
     AND NOT public.staff_has_editor_role(NEW.owner_id) THEN
    RAISE EXCEPTION 'INVALID_ACCOUNT_OWNER' USING ERRCODE = '22023';
  END IF;
  NEW.name := trim(NEW.name);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_crm_organization ON public.crm_organizations;
CREATE TRIGGER guard_crm_organization BEFORE INSERT OR UPDATE ON public.crm_organizations
FOR EACH ROW EXECUTE FUNCTION public.crm_guard_organization();

CREATE OR REPLACE FUNCTION public.crm_guard_lead_customer_link() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.crm_contacts WHERE id = NEW.contact_id AND organization_id IS NOT DISTINCT FROM NEW.organization_id) THEN
    RAISE EXCEPTION 'CONTACT_ORGANIZATION_MISMATCH' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_lead_customer_link ON public.booking_requests;
CREATE TRIGGER guard_lead_customer_link BEFORE INSERT OR UPDATE OF organization_id, contact_id ON public.booking_requests
FOR EACH ROW EXECUTE FUNCTION public.crm_guard_lead_customer_link();

CREATE TABLE public.crm_customer_link_ops (
  op_key text PRIMARY KEY CHECK (length(op_key) BETWEEN 8 AND 100),
  lead_id uuid NOT NULL REFERENCES public.booking_requests(id),
  request_hash text NOT NULL,
  result jsonb NOT NULL,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.crm_customer_link_ops TO service_role;
ALTER TABLE public.crm_customer_link_ops ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.crm_find_organization_candidates(p_query text)
RETURNS TABLE(id uuid, name text, business_id text, match text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE q text := trim(coalesce(p_query,'')); bid text := public.crm_normalize_business_id(p_query);
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  IF length(q) < 2 THEN RETURN; END IF;
  RETURN QUERY
    SELECT o.id, o.name, o.business_id, CASE WHEN bid IS NOT NULL AND o.business_id = bid THEN 'business_id' ELSE 'name' END
    FROM public.crm_organizations o
    WHERE (bid IS NOT NULL AND o.business_id = bid)
       OR o.name ILIKE '%' || replace(replace(replace(q,'\','\\'),'%','\%'),'_','\_') || '%'
    ORDER BY (bid IS NOT NULL AND o.business_id = bid) DESC, o.name
    LIMIT 20;
END $$;

CREATE OR REPLACE FUNCTION public.crm_link_lead_customer(
  p_lead_id uuid, p_expected_organization_id uuid, p_expected_contact_id uuid,
  p_organization_id uuid, p_new_organization_name text, p_new_business_id text,
  p_contact_id uuid, p_new_contact_name text, p_new_contact_email text, p_new_contact_phone text,
  p_op_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid(); l public.booking_requests; op public.crm_customer_link_ops;
  h text; org uuid; con uuid; bid text; existing uuid; created_org boolean := false; created_contact boolean := false; res jsonb;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  IF p_op_key IS NULL OR length(p_op_key) NOT BETWEEN 8 AND 100 THEN RAISE EXCEPTION 'OP_KEY_REQUIRED'; END IF;
  h := md5(concat_ws('|', p_lead_id, p_expected_organization_id, p_expected_contact_id, p_organization_id, trim(p_new_organization_name),
        public.crm_normalize_business_id(p_new_business_id), p_contact_id, trim(p_new_contact_name), lower(trim(p_new_contact_email)), trim(p_new_contact_phone)));
  PERFORM pg_advisory_xact_lock(hashtextextended('crm-link-op:' || p_op_key, 0));
  SELECT * INTO op FROM public.crm_customer_link_ops WHERE op_key = p_op_key;
  IF FOUND THEN
    IF op.request_hash = h THEN RETURN op.result || jsonb_build_object('replayed', true); END IF;
    RAISE EXCEPTION 'OP_KEY_REUSED' USING ERRCODE = '23505';
  END IF;

  SELECT * INTO l FROM public.booking_requests WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
  IF l.mt_personal THEN RAISE EXCEPTION 'PERSONAL_CASE'; END IF;
  IF l.organization_id IS DISTINCT FROM p_expected_organization_id OR l.contact_id IS DISTINCT FROM p_expected_contact_id THEN
    RAISE EXCEPTION 'LINK_CHANGED' USING ERRCODE = '40001';
  END IF;

  IF (p_organization_id IS NULL) = (p_new_business_id IS NULL) THEN RAISE EXCEPTION 'ORGANIZATION_CHOICE_REQUIRED'; END IF;
  IF p_organization_id IS NOT NULL THEN
    SELECT id INTO org FROM public.crm_organizations WHERE id = p_organization_id FOR UPDATE;
    IF org IS NULL THEN RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND'; END IF;
  ELSE
    bid := public.crm_normalize_business_id(p_new_business_id);
    IF bid IS NULL THEN RAISE EXCEPTION 'INVALID_BUSINESS_ID' USING ERRCODE = '22023'; END IF;
    IF coalesce(trim(p_new_organization_name),'') = '' THEN RAISE EXCEPTION 'ORGANIZATION_NAME_REQUIRED'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('crm-business-id:' || bid, 0));
    SELECT id INTO existing FROM public.crm_organizations WHERE business_id = bid;
    IF existing IS NOT NULL THEN RAISE EXCEPTION 'ORGANIZATION_EXISTS' USING DETAIL = existing::text, ERRCODE = '23505'; END IF;
    INSERT INTO public.crm_organizations(name, business_id) VALUES (trim(p_new_organization_name), bid) RETURNING id INTO org;
    created_org := true;
  END IF;

  IF EXISTS (SELECT 1 FROM public.crm_orders WHERE lead_id = l.id AND organization_id <> org) THEN
    RAISE EXCEPTION 'CONFIRMED_BUYER_CONFLICT';
  END IF;

  IF p_contact_id IS NOT NULL AND p_new_contact_email IS NOT NULL THEN RAISE EXCEPTION 'CONTACT_CHOICE_AMBIGUOUS'; END IF;
  IF p_contact_id IS NOT NULL THEN
    SELECT id INTO con FROM public.crm_contacts WHERE id = p_contact_id AND organization_id = org;
    IF con IS NULL THEN RAISE EXCEPTION 'CONTACT_ORGANIZATION_MISMATCH' USING ERRCODE = '23514'; END IF;
  ELSIF p_new_contact_email IS NOT NULL OR p_new_contact_name IS NOT NULL THEN
    IF coalesce(trim(p_new_contact_name),'') = '' THEN RAISE EXCEPTION 'CONTACT_NAME_REQUIRED'; END IF;
    IF coalesce(trim(p_new_contact_email),'') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'CONTACT_EMAIL_REQUIRED'; END IF;
    SELECT id INTO existing FROM public.crm_contacts WHERE organization_id = org AND lower(email) = lower(trim(p_new_contact_email));
    IF existing IS NOT NULL THEN RAISE EXCEPTION 'CONTACT_EXISTS' USING DETAIL = existing::text, ERRCODE = '23505'; END IF;
    INSERT INTO public.crm_contacts(organization_id, name, email, phone)
    VALUES (org, trim(p_new_contact_name), lower(trim(p_new_contact_email)), nullif(trim(p_new_contact_phone),'')) RETURNING id INTO con;
    created_contact := true;
  END IF;

  UPDATE public.booking_requests SET organization_id = org, contact_id = con WHERE id = l.id;
  res := jsonb_build_object('lead_id', l.id, 'organization_id', org, 'contact_id', con,
    'organization_created', created_org, 'contact_created', created_contact, 'contact_pending', con IS NULL);
  INSERT INTO public.crm_audit(table_name, row_id, action, actor_id, changes)
  VALUES ('booking_requests', l.id, 'link_customer', me, jsonb_build_object(
    'old', jsonb_build_object('organization_id', l.organization_id, 'contact_id', l.contact_id),
    'new', jsonb_build_object('organization_id', org, 'contact_id', con), 'op_key', p_op_key));
  INSERT INTO public.crm_customer_link_ops(op_key, lead_id, request_hash, result, actor_id) VALUES (p_op_key, l.id, h, res, me);
  RETURN res;
END $$;

CREATE OR REPLACE FUNCTION public.crm_confirm_order(p_version_id uuid, p_idempotency_key text)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v public.crm_offer_versions; l public.booking_requests; existing uuid; missing text[] := '{}'; new_id uuid; total numeric;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) < 8 THEN RAISE EXCEPTION 'Idempotenssiavain puuttuu'; END IF;
  SELECT * INTO v FROM public.crm_offer_versions WHERE id = p_version_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tarjousversiota ei löydy'; END IF;
  SELECT id INTO existing FROM public.crm_orders WHERE offer_version_id = p_version_id OR idempotency_key = p_idempotency_key LIMIT 1;
  IF existing IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.crm_orders WHERE id = existing AND offer_version_id = p_version_id) THEN RAISE EXCEPTION 'Idempotenssiavain on jo käytetty toiseen tilaukseen'; END IF;
    RETURN existing;
  END IF;
  SELECT b.* INTO l FROM public.booking_requests b JOIN public.crm_offers o ON o.lead_id = b.id WHERE o.id = v.offer_id;
  IF v.approved_at IS NULL OR v.approved_by IS NULL THEN missing := missing || 'ihmisen kirjaama hyväksyntä'; END IF;
  IF v.organization_id IS NULL THEN missing := missing || 'ostaja'; END IF;
  IF v.contact_id IS NULL THEN missing := missing || 'tilaajan vastuuhenkilö'; END IF;
  IF v.service_key IS NULL THEN missing := missing || 'tuote tai palvelu'; END IF;
  IF coalesce(trim(v.content), '') = '' THEN missing := missing || 'sovittu sisältö'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crm_offer_version_lines WHERE version_id = v.id) THEN missing := missing || 'hinnoitellut rivit'; END IF;
  IF v.vat_rate IS NULL OR v.vat_basis IS NULL THEN missing := missing || 'ALV-käsittelyn lähtötiedot'; END IF;
  IF v.starts_on IS NULL THEN missing := missing || 'aikataulu'; END IF;
  IF coalesce(trim(v.terms), '') = '' OR coalesce(trim(v.payment_terms), '') = '' THEN missing := missing || 'sopimus- ja maksuehdot'; END IF;
  IF l.owner_id IS NULL THEN missing := missing || 'KeudaPROn vastuuhenkilö'; END IF;
  IF v.contact_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.crm_contacts WHERE id = v.contact_id AND organization_id = v.organization_id) THEN missing := missing || 'yhteyshenkilö kuuluu ostajaan'; END IF;
  IF v.organization_id IS NOT NULL AND l.organization_id IS DISTINCT FROM v.organization_id THEN missing := missing || 'ostaja on yhteydenoton vahvistettu organisaatio'; END IF;
  IF cardinality(missing) > 0 THEN RAISE EXCEPTION 'Ei valmis tuotantoon. Puuttuu: %', array_to_string(missing, ', ') USING ERRCODE = 'P0001'; END IF;
  SELECT sum(quantity * unit_price) INTO total FROM public.crm_offer_version_lines WHERE version_id = v.id;
  INSERT INTO public.crm_orders(lead_id, offer_version_id, idempotency_key, organization_id, contact_id, owner_id, service_key, vat_rate, vat_basis, starts_on, ends_on, terms, payment_terms, total_net, confirmed_by)
  VALUES (l.id, v.id, p_idempotency_key, v.organization_id, v.contact_id, l.owner_id, v.service_key, v.vat_rate, v.vat_basis, v.starts_on, v.ends_on, v.terms, v.payment_terms, total, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO public.crm_order_lines(order_id, line_no, description, quantity, unit_price)
  SELECT new_id, line_no, description, quantity, unit_price FROM public.crm_offer_version_lines WHERE version_id = v.id ORDER BY line_no;
  RETURN new_id;
END $function$;

CREATE OR REPLACE FUNCTION public.crm_confirm_company_order(
  p_lead_id uuid, p_offer_id uuid, p_content text, p_amount numeric, p_vat_basis text,
  p_starts_on date, p_ends_on date, p_terms text, p_payment_terms text,
  p_approval_method text, p_approval_note text, p_idempotency_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); l public.booking_requests; existing public.crm_orders; ver uuid; n int;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) < 8 THEN RAISE EXCEPTION 'Idempotenssiavain puuttuu'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('crm-order:' || p_idempotency_key, 0));
  SELECT * INTO existing FROM public.crm_orders WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF existing.lead_id <> p_lead_id THEN RAISE EXCEPTION 'Idempotenssiavain on jo käytetty toiseen tilaukseen'; END IF;
    RETURN existing.id;
  END IF;
  SELECT * INTO l FROM public.booking_requests WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
  IF l.mt_personal THEN RAISE EXCEPTION 'PERSONAL_CASE'; END IF;
  IF l.organization_id IS NULL THEN RAISE EXCEPTION 'BUYER_NOT_LINKED'; END IF;
  IF l.contact_id IS NULL THEN RAISE EXCEPTION 'CONTACT_NOT_LINKED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crm_contacts WHERE id = l.contact_id AND organization_id = l.organization_id) THEN RAISE EXCEPTION 'CONTACT_ORGANIZATION_MISMATCH'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crm_offers WHERE id = p_offer_id AND lead_id = l.id AND status = 'accepted') THEN RAISE EXCEPTION 'OFFER_NOT_ACCEPTED'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'AMOUNT_REQUIRED'; END IF;
  SELECT coalesce(max(version_no),0) + 1 INTO n FROM public.crm_offer_versions WHERE offer_id = p_offer_id;
  INSERT INTO public.crm_offer_versions(offer_id, version_no, organization_id, contact_id, service_key, content, vat_rate, vat_basis, starts_on, ends_on, terms, payment_terms)
  VALUES (p_offer_id, n, l.organization_id, l.contact_id, coalesce(l.service_key,'aly'), trim(p_content),
    CASE WHEN p_vat_basis = 'koulutus_veroton' THEN 0 ELSE 25.5 END, p_vat_basis, p_starts_on, coalesce(p_ends_on, p_starts_on), trim(p_terms), trim(p_payment_terms))
  RETURNING id INTO ver;
  INSERT INTO public.crm_offer_version_lines(version_id, line_no, description, quantity, unit_price) VALUES (ver, 1, left(trim(p_content), 200), 1, p_amount);
  UPDATE public.crm_offer_versions SET approved_at = now(), approval_method = p_approval_method, approval_note = trim(p_approval_note) WHERE id = ver;
  RETURN public.crm_confirm_order(ver, p_idempotency_key);
END $$;

REVOKE ALL ON FUNCTION public.crm_find_organization_candidates(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_link_lead_customer(uuid,uuid,uuid,uuid,text,text,uuid,text,text,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_confirm_company_order(uuid,uuid,text,numeric,text,date,date,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_find_organization_candidates(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_link_lead_customer(uuid,uuid,uuid,uuid,text,text,uuid,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_confirm_company_order(uuid,uuid,text,numeric,text,date,date,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_normalize_business_id(text) TO authenticated;
