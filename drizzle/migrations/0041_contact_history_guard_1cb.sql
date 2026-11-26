CREATE OR REPLACE FUNCTION public.crm_update_contact(p_contact_id uuid, p_expected_updated_at timestamp with time zone, p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  PERFORM set_config('keuda.contact_op', 'edit', true);
  UPDATE public.crm_contacts SET name = v_name, email = v_email, phone = v_phone, interests = v_interests, edited_at = now(), edited_by = me WHERE id = c.id;
  INSERT INTO public.crm_contact_affiliations(contact_id, organization_id, job_title, roles, is_key_person)
  VALUES (c.id, c.organization_id, v_title, v_roles, coalesce((p->>'is_key_person')::boolean, false))
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET job_title = EXCLUDED.job_title, roles = EXCLUDED.roles, is_key_person = EXCLUDED.is_key_person;
  RETURN jsonb_build_object('id', c.id, 'updated_at', (SELECT updated_at FROM public.crm_contacts WHERE id = c.id));
END $function$;

CREATE OR REPLACE FUNCTION public.crm_verify_contact(p_contact_id uuid, p_expected_updated_at timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE me uuid := auth.uid(); c public.crm_contacts;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei oikeutta muokata yhteyshenkilöitä' USING ERRCODE = '42501'; END IF;
  SELECT * INTO c FROM public.crm_contacts WHERE id = p_contact_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Yhteyshenkilöä ei löydy' USING ERRCODE = 'P0002'; END IF;
  IF p_expected_updated_at IS NULL OR c.updated_at <> p_expected_updated_at THEN
    RAISE EXCEPTION 'Tietoja on muutettu toisaalla. Lataa henkilö uudelleen ennen vahvistusta.' USING ERRCODE = '40001'; END IF;
  PERFORM set_config('keuda.contact_op', 'verify', true);
  UPDATE public.crm_contacts SET contact_verified_at = now(), contact_verified_by = me WHERE id = c.id;
  RETURN jsonb_build_object('id', c.id, 'updated_at', (SELECT updated_at FROM public.crm_contacts WHERE id = c.id));
END $function$;

CREATE OR REPLACE FUNCTION public.crm_guard_contact_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $g$
DECLARE op text := coalesce(current_setting('keuda.contact_op', true), '');
BEGIN
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Yhteyshenkilön organisaatiota ei voi vaihtaa' USING ERRCODE = '42501'; END IF;
  IF (NEW.name IS DISTINCT FROM OLD.name OR lower(NEW.email) IS DISTINCT FROM lower(OLD.email))
     AND (EXISTS (SELECT 1 FROM public.crm_orders WHERE contact_id = OLD.id)
          OR EXISTS (SELECT 1 FROM public.crm_offer_versions WHERE contact_id = OLD.id AND approved_at IS NOT NULL)) THEN
    RAISE EXCEPTION 'Henkilö on hyväksytyn tarjouksen tai tilauksen yhteyshenkilö, joten nimeä ja sähköpostia ei voi muuttaa. Puhelin, nimike, roolit ja kiinnostukset voi päivittää.' USING ERRCODE = '42501'; END IF;
  IF (NEW.edited_at IS DISTINCT FROM OLD.edited_at OR NEW.edited_by IS DISTINCT FROM OLD.edited_by) AND op <> 'edit' THEN
    RAISE EXCEPTION 'Muokkausmerkinnän voi asettaa vain henkilökortin tallennus' USING ERRCODE = '42501'; END IF;
  IF (NEW.contact_verified_at IS DISTINCT FROM OLD.contact_verified_at OR NEW.contact_verified_by IS DISTINCT FROM OLD.contact_verified_by) AND op <> 'verify' THEN
    RAISE EXCEPTION 'Tarkistusmerkinnän voi asettaa vain tarkistuksen vahvistus' USING ERRCODE = '42501'; END IF;
  RETURN NEW;
END $g$;
CREATE TRIGGER guard_contact_update BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.crm_guard_contact_update();