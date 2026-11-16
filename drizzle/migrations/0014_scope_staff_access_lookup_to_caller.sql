CREATE OR REPLACE FUNCTION public.is_editor_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
 SELECT (_user_id = auth.uid() OR COALESCE(auth.role(), '') = 'service_role')
   AND EXISTS (
     SELECT 1 FROM public.user_roles
     WHERE user_id = _user_id AND role IN ('admin','editor')
   );
$function$;
REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO authenticated, service_role;