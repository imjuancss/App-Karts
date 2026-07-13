-- Migration: Add Delete Policy and Restrict Update Policy to Admin
-- Path: supabase/migrations/20260713000000_track_admin_policies.sql

-- 1. Eliminar políticas previas de UPDATE y DELETE
DROP POLICY IF EXISTS "Creators or admins can update tracks." ON public.tracks;
DROP POLICY IF EXISTS "Creators can update tracks." ON public.tracks;
DROP POLICY IF EXISTS "Creators or admins can delete tracks." ON public.tracks;

-- 2. Crear nueva política para UPDATE: Solo administradores
CREATE POLICY "Only admins can update tracks." ON public.tracks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

-- 3. Crear nueva política para DELETE: Solo administradores
CREATE POLICY "Only admins can delete tracks." ON public.tracks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);
