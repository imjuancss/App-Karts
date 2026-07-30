-- Fix: Add admin authorization check to upsert_motorsport_news RPC
-- Prevents standard users from injecting arbitrary news items.

CREATE OR REPLACE FUNCTION public.upsert_motorsport_news(news_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item JSONB;
BEGIN
    -- Authorization Check: Ensure the caller is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can upsert news.';
    END IF;

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
