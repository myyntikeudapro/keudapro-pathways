ALTER FUNCTION public.crm_guard_organization() SECURITY DEFINER;
CREATE TABLE public.crm_order_command_ops (
 op_key text PRIMARY KEY, request jsonb NOT NULL, order_id uuid NOT NULL REFERENCES public.crm_orders(id), actor_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.crm_order_command_ops TO service_role;
ALTER TABLE public.crm_order_command_ops ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.crm_confirm_company_order(
 p_lead_id uuid,p_offer_id uuid,p_content text,p_amount numeric,p_vat_basis text,
 p_starts_on date,p_ends_on date,p_terms text,p_payment_terms text,
 p_approval_method text,p_approval_note text,p_idempotency_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE me uuid:=auth.uid(); l public.booking_requests; existing public.crm_orders; op public.crm_order_command_ops; ver uuid; n int; payload jsonb; oid uuid;
BEGIN
 IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
 IF p_idempotency_key IS NULL OR length(p_idempotency_key) NOT BETWEEN 8 AND 100 THEN RAISE EXCEPTION 'OP_KEY_REQUIRED'; END IF;
 payload:=jsonb_build_array(p_lead_id,p_offer_id,trim(p_content),p_amount,p_vat_basis,p_starts_on,coalesce(p_ends_on,p_starts_on),trim(p_terms),trim(p_payment_terms),p_approval_method,trim(p_approval_note));
 PERFORM pg_advisory_xact_lock(hashtextextended('crm-order:'||p_idempotency_key,0));
 SELECT * INTO op FROM public.crm_order_command_ops WHERE op_key=p_idempotency_key;
 IF FOUND THEN IF op.request IS DISTINCT FROM payload THEN RAISE EXCEPTION 'OP_KEY_REUSED'; END IF; RETURN op.order_id; END IF;
 SELECT * INTO l FROM public.booking_requests WHERE id=p_lead_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
 IF l.mt_personal THEN RAISE EXCEPTION 'PERSONAL_CASE'; END IF;
 IF l.organization_id IS NULL THEN RAISE EXCEPTION 'BUYER_NOT_LINKED'; END IF;
 IF l.contact_id IS NULL THEN RAISE EXCEPTION 'CONTACT_NOT_LINKED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.crm_contacts WHERE id=l.contact_id AND organization_id=l.organization_id) THEN RAISE EXCEPTION 'CONTACT_ORGANIZATION_MISMATCH'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.crm_offers WHERE id=p_offer_id AND lead_id=l.id AND status='accepted') THEN RAISE EXCEPTION 'OFFER_NOT_ACCEPTED'; END IF;
 IF p_amount IS NULL OR p_amount<=0 OR p_amount::text IN ('NaN','Infinity','-Infinity') OR p_amount<>round(p_amount,2) THEN RAISE EXCEPTION 'AMOUNT_REQUIRED'; END IF;
 IF p_starts_on IS NULL OR NOT isfinite(p_starts_on) OR (p_ends_on IS NOT NULL AND (NOT isfinite(p_ends_on) OR p_ends_on<p_starts_on)) THEN RAISE EXCEPTION 'ORDER_DATES_INVALID'; END IF;
 SELECT * INTO existing FROM public.crm_orders WHERE idempotency_key=p_idempotency_key;
 IF FOUND THEN
  IF existing.lead_id<>p_lead_id OR existing.organization_id<>l.organization_id OR existing.contact_id<>l.contact_id OR existing.total_net IS DISTINCT FROM p_amount OR existing.starts_on IS DISTINCT FROM p_starts_on OR existing.ends_on IS DISTINCT FROM coalesce(p_ends_on,p_starts_on) OR existing.vat_basis IS DISTINCT FROM p_vat_basis OR existing.terms IS DISTINCT FROM trim(p_terms) OR existing.payment_terms IS DISTINCT FROM trim(p_payment_terms) OR NOT EXISTS(SELECT 1 FROM public.crm_offer_versions WHERE id=existing.offer_version_id AND offer_id=p_offer_id AND content IS NOT DISTINCT FROM trim(p_content) AND approval_method IS NOT DISTINCT FROM p_approval_method AND approval_note IS NOT DISTINCT FROM trim(p_approval_note)) THEN RAISE EXCEPTION 'OP_KEY_REUSED'; END IF;
  oid:=existing.id;
 ELSE
  SELECT coalesce(max(version_no),0)+1 INTO n FROM public.crm_offer_versions WHERE offer_id=p_offer_id;
  INSERT INTO public.crm_offer_versions(offer_id,version_no,organization_id,contact_id,service_key,content,vat_rate,vat_basis,starts_on,ends_on,terms,payment_terms)
  VALUES(p_offer_id,n,l.organization_id,l.contact_id,coalesce(l.service_key,'aly'),trim(p_content),CASE WHEN p_vat_basis='koulutus_veroton' THEN 0 ELSE 25.5 END,p_vat_basis,p_starts_on,coalesce(p_ends_on,p_starts_on),trim(p_terms),trim(p_payment_terms)) RETURNING id INTO ver;
  INSERT INTO public.crm_offer_version_lines(version_id,line_no,description,quantity,unit_price) VALUES(ver,1,left(trim(p_content),200),1,p_amount);
  UPDATE public.crm_offer_versions SET approved_at=now(),approval_method=p_approval_method,approval_note=trim(p_approval_note) WHERE id=ver;
  oid:=public.crm_confirm_order(ver,p_idempotency_key);
 END IF;
 INSERT INTO public.crm_order_command_ops(op_key,request,order_id,actor_id) VALUES(p_idempotency_key,payload,oid,me);
 RETURN oid;
END $$;
REVOKE ALL ON FUNCTION public.crm_confirm_company_order(uuid,uuid,text,numeric,text,date,date,text,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.crm_confirm_company_order(uuid,uuid,text,numeric,text,date,date,text,text,text,text,text) TO authenticated;