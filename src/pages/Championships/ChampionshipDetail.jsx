import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, MessageSquare, Award, Clock, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getChampionshipById, getRoundTimes, registerRoundTime, completeRound, joinChampionship, inviteToChampionship } from '../../services/api';
import './Championships.css';

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

export default function ChampionshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ranking');
  const [champ, setChamp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  // Ronda seleccionada para ver detalles / líder de ronda
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [roundTimes, setRoundTimes] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  // Registro de tiempo
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');

  // Invitación
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Inscripción
  const [isJoining, setIsJoining] = useState(false);

  // Recálculo del campeonato
  const [isCompletingRound, setIsCompletingRound] = useState(false);

  const loadChampionshipData = async () => {
    setIsLoading(true);
    const data = await getChampionshipById(id);
    setChamp(data);
    
    // Obtener sesión
    const { data: { session } } = await supabase.auth.getSession();
    setSessionUser(session?.user || null);

    if (data && data.rounds && data.rounds.length > 0) {
      setIsLoadingTimes(true);
      const activeOrFirstRound = data.rounds[selectedRoundIdx] || data.rounds[0];
      const times = await getRoundTimes(activeOrFirstRound.id);
      setRoundTimes(times || []);
      setIsLoadingTimes(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadChampionshipData();
  }, [id]);

  // Cada vez que cambia la ronda seleccionada, cargar sus tiempos
  const handleSelectRound = async (idx) => {
    setSelectedRoundIdx(idx);
    const round = champ.rounds[idx];
    if (round) {
      setIsLoadingTimes(true);
      const times = await getRoundTimes(round.id);
      setRoundTimes(times || []);
      setIsLoadingTimes(false);
    }
  };

  const handleJoin = async () => {
    if (!sessionUser) {
      alert("Debes iniciar sesión para inscribirte.");
      navigate('/login');
      return;
    }
    setIsJoining(true);
    try {
      await joinChampionship(champ.id);
      alert("¡Te has inscrito exitosamente en el campeonato!");
      await loadChampionshipData();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al inscribirte.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRegisterTime = async (e) => {
    e.preventDefault();
    setIsSubmittingTime(true);
    setTimeError('');

    try {
      const ms = parseTimeToMs(timeInput);
      if (ms <= 0) {
        throw new Error("Por favor ingresa un tiempo válido en formato mm:ss.SSS o ss.SSS");
      }
      
      const round = champ.rounds[selectedRoundIdx];
      if (!round) {
        throw new Error("Ronda no válida.");
      }

      await registerRoundTime(round.id, ms);
      
      setTimeInput('');
      setIsTimeModalOpen(false);
      
      // Recargar tiempos de ronda
      const times = await getRoundTimes(round.id);
      setRoundTimes(times || []);
      alert('¡Tiempo enviado exitosamente para la ronda!');
    } catch (err) {
      console.error(err);
      setTimeError(err.message || 'Error al subir el tiempo.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsSubmittingInvite(true);
    try {
      await inviteToChampionship(champ.id, inviteEmail);
      alert(`Invitación simulada enviada con éxito a: ${inviteEmail}. Al registrarse podrá unirse.`);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al enviar la invitación.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleCompleteRound = async (roundId) => {
    if (!window.confirm("¿Estás seguro de finalizar esta fecha? Esto calculará los puntos de la ronda para todos los pilotos y actualizará el Leaderboard general del torneo.")) {
      return;
    }
    setIsCompletingRound(true);
    try {
      await completeRound(champ.id, roundId);
      alert("¡Ronda finalizada correctamente y leaderboard general actualizado!");
      await loadChampionshipData();
    } catch (err) {
      console.error(err);
      alert("Error al finalizar la ronda.");
    } finally {
      setIsCompletingRound(false);
    }
  };

  if (isLoading) return <div className="champ-detail-container fade-in"><p>Cargando información del evento...</p></div>;
  if (!champ) return <div className="champ-detail-container fade-in"><p>Campeonato no encontrado.</p></div>;

  const isCreator = sessionUser && sessionUser.id === champ.creator_id;
  const isParticipant = sessionUser && champ.participants.some(p => p.user_id === sessionUser.id);
  const activeRound = champ.rounds[selectedRoundIdx] || null;

  return (
    <div className="champ-detail-container fade-in" style={{ paddingBottom: '5rem' }}>
      <button className="back-btn" onClick={() => navigate('/championships')}>
        <ArrowLeft size={20}/> Volver a campeonatos
      </button>

      {/* Header */}
      <div className="champ-header glass-panel">
        <div className="champ-title-row">
          <div>
            <h1>{champ.name}</h1>
            <span className="status-badge open" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{champ.status}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {!isParticipant ? (
              <button 
                className="primary-btn" 
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? 'Inscribiendo...' : `Inscribirme - $${champ.entry_fee ? Number(champ.entry_fee).toLocaleString() : 'Gratis'} COP`}
              </button>
            ) : (
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'rgba(250,204,21,0.1)', borderRadius: '8px' }}>
                ✓ Piloto Inscrito
              </span>
            )}
            {champ.entry_fee > 0 && (
              <span className="text-xs" style={{ color: '#9ca3af', maxWidth: '300px', textAlign: 'right' }}>
                Este pago corresponde al Race Pass para la bolsa de premios. NO incluye el costo de alquiler del kart en la pista.
              </span>
            )}
          </div>
        </div>
        <div className="champ-meta-row">
          <span><Calendar size={18}/> {champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</span>
          <span><Users size={18}/> {champ.participants.length} Pilotos</span>
          {champ.prize_label && (
            <span style={{ color: 'var(--accent)' }}><Award size={18} color="var(--accent)"/> Premio: {champ.prize_label}</span>
          )}
        </div>
      </div>

      {/* Layout Tabs */}
      <div className="champ-layout glass-panel">
        <div className="layout-tabs">
          <button className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}><Trophy size={18}/> Ranking y Standings</button>
          <button className={`tab-btn ${activeTab === 'fechas' ? 'active' : ''}`} onClick={() => setActiveTab('fechas')}><Calendar size={18}/> Rondas del Campeonato</button>
          <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}><MessageSquare size={18}/> Reglas e Info</button>
        </div>
        
        <div className="layout-content">
          {/* TAB 1: RANKING Y STANDINGS GENERALES */}
          {activeTab === 'ranking' && (
            <div className="fade-in">
              <h3 style={{ marginBottom: '1.5rem' }}>Standings Generales del Torneo</h3>
              {champ.participants.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No hay pilotos inscritos en este torneo aún.</p>
              ) : (
                <div className="leaderboard-table">
                  <div className="table-header">
                    <div className="col-pos">Pos</div>
                    <div className="col-pilot">Piloto</div>
                    <div className="col-pts">Puntos Totales</div>
                  </div>
                  {champ.participants.map((p, idx) => (
                    <div key={p.user_id} className={`table-row ${idx === 0 ? 'first-place' : ''}`} style={{ gridTemplateColumns: '60px 2fr 1fr' }}>
                      <div className="col-pos">{idx + 1}</div>
                      <div className="col-pilot">@{p.profiles?.username || 'piloto'} {p.profiles?.full_name ? `(${p.profiles.full_name})` : ''}</div>
                      <div className="col-pts">{p.points || 0} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* TAB 2: RONDAS Y CALENDARIO */}
          {activeTab === 'fechas' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              
              {/* Lista de Rondas (Columna Izquierda) */}
              <div>
                <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem' }}>Calendario de Fechas</h3>
                <div className="dates-list">
                  {champ.rounds.map((round, idx) => (
                    <div 
                      key={round.id} 
                      onClick={() => handleSelectRound(idx)}
                      className={`date-card ${selectedRoundIdx === idx ? 'active-card' : ''}`} 
                      style={{ 
                        cursor: 'pointer', 
                        borderLeft: `4px solid ${round.completed ? '#10b981' : '#f59e0b'}`,
                        background: selectedRoundIdx === idx ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        padding: '1rem',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: round.completed ? '#10b981' : '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {round.completed ? 'Completada' : 'Activa'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fecha {idx + 1}</span>
                      </div>
                      <h4 style={{ margin: '0.25rem 0', color: 'white' }}>{round.tracks?.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Calendar size={12} style={{ display: 'inline', marginRight: '5px' }}/> {round.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tiempos de la Ronda Seleccionada (Columna Derecha) */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '1.5rem' }}>
                {activeRound && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>Ronda #{selectedRoundIdx + 1}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Circuito: {activeRound.tracks?.name}
                        </p>
                      </div>

                      {/* Controles de Acción de la Ronda */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isCreator && !activeRound.completed && (
                          <button 
                            className="primary-btn" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#10b981', color: 'white' }}
                            onClick={() => handleCompleteRound(activeRound.id)}
                            disabled={isCompletingRound}
                          >
                            {isCompletingRound ? 'Finalizando...' : 'Finalizar Fecha'}
                          </button>
                        )}
                        {isParticipant && !activeRound.completed && (
                          <button 
                            className="secondary-btn" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => setIsTimeModalOpen(true)}
                          >
                            Subir Mi Tiempo
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ margin: '1rem 0' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }}/> {activeRound.tracks?.location}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1.5rem' }}><Clock size={14} style={{ display: 'inline', marginRight: '4px' }}/> Carrera: {activeRound.date}</span>
                    </div>

                    <h4 style={{ margin: '1.5rem 0 0.75rem', fontSize: '1rem', opacity: 0.8 }}>Tiempos Registrados en esta Fecha</h4>
                    {isLoadingTimes ? (
                      <p style={{ color: 'var(--text-secondary)' }}>Cargando tiempos...</p>
                    ) : roundTimes.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nadie ha subido tiempos para esta ronda todavía.</p>
                    ) : (
                      <div className="leaderboard-table" style={{ background: 'transparent' }}>
                        <div className="table-header" style={{ gridTemplateColumns: '50px 1.5fr 1fr 80px' }}>
                          <div>Pos</div>
                          <div>Piloto</div>
                          <div>Tiempo</div>
                          <div>Puntos</div>
                        </div>
                        {roundTimes.map((time, idx) => (
                          <div key={time.id} className="table-row" style={{ gridTemplateColumns: '50px 1.5fr 1fr 80px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--accent)' : 'inherit' }}>{idx + 1}</div>
                            <div>@{time.profiles?.username || 'piloto'}</div>
                            <div style={{ fontFamily: 'monospace' }}>{formatMsToTime(time.lap_time_ms)}</div>
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{time.points || 0} pts</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
          
          {/* TAB 3: REGLAS, PREMIOS E INVITACIONES */}
          {activeTab === 'rules' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
              
              {/* Reglas y Detalles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="date-card">
                  <h4>Acerca del Torneo</h4>
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {champ.description || 'Sin descripción detallada disponible.'}
                  </p>
                </div>

                {champ.prize_label && (
                  <div className="date-card" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award color="var(--accent)" size={20} />
                      <h4 style={{ margin: 0 }}>Premio Establecido</h4>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>
                      {champ.prize_label}
                    </p>
                  </div>
                )}

                <div className="date-card">
                  <h4>Puntajes de Ronda (Fórmula 1)</h4>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    Al finalizar cada fecha, se otorgarán los siguientes puntos en base a los mejores tiempos de vuelta:
                    <br/><br/>
                    1º: 25 pts | 2º: 18 pts | 3º: 15 pts | 4º: 12 pts | 5º: 10 pts
                    <br/>
                    6º: 8 pts | 7º: 6 pts | 8º: 4 pts | 9º: 2 pts | 10º: 1 pt
                  </p>
                </div>
              </div>

              {/* Formulario de Invitaciones a Amigos */}
              <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Invitar Amigos</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                  Ingresa el correo electrónico de tu amigo para invitarlo a competir en este torneo. Le llegará un correo y podrá inscribirse.
                </p>
                <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input 
                    type="email" 
                    placeholder="amigo@correo.com" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                  <button 
                    type="submit" 
                    className="primary-btn" 
                    disabled={isSubmittingInvite || !inviteEmail}
                    style={{ width: '100%' }}
                  >
                    {isSubmittingInvite ? <Loader2 className="spinner" size={18} /> : (
                      <>
                        <Send size={16}/> Enviar Invitación
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Modal Subir Tiempo para Ronda */}
      {isTimeModalOpen && activeRound && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px', borderRadius: '12px', background: '#1e1e2f' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>Registrar Tiempo - Fecha #{selectedRoundIdx + 1}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Pista: {activeRound.tracks?.name}</p>
            
            {timeError && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{timeError}</p>
            )}

            <form onSubmit={handleRegisterTime}>
              <div style={{ marginBottom: '1rem' }}>
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Subir foto del ticket de la carrera (Opcional)</label>
                <input type="file" accept="image/*" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>Cancelar</button>
                <button type="submit" className="primary-btn" disabled={isSubmittingTime}>
                  {isSubmittingTime ? <Loader2 className="spinner" size={20} /> : 'Registrar Tiempo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
