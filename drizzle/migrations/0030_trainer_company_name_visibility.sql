CREATE FUNCTION public.company_my_trainer_programmes_with_company()
RETURNS TABLE(id uuid, revision integer, state text, starts_at timestamptz, ends_at timestamptz, capacity_approved boolean, company_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT v.id,v.revision,v.state,(v.programme->>'startsAt')::timestamptz,(v.programme->>'endsAt')::timestamptz,
 EXISTS(SELECT 1 FROM public.prod_programme_approvals a WHERE a.programme_version_id=v.id AND a.kind='capacity'),nullif(trim(b.organization),'')
 FROM public.prod_programme_versions v JOIN public.booking_requests b ON b.company_programme_id=v.id
 WHERE auth.uid() IS NOT NULL AND v.responsible_trainer_id=auth.uid() AND coalesce(b.mt_personal,false)=false
 AND (public.has_role(auth.uid(),'trainer') OR public.is_editor_or_admin(auth.uid()))
 ORDER BY (v.programme->>'startsAt')::timestamptz NULLS LAST,v.id;
$$;
REVOKE ALL ON FUNCTION public.company_my_trainer_programmes_with_company() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_my_trainer_programmes_with_company() TO authenticated;

CREATE OR REPLACE FUNCTION public.company_programme_read(p_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; company_name text;
BEGIN
 v:=public.company_require(p_id);
 IF public.is_editor_or_admin(auth.uid()) THEN RETURN to_jsonb(v)||jsonb_build_object('readiness',public.company_ready(p_id,true)); END IF;
 SELECT nullif(trim(b.organization),'') INTO company_name FROM public.booking_requests b WHERE b.id=v.case_lead_id AND coalesce(b.mt_personal,false)=false;
 RETURN jsonb_build_object('id',v.id,'revision',v.revision,'company_name',company_name,'programme',v.programme-'customer','capacity',v.capacity,'resources',v.resource_plan,'readiness',public.company_ready(p_id,true));
END $$;
REVOKE ALL ON FUNCTION public.company_programme_read(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_programme_read(uuid) TO authenticated;

CREATE OR REPLACE VIEW public.prod_trainer_sessions AS
 SELECT s.id AS session_id,s.seq,s.title AS session_title,s.starts_at,s.ends_at,s.location,d.title AS delivery_title,b.status AS booking_status,nullif(trim(o.name),'') AS company_name
 FROM public.prod_trainer_bookings b JOIN public.prod_sessions s ON s.id=b.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id
 JOIN public.crm_orders ord ON ord.id=d.order_id JOIN public.crm_organizations o ON o.id=ord.organization_id
 JOIN public.booking_requests lead ON lead.id=ord.lead_id
 WHERE b.trainer_id=auth.uid() AND b.status<>'peruttu' AND public.has_role(auth.uid(),'trainer') AND coalesce(lead.mt_personal,false)=false;
REVOKE ALL ON public.prod_trainer_sessions FROM anon,PUBLIC;
GRANT SELECT ON public.prod_trainer_sessions TO authenticated;

CREATE FUNCTION public.prod_my_trainer_tasks()
RETURNS TABLE(id uuid,title text,due_at timestamptz,completed_at timestamptz,company_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT t.id,t.title,t.due_at,t.completed_at,nullif(trim(o.name),'')
 FROM public.prod_tasks t JOIN public.prod_deliveries d ON d.id=t.delivery_id JOIN public.crm_orders ord ON ord.id=d.order_id
 JOIN public.crm_organizations o ON o.id=ord.organization_id JOIN public.booking_requests lead ON lead.id=ord.lead_id
 WHERE auth.uid() IS NOT NULL AND t.owner_id=auth.uid() AND public.has_role(auth.uid(),'trainer') AND coalesce(lead.mt_personal,false)=false
 ORDER BY t.due_at NULLS LAST,t.id;
$$;
REVOKE ALL ON FUNCTION public.prod_my_trainer_tasks() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prod_my_trainer_tasks() TO authenticated;