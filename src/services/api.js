import { supabase } from '../lib/supabase';

// ========================================
// TRACKS (Pistas)
// ========================================
export async function getTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
  return data;
}

export async function getTrackById(id) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error("Error fetching track:", error);
    return null;
  }
  return data;
}

// ========================================
// CHAMPIONSHIPS (Campeonatos)
// ========================================
export async function getChampionships() {
  const { data, error } = await supabase
    .from('championships')
    .select(`
      *,
      tracks (name, location)
    `)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching championships:", error);
    return [];
  }
  return data;
}

export async function getChampionshipById(id) {
  const { data, error } = await supabase
    .from('championships')
    .select(`
      *,
      tracks (*)
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error("Error fetching championship:", error);
    return null;
  }
  return data;
}

// ========================================
// PROFILES (Users)
// ========================================
export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}
