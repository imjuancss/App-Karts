-- Fix: Prevent Privilege Escalation via preferred_username metadata
-- Removes the vulnerable OR v_username = 'iamjuancss' condition.

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

  -- Security Fix: Only check the verified email for admin role, not the user-controlled username
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

  IF v_role = 'admin' THEN
    UPDATE public.tracks
    SET creator_id = new.id
    WHERE creator_id IS NULL;
  END IF;

  RETURN new;
END;
$$;
