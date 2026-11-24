CREATE OR REPLACE FUNCTION public.cat_valid_business_id(p text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE w int[] := ARRAY[7,9,10,5,8,4,2]; s int := 0; r int; c int; i int;
BEGIN
  IF p IS NULL OR p !~ '^[0-9]{7}-[0-9]$' THEN RETURN false; END IF;
  FOR i IN 1..7 LOOP s := s + substr(p, i, 1)::int * w[i]; END LOOP;
  r := s % 11;
  IF r = 1 THEN RETURN false; END IF;
  c := CASE WHEN r = 0 THEN 0 ELSE 11 - r END;
  RETURN c = substr(p, 9, 1)::int;
END $$;

ALTER TABLE public.cat_offerings
  ADD COLUMN registration_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN min_participants integer,
  ADD COLUMN group_key text,
  ADD COLUMN go_status text NOT NULL DEFAULT 'avoin',
  ADD COLUMN go_decided_by uuid,
  ADD COLUMN go_decided_at timestamptz,
  ADD COLUMN go_reason text,
  ADD COLUMN source_key text UNIQUE,
  ADD COLUMN source_status text CHECK (source_status IN ('historical','approval_pending','approved')),
  ADD COLUMN source_deadline date,
  ADD COLUMN administrative_ends_at timestamptz,
  ADD COLUMN schedule jsonb NOT NULL DEFAULT '{"fixed_sessions":[],"flexible_blocks":[]}'::jsonb;
ALTER TABLE public.cat_offerings ADD CONSTRAINT cat_offerings_go_status_chk CHECK (go_status IN ('avoin','toteutuu','peruttu'));
ALTER TABLE public.cat_offerings ADD CONSTRAINT cat_offerings_min_chk CHECK (min_participants IS NULL OR min_participants BETWEEN 1 AND 1000);
CREATE INDEX cat_offerings_group_key_idx ON public.cat_offerings(group_key) WHERE group_key IS NOT NULL;
COMMENT ON COLUMN public.cat_offerings.registration_enabled IS 'Verkkoilmoittautuminen avataan erikseen; muuten sivulla on vain yhteydenottopainike.';

CREATE TABLE public.cat_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK (kind IN ('buyer','billing','payer')),
  org_name text, business_id text, contact_name text NOT NULL, email text NOT NULL, phone text, einvoice_address text,
  billing_address text, billing_postal_code text, billing_city text, einvoice_operator text, order_reference text,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.cat_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), offering_id uuid NOT NULL REFERENCES public.cat_offerings(id),
  seats_requested integer NOT NULL CHECK (seats_requested BETWEEN 1 AND 50),
  buyer_party_id uuid NOT NULL REFERENCES public.cat_parties(id), billing_party_id uuid NOT NULL REFERENCES public.cat_parties(id), payer_party_id uuid NOT NULL REFERENCES public.cat_parties(id),
  terms_accepted_at timestamptz NOT NULL, privacy_version text NOT NULL, marketing_consent boolean NOT NULL DEFAULT false,
  source text NOT NULL CHECK (source IN ('public','staff')), status text NOT NULL DEFAULT 'avoin' CHECK (status IN ('avoin','vahvistettu','peruttu')),
  order_id uuid REFERENCES public.crm_orders(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.cat_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), registration_id uuid NOT NULL REFERENCES public.cat_registrations(id), offering_id uuid NOT NULL REFERENCES public.cat_offerings(id),
  state text NOT NULL CHECK (state IN ('hold','confirmed','released')), hold_expires_at timestamptz,
  participant_name text, participant_email text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((state = 'hold') = (hold_expires_at IS NOT NULL)));
CREATE INDEX cat_seats_offering_idx ON public.cat_seats(offering_id, state);
CREATE TABLE public.cat_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), offering_id uuid NOT NULL REFERENCES public.cat_offerings(id), registration_id uuid NOT NULL REFERENCES public.cat_registrations(id),
  position bigint NOT NULL, seats integer NOT NULL CHECK (seats > 0), state text NOT NULL DEFAULT 'jonossa' CHECK (state IN ('jonossa','tarjottu','poistunut')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (offering_id, position));
CREATE TABLE public.cat_registration_answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 registration_id uuid NOT NULL UNIQUE REFERENCES public.cat_registrations(id) ON DELETE CASCADE,
 seat_id uuid NOT NULL UNIQUE REFERENCES public.cat_seats(id) ON DELETE CASCADE,
 offering_id uuid NOT NULL REFERENCES public.cat_offerings(id),
 form_version text NOT NULL, program text NOT NULL, phone_country text NOT NULL, phone_number text NOT NULL,
 street_address text NOT NULL, postal_code text NOT NULL, city text NOT NULL, orientation text, extra_info text,
 payer_option text NOT NULL, payer_option_label text NOT NULL, billing_details_pending boolean NOT NULL DEFAULT false,
 price_version_id uuid NOT NULL REFERENCES public.cat_price_versions(id), price_amount numeric NOT NULL, vat_basis text NOT NULL,
 price_accepted_at timestamptz NOT NULL, privacy_url text, privacy_accepted_at timestamptz NOT NULL,
 cancellation_url text, cancellation_accepted_at timestamptz NOT NULL,
 terms_version text, terms_accepted_at timestamptz, terms_review_status text,
 created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.cat_parties, public.cat_registrations, public.cat_seats, public.cat_waitlist, public.cat_registration_answers TO authenticated;
GRANT ALL ON public.cat_parties, public.cat_registrations, public.cat_seats, public.cat_waitlist, public.cat_registration_answers TO service_role;
ALTER TABLE public.cat_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_registration_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff parties" ON public.cat_parties FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff registrations" ON public.cat_registrations FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff seats" ON public.cat_seats FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff waitlist" ON public.cat_waitlist FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff answers" ON public.cat_registration_answers FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.cat_guard_registration() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.id := OLD.id; NEW.offering_id := OLD.offering_id; NEW.seats_requested := OLD.seats_requested; NEW.buyer_party_id := OLD.buyer_party_id;
  NEW.billing_party_id := OLD.billing_party_id; NEW.payer_party_id := OLD.payer_party_id; NEW.terms_accepted_at := OLD.terms_accepted_at;
  NEW.privacy_version := OLD.privacy_version; NEW.marketing_consent := OLD.marketing_consent; NEW.source := OLD.source; NEW.created_at := OLD.created_at;
  IF current_setting('cat.internal', true) IS DISTINCT FROM 'on' THEN NEW.status := OLD.status; NEW.order_id := OLD.order_id; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cat_registration_guard BEFORE UPDATE ON public.cat_registrations FOR EACH ROW EXECUTE FUNCTION public.cat_guard_registration();

CREATE OR REPLACE FUNCTION public.cat_active_seats(_offering uuid) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::integer FROM public.cat_seats WHERE offering_id = _offering AND (state = 'confirmed' OR (state = 'hold' AND hold_expires_at > now())) $$;
REVOKE EXECUTE ON FUNCTION public.cat_active_seats(uuid) FROM public, anon;

CREATE OR REPLACE FUNCTION public.cat_guard_offering() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cat_price_versions WHERE id = NEW.price_version_id AND product_id = NEW.product_id) THEN RAISE EXCEPTION 'Hintaversio ei kuulu tuotteeseen'; END IF;
  IF NEW.status = 'julkaistu' THEN
    UPDATE public.cat_price_versions SET locked_at = coalesce(locked_at, now()) WHERE id = NEW.price_version_id AND locked_at IS NULL;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.capacity < OLD.capacity AND NEW.capacity < public.cat_active_seats(NEW.id) THEN
    RAISE EXCEPTION 'Kapasiteettia ei voi laskea varattujen paikkojen alle';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.cat_guard_offering() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cat_valid_party(p jsonb, need_org boolean) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT p IS NOT NULL AND jsonb_typeof(p) = 'object'
    AND length(trim(coalesce(p->>'contact_name',''))) BETWEEN 2 AND 120
    AND coalesce(p->>'email','') ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(p->>'email') <= 255
    AND (NOT need_org OR length(trim(coalesce(p->>'org_name',''))) BETWEEN 2 AND 160)
    AND length(coalesce(p->>'phone','')) <= 40 AND length(coalesce(p->>'business_id','')) <= 20 AND length(coalesce(p->>'einvoice_address','')) <= 60
    AND length(coalesce(p->>'org_name','')) <= 160 $$;

CREATE OR REPLACE FUNCTION public.cat_insert_party(kind text, p jsonb) RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.cat_parties(kind, org_name, business_id, contact_name, email, phone, einvoice_address)
  VALUES (kind, nullif(trim(p->>'org_name'),''), nullif(trim(p->>'business_id'),''), trim(p->>'contact_name'), lower(trim(p->>'email')), nullif(trim(p->>'phone'),''), nullif(trim(p->>'einvoice_address'),'')) RETURNING id $$;
REVOKE EXECUTE ON FUNCTION public.cat_insert_party(text, jsonb) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cat_register(p_offering_id uuid, p_seats integer, p_buyer jsonb, p_billing jsonb, p_payer jsonb, p_participants jsonb, p_terms_accepted boolean, p_marketing_consent boolean, p_privacy_version text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.cat_offerings; prod_status text; free integer; held integer; reg uuid; buyer uuid; billing uuid; payer uuid; i integer; part jsonb; n_parts integer; pos bigint; staff boolean := auth.uid() IS NOT NULL AND public.is_editor_or_admin(auth.uid());
BEGIN
  IF p_terms_accepted IS DISTINCT FROM true THEN RAISE EXCEPTION 'Hyväksy ehdot ja tietosuojaseloste' USING ERRCODE = 'P0001'; END IF;
  IF coalesce(length(p_privacy_version),0) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Tietosuojaselosteen versio puuttuu'; END IF;
  IF p_seats IS NULL OR p_seats < 1 OR p_seats > 50 THEN RAISE EXCEPTION 'Paikkamäärän on oltava 1–50'; END IF;
  IF NOT public.cat_valid_party(p_buyer, false) THEN RAISE EXCEPTION 'Tarkista ostajan yhteystiedot'; END IF;
  IF NOT public.cat_valid_party(p_billing, true) THEN RAISE EXCEPTION 'Tarkista laskutustiedot'; END IF;
  IF p_payer IS NOT NULL AND p_payer <> 'null'::jsonb AND NOT public.cat_valid_party(p_payer, true) THEN RAISE EXCEPTION 'Tarkista maksajan tiedot'; END IF;
  p_participants := coalesce(p_participants, '[]'::jsonb);
  IF jsonb_typeof(p_participants) <> 'array' THEN RAISE EXCEPTION 'Virheelliset osallistujatiedot'; END IF;
  n_parts := jsonb_array_length(p_participants);
  IF n_parts > p_seats THEN RAISE EXCEPTION 'Osallistujia on enemmän kuin paikkoja'; END IF;
  FOR part IN SELECT * FROM jsonb_array_elements(p_participants) LOOP
    IF length(trim(coalesce(part->>'name',''))) NOT BETWEEN 2 AND 120 OR coalesce(part->>'email','') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Tarkista osallistujan nimi ja sähköposti'; END IF;
  END LOOP;
  SELECT * INTO o FROM public.cat_offerings WHERE id = p_offering_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Toteutuskertaa ei löydy'; END IF;
  SELECT status INTO prod_status FROM public.cat_products WHERE id = o.product_id;
  IF NOT staff AND (o.status <> 'julkaistu' OR prod_status <> 'julkaistu' OR NOT o.registration_enabled) THEN RAISE EXCEPTION 'Toteutuskerta ei ole avoinna ilmoittautumiselle'; END IF;
  IF o.status = 'peruttu' OR o.go_status = 'peruttu' THEN RAISE EXCEPTION 'Toteutuskerta on peruttu'; END IF;
  IF NOT staff AND (now() < o.reg_opens_at OR now() > o.reg_closes_at) THEN RAISE EXCEPTION 'Ilmoittautumisaika ei ole käynnissä'; END IF;
  free := greatest(o.capacity - public.cat_active_seats(o.id), 0);
  held := least(free, p_seats);
  IF held < p_seats AND NOT o.waitlist_enabled THEN RAISE EXCEPTION 'Paikkoja ei ole riittävästi (vapaana %)', free USING ERRCODE = 'P0001'; END IF;
  buyer := public.cat_insert_party('buyer', p_buyer);
  billing := public.cat_insert_party('billing', p_billing);
  payer := CASE WHEN p_payer IS NULL OR p_payer = 'null'::jsonb THEN billing ELSE public.cat_insert_party('payer', p_payer) END;
  INSERT INTO public.cat_registrations(offering_id, seats_requested, buyer_party_id, billing_party_id, payer_party_id, terms_accepted_at, privacy_version, marketing_consent, source)
  VALUES (o.id, p_seats, buyer, billing, payer, now(), p_privacy_version, coalesce(p_marketing_consent,false), CASE WHEN staff THEN 'staff' ELSE 'public' END) RETURNING id INTO reg;
  FOR i IN 1..held LOOP
    INSERT INTO public.cat_seats(registration_id, offering_id, state, hold_expires_at, participant_name, participant_email)
    VALUES (reg, o.id, 'hold', now() + interval '7 days',
      CASE WHEN i <= n_parts THEN trim(p_participants->(i-1)->>'name') END, CASE WHEN i <= n_parts THEN lower(trim(p_participants->(i-1)->>'email')) END);
  END LOOP;
  IF held < p_seats THEN
    SELECT coalesce(max(position),0)+1 INTO pos FROM public.cat_waitlist WHERE offering_id = o.id;
    INSERT INTO public.cat_waitlist(offering_id, registration_id, position, seats) VALUES (o.id, reg, pos, p_seats - held);
  END IF;
  RETURN jsonb_build_object('registration_id', reg, 'held', held, 'waitlisted', p_seats - held);
END $$;
REVOKE EXECUTE ON FUNCTION public.cat_register(uuid,integer,jsonb,jsonb,jsonb,jsonb,boolean,boolean,text) FROM public;
GRANT EXECUTE ON FUNCTION public.cat_register(uuid,integer,jsonb,jsonb,jsonb,jsonb,boolean,boolean,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cat_confirm_registration(p_registration_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.cat_registrations; n integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  SELECT * INTO r FROM public.cat_registrations WHERE id = p_registration_id; IF NOT FOUND THEN RAISE EXCEPTION 'Ilmoittautumista ei löydy'; END IF;
  PERFORM 1 FROM public.cat_offerings WHERE id = r.offering_id FOR UPDATE;
  UPDATE public.cat_seats SET state = 'released', hold_expires_at = NULL, updated_at = now() WHERE registration_id = r.id AND state = 'hold' AND hold_expires_at <= now();
  UPDATE public.cat_seats SET state = 'confirmed', hold_expires_at = NULL, updated_at = now() WHERE registration_id = r.id AND state = 'hold';
  SELECT count(*) INTO n FROM public.cat_seats WHERE registration_id = r.id AND state = 'confirmed';
  IF n = 0 THEN RAISE EXCEPTION 'Voimassa olevia varauksia ei ole; varaus on vanhentunut'; END IF;
  PERFORM set_config('cat.internal','on',true);
  UPDATE public.cat_registrations SET status = 'vahvistettu' WHERE id = r.id;
  PERFORM set_config('cat.internal','off',true);
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.cat_release_seat(p_seat_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  UPDATE public.cat_seats SET state = 'released', hold_expires_at = NULL, updated_at = now() WHERE id = p_seat_id AND state <> 'released';
END $$;

CREATE OR REPLACE FUNCTION public.cat_add_participant(p_registration_id uuid, p_name text, p_email text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE seat uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  IF length(trim(coalesce(p_name,''))) NOT BETWEEN 2 AND 120 OR coalesce(p_email,'') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Tarkista osallistujan nimi ja sähköposti'; END IF;
  SELECT id INTO seat FROM public.cat_seats WHERE registration_id = p_registration_id AND participant_name IS NULL AND (state = 'confirmed' OR (state = 'hold' AND hold_expires_at > now())) ORDER BY created_at, id LIMIT 1 FOR UPDATE;
  IF seat IS NULL THEN RAISE EXCEPTION 'Kaikki ilmoittautumisen paikat on jo nimetty'; END IF;
  UPDATE public.cat_seats SET participant_name = trim(p_name), participant_email = lower(trim(p_email)), updated_at = now() WHERE id = seat;
  RETURN seat;
END $$;

CREATE OR REPLACE FUNCTION public.cat_offer_from_waitlist(p_offering_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.cat_offerings; w public.cat_waitlist; free integer; i integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE = '42501'; END IF;
  SELECT * INTO o FROM public.cat_offerings WHERE id = p_offering_id FOR UPDATE;
  free := o.capacity - public.cat_active_seats(o.id);
  SELECT * INTO w FROM public.cat_waitlist WHERE offering_id = o.id AND state = 'jonossa' AND seats <= free ORDER BY position LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  FOR i IN 1..w.seats LOOP INSERT INTO public.cat_seats(registration_id, offering_id, state, hold_expires_at) VALUES (w.registration_id, o.id, 'hold', now() + interval '7 days'); END LOOP;
  UPDATE public.cat_waitlist SET state = 'tarjottu' WHERE id = w.id;
  RETURN w.registration_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.cat_confirm_registration(uuid), public.cat_release_seat(uuid), public.cat_add_participant(uuid,text,text), public.cat_offer_from_waitlist(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cat_confirm_registration(uuid), public.cat_release_seat(uuid), public.cat_add_participant(uuid,text,text), public.cat_offer_from_waitlist(uuid) TO authenticated;

-- Group go/no-go
CREATE OR REPLACE FUNCTION public.cat_group_key(_offering uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(group_key, 'offering:'||id::text) FROM public.cat_offerings WHERE id=_offering $$;
CREATE OR REPLACE FUNCTION public.cat_group_status(p_offering uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH g AS (SELECT o.* FROM public.cat_offerings o WHERE coalesce(o.group_key,'offering:'||o.id::text)=public.cat_group_key(p_offering))
  SELECT jsonb_build_object(
    'group_key', public.cat_group_key(p_offering),
    'confirmed', (SELECT count(*) FROM public.cat_seats s WHERE s.offering_id IN (SELECT id FROM g) AND s.state='confirmed'),
    'min_participants', (SELECT max(min_participants) FROM g),
    'go_status', (SELECT CASE WHEN bool_or(go_status='toteutuu') THEN 'toteutuu' WHEN bool_and(go_status='peruttu') THEN 'peruttu' ELSE 'avoin' END FROM g)) $$;
CREATE OR REPLACE FUNCTION public.cat_guard_go() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF (NEW.go_status, NEW.go_decided_by, NEW.go_decided_at, NEW.go_reason) IS DISTINCT FROM (OLD.go_status, OLD.go_decided_by, OLD.go_decided_at, OLD.go_reason)
     AND coalesce(current_setting('cat.go', true),'off') <> 'on' THEN
    RAISE EXCEPTION 'Toteutumispäätös muutetaan vain päätöstoiminnolla' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cat_guard_go BEFORE UPDATE ON public.cat_offerings FOR EACH ROW EXECUTE FUNCTION public.cat_guard_go();
CREATE OR REPLACE FUNCTION public.cat_evaluate_go(p_offering uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text := public.cat_group_key(p_offering); st jsonb;
BEGIN
  PERFORM 1 FROM public.cat_offerings WHERE coalesce(group_key,'offering:'||id::text)=k ORDER BY id FOR UPDATE;
  st := public.cat_group_status(p_offering);
  IF st->>'go_status' <> 'avoin' OR st->'min_participants' = 'null'::jsonb THEN RETURN st->>'go_status'; END IF;
  IF (st->>'confirmed')::int >= (st->>'min_participants')::int THEN
    PERFORM set_config('cat.go','on',true);
    UPDATE public.cat_offerings SET go_status='toteutuu', go_decided_by=NULL, go_decided_at=now(),
      go_reason=format('Vähimmäismäärä täyttyi automaattisesti (%s/%s)', st->>'confirmed', st->>'min_participants')
      WHERE coalesce(group_key,'offering:'||id::text)=k AND go_status='avoin';
    PERFORM set_config('cat.go','off',true);
    RETURN 'toteutuu';
  END IF;
  RETURN 'avoin';
END $$;
CREATE OR REPLACE FUNCTION public.cat_seat_confirmed_go() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.state='confirmed' AND OLD.state IS DISTINCT FROM 'confirmed' THEN PERFORM public.cat_evaluate_go(NEW.offering_id); END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER cat_seat_confirmed_go AFTER UPDATE OF state ON public.cat_seats FOR EACH ROW EXECUTE FUNCTION public.cat_seat_confirmed_go();
CREATE OR REPLACE FUNCTION public.cat_decide_go(p_offering uuid, p_go boolean, p_reason text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text := public.cat_group_key(p_offering); st jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  IF length(trim(coalesce(p_reason,''))) NOT BETWEEN 10 AND 500 THEN RAISE EXCEPTION 'Kirjaa päätöksen perustelu (10–500 merkkiä)'; END IF;
  PERFORM 1 FROM public.cat_offerings WHERE coalesce(group_key,'offering:'||id::text)=k ORDER BY id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Toteutuskertaa ei löydy'; END IF;
  st := public.cat_group_status(p_offering);
  IF st->>'go_status' <> 'avoin' THEN RAISE EXCEPTION 'Toteutumisesta on jo päätetty (%)', st->>'go_status'; END IF;
  PERFORM set_config('cat.go','on',true);
  UPDATE public.cat_offerings SET go_status=CASE WHEN p_go THEN 'toteutuu' ELSE 'peruttu' END, go_decided_by=auth.uid(), go_decided_at=now(), go_reason=trim(p_reason)
    WHERE coalesce(group_key,'offering:'||id::text)=k;
  PERFORM set_config('cat.go','off',true);
  RETURN CASE WHEN p_go THEN 'toteutuu' ELSE 'peruttu' END;
END $$;
REVOKE ALL ON FUNCTION public.cat_group_key(uuid), public.cat_group_status(uuid), public.cat_evaluate_go(uuid), public.cat_decide_go(uuid,boolean,text), public.cat_seat_confirmed_go(), public.cat_guard_go() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cat_group_status(uuid), public.cat_decide_go(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cat_group_key(uuid), public.cat_group_status(uuid), public.cat_evaluate_go(uuid), public.cat_decide_go(uuid,boolean,text) TO service_role;

-- Participants and attendance
ALTER TABLE public.prod_participants ADD COLUMN seat_id uuid, ADD COLUMN registration_id uuid, ADD COLUMN removed_at timestamptz;
CREATE UNIQUE INDEX prod_participants_seat_uq ON public.prod_participants(seat_id) WHERE seat_id IS NOT NULL;
CREATE TABLE public.prod_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.prod_sessions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.prod_participants(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('läsnä','osittain','poissa')),
  hours numeric NOT NULL DEFAULT 0 CHECK (hours >= 0 AND hours <= 24),
  note text, recorded_by uuid, recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id));
GRANT SELECT ON public.prod_attendance TO authenticated;
GRANT ALL ON public.prod_attendance TO service_role;
ALTER TABLE public.prod_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read attendance" ON public.prod_attendance FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.prod_sync_participants(p_delivery uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
  INSERT INTO public.prod_participants(delivery_id, name, email, seat_id, registration_id)
  SELECT p_delivery, coalesce(nullif(trim(s.participant_name),''),'Nimeämätön osallistuja'), nullif(trim(s.participant_email),''), s.id, s.registration_id
  FROM public.cat_seats s JOIN public.cat_offerings o ON o.id=s.offering_id
  WHERE o.delivery_id=p_delivery AND s.state='confirmed'
  ON CONFLICT (seat_id) WHERE seat_id IS NOT NULL DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, removed_at=NULL;
  UPDATE public.prod_participants p SET removed_at=now()
  WHERE p.delivery_id=p_delivery AND p.seat_id IS NOT NULL AND p.removed_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.cat_seats s WHERE s.id=p.seat_id AND s.state='confirmed');
  SELECT count(*) INTO n FROM public.prod_participants WHERE delivery_id=p_delivery AND removed_at IS NULL;
  RETURN n;
END $$;
CREATE OR REPLACE FUNCTION public.prod_seat_sync_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d uuid;
BEGIN
  SELECT delivery_id INTO d FROM public.cat_offerings WHERE id=NEW.offering_id;
  IF d IS NOT NULL THEN PERFORM public.prod_sync_participants(d); END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER prod_seat_sync AFTER UPDATE OF state, participant_name, participant_email ON public.cat_seats FOR EACH ROW EXECUTE FUNCTION public.prod_seat_sync_trigger();
CREATE OR REPLACE FUNCTION public.prod_offering_delivery_sync() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.delivery_id IS NOT NULL AND NEW.delivery_id IS DISTINCT FROM OLD.delivery_id THEN PERFORM public.prod_sync_participants(NEW.delivery_id); END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER prod_offering_delivery_sync AFTER UPDATE OF delivery_id ON public.cat_offerings FOR EACH ROW EXECUTE FUNCTION public.prod_offering_delivery_sync();
CREATE OR REPLACE FUNCTION public.prod_record_attendance(p_session uuid, p_participant uuid, p_status text, p_hours numeric, p_note text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sd uuid; pd uuid; prem timestamptz; id_ uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.is_editor_or_admin(auth.uid()) OR public.prod_is_session_trainer(p_session, auth.uid())) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  IF p_status NOT IN ('läsnä','osittain','poissa') THEN RAISE EXCEPTION 'Tuntematon läsnäolotila'; END IF;
  SELECT delivery_id INTO sd FROM public.prod_sessions WHERE id=p_session;
  SELECT delivery_id, removed_at INTO pd, prem FROM public.prod_participants WHERE id=p_participant;
  IF sd IS NULL OR pd IS DISTINCT FROM sd THEN RAISE EXCEPTION 'Osallistuja ei kuulu tähän toteutukseen'; END IF;
  IF prem IS NOT NULL THEN RAISE EXCEPTION 'Osallistuja on poistunut toteutuksesta'; END IF;
  INSERT INTO public.prod_attendance(session_id, participant_id, status, hours, note, recorded_by)
  VALUES (p_session, p_participant, p_status, CASE WHEN p_status='poissa' THEN 0 ELSE coalesce(p_hours,0) END, p_note, auth.uid())
  ON CONFLICT (session_id, participant_id) DO UPDATE SET status=EXCLUDED.status, hours=EXCLUDED.hours, note=EXCLUDED.note, recorded_by=EXCLUDED.recorded_by, recorded_at=now()
  RETURNING id INTO id_;
  RETURN id_;
END $$;
CREATE OR REPLACE FUNCTION public.prod_attendance_summary(p_delivery uuid) RETURNS TABLE(participant_id uuid, name text, sessions_total integer, sessions_attended integer, sessions_unrecorded integer, hours numeric) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  RETURN QUERY
  SELECT p.id, p.name,
    (SELECT count(*)::int FROM public.prod_sessions s WHERE s.delivery_id=p_delivery),
    (SELECT count(*)::int FROM public.prod_attendance a WHERE a.participant_id=p.id AND a.status IN ('läsnä','osittain')),
    (SELECT count(*)::int FROM public.prod_sessions s WHERE s.delivery_id=p_delivery AND NOT EXISTS (SELECT 1 FROM public.prod_attendance a WHERE a.session_id=s.id AND a.participant_id=p.id)),
    (SELECT coalesce(sum(a.hours),0) FROM public.prod_attendance a WHERE a.participant_id=p.id)
  FROM public.prod_participants p WHERE p.delivery_id=p_delivery AND p.removed_at IS NULL ORDER BY p.name;
END $$;
REVOKE ALL ON FUNCTION public.prod_sync_participants(uuid), public.prod_seat_sync_trigger(), public.prod_offering_delivery_sync(), public.prod_record_attendance(uuid,uuid,text,numeric,text), public.prod_attendance_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.prod_record_attendance(uuid,uuid,text,numeric,text), public.prod_attendance_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prod_sync_participants(uuid), public.prod_record_attendance(uuid,uuid,text,numeric,text), public.prod_attendance_summary(uuid) TO service_role;

-- Cohort schedules
ALTER TABLE public.prod_sessions ADD COLUMN offering_schedule_key text UNIQUE, ADD COLUMN provider_name text;
CREATE OR REPLACE FUNCTION public.cat_guard_schedule() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE s jsonb;
BEGIN
 IF TG_OP='UPDATE' AND OLD.source_key IS NOT NULL AND NEW.source_key IS DISTINCT FROM OLD.source_key THEN RAISE EXCEPTION 'Lähdetunniste on pysyvä'; END IF;
 IF TG_OP='UPDATE' AND OLD.delivery_id IS NOT NULL AND NEW.schedule IS DISTINCT FROM OLD.schedule THEN RAISE EXCEPTION 'Tuotantoon siirretyn aikataulun muutos vaatii erillisen katselmuksen'; END IF;
 IF NEW.source_key IS NOT NULL AND NEW.status='julkaistu' AND coalesce(NEW.source_status,'approval_pending') <> 'approved' THEN RAISE EXCEPTION 'Lähderyhmä tarvitsee erillisen julkaisuhyväksynnän'; END IF;
 IF NEW.source_key IS NOT NULL AND NEW.source_status='approved' AND NEW.starts_at AT TIME ZONE 'Europe/Helsinki' < '2026-10-28'::timestamp THEN RAISE EXCEPTION 'Historiallista lähderyhmää ei julkaista'; END IF;
 IF jsonb_typeof(NEW.schedule->'fixed_sessions') IS DISTINCT FROM 'array' OR jsonb_typeof(NEW.schedule->'flexible_blocks') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Virheellinen aikataulu'; END IF;
 FOR s IN SELECT value FROM jsonb_array_elements(NEW.schedule->'fixed_sessions') LOOP
 IF ((s->>'date')||' '||(s->>'end_time'))::timestamp <= ((s->>'date')||' '||(s->>'start_time'))::timestamp OR coalesce(s->>'topic','')='' THEN RAISE EXCEPTION 'Tarkista opetuskerran ajat ja aihe'; END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER cat_schedule_guard BEFORE INSERT OR UPDATE ON public.cat_offerings FOR EACH ROW EXECUTE FUNCTION public.cat_guard_schedule();
CREATE OR REPLACE FUNCTION public.cat_sync_schedule(p_offering uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.cat_offerings; s jsonb; n integer:=0;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
 SELECT * INTO o FROM public.cat_offerings WHERE id=p_offering FOR UPDATE;
 IF o.delivery_id IS NULL THEN RETURN 0; END IF;
 FOR s IN SELECT value FROM jsonb_array_elements(o.schedule->'fixed_sessions') LOOP
  n:=n+1;
  INSERT INTO public.prod_sessions(delivery_id,seq,title,starts_at,ends_at,offering_schedule_key,provider_name)
  VALUES(o.delivery_id,n,s->>'topic',((s->>'date')||' '||(s->>'start_time'))::timestamp AT TIME ZONE 'Europe/Helsinki',((s->>'date')||' '||(s->>'end_time'))::timestamp AT TIME ZONE 'Europe/Helsinki',o.id::text||':'||n,s->>'trainer_or_provider')
  ON CONFLICT(offering_schedule_key) DO NOTHING;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cat_sync_schedule(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cat_sync_schedule(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.cat_schedule_after_link() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.delivery_id IS NOT NULL AND OLD.delivery_id IS DISTINCT FROM NEW.delivery_id THEN PERFORM public.cat_sync_schedule(NEW.id); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cat_schedule_link AFTER UPDATE OF delivery_id ON public.cat_offerings FOR EACH ROW EXECUTE FUNCTION public.cat_schedule_after_link();
CREATE OR REPLACE FUNCTION public.cat_catalog_group_details(p_offering uuid,p_preview boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.cat_offerings;
BEGIN
 IF p_preview AND (auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid())) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
 SELECT * INTO o FROM public.cat_offerings WHERE id=p_offering;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF NOT p_preview AND (o.status<>'julkaistu' OR NOT EXISTS(SELECT 1 FROM public.cat_products WHERE id=o.product_id AND status='julkaistu')) THEN RETURN NULL; END IF;
 RETURN jsonb_build_object('id',o.id,'schedule',o.schedule,'source_deadline',o.source_deadline,'administrative_ends_at',o.administrative_ends_at,'source_status',o.source_status,'reg_closes_at',o.reg_closes_at);
END $$;
REVOKE ALL ON FUNCTION public.cat_catalog_group_details(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cat_catalog_group_details(uuid,boolean) TO anon,authenticated;

-- AI programme form
CREATE OR REPLACE FUNCTION public.cat_program_form_config(p_slug text) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT CASE p_slug
  WHEN 'ai-coordinator' THEN jsonb_build_object('version','lyyti-v1.2','program','AI Coordinator','form_title','Tekoälyn ammattiosaaja | Tekoälykoordinaattori','orientation_required',true,'extra_info',false,
   'payer_options',jsonb_build_array(jsonb_build_object('key','self','label','Maksan osallistumiseni itse.'),jsonb_build_object('key','employer','label','Työnantajani/yritykseni maksaa osallistumiseni.')),
   'privacy_url',NULL,'cancellation_url',NULL)
  WHEN 'ai-manager' THEN jsonb_build_object('version','lyyti-v1.2','program','AI Manager','form_title','AI-manager | Tekoälypäällikkö – koulutusohjelma','orientation_required',true,'extra_info',false,
   'payer_options',jsonb_build_array(jsonb_build_object('key','self','label','Maksan osallistumiseni itse.'),jsonb_build_object('key','employer','label','Työnantajani/yritykseni maksaa osallistumiseni.'),jsonb_build_object('key','employer_keuda','label','Työnantajani/yritykseni maksaa osallistumiseni - Keuda')),
   'privacy_url','https://www.keuda.fi/tietosuojaseloste/','cancellation_url','https://www.keuda.fi/lyhytkoulutuksen-peruutusehdot/')
  WHEN 'ai-director' THEN jsonb_build_object('version','lyyti-v1.2','program','AI Director','form_title','AI-Director | CEO-johtoryhmätason valmennusohjelma','orientation_required',false,'extra_info',true,
   'payer_options',jsonb_build_array(jsonb_build_object('key','self','label','Maksan osallistumiseni itse.'),jsonb_build_object('key','employer','label','Työnantajani/yritykseni maksaa osallistumiseni.')),
   'privacy_url','https://www.keuda.fi/tietosuojaseloste/','cancellation_url','https://www.keuda.fi/lyhytkoulutuksen-peruutusehdot/')
 END || CASE WHEN p_slug IN ('ai-coordinator','ai-manager') THEN jsonb_build_object('orientations',to_jsonb(ARRAY['Ajoneuvoala','Asiakaspalvelu','Asiantuntijat','Elintarvikeala','Esihenkilötyö','Finanssiala','Hallitustyöskentely','Henkilöstöhallinto | HR','Huolto ja kunnossapito','Hyvinvointipalvelut','IT | Tietoliikenne','Johtaminen','Julkishallinto','Juridiikka | Laki','Kansainvälistyminen','Kasvatus | Ohjaus','Kauneudenhoitoala','Kaupan ala','Kiinteistö- ja isännöinti','Kirjanpito- ja tilintarkastus','Koulutus','Kunnallishallinto','Liikenne- ja kuljetusala','Logistiikka','Maa- ja metsätalous','Maahanmuutto','Markkinointi','Matkailu','Myymälätyö','Myynti','Ostotoiminta','Palvelualat','Pelastustoimi','Rahoitus','Rakentaminen','Rekrytointi','Siivousala','Sosiaali- ja terveysala','Sosiaalinen media','Sähkö- ja energia-ala','Taloushallinto','Teollisuusala','Terveydenhuolto','Toimitusjohtajat','Tuotannon suunnittelu','Tuotannonohjaus','Tuote- ja palvelukehitys','Turvallisuusala','Työturvallisuus','Yrittäjät'])) ELSE '{}'::jsonb END $$;
CREATE OR REPLACE FUNCTION public.cat_program_form_config_v2(p_slug text) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT public.cat_program_form_config(p_slug) || jsonb_build_object('version','ai-form-v2','terms_version','ai-terms-2026-10-27','terms_review_status','approval_pending','billing_fields_status','proposal','installments_enabled',false,'payer_options',(SELECT jsonb_agg(x || jsonb_build_object('enabled', x->>'key'<>'employer_keuda')) FROM jsonb_array_elements(public.cat_program_form_config(p_slug)->'payer_options') x)) $$;
REVOKE ALL ON FUNCTION public.cat_program_form_config(text), public.cat_program_form_config_v2(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cat_program_form_config(text), public.cat_program_form_config_v2(text) TO anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.cat_guard_source_registration() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.cat_offerings;
BEGIN
 SELECT * INTO o FROM public.cat_offerings WHERE id=NEW.offering_id;
 IF o.source_key IS NOT NULL AND o.source_status='historical' THEN RAISE EXCEPTION 'Historialliseen lähderyhmään ei voi ilmoittautua'; END IF;
 IF o.source_key IS NOT NULL AND coalesce(o.source_status,'approval_pending')<>'approved' THEN RAISE EXCEPTION 'Lähderyhmä ei ole avoinna ilmoittautumiselle'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.cat_guard_source_registration() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER cat_source_registration_guard BEFORE INSERT ON public.cat_registrations FOR EACH ROW EXECUTE FUNCTION public.cat_guard_source_registration();

CREATE OR REPLACE FUNCTION public.cat_create_source_group(p_source jsonb,p_config jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE program text:=p_source->>'program'; slug text; prod uuid; price uuid; offering uuid; sk text; s jsonb; min_n integer;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
 IF program NOT IN ('AI Coordinator','AI Manager','AI Director') OR program IS NULL THEN RAISE EXCEPTION 'Tuntematon ohjelma'; END IF;
 slug:=lower(replace(program,' ','-')); sk:=slug||':'||(p_source->>'start_date');
 PERFORM pg_advisory_xact_lock(hashtext(sk));
 SELECT id INTO offering FROM public.cat_offerings WHERE source_key=sk;
 IF offering IS NOT NULL THEN RETURN offering; END IF;
 IF coalesce(p_config->>'unit_price','')='' OR coalesce(p_config->>'vat_basis','')='' OR coalesce(p_config->>'reg_closes_at','')='' OR coalesce(p_config->>'reg_opens_at','')='' OR coalesce(p_config->>'capacity','')='' THEN RAISE EXCEPTION 'Anna hyväksytyt hinta-, kapasiteetti- ja ilmoittautumisaikatiedot'; END IF;
 IF jsonb_array_length(p_source->'fixed_sessions')<1 THEN RAISE EXCEPTION 'Opetuskerrat puuttuvat'; END IF;
 SELECT id INTO prod FROM public.cat_products WHERE cat_products.slug=cat_create_source_group.slug FOR UPDATE;
 IF prod IS NULL THEN
  INSERT INTO public.cat_products(slug,name,service_key,sales_owner_id,production_owner_id) VALUES(slug,program,'aly',auth.uid(),auth.uid()) RETURNING id INTO prod;
 END IF;
 INSERT INTO public.cat_price_versions(product_id,version_no,unit_price,vat_basis,valid_from)
 SELECT prod,coalesce(max(version_no),0)+1,(p_config->>'unit_price')::numeric,p_config->>'vat_basis',current_date FROM public.cat_price_versions WHERE product_id=prod RETURNING id INTO price;
 min_n:=CASE program WHEN 'AI Coordinator' THEN 7 WHEN 'AI Manager' THEN 5 ELSE 4 END;
 INSERT INTO public.cat_offerings(product_id,price_version_id,starts_at,ends_at,reg_opens_at,reg_closes_at,capacity,min_participants,source_key,source_status,source_deadline,administrative_ends_at,schedule)
 VALUES(prod,price,((p_source->>'start_date')||' '||(p_source->>'start_time'))::timestamp AT TIME ZONE 'Europe/Helsinki',
 (SELECT max(((x->>'date')||' '||(x->>'end_time'))::timestamp AT TIME ZONE 'Europe/Helsinki') FROM jsonb_array_elements(p_source->'fixed_sessions') x),
 (p_config->>'reg_opens_at')::timestamptz,(p_config->>'reg_closes_at')::timestamptz,(p_config->>'capacity')::integer,coalesce((p_config->>'min_participants')::integer,min_n),sk,
 CASE WHEN (p_source->>'start_date')::date<='2026-10-27'::date THEN 'historical' ELSE 'approval_pending' END,(p_source->>'registration_deadline')::date,
 nullif(p_config->>'administrative_ends_at','')::timestamptz,jsonb_build_object('fixed_sessions',p_source->'fixed_sessions','flexible_blocks',coalesce(p_source->'flexible_blocks','[]'::jsonb),'individual_sparring',p_source->'individual_sparring')) RETURNING id INTO offering;
 RETURN offering;
END $$;
REVOKE ALL ON FUNCTION public.cat_create_source_group(jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cat_create_source_group(jsonb,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.cat_program_form(p_offering uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.cat_offerings; p public.cat_products; v public.cat_price_versions; cfg jsonb; staff boolean:=auth.uid() IS NOT NULL AND public.is_editor_or_admin(auth.uid());
BEGIN
 SELECT * INTO o FROM public.cat_offerings WHERE id=p_offering; IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT * INTO p FROM public.cat_products WHERE id=o.product_id;
 IF NOT staff AND (o.status<>'julkaistu' OR p.status<>'julkaistu') THEN RETURN NULL; END IF;
 cfg:=public.cat_program_form_config_v2(p.slug); IF cfg IS NULL THEN RETURN NULL; END IF;
 SELECT * INTO v FROM public.cat_price_versions WHERE id=o.price_version_id;
 RETURN cfg||jsonb_build_object('offering_id',o.id,'starts_at',o.starts_at,'ends_at',o.ends_at,'price_amount',v.unit_price,'vat_basis',v.vat_basis,'registration_enabled',o.registration_enabled);
END $$;
REVOKE ALL ON FUNCTION public.cat_program_form(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cat_program_form(uuid) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.cat_register_program(p_offering uuid,p_form jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.cat_offerings; p public.cat_products; v public.cat_price_versions; cfg jsonb; f jsonb:=coalesce(p_form,'{}'::jsonb);
 fn text:=trim(coalesce(f->>'first_name','')); ln text:=trim(coalesce(f->>'last_name','')); em text:=lower(trim(coalesce(f->>'email','')));
 pc text:=trim(coalesce(f->>'phone_country','')); pn text:=regexp_replace(coalesce(f->>'phone_number',''),'[\s-]','','g');
 st text:=trim(coalesce(f->>'street_address','')); zip text:=trim(coalesce(f->>'postal_code','')); city text:=trim(coalesce(f->>'city',''));
 ori text:=nullif(trim(coalesce(f->>'orientation','')),''); extra text:=nullif(trim(coalesce(f->>'extra_info','')),''); payk text:=f->>'payer_option';
 paylabel text; pending boolean; party jsonb; billing jsonb; res jsonb; seat uuid; reg uuid; billed uuid; kv record;
 staff boolean:=auth.uid() IS NOT NULL AND public.is_editor_or_admin(auth.uid());
 org text:=trim(coalesce(f->>'billing_org','')); bid text:=trim(coalesce(f->>'billing_business_id','')); bc text:=trim(coalesce(f->>'billing_contact','')); be text:=lower(trim(coalesce(f->>'billing_email','')));
 ba text:=trim(coalesce(f->>'billing_address','')); bz text:=trim(coalesce(f->>'billing_postal_code','')); bt text:=trim(coalesce(f->>'billing_city','')); ea text:=trim(coalesce(f->>'billing_einvoice','')); eo text:=trim(coalesce(f->>'billing_operator',''));
BEGIN
 SELECT * INTO o FROM public.cat_offerings WHERE id=p_offering; IF NOT FOUND THEN RAISE EXCEPTION 'Toteutuskertaa ei löydy'; END IF;
 SELECT * INTO p FROM public.cat_products WHERE id=o.product_id;
 cfg:=public.cat_program_form_config_v2(p.slug); IF cfg IS NULL THEN RAISE EXCEPTION 'Tälle koulutukselle ei ole ohjelmalomaketta'; END IF;
 IF NOT staff AND cfg->>'terms_review_status' <> 'approved' THEN RAISE EXCEPTION 'Ilmoittautuminen avataan, kun ehdot on hyväksytty'; END IF;
 IF length(fn) NOT BETWEEN 1 AND 60 OR length(ln) NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'Tarkista etu- ja sukunimi'; END IF;
 IF em !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(em)>255 THEN RAISE EXCEPTION 'Tarkista sähköposti'; END IF;
 IF pc !~ '^\+[0-9]{1,4}$' OR pn !~ '^[0-9]{4,15}$' THEN RAISE EXCEPTION 'Tarkista matkapuhelinnumero ja maakoodi'; END IF;
 IF length(st) NOT BETWEEN 2 AND 120 OR zip !~ '^[A-Za-z0-9 -]{3,10}$' OR length(city) NOT BETWEEN 2 AND 60 THEN RAISE EXCEPTION 'Tarkista osoitetiedot'; END IF;
 IF (cfg->>'orientation_required')::boolean THEN
  IF ori IS NULL OR NOT (cfg->'orientations') ? ori THEN RAISE EXCEPTION 'Valitse toiminto tai toimiala'; END IF;
 ELSIF ori IS NOT NULL THEN RAISE EXCEPTION 'Tässä ohjelmassa ei valita toimialaa'; END IF;
 IF NOT (cfg->>'extra_info')::boolean AND extra IS NOT NULL THEN RAISE EXCEPTION 'Tässä ohjelmassa ei ole lisätietokenttää'; END IF;
 IF length(coalesce(extra,''))>1000 THEN RAISE EXCEPTION 'Lisätiedot ovat liian pitkät'; END IF;
 SELECT x->>'label' INTO paylabel FROM jsonb_array_elements(cfg->'payer_options') x WHERE x->>'key'=payk AND (x->>'enabled')::boolean;
 IF paylabel IS NULL THEN RAISE EXCEPTION 'Maksajavaihtoehto ei ole käytössä'; END IF;
 IF (f->>'accept_price') IS DISTINCT FROM 'true' OR (f->>'accept_privacy') IS DISTINCT FROM 'true' OR (f->>'accept_cancellation') IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Hyväksy koulutusmaksu, tietosuoja ja peruutusehdot'; END IF;
 IF (f->>'terms_version_seen') IS DISTINCT FROM cfg->>'terms_version' THEN RAISE EXCEPTION 'Ehtoversio on muuttunut, tarkista ehdot uudelleen'; END IF;
 SELECT * INTO v FROM public.cat_price_versions WHERE id=o.price_version_id;
 IF (f->>'price_seen') IS NULL OR (f->>'price_seen')::numeric IS DISTINCT FROM v.unit_price THEN RAISE EXCEPTION 'Hinta on muuttunut, tarkista hinta uudelleen'; END IF;
 FOR kv IN SELECT key,value FROM jsonb_each_text(f) WHERE key LIKE 'billing_%' LOOP
  IF length(kv.value)>160 THEN RAISE EXCEPTION 'Laskutustieto on liian pitkä'; END IF;
 END LOOP;
 IF payk='employer' AND ((be<>'' AND be !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') OR (bid<>'' AND NOT public.cat_valid_business_id(bid)) OR length(ea)>60 OR length(bid)>20) THEN RAISE EXCEPTION 'Tarkista työnantajan Y-tunnus ja laskutustiedot'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('catreg:'||o.id::text||':'||em));
 IF EXISTS(SELECT 1 FROM public.cat_seats s WHERE s.offering_id=o.id AND s.participant_email=em AND (s.state='confirmed' OR (s.state='hold' AND s.hold_expires_at>now()))) THEN RAISE EXCEPTION 'Tällä sähköpostilla on jo ilmoittautuminen tähän ryhmään'; END IF;
 pending:=payk='employer' AND NOT (length(org)>=2 AND public.cat_valid_business_id(bid) AND length(bc)>=2 AND be ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND ((length(ba)>=2 AND length(bz)>=3 AND length(bt)>=2) OR (ea<>'' AND eo<>'')));
 party:=jsonb_build_object('contact_name',fn||' '||ln,'email',em,'phone',pc||' '||pn);
 billing:=CASE WHEN payk='employer' THEN jsonb_build_object('org_name',CASE WHEN length(org)>=2 THEN org ELSE 'Työnantaja – laskutustiedot vahvistettava' END,'business_id',bid,'contact_name',CASE WHEN length(bc)>=2 THEN bc ELSE fn||' '||ln END,'email',CASE WHEN be<>'' THEN be ELSE em END,'einvoice_address',ea) ELSE party||jsonb_build_object('org_name',fn||' '||ln) END;
 res:=public.cat_register(o.id,1,party,billing,NULL,jsonb_build_array(jsonb_build_object('name',fn||' '||ln,'email',em)),true,false,cfg->>'version');
 reg:=(res->>'registration_id')::uuid;
 SELECT id INTO seat FROM public.cat_seats WHERE registration_id=reg ORDER BY created_at LIMIT 1;
 IF seat IS NULL THEN RAISE EXCEPTION 'Ryhmä on täynnä' USING ERRCODE='P0001'; END IF;
 IF payk='employer' THEN
  SELECT billing_party_id INTO billed FROM public.cat_registrations WHERE id=reg;
  UPDATE public.cat_parties SET billing_address=nullif(ba,''),billing_postal_code=nullif(bz,''),billing_city=nullif(bt,''),einvoice_operator=nullif(eo,''),order_reference=nullif(trim(f->>'billing_reference'),'') WHERE id=billed;
 END IF;
 INSERT INTO public.cat_registration_answers(registration_id,seat_id,offering_id,form_version,program,phone_country,phone_number,street_address,postal_code,city,orientation,extra_info,payer_option,payer_option_label,billing_details_pending,price_version_id,price_amount,vat_basis,price_accepted_at,privacy_url,privacy_accepted_at,cancellation_url,cancellation_accepted_at,terms_version,terms_accepted_at,terms_review_status)
 VALUES(reg,seat,o.id,cfg->>'version',cfg->>'program',pc,pn,st,zip,city,ori,extra,payk,paylabel,pending,v.id,v.unit_price,v.vat_basis,now(),cfg->>'privacy_url',now(),cfg->>'cancellation_url',now(),cfg->>'terms_version',now(),cfg->>'terms_review_status');
 RETURN res||jsonb_build_object('billing_details_pending',pending);
END $$;
REVOKE ALL ON FUNCTION public.cat_register_program(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cat_register_program(uuid,jsonb) TO anon,authenticated;

-- Public catalog now exposes free seats and whether online registration is open (no personal data).
CREATE OR REPLACE FUNCTION public.cat_public_catalog(p_slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('slug', p.slug, 'name', p.name, 'description', p.description, 'service_key', p.service_key,
    'offerings', coalesce((SELECT jsonb_agg(jsonb_build_object('id', o.id, 'starts_at', o.starts_at, 'ends_at', o.ends_at, 'location', o.location,
        'reg_opens_at', o.reg_opens_at, 'reg_closes_at', o.reg_closes_at, 'capacity', o.capacity,
        'free_seats', greatest(o.capacity - public.cat_active_seats(o.id), 0), 'waitlist_enabled', o.waitlist_enabled,
        'registration_enabled', o.registration_enabled AND o.go_status <> 'peruttu',
        'free_cancel_days', o.free_cancel_days, 'late_cancel_pct', o.late_cancel_pct,
        'unit_price', v.unit_price, 'vat_basis', v.vat_basis) ORDER BY o.starts_at)
      FROM public.cat_offerings o JOIN public.cat_price_versions v ON v.id = o.price_version_id
      WHERE o.product_id = p.id AND o.status = 'julkaistu' AND o.ends_at > now()), '[]'::jsonb))
  FROM public.cat_products p WHERE p.slug = p_slug AND p.status = 'julkaistu' $$;
REVOKE EXECUTE ON FUNCTION public.cat_public_catalog(text) FROM public;
GRANT EXECUTE ON FUNCTION public.cat_public_catalog(text) TO anon, authenticated;

CREATE TRIGGER audit_cat_registrations AFTER INSERT OR UPDATE ON public.cat_registrations FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_cat_seats AFTER INSERT OR UPDATE ON public.cat_seats FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();
CREATE TRIGGER audit_cat_waitlist AFTER INSERT OR UPDATE ON public.cat_waitlist FOR EACH ROW EXECUTE FUNCTION public.crm_audit_row();