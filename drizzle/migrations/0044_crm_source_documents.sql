CREATE TABLE public.crm_source_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES public.crm_offers(id) ON DELETE SET NULL,
  import_op_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pdf','email')),
  original_name text CHECK (original_name IS NULL OR length(original_name) BETWEEN 1 AND 255),
  text_content text NOT NULL CHECK (length(trim(text_content)) BETWEEN 1 AND 60000),
  storage_path text UNIQUE,
  file_size integer CHECK (file_size IS NULL OR file_size BETWEEN 1 AND 10485760),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (import_op_key, kind),
  CHECK (kind = 'pdf' OR (storage_path IS NULL AND file_size IS NULL)),
  CHECK (kind <> 'pdf' OR original_name IS NOT NULL)
);
CREATE INDEX crm_source_documents_lead_idx ON public.crm_source_documents(lead_id, created_at);
CREATE INDEX crm_source_documents_offer_idx ON public.crm_source_documents(offer_id);
GRANT SELECT ON public.crm_source_documents TO authenticated;
GRANT ALL ON public.crm_source_documents TO service_role;
ALTER TABLE public.crm_source_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read source documents" ON public.crm_source_documents FOR SELECT TO authenticated
  USING ((SELECT public.is_editor_or_admin((SELECT auth.uid()))));

CREATE POLICY "Staff read crm source files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'crm-source-files' AND (SELECT public.is_editor_or_admin((SELECT auth.uid()))));
CREATE POLICY "Staff upload crm source files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crm-source-files' AND (SELECT public.is_editor_or_admin((SELECT auth.uid())))
    AND name ~ '^[A-Za-z0-9-]{8,100}/[A-Za-z0-9-]+\.pdf$');
CREATE POLICY "Staff remove unlinked crm source files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'crm-source-files' AND (SELECT public.is_editor_or_admin((SELECT auth.uid())))
    AND NOT EXISTS (SELECT 1 FROM public.crm_source_documents d WHERE d.storage_path = storage.objects.name));

CREATE OR REPLACE FUNCTION public.crm_import_offer_with_sources(p jsonb, p_op_key text, p_sources jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid(); res jsonb; s jsonb; kinds text[] := '{}'; k text; path text; nm text; txt text; sz int;
  existing int; want text; have text;
BEGIN
  IF me IS NULL OR NOT public.is_editor_or_admin(me) THEN RAISE EXCEPTION 'Ei käyttöoikeutta' USING ERRCODE='42501'; END IF;
  IF p_sources IS NULL OR jsonb_typeof(p_sources) <> 'array' OR jsonb_array_length(p_sources) NOT BETWEEN 1 AND 2 THEN RAISE EXCEPTION 'SOURCES_INVALID'; END IF;
  FOR s IN SELECT value FROM jsonb_array_elements(p_sources) LOOP
    k := s->>'kind'; txt := s->>'text'; nm := nullif(trim(coalesce(s->>'name','')),''); path := nullif(s->>'storage_path','');
    IF k NOT IN ('pdf','email') OR k = ANY(kinds) THEN RAISE EXCEPTION 'SOURCES_INVALID'; END IF;
    kinds := kinds || k;
    IF coalesce(length(trim(txt)),0) NOT BETWEEN 1 AND 60000 THEN RAISE EXCEPTION 'SOURCES_INVALID'; END IF;
    IF k = 'pdf' AND nm IS NULL THEN RAISE EXCEPTION 'SOURCES_INVALID'; END IF;
    IF k = 'email' AND path IS NOT NULL THEN RAISE EXCEPTION 'SOURCES_INVALID'; END IF;
    IF path IS NOT NULL THEN
      IF path !~ ('^' || p_op_key || '/[A-Za-z0-9-]+\.pdf$') THEN RAISE EXCEPTION 'SOURCE_FILE_INVALID'; END IF;
      IF NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'crm-source-files' AND o.name = path) THEN RAISE EXCEPTION 'SOURCE_FILE_MISSING'; END IF;
    END IF;
  END LOOP;

  -- Locks the op key and replays identical imports; raises OP_KEY_REUSED on changed payloads.
  res := public.crm_import_offer(p, p_op_key);

  SELECT count(*) INTO existing FROM public.crm_source_documents WHERE import_op_key = p_op_key;
  IF existing > 0 THEN
    SELECT string_agg(x->>'kind' || ':' || md5(x->>'text'), ',' ORDER BY x->>'kind') INTO want FROM jsonb_array_elements(p_sources) x;
    SELECT string_agg(kind || ':' || md5(text_content), ',' ORDER BY kind) INTO have FROM public.crm_source_documents WHERE import_op_key = p_op_key;
    IF want IS DISTINCT FROM have THEN RAISE EXCEPTION 'OP_KEY_REUSED' USING ERRCODE='23505'; END IF;
    RETURN res || jsonb_build_object('sources_saved', existing, 'replayed', true);
  END IF;

  FOR s IN SELECT value FROM jsonb_array_elements(p_sources) LOOP
    sz := NULL; path := nullif(s->>'storage_path','');
    IF path IS NOT NULL THEN
      SELECT nullif((o.metadata->>'size'),'')::int INTO sz FROM storage.objects o WHERE o.bucket_id='crm-source-files' AND o.name=path;
    END IF;
    INSERT INTO public.crm_source_documents(lead_id, offer_id, import_op_key, kind, original_name, text_content, storage_path, file_size, created_by)
    VALUES ((res->>'lead_id')::uuid, (res->>'offer_id')::uuid, p_op_key, s->>'kind',
      CASE WHEN s->>'kind'='pdf' THEN left(trim(s->>'name'),255) ELSE nullif(left(trim(coalesce(s->>'name','')),255),'') END,
      s->>'text', path, sz, me);
  END LOOP;
  RETURN res || jsonb_build_object('sources_saved', jsonb_array_length(p_sources));
END $$;
REVOKE ALL ON FUNCTION public.crm_import_offer_with_sources(jsonb,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_import_offer_with_sources(jsonb,text,jsonb) TO authenticated;