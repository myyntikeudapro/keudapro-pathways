CREATE TABLE public.crm_billing_plans (
 order_id uuid PRIMARY KEY REFERENCES public.crm_orders(id),
 mode text NOT NULL CHECK (mode IN ('start','installments','end')),
 version integer NOT NULL DEFAULT 1 CHECK (version>0),
 total_net numeric NOT NULL CHECK (total_net>0 AND total_net=round(total_net,2)),
 starts_on date NOT NULL, ends_on date NOT NULL CHECK (ends_on>=starts_on),
 confirmed_by uuid NOT NULL, confirmed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crm_billing_plans TO authenticated;
GRANT ALL ON public.crm_billing_plans TO service_role;
ALTER TABLE public.crm_billing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_plan_staff_read ON public.crm_billing_plans FOR SELECT TO authenticated USING(public.is_editor_or_admin(auth.uid()));
CREATE TABLE public.crm_billing_installments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id uuid NOT NULL REFERENCES public.crm_billing_plans(order_id),
 seq integer NOT NULL CHECK(seq>0), amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 due_on date NOT NULL, payment_status text NOT NULL DEFAULT 'ei_laskutettu' CHECK(payment_status IN ('ei_laskutettu','laskutettu','maksettu')),
 marked_by uuid, marked_at timestamptz, UNIQUE(order_id,seq)
);
GRANT SELECT ON public.crm_billing_installments TO authenticated;
GRANT ALL ON public.crm_billing_installments TO service_role;
ALTER TABLE public.crm_billing_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_installment_staff_read ON public.crm_billing_installments FOR SELECT TO authenticated USING(public.is_editor_or_admin(auth.uid()));
CREATE TABLE public.crm_billing_ops (
 op_key uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES public.crm_orders(id), request jsonb NOT NULL,
 result jsonb NOT NULL, actor_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.crm_billing_ops TO service_role;
ALTER TABLE public.crm_billing_ops ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.crm_read_billing_plan(p_order_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.crm_orders; p public.crm_billing_plans; rows jsonb; today date := (now() AT TIME ZONE 'Europe/Helsinki')::date; stale boolean; cancelled boolean;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'BILLING_FORBIDDEN' USING ERRCODE='42501'; END IF;
 SELECT * INTO o FROM public.crm_orders WHERE id=p_order_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
 SELECT * INTO p FROM public.crm_billing_plans WHERE order_id=o.id;
 stale:=p.order_id IS NOT NULL AND (p.total_net IS DISTINCT FROM o.total_net OR p.starts_on IS DISTINCT FROM o.starts_on OR p.ends_on IS DISTINCT FROM o.ends_on);
 cancelled:=EXISTS(SELECT 1 FROM public.prod_deliveries WHERE order_id=o.id AND production_status='peruttu');
 SELECT coalesce(jsonb_agg(to_jsonb(i)||jsonb_build_object('due', i.due_on<=today AND i.payment_status='ei_laskutettu' AND NOT coalesce(stale,false) AND NOT cancelled) ORDER BY seq),'[]'::jsonb) INTO rows FROM public.crm_billing_installments i WHERE order_id=o.id;
 RETURN jsonb_build_object('order',to_jsonb(o),'plan',CASE WHEN p.order_id IS NULL THEN NULL ELSE to_jsonb(p) END,'installments',rows,'stale',coalesce(stale,false),'cancelled',cancelled,'today',today);
END $$;
CREATE OR REPLACE FUNCTION public.crm_save_billing_plan(p_order_id uuid,p_mode text,p_installments jsonb,p_expected_version integer,p_op_key uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.crm_orders; p public.crm_billing_plans; op public.crm_billing_ops; payload jsonb; row jsonb; sum_amount numeric:=0; a numeric; dt date; prev date; n int:=0; res jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'BILLING_FORBIDDEN' USING ERRCODE='42501'; END IF;
 IF p_op_key IS NULL THEN RAISE EXCEPTION 'OP_KEY_REQUIRED'; END IF;
 payload:=jsonb_build_array('plan',p_order_id,p_mode,p_installments,p_expected_version);
 PERFORM pg_advisory_xact_lock(hashtextextended('billing-op:'||p_op_key,0));
 SELECT * INTO op FROM public.crm_billing_ops WHERE op_key=p_op_key;
 IF FOUND THEN IF op.request IS DISTINCT FROM payload THEN RAISE EXCEPTION 'OP_KEY_REUSED'; END IF; RETURN op.result; END IF;
 SELECT * INTO o FROM public.crm_orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
 IF EXISTS(SELECT 1 FROM public.booking_requests WHERE id=o.lead_id AND mt_personal) THEN RAISE EXCEPTION 'PERSONAL_CASE'; END IF;
 SELECT * INTO p FROM public.crm_billing_plans WHERE order_id=o.id FOR UPDATE;
 IF p_expected_version IS NULL OR coalesce(p.version,0)<>p_expected_version THEN RAISE EXCEPTION 'BILLING_CHANGED' USING ERRCODE='40001'; END IF;
 IF p_mode IS NULL OR p_mode NOT IN ('start','installments','end') THEN RAISE EXCEPTION 'BILLING_MODE_REQUIRED'; END IF;
 IF o.total_net IS NULL OR o.total_net<=0 OR o.total_net::text IN ('NaN','Infinity','-Infinity') OR o.total_net<>round(o.total_net,2) THEN RAISE EXCEPTION 'BILLING_ORDER_AMOUNT'; END IF;
 IF o.starts_on IS NULL OR o.ends_on IS NULL OR NOT isfinite(o.starts_on) OR NOT isfinite(o.ends_on) OR o.ends_on<o.starts_on THEN RAISE EXCEPTION 'BILLING_ORDER_DATES'; END IF;
 IF EXISTS(SELECT 1 FROM public.crm_billing_installments WHERE order_id=o.id AND payment_status<>'ei_laskutettu') THEN RAISE EXCEPTION 'BILLING_ALREADY_MARKED'; END IF;
 IF p_installments IS NULL OR jsonb_typeof(p_installments)<>'array' THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENTS'; END IF;
 IF p_mode='installments' THEN
  IF jsonb_array_length(p_installments) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENTS'; END IF;
  FOR row IN SELECT value FROM jsonb_array_elements(p_installments) LOOP
   IF jsonb_typeof(row)<>'object' OR jsonb_typeof(row->'amount')<>'number' OR coalesce(row->>'due_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RAISE EXCEPTION 'BILLING_INVALID_INSTALLMENT'; END IF;
   a:=(row->>'amount')::numeric; dt:=(row->>'due_on')::date;
   IF a<=0 OR a::text IN ('NaN','Infinity','-Infinity') OR a<>round(a,2) THEN RAISE EXCEPTION 'BILLING_INVALID_AMOUNT'; END IF;
   IF NOT isfinite(dt) OR (prev IS NOT NULL AND dt<prev) THEN RAISE EXCEPTION 'BILLING_INVALID_DATE_ORDER'; END IF;
   prev:=dt; sum_amount:=sum_amount+a;
  END LOOP;
  IF sum_amount<>o.total_net THEN RAISE EXCEPTION 'BILLING_TOTAL_MISMATCH'; END IF;
 ELSE
  IF jsonb_array_length(p_installments)<>0 THEN RAISE EXCEPTION 'BILLING_AUTOMATIC_DATE'; END IF;
 END IF;
 INSERT INTO public.crm_billing_plans(order_id,mode,version,total_net,starts_on,ends_on,confirmed_by)
 VALUES(o.id,p_mode,coalesce(p.version,0)+1,o.total_net,o.starts_on,o.ends_on,auth.uid())
 ON CONFLICT(order_id) DO UPDATE SET mode=excluded.mode,version=excluded.version,total_net=excluded.total_net,starts_on=excluded.starts_on,ends_on=excluded.ends_on,confirmed_by=excluded.confirmed_by,confirmed_at=now();
 DELETE FROM public.crm_billing_installments WHERE order_id=o.id;
 IF p_mode='installments' THEN
  FOR row IN SELECT value FROM jsonb_array_elements(p_installments) LOOP
   n:=n+1; INSERT INTO public.crm_billing_installments(order_id,seq,amount,due_on) VALUES(o.id,n,(row->>'amount')::numeric,(row->>'due_on')::date);
  END LOOP;
 ELSE INSERT INTO public.crm_billing_installments(order_id,seq,amount,due_on) VALUES(o.id,1,o.total_net,CASE WHEN p_mode='start' THEN o.starts_on ELSE o.ends_on END);
 END IF;
 res:=public.crm_read_billing_plan(o.id);
 INSERT INTO public.crm_billing_ops(op_key,order_id,request,result,actor_id) VALUES(p_op_key,o.id,payload,res,auth.uid());
 INSERT INTO public.crm_audit(table_name,row_id,action,actor_id,changes) VALUES('crm_billing_plans',o.id,'confirm_billing_plan',auth.uid(),jsonb_build_object('old',to_jsonb(p),'new',res,'op_key',p_op_key));
 RETURN res;
END $$;
CREATE OR REPLACE FUNCTION public.crm_set_installment_payment(p_installment_id uuid,p_status text,p_expected_version integer,p_op_key uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i public.crm_billing_installments; p public.crm_billing_plans; op public.crm_billing_ops; payload jsonb; res jsonb; oid uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'BILLING_FORBIDDEN' USING ERRCODE='42501'; END IF;
 IF p_op_key IS NULL THEN RAISE EXCEPTION 'OP_KEY_REQUIRED'; END IF;
 payload:=jsonb_build_array('payment',p_installment_id,p_status,p_expected_version);
 PERFORM pg_advisory_xact_lock(hashtextextended('billing-op:'||p_op_key,0));
 SELECT * INTO op FROM public.crm_billing_ops WHERE op_key=p_op_key;
 IF FOUND THEN IF op.request IS DISTINCT FROM payload THEN RAISE EXCEPTION 'OP_KEY_REUSED'; END IF; RETURN op.result; END IF;
 SELECT order_id INTO oid FROM public.crm_billing_installments WHERE id=p_installment_id;
 IF oid IS NULL THEN RAISE EXCEPTION 'INSTALLMENT_NOT_FOUND'; END IF;
 PERFORM 1 FROM public.crm_orders WHERE id=oid FOR UPDATE;
 SELECT * INTO p FROM public.crm_billing_plans WHERE order_id=oid FOR UPDATE;
 SELECT * INTO i FROM public.crm_billing_installments WHERE id=p_installment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'BILLING_CHANGED' USING ERRCODE='40001'; END IF;
 IF p_expected_version IS NULL OR p.version<>p_expected_version THEN RAISE EXCEPTION 'BILLING_CHANGED' USING ERRCODE='40001'; END IF;
 IF p_status IS NULL OR p_status NOT IN ('ei_laskutettu','laskutettu','maksettu') THEN RAISE EXCEPTION 'BILLING_INVALID_STATUS'; END IF;
 res:=public.crm_read_billing_plan(oid);
 IF p_status<>'ei_laskutettu' AND ((res->>'stale')::boolean OR (res->>'cancelled')::boolean OR i.due_on>(now() AT TIME ZONE 'Europe/Helsinki')::date) THEN RAISE EXCEPTION 'BILLING_NOT_DUE'; END IF;
 UPDATE public.crm_billing_installments SET payment_status=p_status,marked_by=auth.uid(),marked_at=now() WHERE id=i.id;
 UPDATE public.crm_billing_plans SET version=version+1 WHERE order_id=oid;
 res:=public.crm_read_billing_plan(oid);
 INSERT INTO public.crm_billing_ops(op_key,order_id,request,result,actor_id) VALUES(p_op_key,oid,payload,res,auth.uid());
 INSERT INTO public.crm_audit(table_name,row_id,action,actor_id,changes) VALUES('crm_billing_installments',i.id,'manual_payment',auth.uid(),jsonb_build_object('old',i.payment_status,'new',p_status,'op_key',p_op_key));
 RETURN res;
END $$;
REVOKE ALL ON FUNCTION public.crm_read_billing_plan(uuid),public.crm_save_billing_plan(uuid,text,jsonb,integer,uuid),public.crm_set_installment_payment(uuid,text,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.crm_read_billing_plan(uuid),public.crm_save_billing_plan(uuid,text,jsonb,integer,uuid),public.crm_set_installment_payment(uuid,text,integer,uuid) TO authenticated;
COMMENT ON COLUMN public.prod_billing_readiness.billing_ready IS 'Production actuals checkpoint only; contract billing eligibility uses crm_billing_plans and crm_billing_installments. Not evidence of invoice delivery.';