CREATE TABLE public.cat_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,80}$'), name text NOT NULL, service_key text NOT NULL,
  description text NOT NULL DEFAULT '', template_key text REFERENCES public.prod_templates(key), training_card_id uuid REFERENCES public.training_cards(id),
  sales_owner_id uuid NOT NULL, production_owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'luonnos' CHECK (status IN ('luonnos','tarkistettavana','julkaistu','arkistoitu')),
  published_by uuid, published_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.cat_price_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES public.cat_products(id), version_no integer NOT NULL,
  unit_price numeric NOT NULL CHECK (unit_price >= 0), vat_basis text NOT NULL, valid_from date NOT NULL, valid_to date,
  locked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (product_id, version_no));
CREATE TABLE public.cat_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES public.cat_products(id), price_version_id uuid NOT NULL REFERENCES public.cat_price_versions(id),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, location text, reg_opens_at timestamptz NOT NULL, reg_closes_at timestamptz NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0), waitlist_enabled boolean NOT NULL DEFAULT true,
  free_cancel_days integer NOT NULL DEFAULT 14 CHECK (free_cancel_days >= 0), late_cancel_pct integer NOT NULL DEFAULT 50 CHECK (late_cancel_pct BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'luonnos' CHECK (status IN ('luonnos','julkaistu','peruttu')),
  delivery_id uuid REFERENCES public.prod_deliveries(id), created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at), CHECK (reg_closes_at > reg_opens_at));

GRANT SELECT, INSERT, UPDATE ON public.cat_products, public.cat_price_versions, public.cat_offerings TO authenticated;
GRANT ALL ON public.cat_products, public.cat_price_versions, public.cat_offerings TO service_role;
ALTER TABLE public.cat_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_price_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff products" ON public.cat_products FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff prices" ON public.cat_price_versions FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "staff offerings" ON public.cat_offerings FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.cat_guard_product() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_editor_or_admin(NEW.sales_owner_id) OR NOT public.is_editor_or_admin(NEW.production_owner_id) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava henkilöstön käyttöoikeus'; END IF;
  IF TG_OP = 'INSERT' THEN NEW.published_by := NULL; NEW.published_at := NULL; IF NEW.status = 'julkaistu' THEN RAISE EXCEPTION 'Tuote julkaistaan vasta tallentamisen jälkeen'; END IF; RETURN NEW; END IF;
  NEW.id := OLD.id; NEW.created_at := OLD.created_at; NEW.updated_at := now();
  IF NEW.status = 'julkaistu' AND OLD.status <> 'julkaistu' THEN NEW.published_by := auth.uid(); NEW.published_at := now();
  ELSE NEW.published_by := OLD.published_by; NEW.published_at := OLD.published_at; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cat_product_guard BEFORE INSERT OR UPDATE ON public.cat_products FOR EACH ROW EXECUTE FUNCTION public.cat_guard_product();

CREATE OR REPLACE FUNCTION public.cat_guard_price() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN NEW.locked_at := NULL; RETURN NEW; END IF;
  IF OLD.locked_at IS NOT NULL THEN RAISE EXCEPTION 'Käytössä ollutta hintaversiota ei voi muuttaa; tee uusi versio'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cat_price_guard BEFORE INSERT OR UPDATE ON public.cat_price_versions FOR EACH ROW EXECUTE FUNCTION public.cat_guard_price();

CREATE OR REPLACE FUNCTION public.cat_guard_offering() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cat_price_versions WHERE id = NEW.price_version_id AND product_id = NEW.product_id) THEN RAISE EXCEPTION 'Hintaversio ei kuulu tuotteeseen'; END IF;
  IF NEW.status = 'julkaistu' THEN
    UPDATE public.cat_price_versions SET locked_at = coalesce(locked_at, now()) WHERE id = NEW.price_version_id AND locked_at IS NULL;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.cat_guard_offering() FROM public, anon, authenticated;
CREATE TRIGGER cat_offering_guard BEFORE INSERT OR UPDATE ON public.cat_offerings FOR EACH ROW EXECUTE FUNCTION public.cat_guard_offering();

CREATE OR REPLACE FUNCTION public.cat_public_catalog(p_slug text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('slug', p.slug, 'name', p.name, 'description', p.description, 'service_key', p.service_key,
    'offerings', coalesce((SELECT jsonb_agg(jsonb_build_object('id', o.id, 'starts_at', o.starts_at, 'ends_at', o.ends_at, 'location', o.location,
        'reg_opens_at', o.reg_opens_at, 'reg_closes_at', o.reg_closes_at, 'capacity', o.capacity,
        'free_cancel_days', o.free_cancel_days, 'late_cancel_pct', o.late_cancel_pct,
        'unit_price', v.unit_price, 'vat_basis', v.vat_basis) ORDER BY o.starts_at)
      FROM public.cat_offerings o JOIN public.cat_price_versions v ON v.id = o.price_version_id
      WHERE o.product_id = p.id AND o.status = 'julkaistu' AND o.ends_at > now()), '[]'::jsonb))
  FROM public.cat_products p WHERE p.slug = p_slug AND p.status = 'julkaistu' $$;
REVOKE EXECUTE ON FUNCTION public.cat_public_catalog(text) FROM public;
GRANT EXECUTE ON FUNCTION public.cat_public_catalog(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cat_public_slugs() RETURNS TABLE(slug text, name text, description text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.slug, p.name, p.description FROM public.cat_products p WHERE p.status = 'julkaistu' ORDER BY p.name $$;
REVOKE EXECUTE ON FUNCTION public.cat_public_slugs() FROM public;
GRANT EXECUTE ON FUNCTION public.cat_public_slugs() TO anon, authenticated;