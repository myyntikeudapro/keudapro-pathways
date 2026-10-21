CREATE TABLE public.marketing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  event text NOT NULL,
  path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer_host text,
  device text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT me_len CHECK (length(session_id) <= 64 AND length(event) <= 64 AND coalesce(length(path),0) <= 300
    AND coalesce(length(utm_source),0) <= 100 AND coalesce(length(utm_medium),0) <= 100 AND coalesce(length(utm_campaign),0) <= 150
    AND coalesce(length(referrer_host),0) <= 200 AND coalesce(length(device),0) <= 20 AND length(props::text) <= 2000)
);
CREATE INDEX marketing_events_created_idx ON public.marketing_events (created_at DESC);
GRANT INSERT ON public.marketing_events TO anon, authenticated;
GRANT SELECT ON public.marketing_events TO authenticated;
GRANT ALL ON public.marketing_events TO service_role;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log marketing events" ON public.marketing_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Editors can read marketing events" ON public.marketing_events FOR SELECT TO authenticated USING (public.is_editor_or_admin(auth.uid()));

ALTER TABLE public.booking_requests
  ADD COLUMN status text NOT NULL DEFAULT 'uusi',
  ADD COLUMN notes text,
  ADD COLUMN utm_source text,
  ADD COLUMN utm_medium text,
  ADD COLUMN utm_campaign text,
  ADD COLUMN session_id text,
  ADD COLUMN handled_by text;
GRANT UPDATE (status, notes, handled_by) ON public.booking_requests TO authenticated;
CREATE POLICY "Editors can update booking requests" ON public.booking_requests FOR UPDATE TO authenticated USING (public.is_editor_or_admin(auth.uid())) WITH CHECK (public.is_editor_or_admin(auth.uid()));