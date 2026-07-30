-- Fix: Remove hardcoded admin assignment and protect role column on INSERT

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_role TEXT;
BEGIN
  v_username := COALESCE(
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  );

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || substring(new.id::text from 1 for 4);
  END IF;

  -- Default role is user. Admin assignment must be done securely out of band.
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

  RETURN new;
END;
$$;

-- Protect against role escalation on INSERT as well
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role or superuser modifications directly
  IF current_setting('request.jwt.claims', true) IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Handle INSERT: Default to 'user' unless created by an existing admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        NEW.role = 'user';
      END IF;
    END IF;
  END IF;

  -- Handle UPDATE: Prevent non-admins from changing role
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        NEW.role = OLD.role;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger covers both INSERT and UPDATE
DROP TRIGGER IF EXISTS secure_profiles_role_update ON public.profiles;
CREATE TRIGGER secure_profiles_role_update
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();
