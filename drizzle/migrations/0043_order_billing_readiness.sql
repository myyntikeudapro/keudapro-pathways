CREATE OR REPLACE FUNCTION public.crm_read_billing_plan(p_order_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.crm_orders; p public.crm_billing_plans; rows jsonb; today date:=(now() AT TIME ZONE 'Europe/Helsinki')::date; stale boolean; cancelled boolean; count_rows integer; sum_amount numeric; invalid boolean;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'BILLING_FORBIDDEN' USING ERRCODE='42501'; END IF;
 SELECT * INTO o FROM public.crm_orders WHERE id=p_order_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
 SELECT * INTO p FROM public.crm_billing_plans WHERE order_id=o.id;
 SELECT count(*),sum(amount) INTO count_rows,sum_amount FROM public.crm_billing_installments WHERE order_id=o.id;
 invalid:=p.order_id IS NOT NULL AND (count_rows=0 OR sum_amount IS DISTINCT FROM o.total_net OR (p.mode IN ('start','end') AND (count_rows<>1 OR EXISTS(SELECT 1 FROM public.crm_billing_installments WHERE order_id=o.id AND due_on IS DISTINCT FROM CASE WHEN p.mode='start' THEN o.starts_on ELSE o.ends_on END))));
 stale:=p.order_id IS NOT NULL AND (p.total_net IS DISTINCT FROM o.total_net OR p.starts_on IS DISTINCT FROM o.starts_on OR p.ends_on IS DISTINCT FROM o.ends_on OR invalid);
 cancelled:=o.cancelled_at IS NOT NULL OR EXISTS(SELECT 1 FROM public.prod_deliveries WHERE order_id=o.id AND production_status='peruttu');
 SELECT coalesce(jsonb_agg(to_jsonb(i)||jsonb_build_object('due',p.order_id IS NOT NULL AND i.due_on<=today AND i.payment_status='ei_laskutettu' AND NOT coalesce(stale,false) AND NOT cancelled) ORDER BY seq),'[]'::jsonb) INTO rows FROM public.crm_billing_installments i WHERE order_id=o.id;
 RETURN jsonb_build_object('order',to_jsonb(o),'plan',CASE WHEN p.order_id IS NULL THEN NULL ELSE to_jsonb(p) END,'installments',rows,'stale',coalesce(stale,false),'cancelled',cancelled,'today',today);
END $$;
REVOKE ALL ON FUNCTION public.crm_read_billing_plan(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.crm_read_billing_plan(uuid) TO authenticated;
NOTIFY pgrst,'reload schema';