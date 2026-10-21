CREATE TABLE public.crm_interactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE, kind text NOT NULL CHECK (kind IN ('call','email','meeting','note')), summary text NOT NULL CHECK (length(trim(summary)) BETWEEN 1 AND 2000), occurred_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.crm_interactions TO authenticated;
GRANT ALL ON public.crm_interactions TO service_role;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editors read interactions" ON public.crm_interactions FOR SELECT TO authenticated USING(public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Editors record own interactions" ON public.crm_interactions FOR INSERT TO authenticated WITH CHECK(public.is_editor_or_admin(auth.uid()) AND created_by=auth.uid());
CREATE INDEX crm_interactions_lead_idx ON public.crm_interactions(lead_id,occurred_at);
CREATE TABLE public.crm_offers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE, title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 200), amount numeric(12,2) NOT NULL CHECK(amount>=0), probability integer NOT NULL DEFAULT 50 CHECK(probability BETWEEN 0 AND 100), expected_close date NOT NULL, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','accepted','declined')), created_by uuid DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_offers TO authenticated;
GRANT ALL ON public.crm_offers TO service_role;
ALTER TABLE public.crm_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editors manage offers" ON public.crm_offers FOR ALL TO authenticated USING(public.is_editor_or_admin(auth.uid())) WITH CHECK(public.is_editor_or_admin(auth.uid()));
CREATE INDEX crm_offers_lead_idx ON public.crm_offers(lead_id);
CREATE TABLE public.crm_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recipient_id uuid NOT NULL, lead_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE, kind text NOT NULL CHECK(kind IN ('assigned','new_lead','task_assigned')), read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.crm_notifications TO authenticated;
GRANT ALL ON public.crm_notifications TO service_role;
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team reads own notifications" ON public.crm_notifications FOR SELECT TO authenticated USING(recipient_id=auth.uid() AND public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Team marks own notifications" ON public.crm_notifications FOR UPDATE TO authenticated USING(recipient_id=auth.uid() AND public.is_editor_or_admin(auth.uid())) WITH CHECK(recipient_id=auth.uid() AND public.is_editor_or_admin(auth.uid()));
CREATE FUNCTION public.crm_notify_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF TG_TABLE_NAME='booking_requests' THEN
 IF TG_OP='INSERT' THEN
  IF NEW.owner_id IS NULL THEN INSERT INTO public.crm_notifications(recipient_id,lead_id,kind) SELECT DISTINCT user_id,NEW.id,'new_lead' FROM public.user_roles;
  ELSE INSERT INTO public.crm_notifications(recipient_id,lead_id,kind) VALUES(NEW.owner_id,NEW.id,'assigned'); END IF;
 ELSIF NEW.owner_id IS DISTINCT FROM OLD.owner_id AND NEW.owner_id IS NOT NULL THEN INSERT INTO public.crm_notifications(recipient_id,lead_id,kind) VALUES(NEW.owner_id,NEW.id,'assigned'); END IF;
ELSE
 IF TG_OP='INSERT' THEN INSERT INTO public.crm_notifications(recipient_id,lead_id,kind) VALUES(NEW.owner_id,NEW.lead_id,'task_assigned');
 ELSIF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN INSERT INTO public.crm_notifications(recipient_id,lead_id,kind) VALUES(NEW.owner_id,NEW.lead_id,'task_assigned'); END IF;
END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.crm_notify_change() FROM PUBLIC;
CREATE TRIGGER crm_booking_notify AFTER INSERT OR UPDATE OF owner_id ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.crm_notify_change();
CREATE TRIGGER crm_task_notify AFTER INSERT OR UPDATE OF owner_id ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.crm_notify_change();