CREATE OR REPLACE FUNCTION public.staff_member_is_staff(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_editor_or_admin(auth.uid()) AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;
REVOKE ALL ON FUNCTION public.staff_member_is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_member_is_staff(uuid) TO authenticated;

DROP POLICY IF EXISTS "Team hands off orders" ON public.crm_production_handoffs;
CREATE POLICY "Team hands off orders" ON public.crm_production_handoffs FOR INSERT TO authenticated
WITH CHECK (public.is_editor_or_admin(auth.uid()) AND handed_by = auth.uid() AND public.staff_member_is_staff(production_owner_id) AND cancelled_at IS NULL);