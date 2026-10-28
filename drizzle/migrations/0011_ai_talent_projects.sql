CREATE TABLE public.ai_talent_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path smallint NOT NULL CHECK (path BETWEEN 1 AND 5),
  title text NOT NULL,
  owner_org text NOT NULL DEFAULT '',
  owner_name text,
  problem text,
  deliverable text,
  metric text,
  data_scope text,
  commitment_accepted boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ehdotus' CHECK (status IN ('ehdotus','avoin','rajattu','käynnissä','valmis')),
  participant_user_id uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_talent_projects TO authenticated;
GRANT ALL ON public.ai_talent_projects TO service_role;
ALTER TABLE public.ai_talent_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AIT projects read" ON public.ai_talent_projects FOR SELECT TO authenticated
USING (
  public.ai_talent_role(auth.uid()) IN ('helsinki','partner','admin')
  OR public.is_ai_talent_admin(auth.uid())
  OR (participant_user_id = auth.uid() AND public.ai_talent_role(auth.uid()) = 'participant')
);
CREATE POLICY "AIT admin insert" ON public.ai_talent_projects FOR INSERT TO authenticated
WITH CHECK (public.is_ai_talent_admin(auth.uid()));
CREATE POLICY "AIT partner propose" ON public.ai_talent_projects FOR INSERT TO authenticated
WITH CHECK (public.ai_talent_role(auth.uid()) = 'partner' AND status = 'ehdotus' AND participant_user_id IS NULL AND created_by = auth.uid());
CREATE POLICY "AIT admin update" ON public.ai_talent_projects FOR UPDATE TO authenticated
USING (public.is_ai_talent_admin(auth.uid())) WITH CHECK (public.is_ai_talent_admin(auth.uid()));
CREATE POLICY "AIT admin delete" ON public.ai_talent_projects FOR DELETE TO authenticated
USING (public.is_ai_talent_admin(auth.uid()));

CREATE TRIGGER ai_talent_projects_updated BEFORE UPDATE ON public.ai_talent_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.ai_talent_participants()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.email::text FROM auth.users u
  JOIN public.ai_talent_members m ON lower(m.email) = lower(u.email)
  WHERE m.role = 'participant' AND public.is_ai_talent_admin(auth.uid())
$$;
REVOKE ALL ON FUNCTION public.ai_talent_participants() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.ai_talent_participants() TO authenticated;