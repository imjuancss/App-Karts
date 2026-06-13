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

export async function createTrack(trackData) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { data, error } = await supabase
    .from('tracks')
    .insert([{
      ...trackData,
      creator_id: user?.id || null
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========================================
// LAP TIMES (Tiempos generales por pista)
// ========================================
export async function registerLapTime(trackId, lapTimeMs) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from('lap_times')
    .insert([{
      track_id: trackId,
      user_id: user.id,
      lap_time_ms: lapTimeMs
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserLapTimes(userId) {
  const { data, error } = await supabase
    .from('lap_times')
    .select(`
      *,
      tracks (name, location)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching user lap times:", error);
    return [];
  }
  return data;
}

export async function getRecentTrackLapTimes(trackId) {
  const { data, error } = await supabase
    .from('lap_times')
    .select(`
      *,
      profiles (username, full_name, avatar_url)
    `)
    .eq('track_id', trackId)
    .order('lap_time_ms', { ascending: true })
    .limit(10);
  if (error) {
    console.error("Error fetching recent track lap times:", error);
    return [];
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
      *
    `)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching championships:", error);
    return [];
  }
  return data;
}

export async function getChampionshipById(id) {
  // 1. Obtener detalles del campeonato
  const { data: champ, error: champError } = await supabase
    .from('championships')
    .select('*')
    .eq('id', id)
    .single();

  if (champError) {
    console.error("Error fetching championship:", champError);
    return null;
  }

  // 2. Obtener las rondas asociadas
  const { data: rounds, error: roundsError } = await supabase
    .from('championship_rounds')
    .select(`
      *,
      tracks (*)
    `)
    .eq('championship_id', id)
    .order('round_number', { ascending: true });

  if (roundsError) {
    console.error("Error fetching rounds:", roundsError);
  }
  champ.rounds = rounds || [];

  // 3. Obtener participantes
  const { data: participants, error: partsError } = await supabase
    .from('championship_participants')
    .select(`
      *,
      profiles (*)
    `)
    .eq('championship_id', id)
    .order('points', { ascending: false });

  if (partsError) {
    console.error("Error fetching participants:", partsError);
  }
  champ.participants = participants || [];

  return champ;
}

export async function createChampionship(champData, rounds) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");

  // 1. Insertar campeonato
  const { data: champ, error: champError } = await supabase
    .from('championships')
    .insert([{
      name: champData.name,
      description: champData.description || '',
      prize_label: champData.prize_label || '',
      creator_id: user.id,
      start_date: champData.start_date || null,
      end_date: champData.end_date || null,
      entry_fee: champData.entry_fee ? Number(champData.entry_fee) : 0,
      status: 'Inscripciones Abiertas'
    }])
    .select()
    .single();

  if (champError) throw champError;

  // 2. Insertar rondas
  const roundsToInsert = rounds.map((r, idx) => ({
    championship_id: champ.id,
    track_id: r.track_id,
    round_number: idx + 1,
    date: r.date,
    completed: false
  }));

  const { error: roundsError } = await supabase
    .from('championship_rounds')
    .insert(roundsToInsert);

  if (roundsError) throw roundsError;

  // 3. Inscribir automáticamente al creador
  await supabase.from('championship_participants').insert([{
    championship_id: champ.id,
    user_id: user.id,
    points: 0
  }]);

  return champ;
}

// Inscribirse directamente a un campeonato
export async function joinChampionship(championshipId) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from('championship_participants')
    .upsert({
      championship_id: championshipId,
      user_id: user.id,
      points: 0
    }, { onConflict: 'championship_id,user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// ROUND TIMES (Tiempos por Ronda)
// ========================================
export async function registerRoundTime(roundId, lapTimeMs, evidenceUrl = null) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from('championship_round_times')
    .upsert({
      round_id: roundId,
      user_id: user.id,
      lap_time_ms: lapTimeMs,
      evidence_url: evidenceUrl
    }, { onConflict: 'round_id,user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoundTimes(roundId) {
  const { data, error } = await supabase
    .from('championship_round_times')
    .select(`
      *,
      profiles (username, full_name, avatar_url)
    `)
    .eq('round_id', roundId)
    .order('lap_time_ms', { ascending: true });
  if (error) {
    console.error("Error fetching round times:", error);
    return [];
  }
  return data;
}

export async function completeRound(championshipId, roundId) {
  // 1. Obtener tiempos ordenados ascendentemente (menor tiempo es mejor)
  const { data: times, error: timesError } = await supabase
    .from('championship_round_times')
    .select('*')
    .eq('round_id', roundId)
    .order('lap_time_ms', { ascending: true });

  if (timesError) throw timesError;

  // Sistema de puntos F1 simplificado
  const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  // 2. Asignar puntos y actualizar cada registro en la ronda
  for (let i = 0; i < times.length; i++) {
    const pts = i < pointsSystem.length ? pointsSystem[i] : 0;
    await supabase
      .from('championship_round_times')
      .update({ points: pts })
      .eq('id', times[i].id);
  }

  // 3. Marcar la ronda como completada
  const { error: roundUpdateError } = await supabase
    .from('championship_rounds')
    .update({ completed: true })
    .eq('id', roundId);

  if (roundUpdateError) throw roundUpdateError;

  // 4. Recalcular puntos totales acumulados de todos los participantes
  const { data: rounds, error: roundsError } = await supabase
    .from('championship_rounds')
    .select('id')
    .eq('championship_id', championshipId);

  if (roundsError) throw roundsError;
  const roundIds = rounds.map(r => r.id);

  const { data: allRoundTimes, error: allTimesError } = await supabase
    .from('championship_round_times')
    .select('user_id, points')
    .in('round_id', roundIds);

  if (allTimesError) throw allTimesError;

  // Agrupar y sumar puntos por usuario
  const userPoints = {};
  allRoundTimes.forEach(rt => {
    userPoints[rt.user_id] = (userPoints[rt.user_id] || 0) + (rt.points || 0);
  });

  // Guardar puntajes consolidados en championship_participants
  for (const userId of Object.keys(userPoints)) {
    const pts = userPoints[userId];
    const { error: partUpdateError } = await supabase
      .from('championship_participants')
      .update({ points: pts })
      .eq('championship_id', championshipId)
      .eq('user_id', userId);
    
    if (partUpdateError) {
      await supabase
        .from('championship_participants')
        .upsert({
          championship_id: championshipId,
          user_id: userId,
          points: pts
        }, { onConflict: 'championship_id,user_id' });
    }
  }

  return true;
}

// ========================================
// INVITATIONS (Invitaciones por correo)
// ========================================
export async function inviteToChampionship(championshipId, email) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from('championship_invitations')
    .insert([{
      championship_id: championshipId,
      email: email.toLowerCase().trim(),
      invited_by: user.id,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingInvitations(email) {
  if (!email) return [];
  const { data, error } = await supabase
    .from('championship_invitations')
    .select(`
      *,
      championships (name, creator_id)
    `)
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'pending');
  
  if (error) {
    console.error("Error fetching pending invitations:", error);
    return [];
  }
  return data;
}

export async function acceptChampionshipInvitation(invitationId, championshipId) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");

  // 1. Actualizar estado de invitación
  const { error: inviteError } = await supabase
    .from('championship_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (inviteError) throw inviteError;

  // 2. Unirse al campeonato
  const { error: joinError } = await supabase
    .from('championship_participants')
    .upsert({
      championship_id: championshipId,
      user_id: user.id,
      points: 0
    }, { onConflict: 'championship_id,user_id' });

  if (joinError) throw joinError;

  return true;
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

