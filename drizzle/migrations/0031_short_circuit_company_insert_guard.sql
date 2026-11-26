CREATE OR REPLACE FUNCTION public.company_structure_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; l uuid; n jsonb:=to_jsonb(NEW); o jsonb;
BEGIN
 IF TG_OP='UPDATE' THEN
  o:=to_jsonb(OLD);
  IF n->'company_programme_id' IS DISTINCT FROM o->'company_programme_id' OR n->'training_model' IS DISTINCT FROM o->'training_model' OR (TG_TABLE_NAME='crm_production_handoffs' AND (n-ARRAY['mt_state','mt_response_by','mt_response_at','mt_return_reason','mt_revision']) IS DISTINCT FROM (o-ARRAY['mt_state','mt_response_by','mt_response_at','mt_return_reason','mt_revision']) AND (n->>'company_programme_id' IS NOT NULL OR o->>'company_programme_id' IS NOT NULL)) THEN
   IF NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
  END IF;
  IF TG_TABLE_NAME='prod_deliveries' AND o->>'training_model'='company' AND (n->>'training_model' IS DISTINCT FROM 'company' OR NEW.company_programme_id IS NULL) THEN RAISE EXCEPTION 'COMPANY_MODEL_IMMUTABLE'; END IF;
 END IF;
 IF NEW.company_programme_id IS NULL THEN
  IF n->>'training_model'='company' OR (TG_TABLE_NAME='crm_production_handoffs' AND n->>'company_state' IS NOT NULL) THEN RAISE EXCEPTION 'Company programme required'; END IF;
  RETURN NEW;
 END IF;
 IF TG_OP='INSERT' THEN
  IF NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
 END IF;
 IF TG_TABLE_NAME='booking_requests' THEN l:=NEW.id; ELSE SELECT lead_id INTO l FROM public.crm_orders WHERE id=NEW.order_id; END IF;
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=NEW.company_programme_id;
 IF v.id IS NULL OR l IS DISTINCT FROM v.case_lead_id OR EXISTS(SELECT 1 FROM public.booking_requests WHERE id=l AND mt_personal) THEN RAISE EXCEPTION 'Company programme case mismatch'; END IF;
 IF TG_TABLE_NAME<>'booking_requests' AND NOT EXISTS(SELECT 1 FROM public.booking_requests WHERE id=l AND company_programme_id=v.id) THEN RAISE EXCEPTION 'COMPANY_STALE_REVISION'; END IF;
 RETURN NEW;
END $$;