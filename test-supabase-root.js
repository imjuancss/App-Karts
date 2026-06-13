import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env manually
const envPath = '/Users/juancamilosanchez/Documents/App-Karts/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or key');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log('--- SUPABASE DATABASE DIAGNOSTICS ---');

  const tables = [
    'profiles',
    'tracks',
    'track_reviews',
    'championships',
    'championship_participants',
    'comments',
    'lap_times',
    'championship_rounds',
    'championship_round_times',
    'championship_invitations',
    'motorsport_news'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error counting table "${table}":`, error.message);
    } else {
      console.log(`Table "${table}": ${count} records`);
    }
  }

  // Print tracks detail and lap times count
  const { data: tracks, error: tracksError } = await supabase.from('tracks').select('id, name, rating_avg');
  if (tracksError) {
    console.error('Error fetching tracks:', tracksError.message);
  } else {
    console.log('\nTracks list and lap times:');
    const { data: lapTimes } = await supabase.from('lap_times').select('track_id');
    const counts = {};
    if (lapTimes) {
      lapTimes.forEach(l => { counts[l.track_id] = (counts[l.track_id] || 0) + 1; });
    }
    tracks.forEach(t => {
      console.log(` - [${t.id}] ${t.name} (Rating Avg: ${t.rating_avg}) -> ${counts[t.id] || 0} lap times`);
    });
  }
}

test().catch(e => console.error(e));
