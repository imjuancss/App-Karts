-- Migration: Fix profile insert policy and robustify handle_new_user trigger
-- Path: supabase/migrations/20260603000000_fix_profile_insert_and_trigger.sql

-- 1. Agregar política RLS para permitir que el usuario inserte su propio perfil en caso de contingencia desde el frontend.
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Modificar la función disparadora para evitar errores de restricción UNIQUE en la columna username.
-- Ahora añade los primeros 4 caracteres del id del usuario al final del prefijo del correo para garantizar unicidad.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Piloto Nuevo'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    COALESCE(
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1) || '_' || substring(new.id::text from 1 for 4)
    ),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
