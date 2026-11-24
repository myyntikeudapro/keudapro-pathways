-- Organisations and contacts
CREATE TABLE public.crm_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  business_id text UNIQUE,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.crm_organizations(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX crm_contacts_org_email ON public.crm_contacts(organization_id, lower(email));

ALTER TABLE public.booking_requests
  ADD COLUMN organization_id uuid REFERENCES public.crm_organizations(id),
  ADD COLUMN contact_id uuid REFERENCES public.crm_contacts(id),
  ADD COLUMN updated_at timestamptz DEFAULT now(),
  ADD COLUMN ai_level text CHECK (ai_level IN ('aktivointi','pätevöittäminen','rakentaminen')),
  ADD COLUMN ai_procurement text CHECK (ai_procurement IN ('suorahankinta','kilpailutus','puitesopimus','muutosturva','tuntematon')),
  ADD COLUMN ai_recommendation text,
  ADD COLUMN ai_model text,
  ADD COLUMN ai_classified_at timestamptz;
COMMENT ON COLUMN public.booking_requests.ai_level IS 'Advisory AI classification only; never used to approve orders.';

CREATE TABLE public.crm_offer_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.crm_offers(id),
  version_no integer NOT NULL CHECK (version_no > 0),
  organization_id uuid REFERENCES public.crm_organizations(id),
  contact_id uuid REFERENCES public.crm_contacts(id),
  service_key text,
  content text,
  vat_rate numeric CHECK (vat_rate >= 0 AND vat_rate <= 100),
  vat_basis text CHECK (vat_basis IN ('yleinen','koulutus_veroton','kaannetty','muu')),
  starts_on date,
  ends_on date,
  terms text,
  payment_terms text,
  approved_at timestamptz,
  approved_by uuid,
  approval_method text CHECK (approval_method IN ('sahkoposti','allekirjoitus','suullinen_muistio')),
  approval_note text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (offer_id, version_no),
  CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);
CREATE TABLE public.crm_offer_version_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES public.crm_offer_versions(id),
  line_no integer NOT NULL CHECK (line_no > 0),
  description text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, line_no)
);

CREATE TABLE public.crm_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.booking_requests(id),
  offer_version_id uuid NOT NULL UNIQUE REFERENCES public.crm_offer_versions(id),
  idempotency_key text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.crm_organizations(id),
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id),
  owner_id uuid NOT NULL,
  service_key text NOT NULL,
  vat_rate numeric NOT NULL,
  vat_basis text NOT NULL,
  starts_on date NOT NULL,
  ends_on date,
  terms text NOT NULL,
  payment_terms text NOT NULL,
  total_net numeric NOT NULL,
  confirmed_by uuid NOT NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.crm_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.crm_orders(id),
  line_no integer NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, line_no)
);
CREATE TABLE public.crm_production_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.crm_orders(id),
  production_owner_id uuid NOT NULL,
  handed_by uuid NOT NULL DEFAULT auth.uid(),
  handed_at timestamptz NOT NULL DEFAULT now(),
  note text,
  cancelled_at timestamptz,
  cancelled_by uuid
);
CREATE TABLE public.crm_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  row_id uuid NOT NULL,
  action text NOT NULL,
  actor_id uuid,
  changes jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_audit_row ON public.crm_audit(table_name, row_id, created_at);
CREATE INDEX crm_offer_versions_offer ON public.crm_offer_versions(offer_id);
CREATE INDEX crm_orders_lead ON public.crm_orders(lead_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_organizations, public.crm_contacts, public.crm_offer_versions, public.crm_offer_version_lines TO authenticated;
GRANT SELECT ON public.crm_orders, public.crm_order_lines, public.crm_audit TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.crm_production_handoffs TO authenticated;
GRANT ALL ON public.crm_organizations, public.crm_contacts, public.crm_offer_versions, public.crm_offer_version_lines, public.crm_orders, public.crm_order_lines, public.crm_production_handoffs, public.crm_audit TO service_role;

ALTER TABLE public.crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_offer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_offer_version_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_production_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team manages organizations" ON public.crm_organizations FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team manages contacts" ON public.crm_contacts FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team manages offer versions" ON public.crm_offer_versions FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team manages offer lines" ON public.crm_offer_version_lines FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team reads orders" ON public.crm_orders FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team reads order lines" ON public.crm_order_lines FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team reads handoffs" ON public.crm_production_handoffs FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team hands off orders" ON public.crm_production_handoffs FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin(auth.uid()) AND handed_by = auth.uid() AND public.is_editor_or_admin(production_owner_id) AND cancelled_at IS NULL);
CREATE POLICY "Admins cancel handoffs" ON public.crm_production_handoffs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND cancelled_by = auth.uid());
CREATE POLICY "Team reads audit" ON public.crm_audit FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));

CREATE TRIGGER trg_crm_organizations_updated BEFORE UPDATE ON public.crm_organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crm_contacts_updated BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_booking_requests_updated BEFORE UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.crm_guard_offer_version() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.approved_at IS NOT NULL THEN RAISE EXCEPTION 'Hyväksyttyä tarjousversiota ei voi poistaa'; END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.approved_at IS NOT NULL OR NEW.approved_by IS NOT NULL THEN RAISE EXCEPTION 'Versio hyväksytään vasta tallentamisen jälkeen'; END IF;
    NEW.created_by := coalesce(auth.uid(), NEW.created_by);
    RETURN NEW;
  END IF;
  IF OLD.approved_at IS NOT NULL THEN RAISE EXCEPTION 'Hyväksyttyä tarjousversiota ei voi muuttaa; tee uusi versio'; END IF;
  IF NEW.approved_at IS NOT NULL THEN
    IF NEW.approval_method IS NULL THEN RAISE EXCEPTION 'Hyväksynnän tapa puuttuu'; END IF;
    NEW.approved_by := auth.uid();
    NEW.approved_at := now();
    IF NEW.approved_by IS NULL THEN RAISE EXCEPTION 'Hyväksyjä puuttuu'; END IF;
  END IF;
  NEW.id := OLD.id; NEW.offer_id := OLD.offer_id; NEW.version_no := OLD.version_no; NEW.created_by := OLD.created_by; NEW.created_at := OLD.created_at;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_offer_version BEFORE INSERT OR UPDATE OR DELETE ON public.crm_offer_versions FOR EACH ROW EXECUTE FUNCTION public.crm_guard_offer_version();

CREATE OR REPLACE FUNCTION public.crm_guard_offer_line() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v uuid := CASE WHEN TG_OP = 'DELETE' THEN OLD.version_id ELSE NEW.version_id END;
BEGIN
  IF EXISTS (SELECT 1 FROM public.crm_offer_versions WHERE id = v AND approved_at IS NOT NULL)
     OR (TG_OP = 'UPDATE' AND EXISTS (SELECT 1 FROM public.crm_offer_versions WHERE id = OLD.version_id AND approved_at IS NOT NULL)) THEN
    RAISE EXCEPTION 'Hyväksytyn version rivejä ei voi muuttaa';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;
CREATE TRIGGER guard_offer_line BEFORE INSERT OR UPDATE OR DELETE ON public.crm_offer_version_lines FOR EACH ROW EXECUTE FUNCTION public.crm_guard_offer_line();

CREATE OR REPLACE FUNCTION public.crm_guard_handoff() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Peruttua luovutusta ei voi muuttaa'; END IF;
  NEW.order_id := OLD.order_id; NEW.production_owner_id := OLD.production_owner_id; NEW.handed_by := OLD.handed_by; NEW.handed_at := OLD.handed_at; NEW.note := OLD.note;
  NEW.cancelled_at := now(); NEW.cancelled_by := auth.uid();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_handoff BEFORE UPDATE ON public.crm_production_handoffs FOR EACH ROW EXECUTE FUNCTION public.crm_guard_handoff();

CREATE OR REPLACE FUNCTION public.crm_audit_row() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.crm_audit(table_name, row_id, action, actor_id, changes)
  VALUES (TG_TABLE_NAME, CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END, lower(TG_OP), auth.uid(),
    CASE TG_OP WHEN 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW)) WHEN 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD)) ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)) END);
  RETURN NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.crm_audit_row() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON public.crm_organizations FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_contacts AFTER INSERT OR UPDATE OR DELETE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_offer_versions AFTER INSERT OR UPDATE OR DELETE ON public.crm_offer_versions FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_offer_lines AFTER INSERT OR UPDATE OR DELETE ON public.crm_offer_version_lines FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.crm_orders FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_order_lines AFTER INSERT ON public.crm_order_lines FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_handoffs AFTER INSERT OR UPDATE ON public.crm_production_handoffs FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();

CREATE OR REPLACE FUNCTION public.crm_confirm_order(p_version_id uuid, p_idempotency_key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  IF cardinality(missing) > 0 THEN RAISE EXCEPTION 'Ei valmis tuotantoon. Puuttuu: %', array_to_string(missing, ', ') USING ERRCODE = 'P0001'; END IF;
  SELECT sum(quantity * unit_price) INTO total FROM public.crm_offer_version_lines WHERE version_id = v.id;
  INSERT INTO public.crm_orders(lead_id, offer_version_id, idempotency_key, organization_id, contact_id, owner_id, service_key, vat_rate, vat_basis, starts_on, ends_on, terms, payment_terms, total_net, confirmed_by)
  VALUES (l.id, v.id, p_idempotency_key, v.organization_id, v.contact_id, l.owner_id, v.service_key, v.vat_rate, v.vat_basis, v.starts_on, v.ends_on, v.terms, v.payment_terms, total, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO public.crm_order_lines(order_id, line_no, description, quantity, unit_price)
  SELECT new_id, line_no, description, quantity, unit_price FROM public.crm_offer_version_lines WHERE version_id = v.id ORDER BY line_no;
  RETURN new_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.crm_confirm_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_confirm_order(uuid, text) TO authenticated;

REVOKE ALL ON public.crm_organizations, public.crm_contacts, public.crm_offer_versions, public.crm_offer_version_lines, public.crm_orders, public.crm_order_lines, public.crm_production_handoffs, public.crm_audit FROM anon, PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.crm_orders, public.crm_order_lines, public.crm_audit FROM authenticated;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.crm_production_handoffs FROM authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.crm_organizations, public.crm_contacts, public.crm_offer_versions, public.crm_offer_version_lines FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.crm_guard_offer_version(), public.crm_guard_offer_line(), public.crm_guard_handoff() FROM PUBLIC, anon, authenticated;