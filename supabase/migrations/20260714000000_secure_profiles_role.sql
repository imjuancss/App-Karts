-- Migration: Prevent Privilege Escalation on Profiles
-- Path: supabase/migrations/20260714000000_secure_profiles_role.sql

-- 1. Modify the handle_new_user() trigger to securely check only the verified email for admin role assignment
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

  -- Determinar rol de administrador SÓLO en base al email verificado de la solicitud
  IF new.email = 'iamjuancss@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'user';
  END IF;

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

-- 2. Create a function to prevent users from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role or superuser modifications directly
  IF current_setting('request.jwt.claims', true) IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check if the role is being modified
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if the user making the request is already an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      -- If not an admin, revert the role to its previous value (prevent escalation)
      NEW.role = OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS secure_profiles_role_update ON public.profiles;
CREATE TRIGGER secure_profiles_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();
