CREATE OR REPLACE FUNCTION public.crm_confirm_order(p_version_id uuid, p_idempotency_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF v.approved_at IS NULL OR v.approved_by IS NULL THEN missing := array_append(missing, 'ihmisen kirjaama hyväksyntä'::text); END IF;
  IF v.organization_id IS NULL THEN missing := array_append(missing, 'ostaja'::text); END IF;
  IF v.contact_id IS NULL THEN missing := array_append(missing, 'tilaajan vastuuhenkilö'::text); END IF;
  IF v.service_key IS NULL THEN missing := array_append(missing, 'tuote tai palvelu'::text); END IF;
  IF coalesce(trim(v.content), '') = '' THEN missing := array_append(missing, 'sovittu sisältö'::text); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crm_offer_version_lines WHERE version_id = v.id) THEN missing := array_append(missing, 'hinnoitellut rivit'::text); END IF;
  IF v.vat_rate IS NULL OR v.vat_basis IS NULL THEN missing := array_append(missing, 'ALV-käsittelyn lähtötiedot'::text); END IF;
  IF v.starts_on IS NULL THEN missing := array_append(missing, 'aikataulu'::text); END IF;
  IF coalesce(trim(v.terms), '') = '' OR coalesce(trim(v.payment_terms), '') = '' THEN missing := array_append(missing, 'sopimus- ja maksuehdot'::text); END IF;
  IF l.owner_id IS NULL THEN missing := array_append(missing, 'KeudaPROn vastuuhenkilö'::text); END IF;
  IF v.contact_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.crm_contacts WHERE id = v.contact_id AND organization_id = v.organization_id) THEN missing := array_append(missing, 'yhteyshenkilö kuuluu ostajaan'::text); END IF;
  IF v.organization_id IS NOT NULL AND l.organization_id IS DISTINCT FROM v.organization_id THEN missing := array_append(missing, 'ostaja on yhteydenoton vahvistettu organisaatio'::text); END IF;
  IF cardinality(missing) > 0 THEN RAISE EXCEPTION 'Ei valmis tuotantoon. Puuttuu: %', array_to_string(missing, ', ') USING ERRCODE = 'P0001'; END IF;
  SELECT sum(quantity * unit_price) INTO total FROM public.crm_offer_version_lines WHERE version_id = v.id;
  INSERT INTO public.crm_orders(lead_id, offer_version_id, idempotency_key, organization_id, contact_id, owner_id, service_key, vat_rate, vat_basis, starts_on, ends_on, terms, payment_terms, total_net, confirmed_by)
  VALUES (l.id, v.id, p_idempotency_key, v.organization_id, v.contact_id, l.owner_id, v.service_key, v.vat_rate, v.vat_basis, v.starts_on, v.ends_on, v.terms, v.payment_terms, total, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO public.crm_order_lines(order_id, line_no, description, quantity, unit_price)
  SELECT new_id, line_no, description, quantity, unit_price FROM public.crm_offer_version_lines WHERE version_id = v.id ORDER BY line_no;
  RETURN new_id;
END $function$;