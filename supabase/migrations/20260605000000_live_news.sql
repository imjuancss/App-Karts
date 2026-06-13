-- Migration: Motorsport Live News Table, RLS Policies, and Upsert RPC Function
-- Path: supabase/migrations/20260605000000_live_news.sql

-- 1. Crear tabla de noticias de motorsport
CREATE TABLE IF NOT EXISTS public.motorsport_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT UNIQUE NOT NULL,
    description TEXT,
    pub_date TIMESTAMPTZ NOT NULL,
    source TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.motorsport_news ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para permitir la lectura pública de las noticias
DROP POLICY IF EXISTS "Allow public read access to news" ON public.motorsport_news;
CREATE POLICY "Allow public read access to news" 
ON public.motorsport_news FOR SELECT 
USING (true);

-- 4. Crear política para permitir inserciones solo al rol de servicio o administrador
-- Nota: Como usaremos una función RPC con SECURITY DEFINER, la función se ejecutará con privilegios de postgres
-- saltándose las políticas de RLS para inserciones, lo cual es más seguro. Pero creamos políticas explícitas por si acaso.
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.motorsport_news;
CREATE POLICY "Allow authenticated inserts" 
ON public.motorsport_news FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated updates" ON public.motorsport_news;
CREATE POLICY "Allow authenticated updates" 
ON public.motorsport_news FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 5. Crear función RPC con SECURITY DEFINER para permitir upsert de noticias de forma segura
CREATE OR REPLACE FUNCTION public.upsert_motorsport_news(news_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios del creador (postgres/admin)
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

-- 6. Comentarios e instrucciones para pg_cron (opcional para el servidor backend de Supabase)
-- Si el usuario tiene pg_cron y pg_net habilitados en Supabase, puede ejecutar la siguiente query para 
-- automatizar la actualización cada hora desde la propia base de datos:
-- 
-- SELECT cron.schedule(
--   'fetch-motorsport-news-hourly',
--   '0 * * * *', -- Cada hora
--   $$
--     SELECT net.http_get(
--       'https://api.rss2json.com/v1/api.json?rss_url=https://www.motorsport.com/rss/f1/news/'
--     );
--   $$
-- );
