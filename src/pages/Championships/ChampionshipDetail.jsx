import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getChampionshipById, getRoundTimes, registerRoundTime, completeRound, joinChampionship, inviteToChampionship } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import KineticButton from '../../components/ui/KineticButton';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroImage = document.querySelector('img[data-alt]');
      if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return <div className="p-8 text-on-surface fade-in"><p>Cargando información del evento...</p></div>;
  if (!champ) return <div className="p-8 text-on-surface fade-in"><p>Campeonato no encontrado.</p></div>;

  const isCreator = sessionUser && sessionUser.id === champ.creator_id;
  const isParticipant = sessionUser && champ.participants.some(p => p.user_id === sessionUser.id);
  const activeRound = champ.rounds[selectedRoundIdx] || null;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-dim/30 min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl h-20 flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/championships')}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-highest transition-colors rounded-sm"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-dim">sports_motorsports</span>
            <h1 className="font-headline text-headline-sm font-bold text-on-surface uppercase tracking-widest hidden md:block">
              {champ.name}
            </h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-primary-dim font-headline font-bold text-lg leading-none">
              Inscribirme - ${champ.entry_fee ? Number(champ.entry_fee).toLocaleString() : '0'} COP
            </span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-tighter">
              Sujeto a términos de Race Pass
            </span>
          </div>
          {!isParticipant ? (
            <KineticButton 
              variant="contained"
              color="primary"
              onClick={handleJoin}
              disabled={isJoining}
              className="px-6 py-2 font-headline font-bold uppercase tracking-wider text-sm rounded-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isJoining ? 'Procesando...' : 'Pagar Ahora'}
            </KineticButton>
          ) : (
            <div className="bg-tertiary-fixed/10 text-tertiary-fixed px-4 py-2 rounded-sm border border-tertiary-fixed/30 font-headline font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span> Inscrito
            </div>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 relative overflow-hidden aspect-[21/9] rounded-sm group">
            <img 
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" 
              data-alt="A high-performance racing kart speeding around a professional asphalt track at dusk..."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB5ugz2TGs2-4YmqESERw-Xjw4A5PptRJ0bSmmTucji_scCgPajH7L5rcfopHW2OEAqPXY9Ilsx7jl_9dn4UQ0Snz8cxEi0D6P8Ulub-L2easKt2MCpusccMvBpSBjjniY2e-Xd9TaWUr-FVNQWgIT6hg6T1HF217C1gpYd3Ei89xI0x4RpdQwGwVZx_1_84ElgcDQEqNrrIl9YZCKl3yAem4BDv_tjq1-8IXjetnYmwQbU4g4ADAx771SpdYOFAh3zVN733_gjZ13"
              alt="Track hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                {champ.status === 'open' && (
                  <Badge variant="open" pulse className="mb-4">Inscripciones Abiertas</Badge>
                )}
                {champ.status === 'closed' && (
                  <Badge variant="closed" icon="lock" className="mb-4">Cerrado</Badge>
                )}
                {champ.status === 'ongoing' && (
                  <Badge variant="ongoing" icon="sync" pulse className="mb-4">En Curso</Badge>
                )}
                <h2 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-2">{champ.name}</h2>
                <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Circuito Profesional / Torneo</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container-low p-6 flex flex-col justify-between flex-1 relative overflow-hidden rounded-sm">
              <div className="relative z-10">
                <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4 block">Detalles del Torneo</span>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary-dim">calendar_today</span>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-label">Temporada</p>
                      <p className="font-headline text-lg font-bold">{champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-tertiary-fixed">groups</span>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-label">Parrilla Actual</p>
                      <p className="font-headline text-lg font-bold text-tertiary-fixed">{champ.participants?.length || 0} Pilotos Inscritos</p>
                    </div>
                  </div>
                  {champ.prize_label && (
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary-dim">emoji_events</span>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase font-label">Bolsa de Premios</p>
                        <p className="font-headline text-lg font-bold">{champ.prize_label}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_motorsports</span>
              </div>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Tabs */}
          <div className="flex mb-8 overflow-x-auto scrollbar-hide">
            <TabsList className="w-full md:w-auto flex">
              <TabsTrigger value="ranking" className="flex-1 md:flex-none">Ranking y Standings</TabsTrigger>
              <TabsTrigger value="fechas" className="flex-1 md:flex-none">Rondas del Campeonato</TabsTrigger>
              <TabsTrigger value="rules" className="flex-1 md:flex-none">Reglas e Info</TabsTrigger>
            </TabsList>
          </div>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8">
              <TabsContent value="ranking" className="fade-in mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-2xl font-bold uppercase tracking-tight mb-4">Standings Generales del Torneo</h3>
                </div>
                {champ.participants.length === 0 ? (
                  <div className="bg-surface-container-low p-10 text-center text-on-surface-variant font-label uppercase tracking-widest rounded-sm">
                    No hay pilotos inscritos en este torneo aún.
                  </div>
                ) : (
                  <div className="bg-surface-container-low overflow-hidden rounded-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high">
                          <th className="p-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant">Pos</th>
                          <th className="p-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant">Piloto</th>
                          <th className="p-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant text-right">Puntos Totales</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface-container-low">
                        {champ.participants.map((p, idx) => (
                          <tr key={p.user_id} className="group hover:bg-surface-container-highest/50 transition-colors">
                            <td className={`p-4 font-headline text-2xl font-bold ${idx === 0 ? 'text-tertiary-fixed text-glow-neon' : 'text-on-surface-variant'}`}>
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center rounded-sm transition-colors group-hover:text-primary-dim">
                                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-dim transition-colors">person</span>
                                </div>
                                <div>
                                  <p className="font-bold">@{p.profiles?.username || 'piloto'}</p>
                                  <span className="text-[11px] text-primary-dim uppercase font-label font-bold tracking-widest">
                                    {p.profiles?.full_name || 'Piloto'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right font-headline text-xl font-bold">{p.points || 0} pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fechas" className="flex flex-col gap-6">
                {/* Rounds List */}
                <div>
                  <h3 className="font-headline text-xl font-bold uppercase tracking-tight mb-6">Calendario de Fechas</h3>
                  <div className="space-y-4">
                    {champ.rounds.map((round, idx) => (
                      <div 
                        key={round.id}
                        onClick={() => handleSelectRound(idx)}
                        className={`p-4 rounded-sm cursor-pointer transition-all border-l-4 ${selectedRoundIdx === idx ? 'bg-surface-container border-primary-dim' : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container-high'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-[11px] uppercase font-bold tracking-widest ${round.completed ? 'text-tertiary-fixed' : 'text-primary-dim'}`}>
                            {round.completed ? 'Completada' : 'Activa'}
                          </span>
                          <span className="text-xs text-on-surface-variant font-label uppercase">Fecha {idx + 1}</span>
                        </div>
                        <h4 className="font-headline font-bold text-lg mb-3">{round.tracks?.name}</h4>
                        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span>{round.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round Details & Times */}
                <div className="pt-8 md:pt-0 md:pl-8">
                  {activeRound && (
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-headline text-xl font-bold uppercase tracking-tight mb-4">Ronda #{selectedRoundIdx + 1}</h3>
                          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-1">
                            Circuito: {activeRound.tracks?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">map</span>
                          <span>{activeRound.tracks?.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{activeRound.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-8">
                        {isCreator && !activeRound.completed && (
                          <button 
                            onClick={() => handleCompleteRound(activeRound.id)}
                            disabled={isCompletingRound}
                            className="bg-surface-container-highest text-on-surface font-headline font-bold uppercase py-4 px-6 text-xs tracking-widest hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-all disabled:opacity-50 flex justify-center items-center gap-2 rounded-sm"
                          >
                            <span className="material-symbols-outlined text-sm">flag</span>
                            {isCompletingRound ? 'Finalizando...' : 'Finalizar Fecha'}
                          </button>
                        )}
                        {isParticipant && !activeRound.completed && (
                          <KineticButton 
                            variant="contained"
                            color="primary"
                            onClick={() => setIsTimeModalOpen(true)}
                            className="font-headline font-bold uppercase py-2 px-4 text-xs tracking-widest flex justify-center items-center gap-2 rounded-sm"
                          >
                            <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '16px' }}>timer</span>
                            <span>Subir Mi Tiempo</span>
                          </KineticButton>
                        )}
                      </div>

                      <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Tiempos de la Fecha</h4>
                      
                      {isLoadingTimes ? (
                        <p className="text-on-surface-variant text-sm">Cargando tiempos...</p>
                      ) : roundTimes.length === 0 ? (
                        <p className="text-on-surface-variant text-sm italic">Nadie ha subido tiempos para esta ronda todavía.</p>
                      ) : (
                        <div className="bg-surface-container-low rounded-sm overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-surface-container-high">
                                <th className="p-2 font-headline text-[11px] uppercase tracking-widest text-on-surface-variant">Pos</th>
                                <th className="p-2 font-headline text-[11px] uppercase tracking-widest text-on-surface-variant">Piloto</th>
                                <th className="p-2 font-headline text-[11px] uppercase tracking-widest text-on-surface-variant">Tiempo</th>
                                <th className="p-2 font-headline text-[11px] uppercase tracking-widest text-on-surface-variant text-right">Pts</th>
                              </tr>
                            </thead>
                            <tbody className="bg-surface-container-low">
                              {roundTimes.map((time, idx) => (
                                <tr key={time.id} className="hover:bg-surface-container-highest/30 transition-colors">
                                  <td className={`p-2 font-headline font-bold ${idx === 0 ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`}>{idx + 1}</td>
                                  <td className="p-2 text-sm font-bold">@{time.profiles?.username || 'piloto'}</td>
                                  <td className="p-2 text-sm font-mono">{formatMsToTime(time.lap_time_ms)}</td>
                                  <td className="p-2 text-sm font-headline font-bold text-primary-dim text-right">{time.points || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rules" className="flex flex-col gap-6">
                <div className="space-y-6">
                  <div className="bg-surface-container-low p-6 rounded-sm">
                    <h4 className="font-headline font-bold uppercase tracking-widest mb-4">Acerca del Torneo</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      {champ.description || 'Sin descripción detallada disponible para este evento.'}
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-sm border-l-4 border-primary-dim">
                    <h4 className="font-headline font-bold uppercase tracking-widest mb-4">Puntajes de Ronda (Fórmula 1)</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      Al finalizar cada fecha, se otorgarán los siguientes puntos en base a los mejores tiempos de vuelta:
                      <br/><br/>
                      <span className="text-on-surface">1º: 25 pts | 2º: 18 pts | 3º: 15 pts | 4º: 12 pts | 5º: 10 pts</span>
                      <br/>
                      <span className="text-on-surface">6º: 8 pts | 7º: 6 pts | 8º: 4 pts | 9º: 2 pts | 10º: 1 pt</span>
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-high p-6 rounded-sm h-fit border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                  <h4 className="font-headline font-bold uppercase tracking-widest mb-4">Invitar Amigos</h4>
                  <p className="text-on-surface-variant text-xs mb-6">
                    Ingresa el correo electrónico de tu amigo para invitarlo a competir en este torneo. Le llegará un correo y podrá inscribirse.
                  </p>
                  <form onSubmit={handleInvite} className="flex flex-col gap-4">
                    <div>
                      <Input 
                        type="email" 
                        placeholder="amigo@correo.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        className="w-full bg-surface-container py-4 text-sm"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmittingInvite || !inviteEmail}
                      className="bg-surface-container-lowest border-none text-on-surface font-headline font-bold uppercase py-4 text-xs tracking-widest hover:bg-surface-container transition-all disabled:opacity-50 flex justify-center items-center gap-2 rounded-sm"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      {isSubmittingInvite ? 'Enviando...' : 'Enviar Invitación'}
                    </button>
                  </form>
                </div>
              </TabsContent>
            </div>

          {/* Side Actions & Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {!isParticipant && champ.status === 'open' && (
              <div className="bg-surface-container-highest p-6 relative overflow-hidden border-l-4 border-primary-dim rounded-r-sm">
                <h4 className="font-headline text-xl font-bold uppercase mb-4">Inscripción al Evento</h4>
                <p className="text-on-surface-variant text-sm mb-6">Asegura tu puesto en la parrilla de salida y compite por la victoria.</p>
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Costo de Inscripción</span>
                    <span className="font-bold text-on-surface">${champ.entry_fee ? Number(champ.entry_fee).toLocaleString() : '0'} COP</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant/30 w-full"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Estado de cupos</span>
                    <span className="text-tertiary-fixed font-bold">Abierto</span>
                  </div>
                </div>
                <KineticButton 
                  variant="contained"
                  color="primary"
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full font-headline font-bold uppercase py-4 text-sm tracking-widest hover:brightness-110 active:scale-95 transition-all rounded-sm disabled:opacity-50"
                >
                  {isJoining ? 'Procesando...' : 'Inscribirme Ahora'}
                </KineticButton>
                <p className="text-[10px] text-on-surface-variant mt-4 text-center leading-relaxed italic">
                  *Este pago corresponde al Race Pass para la bolsa de premios. NO incluye el costo de alquiler del kart en la pista.
                </p>
              </div>
            )}

            <div className="bg-surface-container p-6 rounded-sm">
              <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Información Técnica</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-6 rounded-sm">
                  <span className="text-[11px] uppercase font-label text-on-surface-variant">Nivel de Competencia</span>
                  <p className="font-headline text-lg font-bold text-tertiary-fixed truncate">{champ.level || 'Profesional'}</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-sm">
                  <span className="text-[11px] uppercase font-label text-on-surface-variant">Ubicación</span>
                  <p className="font-headline text-lg font-bold truncate">{champ.location || 'Múltiples'}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-center font-label text-[11px] uppercase tracking-[0.3em] text-on-surface-variant/40 mb-4">Powered by Velocity Engine</p>
              <div className="flex justify-center gap-8 opacity-30 grayscale contrast-125">
                <span className="material-symbols-outlined text-4xl">dynamic_form</span>
                <span className="material-symbols-outlined text-4xl">precision_manufacturing</span>
                <span className="material-symbols-outlined text-4xl">speed</span>
              </div>
            </div>
          </div>
        </section>
        </Tabs>
      </main>

      {/* Time Entry Modal */}
      {isTimeModalOpen && activeRound && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-high border-none p-6 w-full max-w-md rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] relative fade-in">
            <button 
              onClick={() => setIsTimeModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-2xl font-bold uppercase tracking-tight mb-4">Registrar Tiempo</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Fecha #{selectedRoundIdx + 1} - {activeRound.tracks?.name}
            </p>
            
            {timeError && (
              <div className="bg-error-container/20 border-none text-error px-4 py-2 rounded-sm mb-6 text-sm">
                {timeError}
              </div>
            )}

            <form onSubmit={handleRegisterTime} className="flex flex-col gap-6">
              <div>
                <label className="block font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Tu mejor tiempo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">timer</span>
                  <Input 
                    type="text" 
                    placeholder="Ej: 00:44.520 o 44.520" 
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    required 
                    className="w-full font-mono pl-12 py-4" 
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2 font-mono">Formato: mm:ss.SSS o ss.SSS</p>
              </div>
              
              <div>
                <label className="block font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Foto del Ticket (Opcional)
                </label>
                <div className="border-2 border-dashed border-outline-variant/30 rounded-sm p-8 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                  <span className="material-symbols-outlined mb-2 text-2xl">add_a_photo</span>
                  <span className="text-xs uppercase tracking-widest">Subir Imagen</span>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsTimeModalOpen(false)} 
                  disabled={isSubmittingTime}
                  className="px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancelar
                </button>
                <KineticButton 
                  type="submit" 
                  variant="contained"
                  color="primary"
                  disabled={isSubmittingTime}
                  className="px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingTime ? (
                    <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span> Registrando</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> Guardar Tiempo</>
                  )}
                </KineticButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
