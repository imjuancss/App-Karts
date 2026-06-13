import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Calendar, MessageSquare, Clock, Plus, MailOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getUserLapTimes, registerLapTime, getTracks, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';

const formatMsToTime = (ms) => {
  if (!ms) return "00:00.000";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const parseTimeToMs = (timeStr) => {
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secsParts = parts[1].split('.');
    const secs = parseInt(secsParts[0], 10);
    const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    return (mins * 60000) + (secs * 1000) + ms;
  } else if (parts.length === 1) {
    const secsParts = parts[0].split('.');
    const secs = parseInt(secsParts[0], 10);
    const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
    return (secs * 1000) + ms;
  }
  return 0;
};

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campeonatos');
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos de Supabase
  const [userTimes, setUserTimes] = useState([]);
  const [userChampionships, setUserChampionships] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  
  // Modal de registro de tiempos
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');

  const loadData = async (user) => {
    setIsLoading(true);
    let p = await getProfile(user.id);
    
    // Si por alguna razón el trigger falló, intentamos crearlo manualmente
    if (!p) {
      const { data } = await supabase.from('profiles').insert([{
        id: user.id,
        username: user.email.split('@')[0] + Math.floor(Math.random() * 1000),
        full_name: user.user_metadata?.full_name || 'Piloto Nuevo'
      }]).select().single();
      
      p = data || { id: user.id, full_name: user.user_metadata?.full_name || 'Piloto Nuevo', username: user.email.split('@')[0] };
    }
    setUserProfile(p);

    // Cargar tiempos de vuelta
    const times = await getUserLapTimes(user.id);
    setUserTimes(times || []);

    // Cargar invitaciones pendientes
    const invites = await getPendingInvitations(user.email);
    setPendingInvites(invites || []);

    // Cargar campeonatos a los que se ha unido
    const { data: participations, error: partError } = await supabase
      .from('championship_participants')
      .select(`
        championship_id,
        points,
        championships (*)
      `)
      .eq('user_id', user.id);
    
    if (!partError) {
      setUserChampionships(participations || []);
    }

    // Cargar todas las pistas para el modal
    const tracks = await getTracks();
    setAllTracks(tracks || []);
    if (tracks && tracks.length > 0) {
      setSelectedTrackId(tracks[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        setSessionUser(user);
        await loadData(user);
      } else {
        setSessionUser(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    }
    
    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        loadData(session.user);
      } else {
        setSessionUser(null);
        setUserProfile(null);
      }
    });

    loadUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRegisterLapTime = async (e) => {
    e.preventDefault();
    setIsSubmittingTime(true);
    setTimeError('');

    try {
      const ms = parseTimeToMs(timeInput);
      if (ms <= 0) {
        throw new Error("Ingresa un tiempo válido (mm:ss.SSS o ss.SSS)");
      }
      if (!selectedTrackId) {
        throw new Error("Por favor selecciona una pista");
      }

      await registerLapTime(selectedTrackId, ms);
      
      // Resetear formulario
      setTimeInput('');
      setIsTimeModalOpen(false);

      // Recargar tiempos
      if (sessionUser) {
        const times = await getUserLapTimes(sessionUser.id);
        setUserTimes(times || []);
      }
      alert('¡Tiempo guardado exitosamente!');
    } catch (err) {
      console.error(err);
      setTimeError(err.message || 'Error al guardar el tiempo.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  const handleAcceptInvite = async (inviteId, champId, name) => {
    try {
      await acceptChampionshipInvitation(inviteId, champId);
      alert(`Te has unido exitosamente al campeonato: ${name}`);
      
      // Recargar datos
      if (sessionUser) {
        await loadData(sessionUser);
      }
    } catch (error) {
      console.error("Error al aceptar invitación:", error);
      alert("Hubo un problema al aceptar la invitación.");
    }
  };

  if (isLoading) return <div className="profile-container fade-in"><p>Cargando perfil...</p></div>;

  if (!sessionUser || !userProfile) {
    return (
      <div className="profile-container fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Aún no has iniciado sesión</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Conéctate o vuelve a iniciar sesión con tu cuenta recién creada.</p>
        <button className="primary-btn" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/login')}>Iniciar Sesión / Registro</button>
      </div>
    );
  }

  return (
    <div className="profile-container fade-in">
      {/* Invitaciones Pendientes Banner */}
      {pendingInvites.length > 0 && (
        <div className="pending-invitations-banner glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--accent)', background: 'rgba(250, 204, 21, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MailOpen size={24} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>¡Tienes invitaciones a torneos!</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingInvites.map(invite => (
              <div key={invite.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>Te invitaron a participar en: <strong>{invite.championships?.name}</strong></span>
                <button 
                  className="primary-btn" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  onClick={() => handleAcceptInvite(invite.id, invite.championship_id, invite.championships?.name)}
                >
                  Aceptar y Unirme
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <section className="profile-header glass-panel">
        <div className="profile-cover"></div>
        <div className="profile-info-wrapper">
          <img src={userProfile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.username}`} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <div className="profile-title">
              <h1>{userProfile.full_name || 'Piloto'}</h1>
              <span className="username">@{userProfile.username || 'usuario'}</span>
            </div>
            <p className="profile-bio">{userProfile.bio || 'Sin biografía.'}</p>
            <div className="profile-meta">
              <span><MapPin size={16}/> {userProfile.location || 'Bogotá, Colombia'}</span>
              <span><Calendar size={16}/> Creado: {new Date(userProfile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="primary-btn" onClick={() => setIsTimeModalOpen(true)}><Plus size={16}/> Registrar Tiempo</button>
            <button className="secondary-btn" onClick={async () => await supabase.auth.signOut()}>Cerrar Sesión</button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{userTimes.length}</span>
            <span className="stat-label">Récords Pista</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userChampionships.length}</span>
            <span className="stat-label">Campeonatos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {userChampionships.reduce((acc, c) => acc + (c.points || 0), 0)}
            </span>
            <span className="stat-label">Puntos Totales</span>
          </div>
          
          {/* Stats */}
          <Grid container spacing={3} className="pt-6 border-t border-white/10">
            <Grid item xs={12} sm={4}>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Typography variant="h3" fontWeight="bold" color="white">{userTimes.length}</Typography>
                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider">Récords Pista</Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Typography variant="h3" fontWeight="bold" color="white">{userChampionships.length}</Typography>
                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider">Campeonatos</Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Typography variant="h3" fontWeight="bold" color="#FF3100">
                  {userChampionships.reduce((acc, c) => acc + (c.points || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider">Puntos Totales</Typography>
              </div>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <KineticButton
          variant={activeTab === 'campeonatos' ? 'contained' : 'outlined'}
          color={activeTab === 'campeonatos' ? 'primary' : 'inherit'}
          onClick={() => setActiveTab('campeonatos')}
          startIcon={<Trophy size={18}/>}
          sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
        >
          <Trophy size={18}/> Mis Campeonatos ({userChampionships.length})
        </KineticButton>

        <button 
          className={`tab-btn ${activeTab === 'tiempos' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiempos')}
        >
          <Clock size={18}/> Mis Tiempos ({userTimes.length})
        </button>

        <KineticButton 
          className={`tab-btn ${activeTab === 'actividad' ? 'active' : ''}`}
          onClick={() => setActiveTab('actividad')}
          startIcon={<MessageSquare size={18}/>}
          sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
        >
          Actividad
        </KineticButton>
      </div>

      {/* Tab Content */}
      <KineticCard sx={{ p: 4, minHeight: '300px' }}>
        {activeTab === 'campeonatos' && (
          <div className="content-grid list-view fade-in">
             {userChampionships.length === 0 ? (
               <p style={{color: 'var(--text-secondary)'}}>Aún no te has inscrito a ningún campeonato.</p>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                 {userChampionships.map(uc => (
                   <div 
                     key={uc.championship_id} 
                     className="champ-item-list" 
                     onClick={() => navigate(`/championships/${uc.championship_id}`)}
                     style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                   >
                     <div>
                       <h4 style={{ margin: 0, color: 'white' }}>{uc.championships?.name}</h4>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estado: {uc.championships?.status}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent)' }}>{uc.points} pts</span>
                       <Trophy size={18} color="var(--accent)" />
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'tiempos' && (
          <div className="fade-in" style={{ width: '100%' }}>
            {userTimes.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No has registrado ningún tiempo todavía.</p>
            ) : (
              <div className="times-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userTimes.map(time => (
                  <div key={time.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{time.tracks?.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }}/>{time.tracks?.location}</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.05rem', color: 'white' }}>
                      {formatMsToTime(time.lap_time_ms)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actividad' && (
          <div className="fade-in">
            <Typography color="text.secondary">No hay actividad reciente.</Typography>
          </div>
        )}
      </KineticCard>

      {/* Modal Registrar Tiempo */}
      {isTimeModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '450px', borderRadius: '12px', background: '#1e1e2f' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registrar Tiempo de Vuelta</h3>
            {timeError && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{timeError}</p>
            )}
            <form onSubmit={handleRegisterLapTime}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Seleccionar Circuito</label>
                <select 
                  value={selectedTrackId} 
                  onChange={e => setSelectedTrackId(e.target.value)} 
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#121212', color: 'white' }}
                >
                  <option value="" disabled>Selecciona una pista...</option>
                  {allTracks.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Tu mejor tiempo (mm:ss.SSS o ss.SSS)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 00:44.520 o 44.520" 
                  value={timeInput} 
                  onChange={e => setTimeInput(e.target.value)} 
                  required 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>Cancelar</button>
                <button type="submit" className="primary-btn" disabled={isSubmittingTime}>
                  {isSubmittingTime ? <Loader2 className="spinner" size={20} /> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
