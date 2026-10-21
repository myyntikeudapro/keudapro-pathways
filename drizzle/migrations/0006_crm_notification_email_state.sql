ALTER TABLE public.crm_notifications ADD COLUMN emailed_at timestamptz;
REVOKE UPDATE ON public.crm_notifications FROM authenticated;
GRANT UPDATE(read_at) ON public.crm_notifications TO authenticated;