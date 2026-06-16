-- Circuit type for tracks + storage bucket for cover images

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS circuit_type TEXT NOT NULL DEFAULT 'kart'
  CHECK (circuit_type IN ('kart', 'autodromo'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('track-covers', 'track-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Track covers are publicly accessible" ON storage.objects;
CREATE POLICY "Track covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'track-covers');

DROP POLICY IF EXISTS "Authenticated users can upload track covers" ON storage.objects;
CREATE POLICY "Authenticated users can upload track covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'track-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own track covers" ON storage.objects;
CREATE POLICY "Users can update own track covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'track-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own track covers" ON storage.objects;
CREATE POLICY "Users can delete own track covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'track-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
