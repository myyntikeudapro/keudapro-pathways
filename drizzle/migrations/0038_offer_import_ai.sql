ALTER TABLE public.crm_offer_versions
  ADD COLUMN billing_mode text CHECK (billing_mode IN ('start','installments','end')),
  ADD COLUMN billing_installments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN imported boolean NOT NULL DEFAULT false;

CREATE TABLE public.crm_offer_import_ops (
  op_key text PRIMARY KEY, request_hash text NOT NULL, result jsonb NOT NULL, actor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.crm_offer_import_ops TO service_role;
ALTER TABLE public.crm_offer_import_ops ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_ai_import_usage (
  id bigserial PRIMARY KEY, user_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.crm_ai_import_usage TO service_role;
GRANT USAGE ON SEQUENCE public.crm_ai_import_usage_id_seq TO service_role;
ALTER TABLE public.crm_ai_import_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX crm_ai_import_usage_idx ON public.crm_ai_import_usage(user_id, created_at);

CREATE OR REPLACE FUNCTION public.crm_ai_import_consume(p_user uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF p_user IS NULL OR NOT public.staff_has_editor_role(p_user) THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('crm-ai-import', 0));
  DELETE FROM public.crm_ai_import_usage WHERE created_at < now() - interval '2 days';
  IF (SELECT count(*) FROM public.crm_ai_import_usage WHERE user_id=p_user AND created_at > now()-interval '1 hour') >= 20 THEN RETURN false; END IF;
  IF (SELECT count(*) FROM public.crm_ai_import_usage WHERE created_at > now()-interval '1 day') >= 200 THEN RETURN false; END IF;
  INSERT INTO public.crm_ai_import_usage(user_id) VALUES (p_user);
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.crm_ai_import_consume(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_ai_import_consume(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.crm_import_offer(p jsonb, p_op_key text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  me uuid := auth.uid(); op public.crm_offer_import_ops; h text; l public.booking_requests;
  bid text; org uuid; con uuid; lead uuid; link jsonb; offer uuid; ver uuid;
  impl int; price numeric; vat numeric; total numeric; mode text; inst jsonb; row jsonb; s numeric := 0; prev date; dt date; a numeric;
  src text; email text; cname text; chunk int; parts int; content text; pay text; res jsonb;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  IF p_op_key IS NULL OR length(p_op_key) NOT BETWEEN 8 AND 100 THEN RAISE EXCEPTION 'OP_KEY_REQUIRED'; END IF;
  IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN RAISE EXCEPTION 'IMPORT_INVALID'; END IF;
  h := md5(p::text);
  PERFORM pg_advisory_xact_lock(hashtextextended('crm-import-op:'||p_op_key,0));
  SELECT * INTO op FROM public.crm_offer_import_ops WHERE op_key=p_op_key;
  IF FOUND THEN
    IF op.request_hash = h THEN RETURN op.result || jsonb_build_object('replayed',true); END IF;
    RAISE EXCEPTION 'OP_KEY_REUSED' USING ERRCODE='23505';
  END IF;

  src := p->>'source_text';
  IF coalesce(length(trim(src)),0) NOT BETWEEN 1 AND 60000 THEN RAISE EXCEPTION 'SOURCE_TEXT_REQUIRED'; END IF;
  bid := public.crm_normalize_business_id(p->>'business_id');
  IF bid IS NULL THEN RAISE EXCEPTION 'INVALID_BUSINESS_ID' USING ERRCODE='22023'; END IF;
  IF coalesce(trim(p->>'organization_name'),'') = '' THEN RAISE EXCEPTION 'ORGANIZATION_NAME_REQUIRED'; END IF;
  IF coalesce(trim(p->>'service_title'),'') = '' OR length(p->>'service_title') > 200 THEN RAISE EXCEPTION 'SERVICE_REQUIRED'; END IF;
  impl := (p->>'implementations')::int;
  price := (p->>'unit_price')::numeric;
  vat := (p->>'vat_rate')::numeric;
  IF impl IS NULL OR impl < 1 OR impl > 1000 THEN RAISE EXCEPTION 'IMPLEMENTATIONS_REQUIRED'; END IF;
  IF price IS NULL OR price < 0 OR price <> round(price,2) THEN RAISE EXCEPTION 'PRICE_REQUIRED'; END IF;
  IF vat IS NOT NULL AND (vat < 0 OR vat > 100) THEN RAISE EXCEPTION 'VAT_INVALID'; END IF;
  IF (p->>'expected_close') IS NULL THEN RAISE EXCEPTION 'EXPECTED_CLOSE_REQUIRED'; END IF;
  total := round(price * impl, 2);

  -- Billing proposal validated with the same rules as crm_save_billing_plan; no plan exists before an order.
  mode := nullif(p->>'billing_mode','');
  inst := coalesce(p->'billing_installments','[]'::jsonb);
  IF mode IS NOT NULL AND mode NOT IN ('start','installments','end') THEN RAISE EXCEPTION 'BILLING_MODE_REQUIRED'; END IF;
  IF jsonb_typeof(inst) <> 'array' THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENTS'; END IF;
  IF mode = 'installments' THEN
    IF jsonb_array_length(inst) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENTS'; END IF;
    FOR row IN SELECT value FROM jsonb_array_elements(inst) LOOP
      IF jsonb_typeof(row)<>'object' OR jsonb_typeof(row->'amount')<>'number' OR coalesce(row->>'due_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENT'; END IF;
      a := (row->>'amount')::numeric; dt := (row->>'due_on')::date;
      IF a<=0 OR a<>round(a,2) THEN RAISE EXCEPTION 'BILLING_INVALID_AMOUNT'; END IF;
      IF prev IS NOT NULL AND dt < prev THEN RAISE EXCEPTION 'BILLING_INVALID_DATE_ORDER'; END IF;
      prev := dt; s := s + a;
    END LOOP;
    IF s <> total THEN RAISE EXCEPTION 'BILLING_TOTAL_MISMATCH'; END IF;
  ELSIF jsonb_array_length(inst) <> 0 THEN RAISE EXCEPTION 'BILLING_AUTOMATIC_DATE';
  END IF;

  email := nullif(lower(trim(p->>'contact_email')),'');
  cname := nullif(trim(p->>'contact_name'),'');
  SELECT id INTO org FROM public.crm_organizations WHERE business_id = bid;
  IF org IS NOT NULL AND email IS NOT NULL THEN
    SELECT id INTO con FROM public.crm_contacts WHERE organization_id=org AND lower(email)=email;
  END IF;

  IF (p->>'lead_id') IS NOT NULL THEN
    SELECT * INTO l FROM public.booking_requests WHERE id=(p->>'lead_id')::uuid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
    IF l.mt_personal THEN RAISE EXCEPTION 'PERSONAL_CASE'; END IF;
    IF l.organization_id IS NOT NULL AND l.organization_id IS DISTINCT FROM org THEN RAISE EXCEPTION 'LEAD_LINKED_ELSEWHERE'; END IF;
  ELSE
    INSERT INTO public.booking_requests(name,email,phone,organization,meeting_format,message,source,owner_id)
    VALUES (coalesce(cname, trim(p->>'organization_name')), coalesce(email,''), nullif(trim(p->>'contact_phone'),''),
            trim(p->>'organization_name'), 'muu', 'Tuotu tarjous tai keskustelu työtilassa', 'tarjouksen_tuonti', me)
    RETURNING * INTO l;
  END IF;
  lead := l.id;

  link := public.crm_link_lead_customer(lead, l.organization_id, l.contact_id,
    org, CASE WHEN org IS NULL THEN trim(p->>'organization_name') END, CASE WHEN org IS NULL THEN bid END,
    con, CASE WHEN con IS NULL AND email IS NOT NULL THEN cname END, CASE WHEN con IS NULL THEN email END,
    CASE WHEN con IS NULL AND email IS NOT NULL THEN nullif(trim(p->>'contact_phone'),'') END,
    'import:'||p_op_key);
  org := (link->>'organization_id')::uuid; con := nullif(link->>'contact_id','')::uuid;

  INSERT INTO public.crm_offers(lead_id,title,amount,probability,expected_close,status)
  VALUES (lead, trim(p->>'service_title'), total, 50, (p->>'expected_close')::date, 'draft') RETURNING id INTO offer;

  content := concat_ws(E'\n', 'Palvelu: '||trim(p->>'service_title'), 'Toteutuksia: '||impl,
    'Kesto: '||nullif(trim(p->>'duration'),''), 'Toteutustapa: '||nullif(trim(p->>'delivery'),''),
    'Toivottu ajankohta: '||nullif(trim(p->>'preferred_timing'),''), 'Yhteyshenkilön rooli: '||nullif(trim(p->>'contact_role'),''));
  pay := CASE mode WHEN 'start' THEN 'Laskutus koulutuksen alkaessa' WHEN 'end' THEN 'Laskutus koulutuksen päätyttyä'
    WHEN 'installments' THEN 'Laskutus osissa' END;
  INSERT INTO public.crm_offer_versions(offer_id,version_no,organization_id,contact_id,service_key,content,vat_rate,vat_basis,payment_terms,billing_mode,billing_installments,imported)
  VALUES (offer,1,org,con,nullif(p->>'service_key',''),content,vat,CASE WHEN vat IS NOT NULL AND vat>0 THEN 'yleinen' END,pay,mode,inst,true)
  RETURNING id INTO ver;
  INSERT INTO public.crm_offer_version_lines(version_id,line_no,description,quantity,unit_price)
  VALUES (ver,1,trim(p->>'service_title'),impl,price);

  parts := ceil(length(src)/1800.0);
  FOR chunk IN 1..parts LOOP
    INSERT INTO public.crm_interactions(lead_id,kind,summary)
    VALUES (lead,'email','Tuotu alkuperäinen teksti ('||chunk||'/'||parts||E'):\n'||substr(src,(chunk-1)*1800+1,1800));
  END LOOP;
  IF coalesce((p->>'approval_suggested')::boolean,false) THEN
    INSERT INTO public.crm_interactions(lead_id,kind,summary)
    VALUES (lead,'note',left('Tekoälyn ehdotus: tekstissä on merkkejä asiakkaan hyväksynnästä. Ei kirjattu hyväksynnäksi – ihminen vahvistaa erikseen.'||coalesce(E'\nLainaus: '||nullif(trim(p->>'approval_evidence'),''),''),2000));
  END IF;

  res := jsonb_build_object('lead_id',lead,'organization_id',org,'contact_id',con,'offer_id',offer,'offer_version_id',ver,
    'organization_created',(link->>'organization_created')::boolean,'contact_created',(link->>'contact_created')::boolean,'history_parts',parts);
  INSERT INTO public.crm_audit(table_name,row_id,action,actor_id,changes)
  VALUES ('crm_offers',offer,'import_offer',me,jsonb_build_object('op_key',p_op_key,'offer_version_id',ver,'lead_id',lead));
  INSERT INTO public.crm_offer_import_ops(op_key,request_hash,result,actor_id) VALUES (p_op_key,h,res,me);
  RETURN res;
END $$;
REVOKE ALL ON FUNCTION public.crm_import_offer(jsonb,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_import_offer(jsonb,text) TO authenticated;