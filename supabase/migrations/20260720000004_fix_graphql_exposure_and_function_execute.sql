-- Fix: Hide public tables from GraphQL introspection and restrict SECURITY DEFINER function execution.
-- Covers lint rules: 0026, 0027, 0028, 0029

-- =============================================
-- 1. Ocultar tablas del GraphQL schema
--    PostgREST (Supabase JS client) sigue funcionando.
--    Solo se desactiva la introspección GraphQL.
-- =============================================

COMMENT ON TABLE public.tracks IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.profiles IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.championships IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.championship_rounds IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.championship_round_times IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.championship_participants IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.championship_invitations IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.motorsport_news IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.track_reviews IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.lap_times IS E'@graphql({"omit": true})';
COMMENT ON TABLE public.comments IS E'@graphql({"omit": true})';

-- =============================================
-- 2. Revocar EXECUTE de funciones SECURITY DEFINER
--    que son trigger functions (no deben ser llamables vía RPC).
-- =============================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_track_rating_avg() FROM anon, authenticated;

-- upsert_motorsport_news: solo authenticated debe poder llamarla (la usa el frontend)
-- anon no debe tener acceso
REVOKE EXECUTE ON FUNCTION public.upsert_motorsport_news(JSONB) FROM anon;
