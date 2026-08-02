-- Migration: Add Proof Image and Verification Status to Lap Times
-- Path: supabase/migrations/20260802000000_lap_times_proof_and_verification.sql

-- 1. Modificar tabla lap_times
ALTER TABLE lap_times ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
ALTER TABLE lap_times ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified'));

-- Update existing rows if any
UPDATE lap_times SET verification_status = 'pending' WHERE verification_status IS NULL;

-- 2. Crear bucket de almacenamiento para comprobantes de vueltas si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('lap-proofs', 'lap-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para el bucket lap-proofs
DROP POLICY IF EXISTS "Public lap proof access" ON storage.objects;
CREATE POLICY "Public lap proof access" ON storage.objects
  FOR SELECT USING (bucket_id = 'lap-proofs');

DROP POLICY IF EXISTS "Authenticated lap proof upload" ON storage.objects;
CREATE POLICY "Authenticated lap proof upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lap-proofs' 
    AND auth.role() = 'authenticated'
  );
