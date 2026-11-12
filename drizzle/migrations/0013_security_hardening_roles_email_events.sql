CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT (_user_id = auth.uid() OR coalesce(auth.role(),'') = 'service_role' OR auth.uid() IS NULL AND current_setting('request.jwt.claims', true) IS NULL)
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.ai_talent_role(_user_id uuid)
 RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT m.role FROM public.ai_talent_members m
  JOIN auth.users u ON u.id = _user_id
  WHERE lower(m.email) = lower(u.email) AND u.email_confirmed_at IS NOT NULL
    AND (_user_id = auth.uid() OR coalesce(auth.role(),'') = 'service_role'
         OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ai_talent_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ai_talent_role(uuid) TO authenticated, service_role;

ALTER FUNCTION public.move_to_dlq(text,text,bigint,jsonb) SET search_path = '';
ALTER FUNCTION public.read_email_batch(text,integer,integer) SET search_path = '';
ALTER FUNCTION public.enqueue_email(text,jsonb) SET search_path = '';
ALTER FUNCTION public.delete_email(text,bigint) SET search_path = '';

DROP POLICY IF EXISTS "Anyone can log marketing events" ON public.marketing_events;
CREATE POLICY "Anyone can log marketing events" ON public.marketing_events FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(session_id) BETWEEN 8 AND 100
  AND event ~ '^[a-z0-9_:\-]{1,64}$'
  AND (path IS NULL OR char_length(path) <= 500)
  AND (utm_source IS NULL OR char_length(utm_source) <= 200)
  AND (utm_medium IS NULL OR char_length(utm_medium) <= 200)
  AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 200)
  AND (referrer_host IS NULL OR char_length(referrer_host) <= 255)
  AND (device IS NULL OR char_length(device) <= 32)
  AND jsonb_typeof(props) = 'object' AND pg_column_size(props) <= 4000
);