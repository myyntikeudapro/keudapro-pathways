GRANT SELECT ON public.booking_requests TO authenticated;

CREATE POLICY "Editors can read booking requests"
ON public.booking_requests
FOR SELECT
TO authenticated
USING (public.is_editor_or_admin(auth.uid()));