CREATE TABLE public.ai_talent_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('participant','helsinki','partner','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
CREATE UNIQUE INDEX ai_talent_members_email_key ON public.ai_talent_members (lower(email));

CREATE OR REPLACE FUNCTION public.ai_talent_role(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM public.ai_talent_members m
  JOIN auth.users u ON u.id = _user_id
  WHERE lower(m.email) = lower(u.email) AND u.email_confirmed_at IS NOT NULL
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_ai_talent_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.ai_talent_role(_user_id) = 'admin' OR public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.normalize_ai_talent_member()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.email := lower(trim(NEW.email));
  IF NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Virheellinen sähköposti'; END IF;
  RETURN NEW; END $$;
CREATE TRIGGER normalize_ai_talent_member BEFORE INSERT OR UPDATE ON public.ai_talent_members
FOR EACH ROW EXECUTE FUNCTION public.normalize_ai_talent_member();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_talent_members TO authenticated;
GRANT ALL ON public.ai_talent_members TO service_role;
ALTER TABLE public.ai_talent_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own membership" ON public.ai_talent_members FOR SELECT TO authenticated
  USING (public.ai_talent_role(auth.uid()) IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'));
CREATE POLICY "AI Talent admins read members" ON public.ai_talent_members FOR SELECT TO authenticated
  USING (public.is_ai_talent_admin(auth.uid()));
CREATE POLICY "AI Talent admins add members" ON public.ai_talent_members FOR INSERT TO authenticated
  WITH CHECK (public.is_ai_talent_admin(auth.uid()));
CREATE POLICY "AI Talent admins update members" ON public.ai_talent_members FOR UPDATE TO authenticated
  USING (public.is_ai_talent_admin(auth.uid())) WITH CHECK (public.is_ai_talent_admin(auth.uid()));
CREATE POLICY "AI Talent admins remove members" ON public.ai_talent_members FOR DELETE TO authenticated
  USING (public.is_ai_talent_admin(auth.uid()));