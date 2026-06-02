-- Migration: Add Tournaments and Lap Times
-- Path: supabase/migrations/20260602000000_tournaments_and_lap_times.sql

-- ==========================================
-- 1. MODIFICACIÓN DE CHAMPIONSHIPS
-- ==========================================
ALTER TABLE championships ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE championships ADD COLUMN IF NOT EXISTS prize_label TEXT;

-- ==========================================
-- 2. TABLA LAP_TIMES (Tiempos generales)
-- ==========================================
CREATE TABLE IF NOT EXISTS lap_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lap_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. TABLA CHAMPIONSHIP_ROUNDS (Fechas/Rondas)
-- ==========================================
CREATE TABLE IF NOT EXISTS championship_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. TABLA CHAMPIONSHIP_ROUND_TIMES (Tiempos por Ronda)
-- ==========================================
CREATE TABLE IF NOT EXISTS championship_round_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES championship_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lap_time_ms INTEGER NOT NULL,
  evidence_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (round_id, user_id)
);

-- ==========================================
-- 5. TABLA CHAMPIONSHIP_INVITATIONS (Invitaciones)
-- ==========================================
CREATE TABLE IF NOT EXISTS championship_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (championship_id, email)
);

-- ==========================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE lap_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_round_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_invitations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. POLÍTICAS DE RLS
-- ==========================================

-- Lap Times
DROP POLICY IF EXISTS "Lap times are viewable by everyone" ON lap_times;
CREATE POLICY "Lap times are viewable by everyone" ON lap_times FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own lap times" ON lap_times;
CREATE POLICY "Users can insert their own lap times" ON lap_times FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lap times" ON lap_times;
CREATE POLICY "Users can delete their own lap times" ON lap_times FOR DELETE USING (auth.uid() = user_id);

-- Championship Rounds
DROP POLICY IF EXISTS "Rounds are viewable by everyone" ON championship_rounds;
CREATE POLICY "Rounds are viewable by everyone" ON championship_rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert rounds" ON championship_rounds;
CREATE POLICY "Authenticated users can insert rounds" ON championship_rounds FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM championships
    WHERE championships.id = championship_rounds.championship_id
    AND championships.creator_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Creators can update rounds" ON championship_rounds;
CREATE POLICY "Creators can update rounds" ON championship_rounds FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM championships
    WHERE championships.id = championship_rounds.championship_id
    AND championships.creator_id = auth.uid()
  )
);

-- Championship Round Times
DROP POLICY IF EXISTS "Round times are viewable by everyone" ON championship_round_times;
CREATE POLICY "Round times are viewable by everyone" ON championship_round_times FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert/update their own round times" ON championship_round_times;
CREATE POLICY "Users can insert/update their own round times" ON championship_round_times FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own round times" ON championship_round_times;
CREATE POLICY "Users can update their own round times" ON championship_round_times FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM championship_rounds
  JOIN championships ON championships.id = championship_rounds.championship_id
  WHERE championship_rounds.id = championship_round_times.round_id
  AND championships.creator_id = auth.uid()
));

-- Championship Invitations
DROP POLICY IF EXISTS "Invitations are viewable by everyone" ON championship_invitations;
CREATE POLICY "Invitations are viewable by everyone" ON championship_invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert invitations" ON championship_invitations;
CREATE POLICY "Users can insert invitations" ON championship_invitations FOR INSERT WITH CHECK (auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can update invitations" ON championship_invitations;
CREATE POLICY "Users can update invitations" ON championship_invitations FOR UPDATE USING (true);

-- ==========================================
-- 8. SEMILLAS (SEED DATA) PARA PISTAS DE BOGOTÁ
-- ==========================================

-- Asegurar que el perfil temporal de sistema exista (opcional, o creator_id NULL)
-- Insertar las pistas principales si no existen
INSERT INTO tracks (name, description, location, cost_info, schedule, cover_image)
VALUES 
  (
    'SuperKarts Nuestro Bogotá', 
    'Pista de karts bajo techo (indoor) ubicada en el C.C. Nuestro Bogotá. Excelente trazado técnico con curvas cerradas y asfalto de buen agarre.', 
    'Bogotá - C.C. Nuestro Bogotá', 
    '$46.000 COP por carrera individual de 8 minutos', 
    '{"lunes_jueves": "12:00 PM - 8:00 PM", "viernes_sabado": "12:00 PM - 9:00 PM", "domingo_festivos": "11:00 AM - 8:00 PM"}', 
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80'
  ),
  (
    'La Pista Indoor Karting', 
    'Una de las pistas bajo techo más profesionales y de mayor trayectoria en el norte de Bogotá. Cuenta con karts de alto rendimiento y cronometraje electrónico avanzado.', 
    'Bogotá - Autopista Norte N° 224-60 (Km 16)', 
    '$69.900 COP por manga de 10 minutos', 
    '{"miercoles_viernes": "1:00 PM - 9:00 PM", "sabado_domingo_festivos": "10:00 AM - 8:00 PM", "lunes_martes": "Cerrado"}', 
    'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&auto=format&fit=crop&q=80'
  ),
  (
    'Modo Karting Paseo Villa del Río', 
    'Circuito indoor en el sur de Bogotá, con una flota moderna de karts eléctricos y de gasolina. Un trazado desafiante de dos niveles.', 
    'Bogotá - C.C. Paseo Villa del Río (Piso 4)', 
    '$38.750 COP por carrera de 12 minutos (Tarifa básica)', 
    '{"lunes_viernes": "1:00 PM - 9:00 PM", "fin_de_semana_festivos": "12:30 PM - 9:00 PM"}', 
    'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=800&auto=format&fit=crop&q=80'
  ),
  (
    'City Karts - CC. Santafé Bogotá', 
    'Pista clásica de karts recreativos dentro del Centro Comercial Santafé en el norte de Bogotá. Trazado rápido con excelente visibilidad y barreras de seguridad.', 
    'Bogotá - C.C. Santafé (Sótano)', 
    '$50.000 COP por carrera de 8 minutos', 
    '{"lunes_domingo": "10:00 AM - 10:00 PM"}', 
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80'
  ),
  (
    'Xtreme Karts Cajicá', 
    'Circuito semi-profesional al aire libre ubicado a las afueras de Bogotá en Cajicá. Curvas rápidas e ideal para sentir la velocidad del karting de competencia.', 
    'Cajicá - Kilómetro 4 Vía Cajicá', 
    '$60.000 COP por manga de 10 minutos', 
    '{"martes_domingo": "11:00 AM - 8:00 PM", "lunes": "Cerrado"}', 
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800&auto=format&fit=crop&q=80'
  )
ON CONFLICT DO NOTHING;
