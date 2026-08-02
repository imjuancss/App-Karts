import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getChampionshipById, getRoundTimes, registerRoundTime, completeRound, joinChampionship, inviteToChampionship, deleteChampionship, getProfile } from '../../services/api';
import { formatMsToTime, formatTimeInput, parseTimeToMs } from '../../lib/formatters';
import { useToast } from '../../components/ui/toast';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import KineticButton from '../../components/ui/KineticButton';
import HeroHeader from '../../components/ui/HeroHeader';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';
import ConfirmModal from '../../components/modals/ConfirmModal';

export default function ChampionshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ranking');
  const [champ, setChamp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [roundTimes, setRoundTimes] = useState([]);
  
  const [confirmCompleteRoundId, setConfirmCompleteRoundId] = useState(null);
  const [showDeleteChampModal, setShowDeleteChampModal] = useState(false);
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
    const user = session?.user || null;
    setSessionUser(user);
    if (user) {
      const profile = await getProfile(user.id);
      setIsAdmin(profile?.role === 'admin');
    }

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
    setTimeout(() => loadChampionshipData(), 0);
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
      toast({ title: 'Sesión requerida', description: 'Debes iniciar sesión para inscribirte', variant: 'error' });
      navigate('/login');
      return;
    }
    setIsJoining(true);
    try {
      await joinChampionship(champ.id);
      toast({ title: '¡Inscrito!', description: 'Te has inscrito exitosamente en el campeonato', variant: 'success' });
      await setTimeout(() => loadChampionshipData(), 0);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Ocurrió un error al inscribirte', variant: 'error' });
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
      toast({
        title: '¡Tiempo guardado exitosamente!',
        description: '¡Tiempo enviado exitosamente para la ronda!',
        variant: 'success'
      });
    } catch (err) {
      console.error(err);
      setTimeError('Error al subir el tiempo.');
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
      toast({ title: 'Invitación enviada', description: `Se guardó la invitación para ${inviteEmail}`, variant: 'success' });
      setInviteEmail('');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Error al enviar la invitación', variant: 'error' });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const executeCompleteRound = async () => {
    if (!confirmCompleteRoundId) return;
    const roundId = confirmCompleteRoundId;
    setConfirmCompleteRoundId(null);
    setIsCompletingRound(true);
    try {
      await completeRound(champ.id, roundId);
      toast({ title: '¡Ronda finalizada!', description: 'Leaderboard general actualizado', variant: 'success' });
      await loadChampionshipData();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Error al finalizar la ronda', variant: 'error' });
    } finally {
      setIsCompletingRound(false);
    }
  };

  const handleCompleteRound = (roundId) => {
    setConfirmCompleteRoundId(roundId);
  };

  if (isLoading) {
    return (
      <PageContainer compact className="min-h-[40vh] items-center justify-center fade-in">
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Cargando información del evento...</p>
      </PageContainer>
    );
  }
  if (!champ) {
    return (
      <PageContainer compact className="min-h-[40vh] items-center justify-center fade-in">
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Campeonato no encontrado.</p>
      </PageContainer>
    );
  }

  const isCreator = sessionUser && sessionUser.id === champ.creator_id;
  const canEdit = isCreator || isAdmin;
  const isParticipant = sessionUser && champ.participants.some(p => p.user_id === sessionUser.id);
  const activeRound = champ.rounds[selectedRoundIdx] || null;

  const statusBadge = {
    open: { text: 'Inscripciones Abiertas', variant: 'open' },
    closed: { text: 'Cerrado', variant: 'closed' },
    ongoing: { text: 'En Curso', variant: 'ongoing' },
  }[champ.status] ?? null;

  const heroImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB5ugz2TGs2-4YmqESERw-Xjw4A5PptRJ0bSmmTucji_scCgPajH7L5rcfopHW2OEAqPXY9Ilsx7jl_9dn4UQ0Snz8cxEi0D6P8Ulub-L2easKt2MCpusccMvBpSBjjniY2e-Xd9TaWUr-FVNQWgIT6hg6T1HF217C1gpYd3Ei89xI0x4RpdQwGwVZx_1_84ElgcDQEqNrrIl9YZCKl3yAem4BDv_tjq1-8IXjetnYmwQbU4g4ADAx771SpdYOFAh3zVN733_gjZ13';

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-dim/30 min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-[72px] md:top-0 left-0 md:left-72 right-0 z-40 bg-background/80 backdrop-blur-xl h-20 border-b border-outline-variant/10 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <button 
              aria-label="Volver a campeonatos"
              title="Volver a campeonatos"
              onClick={() => navigate('/championships')}
              className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-highest transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            {canEdit && (
              <button 
                aria-label="Editar campeonato"
                title="Editar campeonato"
                onClick={() => navigate(`/championships/edit/${champ.id}`)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary-dim transition-colors mr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span className="font-headline font-bold uppercase text-xs tracking-widest">Editar</span>
              </button>
            )}
            <div className="flex flex-col items-end gap-1">
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
            {isCreator && (
              <button
                type="button"
                aria-label="Eliminar campeonato"
                title="Eliminar campeonato"
                onClick={() => setShowDeleteChampModal(true)}
                className="text-error hover:text-error/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error rounded-sm p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <PageContainer compact className="pt-24 pb-12">
        <HeroHeader
          title={champ.name}
          subtitle="Circuito Profesional / Torneo"
          imageUrl={heroImageUrl}
          badgeText={statusBadge?.text}
          badgeVariant={statusBadge?.variant}
        >
          <div className="bg-surface-container-low p-6 flex flex-col justify-between flex-1 relative overflow-hidden rounded-sm h-full">
            <ContentSection className="relative z-10">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Detalles del Torneo</span>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-dim">calendar_today</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-on-surface-variant uppercase font-label">Temporada</p>
                    <p className="font-headline text-lg font-bold">{champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-tertiary-fixed">groups</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-on-surface-variant uppercase font-label">Parrilla Actual</p>
                    <p className="font-headline text-lg font-bold text-tertiary-fixed">{champ.participants?.length || 0} Pilotos Inscritos</p>
                  </div>
                </div>
                {champ.prize_label && (
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary-dim">emoji_events</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-on-surface-variant uppercase font-label">Bolsa de Premios</p>
                      <p className="font-headline text-lg font-bold">{champ.prize_label}</p>
                    </div>
                  </div>
                )}
              </div>
            </ContentSection>
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_motorsports</span>
            </div>
          </div>
        </HeroHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex overflow-x-auto scrollbar-hide">
            <TabsList className="w-full md:w-auto flex shrink-0">
              <TabsTrigger value="ranking" className="flex-1 md:flex-none">Ranking y Standings</TabsTrigger>
              <TabsTrigger value="fechas" className="flex-1 md:flex-none">Rondas del Campeonato</TabsTrigger>
              <TabsTrigger value="rules" className="flex-1 md:flex-none">Reglas e Info</TabsTrigger>
            </TabsList>
          </div>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            <div className="lg:col-span-8 flex flex-col gap-6">
              <TabsContent value="ranking" className="fade-in">
                <ContentSection>
                  <h3 className="font-headline text-2xl font-bold uppercase tracking-tight">Standings Generales del Torneo</h3>
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
                </ContentSection>
              </TabsContent>

              <TabsContent value="fechas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <ContentSection>
                    <h3 className="font-headline text-xl font-bold uppercase tracking-tight">Calendario de Fechas</h3>
                    <div className="flex flex-col gap-4">
                      {champ.rounds.map((round, idx) => (
                        <div 
                          key={round.id}
                          onClick={() => handleSelectRound(idx)}
                          className={`p-4 rounded-sm cursor-pointer transition-all border-l-4 flex flex-col gap-3 ${selectedRoundIdx === idx ? 'bg-surface-container border-primary-dim' : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container-high'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] uppercase font-bold tracking-widest ${round.completed ? 'text-tertiary-fixed' : 'text-primary-dim'}`}>
                              {round.completed ? 'Completada' : 'Activa'}
                            </span>
                            <span className="text-xs text-on-surface-variant font-label uppercase">Fecha {idx + 1}</span>
                          </div>
                          <h4 className="font-headline font-bold text-lg">{round.tracks?.name}</h4>
                          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>{round.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ContentSection>

                  <ContentSection>
                  {activeRound && (
                    <>
                      <div className="flex flex-col gap-3">
                        <h3 className="font-headline text-xl font-bold uppercase tracking-tight">Ronda #{selectedRoundIdx + 1}</h3>
                        <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">
                          Circuito: {activeRound.tracks?.name}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">map</span>
                          <span>{activeRound.tracks?.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{activeRound.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
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

                      <ContentSection>
                      <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">Tiempos de la Fecha</h4>
                      
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
                      </ContentSection>
                    </>
                  )}
                  </ContentSection>
                </div>
              </TabsContent>

              <TabsContent value="rules">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                  <ContentSection className="lg:col-span-7">
                    <div className="bg-surface-container-low p-6 rounded-sm flex flex-col gap-4">
                      <h4 className="font-headline font-bold uppercase tracking-widest">Acerca del Torneo</h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {champ.description || 'Sin descripción detallada disponible para este evento.'}
                      </p>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-sm border-l-4 border-primary-dim flex flex-col gap-4">
                      <h4 className="font-headline font-bold uppercase tracking-widest">Puntajes de Ronda (Fórmula 1)</h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        Al finalizar cada fecha, se otorgarán los siguientes puntos en base a los mejores tiempos de vuelta:
                        <br/><br/>
                        <span className="text-on-surface">1º: 25 pts | 2º: 18 pts | 3º: 15 pts | 4º: 12 pts | 5º: 10 pts</span>
                        <br/>
                        <span className="text-on-surface">6º: 8 pts | 7º: 6 pts | 8º: 4 pts | 9º: 2 pts | 10º: 1 pt</span>
                      </p>
                    </div>
                  </ContentSection>

                  <div className="lg:col-span-5 bg-surface-container-high p-6 rounded-sm h-fit shadow-[0_0_40px_rgba(255,255,255,0.02)] flex flex-col gap-4">
                    <h4 className="font-headline font-bold uppercase tracking-widest">Invitar Amigos</h4>
                    <p className="text-on-surface-variant text-xs">
                      Ingresa el correo electrónico de tu amigo para invitarlo a competir en este torneo. Le llegará un correo y podrá inscribirse.
                    </p>
                    <form onSubmit={handleInvite} className="flex flex-col gap-4">
                      <Input 
                        type="email" 
                        aria-label="Correo electrónico para invitar"
                        placeholder="amigo@correo.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        className="w-full bg-surface-container py-4 text-sm"
                      />
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
                </div>
              </TabsContent>
            </div>

          {/* Side Actions & Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {!isParticipant && champ.status === 'open' && (
              <div className="bg-surface-container-highest p-6 relative overflow-hidden border-l-4 border-primary-dim rounded-r-sm flex flex-col gap-4">
                <h4 className="font-headline text-xl font-bold uppercase">Inscripción al Evento</h4>
                <p className="text-on-surface-variant text-sm">Asegura tu puesto en la parrilla de salida y compite por la victoria.</p>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Costo de Inscripción</span>
                    <span className="font-bold text-on-surface">${champ.entry_fee ? Number(champ.entry_fee).toLocaleString() : '0'} COP</span>
                  </div>
                  <div className="h-px bg-outline-variant/30 w-full" />
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
                <p className="text-[10px] text-on-surface-variant text-center leading-relaxed italic">
                  *Este pago corresponde al Race Pass para la bolsa de premios. NO incluye el costo de alquiler del kart en la pista.
                </p>
              </div>
            )}

            <div className="bg-surface-container p-6 rounded-sm flex flex-col gap-4">
              <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Información Técnica</h4>
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

            <div className="flex flex-col gap-4 pt-8">
            </div>
          </div>
        </section>
        </Tabs>
      </PageContainer>

      {/* Time Entry Modal */}
      {isTimeModalOpen && activeRound && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:pb-4">
          <div className="bg-surface-container-high border-none p-6 w-full max-w-md rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] relative fade-in flex flex-col gap-6">
            <button 
              type="button"
              title="Cerrar modal"
              aria-label="Cerrar modal"
              title="Cerrar modal"
              onClick={() => setIsTimeModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex flex-col gap-3 pr-8">
              <h3 className="font-headline text-2xl font-bold uppercase tracking-tight">Registrar Tiempo</h3>
              <p className="text-on-surface-variant text-sm">
                Fecha #{selectedRoundIdx + 1} - {activeRound.tracks?.name}
              </p>
            </div>
            
            {timeError && (
              <div className="bg-error-container/20 border-none text-error px-4 py-2 rounded-sm text-sm">
                {timeError}
              </div>
            )}

            <form onSubmit={handleRegisterTime} className="flex flex-col gap-6">
              <FormSection maxWidth="full">
                <div className="flex flex-col gap-2">
                  <label htmlFor="time-input" className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Tu mejor tiempo
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">timer</span>
                    <Input 
                      id="time-input"
                      type="text" 
                      placeholder="Ej: 0:44.520" 
                      value={timeInput}
                      onChange={e => setTimeInput(formatTimeInput(e.target.value))}
                      required 
                      className="w-full font-mono pl-12 py-4" 
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-mono">Formato: mm:ss.SSS o ss.SSS</p>
                </div>
              
                <div className="flex flex-col gap-2">
                  <label className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Foto del Ticket (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-outline-variant/30 rounded-sm p-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                    <span className="text-xs uppercase tracking-widest">Subir Imagen</span>
                  </div>
                </div>
              </FormSection>

              <div className="flex justify-end gap-4">
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

      {/* Modal para confirmar finalización de fecha */}
      <ConfirmModal
        isOpen={Boolean(confirmCompleteRoundId)}
        onClose={() => setConfirmCompleteRoundId(null)}
        onConfirm={executeCompleteRound}
        isLoading={isCompletingRound}
        title="FINALIZAR FECHA"
        description="¿Estás seguro de finalizar esta fecha? Esto calculará los puntos de la ronda para todos los pilotos y actualizará el Leaderboard general del torneo."
        confirmText="FINALIZAR FECHA"
        cancelText="CANCELAR"
        variant="warning"
      />

      {/* Modal para eliminar campeonato */}
      <ConfirmModal
        isOpen={showDeleteChampModal}
        onClose={() => setShowDeleteChampModal(false)}
        onConfirm={async () => {
          setShowDeleteChampModal(false);
          try {
            await deleteChampionship(champ.id);
            toast({ title: 'Campeonato eliminado', description: 'El campeonato fue eliminado correctamente', variant: 'success' });
            navigate('/championships');
          } catch {
            toast({ title: 'Error', description: 'No se pudo eliminar el campeonato', variant: 'error' });
          }
        }}
        title="ELIMINAR CAMPEONATO"
        description="¿Estás seguro de eliminar este campeonato? Esta acción no se puede deshacer y borrará todas las rondas y puntuaciones registradas."
        confirmText="ELIMINAR CAMPEONATO"
        cancelText="CANCELAR"
        variant="destructive"
      />
    </div>
  );
}
