ALTER TABLE public.crm_contacts
  ADD COLUMN interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN edited_at timestamptz,
  ADD COLUMN edited_by uuid,
  ADD COLUMN contact_verified_at timestamptz,
  ADD COLUMN contact_verified_by uuid,
  ADD CONSTRAINT crm_contacts_interests_allowed CHECK (interests <@ ARRAY['ai','leadership','safety','wellbeing','staff_development','recruitment','change_security','continuing_education','other']::text[]);

CREATE TABLE public.crm_contact_affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id),
  organization_id uuid NOT NULL REFERENCES public.crm_organizations(id),
  job_title text CHECK (job_title IS NULL OR length(job_title) <= 160),
  roles text[] NOT NULL DEFAULT '{}' CHECK (roles <@ ARRAY['decision_maker','buyer','hr','training_coordinator','training_practical','finance','other']::text[]),
  is_key_person boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, organization_id)
);
GRANT SELECT ON public.crm_contact_affiliations TO authenticated;
GRANT ALL ON public.crm_contact_affiliations TO service_role;
ALTER TABLE public.crm_contact_affiliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read contact affiliations" ON public.crm_contact_affiliations FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE INDEX crm_contact_affiliations_org ON public.crm_contact_affiliations(organization_id);
CREATE TRIGGER audit_contact_affiliations AFTER INSERT OR DELETE OR UPDATE ON public.crm_contact_affiliations FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER trg_crm_contact_affiliations_updated BEFORE UPDATE ON public.crm_contact_affiliations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.crm_update_contact(p_contact_id uuid, p_expected_updated_at timestamptz, p jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); c public.crm_contacts; v_name text; v_email text; v_phone text; v_title text; v_roles text[]; v_interests text[];
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei oikeutta muokata yhteyshenkilöitä' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.crm_contacts WHERE id = p_contact_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Yhteyshenkilöä ei löydy' USING ERRCODE = 'P0002'; END IF;
  IF p_expected_updated_at IS NULL OR c.updated_at <> p_expected_updated_at THEN
    RAISE EXCEPTION 'Tietoja on muutettu toisaalla. Lataa henkilö uudelleen ennen tallennusta.' USING ERRCODE = '40001'; END IF;
  v_name := btrim(coalesce(p->>'name', ''));
  v_email := lower(btrim(coalesce(p->>'email', '')));
  v_phone := nullif(btrim(coalesce(p->>'phone', '')), '');
  v_title := nullif(btrim(coalesce(p->>'job_title', '')), '');
  IF v_name = '' OR length(v_name) > 160 THEN RAISE EXCEPTION 'Nimi puuttuu tai on liian pitkä' USING ERRCODE = '22023'; END IF;
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(v_email) > 254 THEN RAISE EXCEPTION 'Sähköpostiosoite ei kelpaa' USING ERRCODE = '22023'; END IF;
  IF v_phone IS NOT NULL AND length(v_phone) > 40 THEN RAISE EXCEPTION 'Puhelinnumero on liian pitkä' USING ERRCODE = '22023'; END IF;
  SELECT coalesce(array_agg(DISTINCT x ORDER BY x), '{}') INTO v_roles FROM jsonb_array_elements_text(coalesce(p->'roles', '[]')) x;
  SELECT coalesce(array_agg(DISTINCT x ORDER BY x), '{}') INTO v_interests FROM jsonb_array_elements_text(coalesce(p->'interests', '[]')) x;
  IF EXISTS (SELECT 1 FROM public.crm_contacts WHERE organization_id = c.organization_id AND lower(email) = v_email AND id <> c.id) THEN
    RAISE EXCEPTION 'Organisaatiossa on jo yhteyshenkilö tällä sähköpostiosoitteella' USING ERRCODE = '23505'; END IF;
  UPDATE public.crm_contacts SET name = v_name, email = v_email, phone = v_phone, interests = v_interests, edited_at = now(), edited_by = me WHERE id = c.id;
  INSERT INTO public.crm_contact_affiliations(contact_id, organization_id, job_title, roles, is_key_person)
  VALUES (c.id, c.organization_id, v_title, v_roles, coalesce((p->>'is_key_person')::boolean, false))
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET job_title = EXCLUDED.job_title, roles = EXCLUDED.roles, is_key_person = EXCLUDED.is_key_person;
  RETURN jsonb_build_object('id', c.id, 'updated_at', (SELECT updated_at FROM public.crm_contacts WHERE id = c.id));
END $$;

CREATE OR REPLACE FUNCTION public.crm_verify_contact(p_contact_id uuid, p_expected_updated_at timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); c public.crm_contacts;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei oikeutta muokata yhteyshenkilöitä' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.crm_contacts WHERE id = p_contact_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Yhteyshenkilöä ei löydy' USING ERRCODE = 'P0002'; END IF;
  IF p_expected_updated_at IS NULL OR c.updated_at <> p_expected_updated_at THEN
    RAISE EXCEPTION 'Tietoja on muutettu toisaalla. Lataa henkilö uudelleen ennen vahvistusta.' USING ERRCODE = '40001'; END IF;
  UPDATE public.crm_contacts SET contact_verified_at = now(), contact_verified_by = me WHERE id = c.id;
  RETURN jsonb_build_object('id', c.id, 'updated_at', (SELECT updated_at FROM public.crm_contacts WHERE id = c.id));
END $$;

REVOKE ALL ON FUNCTION public.crm_update_contact(uuid, timestamptz, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_verify_contact(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_update_contact(uuid, timestamptz, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_verify_contact(uuid, timestamptz) TO authenticated;