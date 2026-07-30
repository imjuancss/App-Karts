-- Fix: Pin search_path on all functions to satisfy lint rule 0011_function_search_path_mutable

-- 1. upsert_motorsport_news
CREATE OR REPLACE FUNCTION public.upsert_motorsport_news(news_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(news_items) LOOP
        INSERT INTO public.motorsport_news (
            title,
            link,
            description,
            pub_date,
            source,
            image_url,
            category
        ) VALUES (
            COALESCE(item->>'title', 'Sin título'),
            (item->>'link'),
            (item->>'description'),
            (item->>'pub_date')::TIMESTAMPTZ,
            COALESCE(item->>'source', 'Desconocido'),
            (item->>'image_url'),
            COALESCE(item->>'category', 'General')
        )
        ON CONFLICT (link) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            pub_date = EXCLUDED.pub_date,
            source = EXCLUDED.source,
            image_url = EXCLUDED.image_url,
            category = EXCLUDED.category;
    END LOOP;
END;
$$;

-- 2. handle_new_user
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

  IF new.email = 'iamjuancss@gmail.com' OR v_username = 'iamjuancss' THEN
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

-- 3. update_track_rating_avg
CREATE OR REPLACE FUNCTION public.update_track_rating_avg()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE tracks
    SET rating_avg = (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM track_reviews
      WHERE track_id = NEW.track_id
    )
    WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks
    SET rating_avg = (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM track_reviews
      WHERE track_id = OLD.track_id
    )
    WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$;
