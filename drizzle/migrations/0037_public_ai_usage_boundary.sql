CREATE TABLE public.public_ai_usage (
 bucket_key text NOT NULL, window_start timestamptz NOT NULL, request_count integer NOT NULL DEFAULT 0 CHECK(request_count>=0), PRIMARY KEY(bucket_key,window_start)
);
GRANT ALL ON public.public_ai_usage TO service_role;
ALTER TABLE public.public_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.public_ai_consume(p_scope text,p_visitor text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE w timestamptz:=date_trunc('hour',now()); v integer; g integer;
BEGIN
 IF p_scope IS NULL OR p_scope NOT IN ('growth-checkup','smart-search','veli-coach-chat','chat') OR p_visitor IS NULL OR p_visitor !~ '^[a-f0-9]{32}$' THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(7311042);
 DELETE FROM public.public_ai_usage WHERE window_start<now()-interval '2 hours';
 SELECT request_count INTO v FROM public.public_ai_usage WHERE bucket_key='v:'||p_visitor AND window_start=w;
 SELECT request_count INTO g FROM public.public_ai_usage WHERE bucket_key='global' AND window_start=w;
 IF coalesce(v,0)>=10 OR coalesce(g,0)>=400 THEN RETURN false; END IF;
 INSERT INTO public.public_ai_usage AS u(bucket_key,window_start,request_count) VALUES('global',w,1) ON CONFLICT(bucket_key,window_start) DO UPDATE SET request_count=u.request_count+1;
 INSERT INTO public.public_ai_usage AS u(bucket_key,window_start,request_count) VALUES('v:'||p_visitor,w,1) ON CONFLICT(bucket_key,window_start) DO UPDATE SET request_count=u.request_count+1;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.public_ai_consume(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.public_ai_consume(text,text) TO service_role;