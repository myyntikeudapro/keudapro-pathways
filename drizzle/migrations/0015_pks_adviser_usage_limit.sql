CREATE TABLE public.pks_adviser_usage (
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
GRANT ALL ON public.pks_adviser_usage TO service_role;
ALTER TABLE public.pks_adviser_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.pks_adviser_consume(_visitor text, _visitor_limit integer, _global_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w timestamptz := date_trunc('hour', now());
  v integer;
  g integer;
BEGIN
  DELETE FROM public.pks_adviser_usage WHERE window_start < now() - interval '2 hours';
  INSERT INTO public.pks_adviser_usage AS u (bucket_key, window_start, request_count)
  VALUES ('global', w, 1)
  ON CONFLICT (bucket_key, window_start) DO UPDATE SET request_count = u.request_count + 1
  RETURNING request_count INTO g;
  INSERT INTO public.pks_adviser_usage AS u (bucket_key, window_start, request_count)
  VALUES ('v:' || _visitor, w, 1)
  ON CONFLICT (bucket_key, window_start) DO UPDATE SET request_count = u.request_count + 1
  RETURNING request_count INTO v;
  RETURN v <= _visitor_limit AND g <= _global_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.pks_adviser_consume(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pks_adviser_consume(text, integer, integer) TO service_role;