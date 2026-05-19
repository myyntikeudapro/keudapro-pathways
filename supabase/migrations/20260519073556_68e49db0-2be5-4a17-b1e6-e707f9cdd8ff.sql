-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  )
$$;

CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Categories
CREATE TABLE public.card_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  category_slug text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_slug, category_slug)
);

ALTER TABLE public.card_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON public.card_categories FOR SELECT
  USING (true);

CREATE POLICY "Editors can insert categories"
  ON public.card_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can update categories"
  ON public.card_categories FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON public.card_categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_card_categories_updated
  BEFORE UPDATE ON public.card_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cards
CREATE TYPE public.cta_type AS ENUM ('enroll', 'ask');

CREATE TABLE public.training_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.card_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  ingress text NOT NULL DEFAULT '',
  read_more_url text,
  cta_type public.cta_type NOT NULL DEFAULT 'ask',
  cta_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(ingress) <= 100),
  CHECK (char_length(title) BETWEEN 1 AND 200)
);

CREATE INDEX idx_training_cards_category ON public.training_cards(category_id, sort_order);

ALTER TABLE public.training_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published cards"
  ON public.training_cards FOR SELECT
  USING (published = true);

CREATE POLICY "Editors can read all cards"
  ON public.training_cards FOR SELECT TO authenticated
  USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can insert cards"
  ON public.training_cards FOR INSERT TO authenticated
  WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can update cards"
  ON public.training_cards FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can delete cards"
  ON public.training_cards FOR DELETE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()));

CREATE TRIGGER trg_training_cards_updated
  BEFORE UPDATE ON public.training_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();