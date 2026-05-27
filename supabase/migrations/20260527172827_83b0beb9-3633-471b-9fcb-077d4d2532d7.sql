
-- 1) Restrict storage listing on public card-images bucket.
-- Files remain publicly accessible via the public URL (bucket.public = true),
-- but we drop the broad SELECT policy that allowed listing all objects.
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;

-- 2) Lock down SECURITY DEFINER helper functions so signed-in users
-- cannot execute them directly via the Data API.
-- RLS policies that reference these will continue to work because
-- Postgres evaluates policy expressions with definer privileges when
-- the function itself is SECURITY DEFINER.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) FROM anon, authenticated, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO service_role;
