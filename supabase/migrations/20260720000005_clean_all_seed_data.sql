-- Clean all seed/example data, preserving the admin user (iamjuancss@gmail.com)
-- Order matters due to foreign key constraints

-- Disable triggers temporarily to avoid side effects during cleanup
SET session_replication_role = 'replica';

TRUNCATE TABLE public.championship_round_times CASCADE;
TRUNCATE TABLE public.championship_participants CASCADE;
TRUNCATE TABLE public.championship_invitations CASCADE;
TRUNCATE TABLE public.championship_rounds CASCADE;
TRUNCATE TABLE public.championships CASCADE;
TRUNCATE TABLE public.track_reviews CASCADE;
TRUNCATE TABLE public.lap_times CASCADE;
TRUNCATE TABLE public.motorsport_news CASCADE;
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.tracks CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Clean profiles except admin
DELETE FROM public.profiles WHERE id != 'fa86e74a-ba6f-4346-871a-6618148bd593';

-- Clean auth users except admin
DELETE FROM auth.users WHERE id != 'fa86e74a-ba6f-4346-871a-6618148bd593';
