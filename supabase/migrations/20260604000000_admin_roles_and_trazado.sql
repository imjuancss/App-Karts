-- Migration: User Roles, Track Layout Image (Trazado), and Admin/Creator Permissions
-- Path: supabase/migrations/20260604000000_admin_roles_and_trazado.sql

-- 1. Agregar columna role a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Agregar columna trazado a la tabla tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS trazado TEXT;

-- 3. Modificar la función handle_new_user() para asignar el rol admin y reclamar pistas sin dueño
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username TEXT;
  v_role TEXT;
BEGIN
  -- Determinar username base
  v_username := COALESCE(
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  );
  
  -- Asegurar unicidad de username agregando parte del UUID si ya existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || substring(new.id::text from 1 for 4);
  END IF;

  -- El rol por defecto es usuario normal
  v_role := 'user';

  INSERT INTO public.profiles (id, full_name, avatar_url, username, role, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Piloto Nuevo'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    v_username,
    v_role,
    now()
  );

  -- Si el rol asignado es administrador, reclamamos las pistas sembradas/iniciales sin creador
  IF v_role = 'admin' THEN
    UPDATE public.tracks
    SET creator_id = new.id
    WHERE creator_id IS NULL;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Asignar las pistas actuales sin creador al administrador si ya se encuentra registrado
UPDATE public.tracks
SET creator_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE creator_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin');

-- 6. Actualizar las políticas de RLS para permitir la edición de cualquier pista al administrador
DROP POLICY IF EXISTS "Creators can update tracks." ON public.tracks;
CREATE POLICY "Creators or admins can update tracks." ON public.tracks FOR UPDATE
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);
