ALTER TABLE public.prod_deliveries ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE public.prod_deliveries ADD CONSTRAINT prod_deliveries_source_chk CHECK (order_id IS NOT NULL OR offering_group IS NOT NULL);

CREATE OR REPLACE FUNCTION public.prod_create_group_delivery(p_offering uuid, p_production_owner uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
  IF NOT public.is_editor_or_admin(owner) THEN RAISE EXCEPTION 'Tuotannon vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
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
END $$;
REVOKE ALL ON FUNCTION public.prod_create_group_delivery(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.prod_create_group_delivery(uuid,uuid) TO authenticated, service_role;