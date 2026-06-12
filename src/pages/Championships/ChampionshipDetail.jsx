import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, MessageSquare, Award, Clock, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getChampionshipById, getRoundTimes, registerRoundTime, completeRound, joinChampionship, inviteToChampionship } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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

  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [roundTimes, setRoundTimes] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const [isJoining, setIsJoining] = useState(false);

  const [isCompletingRound, setIsCompletingRound] = useState(false);

  const loadChampionshipData = async () => {
    setIsLoading(true);
    const data = await getChampionshipById(id);
    setChamp(data);
    
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

  if (isLoading) {
    return (
      <div className="champ-detail-container fade-in px-4 py-10" style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--accent)' }} />
        <Typography color="text.secondary">Cargando información del evento...</Typography>
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="champ-detail-container fade-in px-4 py-10 text-center">
        <Typography color="error">Campeonato no encontrado.</Typography>
      </div>
    );
  }

  const isCreator = sessionUser && sessionUser.id === champ.creator_id;
  const isParticipant = sessionUser && champ.participants.some(p => p.user_id === sessionUser.id);
  const activeRound = champ.rounds[selectedRoundIdx] || null;

  return (
    <div className="champ-detail-container fade-in px-4 py-6 md:py-10 max-w-6xl mx-auto pb-20">
      <Stack direction="row" mb={3}>
        <KineticButton 
          variant="text" 
          color="secondary" 
          onClick={() => navigate('/championships')}
          startIcon={<ArrowLeft size={20}/>}
        >
          Volver a campeonatos
        </KineticButton>
      </Stack>

      <KineticCard sx={{ mb: 4, p: { xs: 3, md: 4 } }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <Typography variant="h2" sx={{ color: 'white', mb: 1 }}>{champ.name}</Typography>
            <span className="status-badge open" style={{ display: 'inline-block', marginBottom: '1rem' }}>{champ.status}</span>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <span className="flex items-center gap-1"><Calendar size={18} className="opacity-70" /> {champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</span>
              <span className="flex items-center gap-1"><Users size={18} className="opacity-70" /> {champ.participants.length} Pilotos</span>
              {champ.prize_label && (
                <span className="flex items-center gap-1 text-[#FF3100]"><Award size={18} /> Premio: {champ.prize_label}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            {!isParticipant ? (
              <KineticButton 
                variant="contained" 
                onClick={handleJoin}
                disabled={isJoining}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                {isJoining ? 'Inscribiendo...' : `Inscribirme - $${champ.entry_fee ? Number(champ.entry_fee).toLocaleString() : 'Gratis'} COP`}
              </KineticButton>
            ) : (
              <span className="text-[#cafd00] font-bold text-sm px-4 py-2 bg-[#cafd00]/10 rounded-md block text-center md:text-left">
                ✓ Piloto Inscrito
              </span>
            )}
            {champ.entry_fee > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 300, textAlign: { xs: 'left', md: 'right' } }}>
                Este pago corresponde al Race Pass para la bolsa de premios. NO incluye el costo de alquiler del kart en la pista.
              </Typography>
            )}
          </div>
        </div>
      </KineticCard>

      <KineticCard sx={{ p: { xs: 2, md: 4 } }}>
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <KineticButton
            variant={activeTab === 'ranking' ? 'contained' : 'outlined'}
            color={activeTab === 'ranking' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('ranking')}
            startIcon={<Trophy size={18}/>}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Ranking y Standings
          </KineticButton>
          <KineticButton
            variant={activeTab === 'fechas' ? 'contained' : 'outlined'}
            color={activeTab === 'fechas' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('fechas')}
            startIcon={<Calendar size={18}/>}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Rondas del Campeonato
          </KineticButton>
          <KineticButton
            variant={activeTab === 'rules' ? 'contained' : 'outlined'}
            color={activeTab === 'rules' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('rules')}
            startIcon={<MessageSquare size={18}/>}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Reglas e Info
          </KineticButton>
        </div>
        
        <div>
          {activeTab === 'ranking' && (
            <div className="fade-in">
              <Typography variant="h4" mb={3}>Standings Generales del Torneo</Typography>
              {champ.participants.length === 0 ? (
                <Typography color="text.secondary">No hay pilotos inscritos en este torneo aún.</Typography>
              ) : (
                <div className="leaderboard-table bg-transparent border-0 mt-0">
                  <div className="table-header">
                    <div className="col-pos">Pos</div>
                    <div className="col-pilot">Piloto</div>
                    <div className="col-pts">Puntos Totales</div>
                  </div>
                  {champ.participants.map((p, idx) => (
                    <div key={p.user_id} className={`table-row ${idx === 0 ? 'first-place' : ''}`} style={{ gridTemplateColumns: '60px 2fr 1fr' }}>
                      <div className="col-pos font-bold">{idx + 1}</div>
                      <div className="col-pilot font-medium">@{p.profiles?.username || 'piloto'} {p.profiles?.full_name ? <span className="opacity-50 font-normal">({p.profiles.full_name})</span> : ''}</div>
                      <div className="col-pts text-[#FF3100] font-bold">{p.points || 0} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'fechas' && (
            <div className="fade-in flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <Typography variant="h5" mb={3}>Calendario de Fechas</Typography>
                <div className="flex flex-col gap-3">
                  {champ.rounds.map((round, idx) => (
                    <div 
                      key={round.id} 
                      onClick={() => handleSelectRound(idx)}
                      className={`cursor-pointer border-l-4 p-4 rounded-md transition-colors ${selectedRoundIdx === idx ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
                      style={{ borderLeftColor: round.completed ? '#10b981' : '#f59e0b' }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: round.completed ? '#10b981' : '#f59e0b' }}>
                          {round.completed ? 'Completada' : 'Activa'}
                        </span>
                        <span className="text-xs text-gray-400">Fecha {idx + 1}</span>
                      </div>
                      <Typography variant="subtitle1" fontWeight="bold" color="white" mb={0.5}>{round.tracks?.name}</Typography>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {round.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                {activeRound && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                      <div>
                        <Typography variant="h4" mb={0.5}>Ronda #{selectedRoundIdx + 1}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Circuito: {activeRound.tracks?.name}
                        </Typography>
                      </div>

                      <Stack direction="row" spacing={1}>
                        {isCreator && !activeRound.completed && (
                          <KineticButton 
                            variant="contained" 
                            color="success"
                            size="small"
                            onClick={() => handleCompleteRound(activeRound.id)}
                            disabled={isCompletingRound}
                          >
                            {isCompletingRound ? 'Finalizando...' : 'Finalizar Fecha'}
                          </KineticButton>
                        )}
                        {isParticipant && !activeRound.completed && (
                          <KineticButton 
                            variant="outlined" 
                            size="small"
                            onClick={() => setIsTimeModalOpen(true)}
                          >
                            Subir Mi Tiempo
                          </KineticButton>
                        )}
                      </Stack>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {activeRound.tracks?.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> Carrera: {activeRound.date}</span>
                    </div>

                    <Typography variant="h6" mb={2}>Tiempos Registrados en esta Fecha</Typography>
                    {isLoadingTimes ? (
                      <Typography color="text.secondary">Cargando tiempos...</Typography>
                    ) : roundTimes.length === 0 ? (
                      <Typography color="text.secondary">Nadie ha subido tiempos para esta ronda todavía.</Typography>
                    ) : (
                      <div className="leaderboard-table bg-transparent border-0 mt-0">
                        <div className="table-header" style={{ gridTemplateColumns: '50px 1.5fr 1fr 80px' }}>
                          <div>Pos</div>
                          <div>Piloto</div>
                          <div>Tiempo</div>
                          <div>Puntos</div>
                        </div>
                        {roundTimes.map((time, idx) => (
                          <div key={time.id} className="table-row" style={{ gridTemplateColumns: '50px 1.5fr 1fr 80px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="font-bold" style={{ color: idx === 0 ? 'var(--accent)' : 'inherit' }}>{idx + 1}</div>
                            <div>@{time.profiles?.username || 'piloto'}</div>
                            <div className="font-mono text-lg font-bold tracking-tight text-[#FF3100]">{formatMsToTime(time.lap_time_ms)}</div>
                            <div className="font-bold text-[#cafd00]">{time.points || 0} pts</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'rules' && (
            <div className="fade-in flex flex-col md:flex-row gap-8">
              <div className="md:w-3/5 space-y-6">
                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                  <Typography variant="h6" mb={1}>Acerca del Torneo</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {champ.description || 'Sin descripción detallada disponible.'}
                  </Typography>
                </div>

                {champ.prize_label && (
                  <div className="bg-white/5 p-5 rounded-lg border-l-4 border-l-[#FF3100]">
                    <div className="flex items-center gap-2 mb-2">
                      <Award color="#FF3100" size={20} />
                      <Typography variant="h6" m={0}>Premio Establecido</Typography>
                    </div>
                    <Typography variant="h5" fontWeight="bold" color="white">
                      {champ.prize_label}
                    </Typography>
                  </div>
                )}

                <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                  <Typography variant="h6" mb={1}>Puntajes de Ronda (Fórmula 1)</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Al finalizar cada fecha, se otorgarán los siguientes puntos en base a los mejores tiempos de vuelta:
                    <br/><br/>
                    1º: 25 pts | 2º: 18 pts | 3º: 15 pts | 4º: 12 pts | 5º: 10 pts
                    <br/>
                    6º: 8 pts | 7º: 6 pts | 8º: 4 pts | 9º: 2 pts | 10º: 1 pt
                  </Typography>
                </div>
              </div>

              <div className="md:w-2/5">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 sticky top-4">
                  <Typography variant="h6" mb={1}>Invitar Amigos</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Ingresa el correo electrónico de tu amigo para invitarlo a competir en este torneo. Le llegará un correo y podrá inscribirse.
                  </Typography>
                  <form onSubmit={handleInvite}>
                    <Stack spacing={2}>
                      <KineticInput 
                        type="email" 
                        placeholder="amigo@correo.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        fullWidth
                      />
                      <KineticButton 
                        type="submit" 
                        variant="contained" 
                        disabled={isSubmittingInvite || !inviteEmail}
                        fullWidth
                        startIcon={!isSubmittingInvite && <Send size={16}/>}
                      >
                        {isSubmittingInvite ? <Loader2 className="animate-spin" size={18} /> : 'Enviar Invitación'}
                      </KineticButton>
                    </Stack>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </KineticCard>

      <Dialog 
        open={isTimeModalOpen} 
        onClose={() => !isSubmittingTime && setIsTimeModalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: 'var(--bg-card)',
            backgroundImage: 'none',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px'
          }
        }}
      >
        <form onSubmit={handleRegisterTime}>
          <DialogTitle sx={{ color: 'white' }}>
            Registrar Tiempo - Fecha #{selectedRoundIdx + 1}
            <Typography variant="body2" color="text.secondary" mt={0.5}>Pista: {activeRound?.tracks?.name}</Typography>
          </DialogTitle>
          <DialogContent>
            {timeError && (
              <Typography color="error" variant="body2" mb={2}>{timeError}</Typography>
            )}
            <Stack spacing={3} mt={1}>
              <KineticInput
                label="Tu mejor tiempo (mm:ss.SSS o ss.SSS)"
                placeholder="Ej: 00:44.520 o 44.520"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                required
                fullWidth
                slotProps={{
                  input: {
                    style: { fontFamily: 'monospace' }
                  }
                }}
              />
              <KineticInput
                type="file"
                label="Subir foto del ticket de la carrera (Opcional)"
                inputProps={{ accept: "image/*" }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <KineticButton variant="text" color="inherit" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>
              Cancelar
            </KineticButton>
            <KineticButton type="submit" variant="contained" disabled={isSubmittingTime}>
              {isSubmittingTime ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Tiempo'}
            </KineticButton>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
