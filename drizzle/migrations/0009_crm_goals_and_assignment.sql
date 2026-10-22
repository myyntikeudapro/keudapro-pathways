CREATE TABLE public.crm_sales_goals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), service_key text NOT NULL CHECK(service_key IN ('muutosturva','aly','kasvu','hub','osaaminen','muu','noste','operaattori','kumppanit','verkosto')),
 month date NOT NULL CHECK(extract(day FROM month)=1), revenue_target numeric(12,2) NOT NULL CHECK(revenue_target>=0), wins_target integer NOT NULL CHECK(wins_target>=0), leads_target integer NOT NULL CHECK(leads_target>=0), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(service_key,month)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.crm_sales_goals TO authenticated;
GRANT ALL ON public.crm_sales_goals TO service_role;
ALTER TABLE public.crm_sales_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team reads goals" ON public.crm_sales_goals FOR SELECT TO authenticated USING(public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Admins manage goals" ON public.crm_sales_goals FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.crm_assignment_rules (
 service_key text PRIMARY KEY CHECK(service_key IN ('all','muutosturva','aly','kasvu','hub','osaaminen','muu','noste','operaattori','kumppanit','verkosto')), enabled boolean NOT NULL DEFAULT false, member_ids uuid[] NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now(), CHECK(cardinality(member_ids)<=100), CHECK(NOT enabled OR cardinality(member_ids)>0)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.crm_assignment_rules TO authenticated;
GRANT ALL ON public.crm_assignment_rules TO service_role;
ALTER TABLE public.crm_assignment_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team reads assignment rules" ON public.crm_assignment_rules FOR SELECT TO authenticated USING(public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Admins manage assignment rules" ON public.crm_assignment_rules FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.crm_assignment_cursors(service_key text PRIMARY KEY REFERENCES public.crm_assignment_rules(service_key) ON DELETE CASCADE, next_index bigint NOT NULL DEFAULT 0);
GRANT ALL ON public.crm_assignment_cursors TO service_role;
ALTER TABLE public.crm_assignment_cursors ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.validate_assignment_rule() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE member uuid; BEGIN
 IF array_position(NEW.member_ids,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Virheellinen vastuuhenkilö'; END IF;
 IF cardinality(NEW.member_ids)<>(SELECT count(DISTINCT x) FROM unnest(NEW.member_ids) x) THEN RAISE EXCEPTION 'Vastuuhenkilö saa esiintyä vain kerran'; END IF;
 FOREACH member IN ARRAY NEW.member_ids LOOP IF NOT public.is_editor_or_admin(member) THEN RAISE EXCEPTION 'Vastuuhenkilöllä on oltava myynnin käyttöoikeus'; END IF; END LOOP;
 NEW.updated_at=now(); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.validate_assignment_rule() FROM PUBLIC;
CREATE TRIGGER validate_assignment_rule BEFORE INSERT OR UPDATE ON public.crm_assignment_rules FOR EACH ROW EXECUTE FUNCTION public.validate_assignment_rule();
CREATE FUNCTION public.assign_new_booking() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE rule public.crm_assignment_rules; eligible uuid[]; position bigint; BEGIN
 IF NEW.owner_id IS NOT NULL THEN RETURN NEW; END IF;
 SELECT * INTO rule FROM public.crm_assignment_rules WHERE service_key=coalesce(NEW.service_key,'muu') FOR UPDATE;
 IF NOT FOUND THEN SELECT * INTO rule FROM public.crm_assignment_rules WHERE service_key='all' FOR UPDATE; END IF;
 IF rule.service_key IS NULL OR NOT rule.enabled THEN RETURN NEW; END IF;
 SELECT array_agg(m.id ORDER BY m.ord) INTO eligible FROM unnest(rule.member_ids) WITH ORDINALITY m(id,ord) WHERE public.is_editor_or_admin(m.id);
 IF coalesce(cardinality(eligible),0)=0 THEN RETURN NEW; END IF;
 INSERT INTO public.crm_assignment_cursors(service_key,next_index) VALUES(rule.service_key,1) ON CONFLICT(service_key) DO UPDATE SET next_index=public.crm_assignment_cursors.next_index+1 RETURNING next_index-1 INTO position;
 NEW.owner_id=eligible[(position % cardinality(eligible))::integer+1]; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.assign_new_booking() FROM PUBLIC;
CREATE TRIGGER assign_booking_owner BEFORE INSERT ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.assign_new_booking();