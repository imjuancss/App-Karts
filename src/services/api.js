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

export async function updateTrack(id, trackData) {
  const { data, error } = await supabase
    .from('tracks')
    .update(trackData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========================================
// TRACK REVIEWS
// ========================================
export async function getTrackReviews(trackId) {
  const { data, error } = await supabase
    .from('track_reviews')
    .select(`
      *,
      profiles (username, full_name, avatar_url)
    `)
    .eq('track_id', trackId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching track reviews:", error);
    return [];
  }
  return data;
}

export async function addTrackReview(trackId, rating, comment) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado");
  
  const { data, error } = await supabase
    .from('track_reviews')
    .insert([{
      track_id: trackId,
      user_id: user.id,
      rating: rating,
      comment: comment
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

// ========================================
// MOTORSPORT NEWS (Noticias En Vivo)
// ========================================

/**
 * Obtiene las noticias de motorsport guardadas en Supabase.
 */
export async function getMotorsportNews() {
  const { data, error } = await supabase
    .from('motorsport_news')
    .select('*')
    .order('pub_date', { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching motorsport news from DB:", error);
    return [];
  }
  return data;
}

/**
 * Guarda las noticias en Supabase llamando a la función RPC upsert_motorsport_news.
 */
export async function saveMotorsportNews(newsItems) {
  if (!newsItems || newsItems.length === 0) return;

  const { error } = await supabase.rpc('upsert_motorsport_news', {
    news_items: newsItems
  });

  if (error) {
    console.error("Error calling RPC upsert_motorsport_news:", error);
    throw error;
  }
}

/**
 * Limpia el texto HTML de las descripciones RSS.
 */
function cleanDescription(htmlDesc) {
  if (!htmlDesc) return '';
  // Eliminar etiquetas HTML
  let clean = htmlDesc.replace(/<[^>]*>/g, '');
  // Decodificar entidades HTML comunes
  clean = clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return clean.trim();
}

/**
 * Extrae una URL de imagen de la descripción HTML si no hay thumbnail explícito.
 */
function extractImageFromHtml(htmlDesc) {
  if (!htmlDesc) return null;
  const match = htmlDesc.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
}

/**
 * Consulta feeds RSS de canales importantes del motorsport en la web y los formatea.
 */
export async function fetchExternalMotorsportNews() {
  const feeds = [
    {
      url: 'https://www.motorsport.com/rss/f1/news/',
      category: 'Formula 1',
      source: 'Motorsport.com'
    },
    {
      url: 'https://www.motorsport.com/rss/motogp/news/',
      category: 'MotoGP',
      source: 'Motorsport.com'
    },
    {
      url: 'https://www.motorsport.com/rss/indycar/news/',
      category: 'IndyCar',
      source: 'Motorsport.com'
    },
    {
      url: 'https://www.motorsport.com/rss/wrc/news/',
      category: 'WRC',
      source: 'Motorsport.com'
    },
    {
      url: 'https://www.motorsport.com/rss/wec/news/',
      category: 'WEC',
      source: 'Motorsport.com'
    },
    {
      url: 'https://racer.com/category/formula-1/feed/',
      category: 'Formula 1',
      source: 'Racer.com'
    }
  ];

  const allNews = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
      );
      
      if (!response.ok) {
        console.warn(`No se pudo obtener el feed de ${feed.source} (${feed.category})`);
        continue;
      }

      const data = await response.json();
      if (data.status !== 'ok' || !data.items) continue;

      for (const item of data.items) {
        const title = item.title;
        const link = item.link;
        // Limpiar la descripción de etiquetas HTML
        const rawDesc = item.description || item.content || '';
        const description = cleanDescription(rawDesc);
        
        // Obtener URL de imagen
        const image_url = item.thumbnail || 
                           item.enclosure?.link || 
                           extractImageFromHtml(rawDesc) || 
                           'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop';

        // Formatear fecha a ISO String
        let pub_date;
        try {
          pub_date = new Date(item.pubDate).toISOString();
        } catch {
          pub_date = new Date().toISOString();
        }

        allNews.push({
          title,
          link,
          description: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
          pub_date,
          source: feed.source,
          image_url,
          category: feed.category
        });
      }
    } catch (err) {
      console.error(`Error procesando feed ${feed.url}:`, err);
    }
  }

  // Ordenar por fecha de publicación descendente
  return allNews.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
}

/**
 * Verifica si es necesario actualizar la base de datos (si no hay noticias o tienen más de 1 hora)
 * y realiza la sincronización en segundo plano de ser necesario.
 */
export async function checkAndUpdateNews() {
  try {
    // 1. Obtener la noticia más reciente para ver cuándo fue creada
    const { data: latestNews, error } = await supabase
      .from('motorsport_news')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error al verificar fecha de últimas noticias:", error);
    }

    const needsUpdate = !latestNews || 
                         latestNews.length === 0 || 
                         (new Date() - new Date(latestNews[0].created_at)) > 60 * 60 * 1000; // 1 hora en ms

    if (needsUpdate) {
      console.log("Las noticias de motorsport han expirado o no existen. Actualizando...");
      const externalNews = await fetchExternalMotorsportNews();
      if (externalNews.length > 0) {
        await saveMotorsportNews(externalNews);
        console.log(`Se actualizaron ${externalNews.length} noticias de motorsport.`);
      }
    }
  } catch (err) {
    console.error("Error en checkAndUpdateNews:", err);
  }
}


