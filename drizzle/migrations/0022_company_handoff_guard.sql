CREATE OR REPLACE FUNCTION public.crm_guard_handoff() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.company_programme_id IS NOT NULL OR NEW.company_programme_id IS NOT NULL THEN
    IF NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
    IF NEW.order_id IS DISTINCT FROM OLD.order_id THEN RAISE EXCEPTION 'COMPANY_HANDOFF_ORDER_IMMUTABLE'; END IF;
    RETURN NEW;
  END IF;
  IF OLD.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Peruttua luovutusta ei voi muuttaa'; END IF;
  NEW.order_id := OLD.order_id; NEW.production_owner_id := OLD.production_owner_id; NEW.handed_by := OLD.handed_by; NEW.handed_at := OLD.handed_at; NEW.note := OLD.note;
  NEW.cancelled_at := now(); NEW.cancelled_by := auth.uid();
  RETURN NEW;
END $$;