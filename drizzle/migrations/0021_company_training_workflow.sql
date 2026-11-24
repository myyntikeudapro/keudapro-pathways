CREATE TABLE public.prod_programme_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 case_lead_id uuid NOT NULL REFERENCES public.booking_requests(id),
 source_version_id uuid REFERENCES public.prod_programme_versions(id),
 revision integer NOT NULL CHECK(revision>0),
 state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','approved','superseded','cancelled')),
 sales_owner_id uuid NOT NULL,
 production_owner_id uuid NOT NULL,
 responsible_trainer_id uuid,
 programme jsonb NOT NULL DEFAULT '{}'::jsonb,
 capacity jsonb NOT NULL DEFAULT '{}'::jsonb,
 resource_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
 resource_list_verified boolean NOT NULL DEFAULT false,
 promises text NOT NULL DEFAULT '',
 review_findings jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(case_lead_id,revision),
 UNIQUE(id,case_lead_id)
);
GRANT SELECT ON public.prod_programme_versions TO authenticated;
GRANT ALL ON public.prod_programme_versions TO service_role;
ALTER TABLE public.prod_programme_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_programme_staff_read ON public.prod_programme_versions FOR SELECT TO authenticated
 USING(public.is_editor_or_admin(auth.uid()) AND public.mt_can_case(case_lead_id));

CREATE TABLE public.prod_programme_approvals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 programme_version_id uuid NOT NULL REFERENCES public.prod_programme_versions(id),
 kind text NOT NULL CHECK(kind IN ('programme','capacity','submitted','accepted','returned')),
 event_revision integer NOT NULL CHECK(event_revision>0),
 snapshot jsonb NOT NULL,
 recorded_by uuid NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 reason text,
 UNIQUE(programme_version_id,kind,event_revision)
);
GRANT SELECT ON public.prod_programme_approvals TO authenticated;
GRANT ALL ON public.prod_programme_approvals TO service_role;
ALTER TABLE public.prod_programme_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_programme_decision_staff_read ON public.prod_programme_approvals FOR SELECT TO authenticated
 USING(public.is_editor_or_admin(auth.uid()) AND EXISTS(SELECT 1 FROM public.prod_programme_versions v
 WHERE v.id=programme_version_id AND public.mt_can_case(v.case_lead_id)));

ALTER TABLE public.booking_requests ADD COLUMN training_model text;
ALTER TABLE public.booking_requests ADD COLUMN company_programme_id uuid REFERENCES public.prod_programme_versions(id);
ALTER TABLE public.prod_deliveries ADD COLUMN training_model text;
ALTER TABLE public.prod_deliveries ADD COLUMN company_programme_id uuid REFERENCES public.prod_programme_versions(id);
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_programme_id uuid REFERENCES public.prod_programme_versions(id);
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_state text CHECK(company_state IN ('submitted','accepted','returned'));
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_revision integer NOT NULL DEFAULT 0;
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_response_by uuid;
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_response_at timestamptz;
ALTER TABLE public.crm_production_handoffs ADD COLUMN company_return_reason text;

CREATE FUNCTION public.company_is_owner(p_table regclass) RETURNS boolean
 LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT current_user = pg_get_userbyid(relowner) FROM pg_class WHERE oid=p_table;
$$;
REVOKE ALL ON FUNCTION public.company_is_owner(regclass) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.company_is_owner(regclass) TO anon,authenticated;

CREATE FUNCTION public.company_structure_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; l uuid;
BEGIN
 IF TG_OP='UPDATE' AND (to_jsonb(NEW)->'company_programme_id' IS DISTINCT FROM to_jsonb(OLD)->'company_programme_id' OR to_jsonb(NEW)->'training_model' IS DISTINCT FROM to_jsonb(OLD)->'training_model' OR (TG_TABLE_NAME='crm_production_handoffs' AND (to_jsonb(NEW)-ARRAY['mt_state','mt_response_by','mt_response_at','mt_return_reason','mt_revision']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['mt_state','mt_response_by','mt_response_at','mt_return_reason','mt_revision']) AND (NEW.company_programme_id IS NOT NULL OR OLD.company_programme_id IS NOT NULL))) AND NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
 IF TG_OP='UPDATE' AND TG_TABLE_NAME='prod_deliveries' AND to_jsonb(OLD)->>'training_model'='company' AND (to_jsonb(NEW)->>'training_model' IS DISTINCT FROM 'company' OR NEW.company_programme_id IS NULL) THEN RAISE EXCEPTION 'COMPANY_MODEL_IMMUTABLE'; END IF;
 IF NEW.company_programme_id IS NULL THEN
  IF to_jsonb(NEW)->>'training_model'='company' OR (TG_TABLE_NAME='crm_production_handoffs' AND to_jsonb(NEW)->>'company_state' IS NOT NULL) THEN RAISE EXCEPTION 'Company programme required'; END IF;
  RETURN NEW;
 END IF;
 IF TG_OP='INSERT' AND NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
 IF TG_TABLE_NAME='booking_requests' THEN l:=NEW.id; ELSE SELECT lead_id INTO l FROM public.crm_orders WHERE id=NEW.order_id; END IF;
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=NEW.company_programme_id;
 IF v.id IS NULL OR l IS DISTINCT FROM v.case_lead_id OR EXISTS(SELECT 1 FROM public.booking_requests WHERE id=l AND mt_personal) THEN RAISE EXCEPTION 'Company programme case mismatch'; END IF;
 IF TG_TABLE_NAME<>'booking_requests' AND NOT EXISTS(SELECT 1 FROM public.booking_requests WHERE id=l AND company_programme_id=v.id) THEN RAISE EXCEPTION 'COMPANY_STALE_REVISION'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.company_structure_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER company_case_structure BEFORE INSERT OR UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.company_structure_guard();
CREATE TRIGGER company_delivery_structure BEFORE INSERT OR UPDATE ON public.prod_deliveries FOR EACH ROW EXECUTE FUNCTION public.company_structure_guard();
CREATE TRIGGER company_handoff_structure BEFORE INSERT OR UPDATE ON public.crm_production_handoffs FOR EACH ROW EXECUTE FUNCTION public.company_structure_guard();

CREATE FUNCTION public.company_programme_history_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT public.company_is_owner(TG_RELID) THEN RAISE EXCEPTION 'COMPANY_RPC_REQUIRED' USING ERRCODE='42501'; END IF;
 IF TG_OP='INSERT' THEN
  IF TG_TABLE_NAME='prod_programme_versions' AND ((to_jsonb(NEW)->>'created_by')::uuid IS DISTINCT FROM auth.uid() OR EXISTS(SELECT 1 FROM public.booking_requests WHERE id=(to_jsonb(NEW)->>'case_lead_id')::uuid AND mt_personal)) THEN RAISE EXCEPTION 'COMPANY_CREATOR_INVALID'; END IF;
  RETURN NEW;
 END IF;
 IF TG_TABLE_NAME='prod_programme_approvals' OR TG_OP='DELETE' OR to_jsonb(OLD)->>'state' IS DISTINCT FROM 'draft' THEN RAISE EXCEPTION 'Programme history immutable'; END IF;
 IF (to_jsonb(NEW)-'state') IS DISTINCT FROM (to_jsonb(OLD)-'state') THEN RAISE EXCEPTION 'Programme edits require new revision'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.company_programme_history_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER company_version_history BEFORE UPDATE OR DELETE ON public.prod_programme_versions FOR EACH ROW EXECUTE FUNCTION public.company_programme_history_guard();
CREATE TRIGGER company_approval_history BEFORE UPDATE OR DELETE ON public.prod_programme_approvals FOR EACH ROW EXECUTE FUNCTION public.company_programme_history_guard();
CREATE TRIGGER company_version_insert BEFORE INSERT ON public.prod_programme_versions FOR EACH ROW EXECUTE FUNCTION public.company_programme_history_guard();
CREATE TRIGGER company_approval_insert BEFORE INSERT ON public.prod_programme_approvals FOR EACH ROW EXECUTE FUNCTION public.company_programme_history_guard();

CREATE FUNCTION public.company_require(p_id uuid, p_mode text DEFAULT 'read')
 RETURNS public.prod_programme_versions LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; b public.booking_requests;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'COMPANY_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'COMPANY_NOT_FOUND'; END IF;
 SELECT * INTO b FROM public.booking_requests WHERE id=v.case_lead_id;
 IF b.mt_personal THEN RAISE EXCEPTION 'COMPANY_PERSONAL_CASE_DENIED' USING ERRCODE='42501'; END IF;
 IF p_mode='sales' THEN
   IF NOT public.is_editor_or_admin(auth.uid()) OR auth.uid() IS DISTINCT FROM v.sales_owner_id OR b.owner_id IS DISTINCT FROM v.sales_owner_id THEN RAISE EXCEPTION 'COMPANY_SALES_REQUIRED' USING ERRCODE='42501'; END IF;
 ELSIF p_mode='trainer' THEN
   IF auth.uid() IS DISTINCT FROM v.responsible_trainer_id OR NOT (public.has_role(auth.uid(),'trainer') OR public.is_editor_or_admin(auth.uid())) THEN RAISE EXCEPTION 'COMPANY_TRAINER_REQUIRED' USING ERRCODE='42501'; END IF;
 ELSIF p_mode='capacity' THEN
   IF NOT ((auth.uid()=v.responsible_trainer_id AND (public.has_role(auth.uid(),'trainer') OR public.is_editor_or_admin(auth.uid())))
        OR (auth.uid()=v.production_owner_id AND public.is_editor_or_admin(auth.uid()))) THEN RAISE EXCEPTION 'COMPANY_TRAINER_REQUIRED' USING ERRCODE='42501'; END IF;
 ELSIF p_mode='production' THEN
   IF auth.uid() IS DISTINCT FROM v.production_owner_id OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'COMPANY_RECEIVER_REQUIRED' USING ERRCODE='42501'; END IF;
 ELSIF p_mode<>'read' OR NOT ((public.is_editor_or_admin(auth.uid()) AND public.mt_can_case(v.case_lead_id)) OR (auth.uid()=v.responsible_trainer_id AND public.has_role(auth.uid(),'trainer'))) THEN
   RAISE EXCEPTION 'COMPANY_ACCESS_DENIED' USING ERRCODE='42501';
 END IF;
 RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.company_require(uuid,text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_latest(p_id uuid) RETURNS public.prod_programme_versions
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; b public.booking_requests;
BEGIN
 v:=public.company_require(p_id);
 SELECT * INTO b FROM public.booking_requests WHERE id=v.case_lead_id FOR UPDATE;
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=p_id FOR UPDATE;
 IF b.company_programme_id IS DISTINCT FROM p_id THEN RAISE EXCEPTION 'COMPANY_STALE_REVISION' USING ERRCODE='40001'; END IF;
 RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.company_latest(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_capacity_defects(p jsonb) RETURNS text[]
 LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE errors text[]:='{}'; st jsonb; sl jsonb; other jsonb; req jsonb; person jsonb; sid text;
 t0 timestamptz; t1 timestamptz; a timestamptz; z timestamptz; ba timestamptz; bz timestamptz;
 duration numeric; transition numeric; parallel_n integer; trainer_n integer; n integer;
BEGIN
 IF jsonb_typeof(p) IS DISTINCT FROM 'object' OR jsonb_typeof(p->'participantIds') IS DISTINCT FROM 'array' OR jsonb_typeof(p->'stations') IS DISTINCT FROM 'array' OR jsonb_typeof(p->'slots') IS DISTINCT FROM 'array' THEN RETURN ARRAY['capacity_shape']; END IF;
 t0:=(p->>'startsAt')::timestamptz; t1:=(p->>'endsAt')::timestamptz;
 IF t0 IS NULL OR t1 IS NULL OR NOT isfinite(t0) OR NOT isfinite(t1) OR t1<=t0 OR nullif(p->>'programmeVersion','') IS NULL OR nullif(p->>'responsibleTrainerId','') IS NULL THEN errors:=array_append(errors,'capacity_window_identity'); END IF;
 IF jsonb_array_length(p->'participantIds')=0 THEN errors:=array_append(errors,'capacity_empty'); END IF;
 IF (SELECT count(*)<>count(DISTINCT x) FROM jsonb_array_elements_text(p->'participantIds') x) OR EXISTS(SELECT 1 FROM jsonb_array_elements(p->'participantIds') x WHERE jsonb_typeof(x) IS DISTINCT FROM 'string' OR length(trim(x#>>'{}'))=0) THEN errors:=array_append(errors,'participant_identity'); END IF;
 IF (SELECT count(*)<>count(DISTINCT x->>'id') FROM jsonb_array_elements(p->'stations') x) THEN errors:=array_append(errors,'station_identity'); END IF;
 FOR st IN SELECT value FROM jsonb_array_elements(p->'stations') LOOP
  sid:=st->>'id'; duration:=(st->>'guidedMinutes')::numeric; transition:=(st->>'transitionMinutes')::numeric;
  parallel_n:=(st->>'safeParallel')::integer; trainer_n:=(st->>'participantsPerTrainer')::integer;
  IF nullif(sid,'') IS NULL OR st->>'requirement' IS NULL OR st->>'requirement' NOT IN ('required','optional') THEN errors:=array_append(errors,'station_requirement'); END IF;
  IF duration IS NULL OR duration<=0 OR duration::text IN ('NaN','Infinity','-Infinity') OR transition IS NULL OR transition<0 OR transition::text IN ('NaN','Infinity','-Infinity') OR parallel_n IS NULL OR parallel_n<=0 OR trainer_n IS NULL OR trainer_n<=0
    OR jsonb_typeof(st->'machineIds') IS DISTINCT FROM 'array' OR jsonb_typeof(st->'trainerIds') IS DISTINCT FROM 'array' THEN errors:=array_append(errors,'station_inputs'); CONTINUE; END IF;
  IF jsonb_array_length(st->'trainerIds')=0 THEN errors:=array_append(errors,'station_resources'); END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(st->'machineIds') x WHERE jsonb_typeof(x) IS DISTINCT FROM 'string' OR nullif(trim(x#>>'{}'),'') IS NULL) OR EXISTS(SELECT 1 FROM jsonb_array_elements(st->'trainerIds') x WHERE jsonb_typeof(x) IS DISTINCT FROM 'string' OR nullif(trim(x#>>'{}'),'') IS NULL) THEN errors:=array_append(errors,'station_resource_identity'); END IF;
  IF st->>'requirement'='required' THEN
   FOR person IN SELECT value FROM jsonb_array_elements(p->'participantIds') LOOP
    IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(p->'slots') x WHERE x->>'stationId'=sid AND x->'participantId'=person) THEN errors:=array_append(errors,'missing_practice'); END IF;
   END LOOP;
  END IF;
 END LOOP;
 FOR req IN SELECT value FROM jsonb_array_elements(coalesce(p->'electiveRequirements','[]'::jsonb)) LOOP
  IF NOT p->'participantIds' @> jsonb_build_array(req->'participantId') THEN errors:=array_append(errors,'elective_participant'); END IF;
  FOR sid IN SELECT value FROM jsonb_array_elements_text(req->'stationIds') LOOP
   IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(p->'stations') x WHERE x->>'id'=sid AND x->>'requirement'='optional') OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(p->'slots') x WHERE x->>'stationId'=sid AND x->'participantId'=req->'participantId') THEN errors:=array_append(errors,'missing_elective'); END IF;
  END LOOP;
 END LOOP;
 FOR sl IN SELECT value FROM jsonb_array_elements(p->'slots') LOOP
  SELECT value INTO st FROM jsonb_array_elements(p->'stations') WHERE value->>'id'=sl->>'stationId';
  a:=(sl->>'startsAt')::timestamptz; z:=(sl->>'endsAt')::timestamptz;
  IF st IS NULL OR NOT coalesce(p->'participantIds' @> jsonb_build_array(sl->'participantId'),false) OR NOT (CASE WHEN nullif(sl->>'machineId','') IS NULL THEN jsonb_array_length(st->'machineIds')=0 ELSE coalesce(st->'machineIds' @> jsonb_build_array(sl->'machineId'),false) END) OR NOT coalesce(st->'trainerIds' @> jsonb_build_array(sl->'trainerId'),false) THEN errors:=array_append(errors,'slot_identity'); CONTINUE; END IF;
  IF a IS NULL OR z IS NULL OR NOT isfinite(a) OR NOT isfinite(z) OR z<=a OR a<t0 OR z>t1 THEN errors:=array_append(errors,'slot_window'); CONTINUE; END IF;
  IF extract(epoch FROM z-a)/60 < (st->>'guidedMinutes')::numeric THEN errors:=array_append(errors,'short_practice'); END IF;
  SELECT count(*) INTO n FROM jsonb_array_elements(p->'slots') x WHERE x->>'stationId'=sl->>'stationId' AND (x->>'startsAt')::timestamptz<=a AND (x->>'endsAt')::timestamptz>a;
  IF n>(st->>'safeParallel')::integer THEN errors:=array_append(errors,'parallel_limit'); END IF;
  SELECT count(*) INTO n FROM jsonb_array_elements(p->'slots') x WHERE x->>'stationId'=sl->>'stationId' AND x->>'trainerId'=sl->>'trainerId' AND (x->>'startsAt')::timestamptz<=a AND (x->>'endsAt')::timestamptz>a;
  IF n>(st->>'participantsPerTrainer')::integer THEN errors:=array_append(errors,'trainer_limit'); END IF;
  FOR other IN SELECT value FROM jsonb_array_elements(p->'slots') WHERE value<>sl LOOP
   ba:=(other->>'startsAt')::timestamptz; bz:=(other->>'endsAt')::timestamptz;
   SELECT (value->>'transitionMinutes')::numeric INTO transition FROM jsonb_array_elements(p->'stations') WHERE value->>'id'=other->>'stationId';
   IF a < bz+make_interval(secs=>coalesce(transition,0)::double precision*60) AND ba < z+make_interval(secs=>coalesce((st->>'transitionMinutes')::numeric,0)::double precision*60) THEN
    IF sl->>'participantId'=other->>'participantId' THEN errors:=array_append(errors,'participant_overlap'); END IF;
    IF nullif(sl->>'machineId','') IS NOT NULL AND sl->>'machineId'=other->>'machineId' THEN errors:=array_append(errors,'machine_overlap'); END IF;
    IF sl->>'trainerId'=other->>'trainerId' AND sl->>'stationId'<>other->>'stationId' THEN errors:=array_append(errors,'trainer_station_overlap'); END IF;
   END IF;
  END LOOP;
 END LOOP;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p->'slots') x GROUP BY x HAVING count(*)>1) THEN errors:=array_append(errors,'duplicate_slot'); END IF;
 RETURN ARRAY(SELECT DISTINCT e FROM unnest(errors) e ORDER BY e);
EXCEPTION WHEN OTHERS THEN RETURN ARRAY['capacity_invalid_data'];
END $$;
REVOKE ALL ON FUNCTION public.company_capacity_defects(jsonb) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_resource_defects(p_id uuid) RETURNS text[]
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; rp jsonb; sl jsonb; rid uuid; tid uuid; a timestamptz; z timestamptz; errors text[]:='{}';
BEGIN
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=p_id;
 IF NOT FOUND THEN RETURN ARRAY['programme_missing']; END IF;
 IF (v.resource_plan IS NOT NULL AND jsonb_typeof(v.resource_plan) IS DISTINCT FROM 'array') OR (NOT coalesce(v.resource_list_verified,false) AND jsonb_array_length(coalesce(v.resource_plan,'[]'::jsonb))>0) THEN errors:=array_append(errors,'resource_list_unverified'); END IF;
 FOR rp IN SELECT value FROM jsonb_array_elements(coalesce(v.resource_plan,'[]'::jsonb)) LOOP
  rid:=(rp->>'resourceId')::uuid; a:=(rp->>'startsAt')::timestamptz; z:=(rp->>'endsAt')::timestamptz;
  IF rid IS NULL OR a IS NULL OR z IS NULL OR z<=a OR NOT EXISTS(SELECT 1 FROM public.prod_resources WHERE id=rid) THEN errors:=array_append(errors,'resource_invalid'); CONTINUE; END IF;
  IF rp->>'critical' IS NULL OR rp->>'critical' NOT IN ('true','false') OR rp->>'status' IS NULL OR rp->>'status' NOT IN ('provisional','confirmed','released') THEN errors:=array_append(errors,'resource_state_missing'); END IF;
  IF rp->>'critical'='true' AND rp->>'status'<>'confirmed' THEN errors:=array_append(errors,'critical_resource_unconfirmed'); END IF;
  IF rp->>'status'='provisional' AND ((rp->>'expiresAt')::timestamptz IS NULL OR (rp->>'expiresAt')::timestamptz<=clock_timestamp()) THEN errors:=array_append(errors,'reservation_expired'); END IF;
  IF rp->>'status'<>'released' AND EXISTS(SELECT 1 FROM public.prod_resource_bookings b JOIN public.prod_sessions s ON s.id=b.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id WHERE b.resource_id=rid AND d.production_status<>'peruttu' AND d.company_programme_id IS DISTINCT FROM p_id AND s.starts_at<z AND s.ends_at>a) THEN errors:=array_append(errors,'resource_external_overlap'); END IF;
  IF rp->>'status'<>'released' AND EXISTS(SELECT 1 FROM public.prod_programme_versions ov JOIN public.booking_requests ob ON ob.company_programme_id=ov.id CROSS JOIN LATERAL jsonb_array_elements(ov.resource_plan) x WHERE ov.id<>p_id AND ov.state<>'cancelled' AND x->>'resourceId'=rid::text AND (x->>'status'='confirmed' OR (x->>'status'='provisional' AND (x->>'expiresAt')::timestamptz>clock_timestamp())) AND (x->>'startsAt')::timestamptz<z AND (x->>'endsAt')::timestamptz>a) THEN errors:=array_append(errors,'resource_programme_overlap'); END IF;
 END LOOP;
 FOR sl IN SELECT value FROM jsonb_array_elements(coalesce(v.capacity->'slots','[]'::jsonb)) LOOP
  rid:=nullif(sl->>'machineId','')::uuid; tid:=(sl->>'trainerId')::uuid; a:=(sl->>'startsAt')::timestamptz; z:=(sl->>'endsAt')::timestamptz;
  IF rid IS NOT NULL AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(v.resource_plan,'[]'::jsonb)) r WHERE r->>'resourceId'=rid::text AND r->>'status'='confirmed' AND (r->>'startsAt')::timestamptz<=a AND (r->>'endsAt')::timestamptz>=z) THEN errors:=array_append(errors,'machine_unconfirmed'); END IF;
  IF NOT EXISTS(SELECT 1 FROM public.exp_experts e JOIN public.exp_assignments ex ON ex.expert_id=e.id JOIN public.prod_sessions s ON s.id=ex.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id WHERE e.user_id=tid AND e.status='aktiivinen' AND ex.status='vahvistettu' AND ex.expert_accepted_at IS NOT NULL AND d.company_programme_id=p_id AND s.starts_at<=a AND s.ends_at>=z) THEN errors:=array_append(errors,'trainer_assignment_unconfirmed'); END IF;
  IF EXISTS(SELECT 1 FROM public.exp_experts e JOIN public.exp_assignments ex ON ex.expert_id=e.id JOIN public.prod_sessions s ON s.id=ex.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id WHERE e.user_id=tid AND ex.status='vahvistettu' AND d.production_status<>'peruttu' AND d.company_programme_id IS DISTINCT FROM p_id AND s.starts_at<z AND s.ends_at>a) OR EXISTS(SELECT 1 FROM public.prod_trainer_bookings b JOIN public.prod_sessions s ON s.id=b.session_id JOIN public.prod_deliveries d ON d.id=s.delivery_id WHERE b.trainer_id=tid AND b.status<>'peruttu' AND d.production_status<>'peruttu' AND d.company_programme_id IS DISTINCT FROM p_id AND s.starts_at<z AND s.ends_at>a) THEN errors:=array_append(errors,'trainer_external_overlap'); END IF;
 END LOOP;
 RETURN ARRAY(SELECT DISTINCT e FROM unnest(errors) e ORDER BY e);
EXCEPTION WHEN OTHERS THEN RETURN ARRAY['resource_invalid_data'];
END $$;
REVOKE ALL ON FUNCTION public.company_resource_defects(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_programme_defects(p_id uuid) RETURNS text[] LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; s public.prod_programme_versions; errors text[]:='{}'; m text[]; start_time time; end_time time; body text; name text;
BEGIN
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=p_id;
 IF v.id IS NULL THEN RETURN ARRAY['programme_missing']; END IF;
 body:=coalesce(v.programme->>'text','');
 start_time:=((v.programme->>'startsAt')::timestamptz AT TIME ZONE 'Europe/Helsinki')::time;
 end_time:=((v.programme->>'endsAt')::timestamptz AT TIME ZONE 'Europe/Helsinki')::time;
 IF body='' OR start_time IS NULL OR end_time IS NULL OR extract(year FROM (v.programme->>'startsAt')::timestamptz AT TIME ZONE 'Europe/Helsinki')<>(v.programme->>'year')::integer THEN errors:=array_append(errors,'programme_date_invalid'); END IF;
 FOR m IN SELECT regexp_matches(body,'[0-9]{1,2}\.[0-9]{1,2}\.([0-9]{4})','g') LOOP
  IF m[1]<>(v.programme->>'year') THEN errors:=array_append(errors,'old_year'); END IF;
 END LOOP;
 FOR m IN SELECT regexp_matches(body,'klo\s+([0-9]{1,2})[.:]([0-9]{2})','gi') LOOP
  IF make_time(m[1]::integer,m[2]::integer,0)<start_time THEN errors:=array_append(errors,'conflicting_clock'); END IF;
 END LOOP;
 FOR m IN SELECT regexp_matches(body,'klo\s+([0-9]{1,2})(?:[.:]([0-9]{2}))?\s*[–-]\s*([0-9]{1,2})(?:[.:]([0-9]{2}))?','gi') LOOP
  IF make_time(m[1]::integer,coalesce(m[2],'0')::integer,0)<>start_time OR make_time(m[3]::integer,coalesce(m[4],'0')::integer,0)<>end_time THEN errors:=array_append(errors,'conflicting_clock'); END IF;
 END LOOP;
 IF v.source_version_id IS NOT NULL THEN
  SELECT * INTO s FROM public.prod_programme_versions WHERE id=v.source_version_id;
  IF s.programme->>'customer' IS DISTINCT FROM v.programme->>'customer' AND position(lower(s.programme->>'customer') IN lower(body))>0 THEN errors:=array_append(errors,'old_customer'); END IF;
  FOR name IN SELECT value FROM jsonb_array_elements_text(coalesce(s.programme->'trainers','[]'::jsonb)) LOOP
   IF NOT coalesce(v.programme->'trainers' @> jsonb_build_array(name),false) AND position(lower(name) IN lower(body))>0 THEN errors:=array_append(errors,'old_trainer'); END IF;
  END LOOP;
 END IF;
 RETURN ARRAY(SELECT DISTINCT e FROM unnest(errors) e);
EXCEPTION WHEN OTHERS THEN RETURN ARRAY['programme_invalid_data'];
END $$;
REVOKE ALL ON FUNCTION public.company_programme_defects(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_event(p_id uuid,p_kind text,p_reason text DEFAULT NULL) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions;
BEGIN
 SELECT * INTO v FROM public.prod_programme_versions WHERE id=p_id;
 INSERT INTO public.prod_programme_approvals(programme_version_id,kind,event_revision,snapshot,recorded_by,reason)
 VALUES(p_id,p_kind,v.revision,jsonb_build_object('programme',v.programme,'capacity',v.capacity,'resources',v.resource_plan,'resourceListVerified',v.resource_list_verified,'revision',v.revision),auth.uid(),p_reason);
END $$;
REVOKE ALL ON FUNCTION public.company_event(uuid,text,text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.company_programme_save(p_case uuid,p_expected uuid,p_programme jsonb,p_capacity jsonb,p_resources jsonb,p_resource_verified boolean,p_receiver uuid,p_trainer uuid,p_source uuid DEFAULT NULL)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.booking_requests; sourcev public.prod_programme_versions; result uuid:=gen_random_uuid(); rev integer; content jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041);
 IF auth.uid() IS NULL OR NOT public.is_editor_or_admin(auth.uid()) THEN RAISE EXCEPTION 'COMPANY_SALES_REQUIRED' USING ERRCODE='42501'; END IF;
 SELECT * INTO b FROM public.booking_requests WHERE id=p_case FOR UPDATE;
 IF b.id IS NULL OR b.mt_personal OR b.owner_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'COMPANY_SALES_REQUIRED' USING ERRCODE='42501'; END IF;
 IF b.company_programme_id IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'COMPANY_STALE_REVISION' USING ERRCODE='40001'; END IF;
 IF p_receiver IS NULL OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_receiver AND role IN ('admin','editor')) OR p_trainer IS NULL OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_trainer AND role IN ('admin','editor','trainer')) THEN RAISE EXCEPTION 'COMPANY_RESPONSIBILITIES_INVALID'; END IF;
 IF EXISTS(SELECT 1 FROM public.prod_deliveries d JOIN public.crm_orders o ON o.id=d.order_id WHERE o.lead_id=p_case AND d.training_model='company' AND d.production_status<>'suunnittelu') THEN RAISE EXCEPTION 'COMPANY_EXECUTION_ALREADY_STARTED'; END IF;
 IF p_source IS NOT NULL THEN sourcev:=public.company_require(p_source,'read'); END IF;
 SELECT coalesce(max(revision),0)+1 INTO rev FROM public.prod_programme_versions WHERE case_lead_id=p_case;
 content:=jsonb_build_object('version',result::text,'customer',coalesce(b.organization,b.name),'year',p_programme->'year','text',CASE WHEN p_source IS NULL THEN p_programme->>'text' ELSE sourcev.programme->>'text' END,'startsAt',p_programme->>'startsAt','endsAt',p_programme->>'endsAt','trainers',p_programme->'trainers');
 IF nullif(content->>'text','') IS NULL OR length(content->>'text')>20000 OR jsonb_typeof(content->'trainers') IS DISTINCT FROM 'array' OR content->>'startsAt' IS NULL OR content->>'endsAt' IS NULL OR content->>'year' IS NULL OR NOT isfinite((content->>'startsAt')::timestamptz) OR NOT isfinite((content->>'endsAt')::timestamptz) OR (content->>'endsAt')::timestamptz <= (content->>'startsAt')::timestamptz THEN RAISE EXCEPTION 'COMPANY_PROGRAMME_INVALID'; END IF;
 IF jsonb_typeof(p_capacity) IS DISTINCT FROM 'object' OR jsonb_typeof(p_resources) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'COMPANY_DATA_INVALID'; END IF;
 INSERT INTO public.prod_programme_versions(id,case_lead_id,source_version_id,revision,sales_owner_id,production_owner_id,responsible_trainer_id,programme,capacity,resource_plan,resource_list_verified,promises,review_findings,created_by)
 VALUES(result,p_case,coalesce(p_source,p_expected),rev,auth.uid(),p_receiver,p_trainer,content,p_capacity||jsonb_build_object('programmeVersion',result::text,'responsibleTrainerId',p_trainer::text,'startsAt',content->>'startsAt','endsAt',content->>'endsAt'),p_resources,p_resource_verified,coalesce(p_programme->>'promises',''),jsonb_build_array('manual_programme_review_required'),auth.uid());
 UPDATE public.booking_requests SET training_model='company',company_programme_id=result WHERE id=p_case;
 UPDATE public.prod_deliveries d SET training_model='company',company_programme_id=result WHERE d.training_model='company' AND d.order_id IN(SELECT id FROM public.crm_orders WHERE lead_id=p_case);
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.company_programme_save(uuid,uuid,jsonb,jsonb,jsonb,boolean,uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_programme_save(uuid,uuid,jsonb,jsonb,jsonb,boolean,uuid,uuid,uuid) TO authenticated;

CREATE FUNCTION public.company_capacity_save(p_id uuid, p_capacity jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; result uuid:=gen_random_uuid(); rev integer; was_approved boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'capacity'); v:=public.company_latest(p_id);
 IF EXISTS(SELECT 1 FROM public.prod_deliveries WHERE company_programme_id=p_id AND production_status<>'suunnittelu') THEN RAISE EXCEPTION 'COMPANY_EXECUTION_ALREADY_STARTED'; END IF;
 IF jsonb_typeof(p_capacity) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'COMPANY_CAPACITY_INVALID'; END IF;
 was_approved:=EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=v.id AND kind='programme');
 rev:=v.revision+1;
 INSERT INTO public.prod_programme_versions(id,case_lead_id,source_version_id,revision,state,sales_owner_id,production_owner_id,responsible_trainer_id,programme,capacity,resource_plan,resource_list_verified,promises,review_findings,created_by)
 VALUES(result,v.case_lead_id,v.id,rev,CASE WHEN was_approved THEN 'approved' ELSE 'draft' END,v.sales_owner_id,v.production_owner_id,v.responsible_trainer_id,v.programme||jsonb_build_object('version',result::text),p_capacity||jsonb_build_object('programmeVersion',result::text,'responsibleTrainerId',v.responsible_trainer_id::text,'startsAt',v.programme->>'startsAt','endsAt',v.programme->>'endsAt'),v.resource_plan,v.resource_list_verified,v.promises,v.review_findings,auth.uid());
 IF was_approved THEN
  PERFORM public.company_event(result,'programme','Ohjelman hyväksyntä säilytetty revisiosta '||v.revision||': vain kapasiteetti muuttui');
 END IF;
 UPDATE public.booking_requests SET company_programme_id=result WHERE id=v.case_lead_id;
 UPDATE public.prod_deliveries SET company_programme_id=result WHERE company_programme_id=p_id;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.company_capacity_save(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_capacity_save(uuid,jsonb) TO authenticated;

CREATE FUNCTION public.company_programme_approve(p_id uuid,p_review_note text) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'sales'); v:=public.company_latest(p_id);
 IF nullif(trim(p_review_note),'') IS NULL THEN RAISE EXCEPTION 'COMPANY_REVIEW_NOTE_REQUIRED'; END IF;
 IF cardinality(public.company_programme_defects(p_id))>0 THEN RAISE EXCEPTION 'COMPANY_PROGRAMME_REVIEW_BLOCKED'; END IF;
 IF EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='programme') THEN RETURN; END IF;
 PERFORM public.company_event(p_id,'programme',p_review_note);
 UPDATE public.prod_programme_versions SET state='approved' WHERE id=p_id;
END $$;
REVOKE ALL ON FUNCTION public.company_programme_approve(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_programme_approve(uuid,text) TO authenticated;

CREATE FUNCTION public.company_capacity_approve(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; errors text[];
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'capacity'); v:=public.company_latest(p_id);
 errors:=public.company_capacity_defects(v.capacity)||public.company_resource_defects(p_id);
 IF cardinality(errors)>0 THEN RAISE EXCEPTION 'COMPANY_CAPACITY_BLOCKED: %',array_to_string(errors,','); END IF;
 IF NOT EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='capacity') THEN PERFORM public.company_event(p_id,'capacity'); END IF;
END $$;
REVOKE ALL ON FUNCTION public.company_capacity_approve(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_capacity_approve(uuid) TO authenticated;

CREATE FUNCTION public.company_attach_order(p_id uuid, p_order uuid, p_template text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; result uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'sales'); v:=public.company_latest(p_id);
 IF NOT EXISTS(SELECT 1 FROM public.crm_orders WHERE id=p_order AND lead_id=v.case_lead_id) THEN RAISE EXCEPTION 'COMPANY_CONFIRMED_ORDER_REQUIRED'; END IF;
 SELECT id INTO result FROM public.prod_deliveries WHERE order_id=p_order FOR UPDATE;
 IF result IS NOT NULL THEN
  IF EXISTS(SELECT 1 FROM public.prod_deliveries WHERE id=result AND training_model='company' AND company_programme_id=p_id) THEN RETURN result; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.prod_deliveries WHERE id=result AND production_status='suunnittelu' AND offering_group IS NULL AND (company_programme_id IS NULL OR company_programme_id=p_id)) THEN
   RAISE EXCEPTION 'COMPANY_LEGACY_DELIVERY_REVIEW_REQUIRED';
  END IF;
 ELSE
  result:=public.prod_create_delivery(p_order,p_template,v.production_owner_id);
  IF EXISTS(SELECT 1 FROM public.prod_deliveries WHERE id=result AND (offering_group IS NOT NULL OR production_status<>'suunnittelu')) THEN RAISE EXCEPTION 'COMPANY_EXISTING_DELIVERY_CONFLICT'; END IF;
 END IF;
 UPDATE public.prod_deliveries SET training_model='company',company_programme_id=p_id WHERE id=result;
 IF NOT EXISTS(SELECT 1 FROM public.prod_sessions WHERE delivery_id=result) THEN
 INSERT INTO public.prod_sessions(delivery_id,seq,title,starts_at,ends_at) VALUES(result,1,'Yrityskoulutus',(v.programme->>'startsAt')::timestamptz,(v.programme->>'endsAt')::timestamptz);
 END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.company_attach_order(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_attach_order(uuid,uuid,text) TO authenticated;

CREATE FUNCTION public.company_ready(p_id uuid,p_require_acceptance boolean DEFAULT true) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; errors text[]; d public.prod_deliveries; approval public.prod_programme_approvals;
BEGIN
 v:=public.company_require(p_id); errors:=public.company_capacity_defects(v.capacity)||public.company_resource_defects(p_id)||public.company_programme_defects(p_id);
 IF NOT EXISTS(SELECT 1 FROM public.booking_requests WHERE id=v.case_lead_id AND company_programme_id=p_id) THEN errors:=array_append(errors,'stale_revision'); END IF;
 IF NOT EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='programme') THEN errors:=array_append(errors,'programme_unapproved'); END IF;
 IF NOT EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='capacity') THEN errors:=array_append(errors,'capacity_unapproved'); END IF;
 FOR approval IN SELECT * FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind IN ('programme','capacity') LOOP
  IF approval.snapshot->'programme' IS DISTINCT FROM v.programme OR approval.snapshot->'capacity' IS DISTINCT FROM v.capacity OR approval.snapshot->'resources' IS DISTINCT FROM v.resource_plan THEN errors:=array_append(errors,'approval_snapshot_mismatch'); END IF;
 END LOOP;
 IF (SELECT count(*) FROM public.prod_deliveries WHERE company_programme_id=p_id)>1 THEN errors:=array_append(errors,'multiple_delivery_review_required'); END IF;
 SELECT * INTO d FROM public.prod_deliveries WHERE company_programme_id=p_id ORDER BY id LIMIT 1;
 IF d.id IS NULL OR d.order_id IS NULL THEN errors:=array_append(errors,'confirmed_order_delivery_missing');
 ELSE
  IF EXISTS(SELECT 1 FROM public.prod_tasks WHERE delivery_id=d.id AND blocks_start AND completed_at IS NULL) THEN errors:=array_append(errors,'preparation_tasks_open'); END IF;
  IF EXISTS(SELECT 1 FROM public.prod_blockers WHERE delivery_id=d.id AND resolved_at IS NULL) THEN errors:=array_append(errors,'blockers_open'); END IF;
  IF NOT EXISTS(SELECT 1 FROM public.prod_sessions WHERE delivery_id=d.id AND starts_at=(v.programme->>'startsAt')::timestamptz AND ends_at=(v.programme->>'endsAt')::timestamptz) THEN errors:=array_append(errors,'programme_session_mismatch'); END IF;
  IF p_require_acceptance AND NOT EXISTS(SELECT 1 FROM public.crm_production_handoffs WHERE order_id=d.order_id AND company_programme_id=p_id AND company_state='accepted' AND cancelled_at IS NULL) THEN errors:=array_append(errors,'handoff_not_accepted'); END IF;
 END IF;
 RETURN jsonb_build_object('ready',cardinality(errors)=0,'missing',to_jsonb(errors),'programmeId',p_id,'revision',v.revision);
END $$;
REVOKE ALL ON FUNCTION public.company_ready(uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_ready(uuid,boolean) TO authenticated;

CREATE FUNCTION public.company_handoff_submit(p_id uuid, p_order uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; h public.crm_production_handoffs;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'sales'); v:=public.company_latest(p_id);
 IF NOT EXISTS(SELECT 1 FROM public.prod_deliveries WHERE company_programme_id=p_id AND order_id=p_order) THEN RAISE EXCEPTION 'COMPANY_ORDER_LINK_REQUIRED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='programme') OR NOT EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='capacity') OR cardinality(public.company_capacity_defects(v.capacity)||public.company_resource_defects(p_id))>0 THEN RAISE EXCEPTION 'COMPANY_HANDOFF_APPROVAL_REQUIRED'; END IF;
 SELECT * INTO h FROM public.crm_production_handoffs WHERE order_id=p_order FOR UPDATE;
 IF h.id IS NOT NULL AND (h.mt_state IS NOT NULL OR h.cancelled_at IS NOT NULL OR (h.company_programme_id IS NULL AND EXISTS(SELECT 1 FROM public.prod_deliveries WHERE order_id=p_order AND (production_status<>'suunnittelu' OR company_programme_id IS DISTINCT FROM p_id)))) THEN RAISE EXCEPTION 'COMPANY_LEGACY_HANDOFF_REVIEW_REQUIRED'; END IF;
 IF h.company_programme_id=p_id AND h.company_state IN ('submitted','accepted') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.prod_programme_approvals WHERE programme_version_id=p_id AND kind='returned') THEN RAISE EXCEPTION 'COMPANY_RETURN_REQUIRES_NEW_REVISION'; END IF;
 INSERT INTO public.crm_production_handoffs(order_id,production_owner_id,handed_by,company_programme_id,company_state,company_revision,note)
 VALUES(p_order,v.production_owner_id,auth.uid(),p_id,'submitted',v.revision,v.promises)
 ON CONFLICT(order_id) DO UPDATE SET production_owner_id=EXCLUDED.production_owner_id,handed_by=EXCLUDED.handed_by,handed_at=clock_timestamp(),company_programme_id=p_id,company_state='submitted',company_revision=v.revision,company_response_by=NULL,company_response_at=NULL,company_return_reason=NULL,note=EXCLUDED.note;
 PERFORM public.company_event(p_id,'submitted');
END $$;
REVOKE ALL ON FUNCTION public.company_handoff_submit(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_handoff_submit(uuid,uuid) TO authenticated;

CREATE FUNCTION public.company_handoff_respond(p_id uuid,p_order uuid,p_accept boolean,p_reason text DEFAULT NULL) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions; h public.crm_production_handoffs; kind text;
BEGIN
 PERFORM pg_advisory_xact_lock(7311041); v:=public.company_require(p_id,'production'); v:=public.company_latest(p_id);
 IF p_accept IS NULL THEN RAISE EXCEPTION 'COMPANY_RESPONSE_REQUIRED'; END IF;
 SELECT * INTO h FROM public.crm_production_handoffs WHERE order_id=p_order FOR UPDATE;
 IF h.id IS NULL OR h.company_programme_id IS DISTINCT FROM p_id OR h.company_revision<>v.revision OR h.production_owner_id IS DISTINCT FROM auth.uid() OR h.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'COMPANY_STALE_HANDOFF' USING ERRCODE='40001'; END IF;
 kind:=CASE WHEN p_accept THEN 'accepted' ELSE 'returned' END;
 IF h.company_state=kind THEN RETURN; END IF;
 IF h.company_state<>'submitted' THEN RAISE EXCEPTION 'COMPANY_HANDOFF_ALREADY_DECIDED'; END IF;
 IF NOT p_accept AND nullif(trim(p_reason),'') IS NULL THEN RAISE EXCEPTION 'COMPANY_RETURN_REASON_REQUIRED'; END IF;
 IF p_accept AND cardinality(public.company_capacity_defects(v.capacity)||public.company_resource_defects(p_id))>0 THEN RAISE EXCEPTION 'COMPANY_CAPACITY_CHANGED'; END IF;
 UPDATE public.crm_production_handoffs SET company_state=kind,company_response_by=auth.uid(),company_response_at=clock_timestamp(),company_return_reason=CASE WHEN p_accept THEN NULL ELSE p_reason END WHERE id=h.id;
 PERFORM public.company_event(p_id,kind,CASE WHEN p_accept THEN NULL ELSE p_reason END);
END $$;
REVOKE ALL ON FUNCTION public.company_handoff_respond(uuid,uuid,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_handoff_respond(uuid,uuid,boolean,text) TO authenticated;

CREATE FUNCTION public.company_execution_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NEW.training_model='company' AND NEW.production_status='käynnissä' THEN
  PERFORM pg_advisory_xact_lock(7311041);
  IF NEW.company_programme_id IS NULL THEN RAISE EXCEPTION 'COMPANY_PROGRAMME_REQUIRED'; END IF;
  result:=public.company_ready(NEW.company_programme_id,true);
  IF result->>'ready' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'COMPANY_START_BLOCKED: %',result->'missing'; END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.company_execution_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER company_execution_ready BEFORE INSERT OR UPDATE ON public.prod_deliveries FOR EACH ROW EXECUTE FUNCTION public.company_execution_guard();

CREATE FUNCTION public.company_programme_read(p_id uuid) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.prod_programme_versions;
BEGIN
 v:=public.company_require(p_id);
 IF public.is_editor_or_admin(auth.uid()) THEN RETURN to_jsonb(v)||jsonb_build_object('readiness',public.company_ready(p_id,true)); END IF;
 RETURN jsonb_build_object('id',v.id,'revision',v.revision,'programme',v.programme-'customer','capacity',v.capacity,'resources',v.resource_plan,'readiness',public.company_ready(p_id,true));
END $$;
REVOKE ALL ON FUNCTION public.company_programme_read(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.company_programme_read(uuid) TO authenticated;

CREATE FUNCTION public.company_my_trainer_programmes()
 RETURNS TABLE(id uuid, revision integer, state text, starts_at timestamptz, ends_at timestamptz, capacity_approved boolean)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT v.id, v.revision, v.state, (v.programme->>'startsAt')::timestamptz, (v.programme->>'endsAt')::timestamptz,
  EXISTS(SELECT 1 FROM public.prod_programme_approvals a WHERE a.programme_version_id=v.id AND a.kind='capacity')
 FROM public.prod_programme_versions v
 JOIN public.booking_requests b ON b.company_programme_id=v.id
 WHERE auth.uid() IS NOT NULL AND v.responsible_trainer_id=auth.uid()
  AND coalesce(b.mt_personal,false)=false
  AND (public.has_role(auth.uid(),'trainer') OR public.is_editor_or_admin(auth.uid()))
 ORDER BY (v.programme->>'startsAt')::timestamptz NULLS LAST, v.id;
$$;
REVOKE ALL ON FUNCTION public.company_my_trainer_programmes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.company_my_trainer_programmes() TO authenticated;

CREATE FUNCTION public.company_reservation_lock() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN PERFORM pg_advisory_xact_lock(7311041); RETURN NULL; END $$;
REVOKE ALL ON FUNCTION public.company_reservation_lock() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER company_lock_deliveries BEFORE INSERT OR UPDATE OR DELETE ON public.prod_deliveries FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_sessions BEFORE INSERT OR UPDATE OR DELETE ON public.prod_sessions FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_resources BEFORE INSERT OR UPDATE OR DELETE ON public.prod_resource_bookings FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_assignments BEFORE INSERT OR UPDATE OR DELETE ON public.exp_assignments FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_trainer_bookings BEFORE INSERT OR UPDATE OR DELETE ON public.prod_trainer_bookings FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_handoffs BEFORE INSERT OR UPDATE OR DELETE ON public.crm_production_handoffs FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_tasks BEFORE INSERT OR UPDATE OR DELETE ON public.prod_tasks FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
CREATE TRIGGER company_lock_blockers BEFORE INSERT OR UPDATE OR DELETE ON public.prod_blockers FOR EACH STATEMENT EXECUTE FUNCTION public.company_reservation_lock();
COMMENT ON TABLE public.prod_programme_versions IS 'Versioned company programme support on existing cases; every content edit INSERTs a new version.';