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
  console.log('Testing Supabase connection...');
  const { data: tracks, error: tracksError } = await supabase.from('tracks').select('*').limit(5);
  if (tracksError) console.error('Tracks error:', tracksError);
  else console.log('Fetched tracks:', tracks.length);

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(5);
  if (profilesError) console.error('Profiles error:', profilesError);
  else console.log('Fetched profiles:', profiles.length);

  // Insert temporary profile
  const tempId = '00000000-0000-0000-0000-000000000001';
  await supabase.from('profiles').delete().eq('id', tempId);
  const { data: inserted, error: insertError } = await supabase.from('profiles').insert([{ id: tempId, username: 'temp_user', full_name: 'Temp User' }]).select();
  if (insertError) console.error('Insert error:', insertError);
  else console.log('Inserted profile:', inserted);
  // Cleanup
  await supabase.from('profiles').delete().eq('id', tempId);
  console.log('Cleanup done');
}

test().catch(e => console.error(e));
