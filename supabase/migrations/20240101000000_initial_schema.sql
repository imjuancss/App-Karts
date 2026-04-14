-- Initial Schema for App-Karts

-- 1. profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. tracks
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  cover_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  cost_info TEXT,
  schedule JSONB DEFAULT '[]'::jsonb,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating_avg NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. track_reviews
CREATE TABLE track_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. championships
CREATE TABLE championships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT,
  status TEXT DEFAULT 'Inscripciones Abiertas',
  start_date DATE,
  end_date DATE,
  entry_fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. championship_participants
CREATE TABLE championship_participants (
  championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  best_time_ms INTEGER,
  points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (championship_id, user_id)
);

-- 6. comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- Row Level Security (RLS) Setup
-- --------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, only the user can update their own profile
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tracks: Anyone can view, authenticated users can create, creators can update
CREATE POLICY "Tracks are viewable by everyone." ON tracks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tracks." ON tracks FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update tracks." ON tracks FOR UPDATE USING (auth.uid() = creator_id);

-- Track Reviews: Anyone can view, users can create/update their own
CREATE POLICY "Reviews are viewable by everyone." ON track_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews." ON track_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews." ON track_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Championships: Anyone can view, authenticated users can create, creators can update
CREATE POLICY "Championships are viewable by everyone." ON championships FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert championships." ON championships FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update championships." ON championships FOR UPDATE USING (auth.uid() = creator_id);

-- Participants: Anyone can view, users can insert themselves and update their own times
CREATE POLICY "Participants are viewable by everyone." ON championship_participants FOR SELECT USING (true);
CREATE POLICY "Users can join championships." ON championship_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their time/entry." ON championship_participants FOR UPDATE USING (auth.uid() = user_id);

-- Comments: Anyone can view, users can insert their own completely
CREATE POLICY "Comments are viewable by everyone." ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments." ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments." ON comments FOR UPDATE USING (auth.uid() = user_id);
