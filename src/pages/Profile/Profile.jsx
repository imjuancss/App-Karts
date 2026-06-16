import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getUserLapTimes, registerLapTime, getTracks, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';
import { Input } from '../../components/ui/input';
import { SelectNative } from '../../components/ui/select-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';
import Auth from '../Auth/Auth';

const formatMsToTime = (ms) => {
  if (!ms || ms === Infinity) return "00:00.000";
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

function StatCard({ label, icon, iconClassName, children, accent }) {
  return (
    <div className={`bg-surface-container-low p-6 rounded-sm flex flex-col gap-4 transition-all hover:bg-surface-container ${accent ? 'border-l-2 border-primary' : ''}`}>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase">{label}</span>
        <span className={`material-symbols-outlined text-xl ${iconClassName}`}>{icon}</span>
      </div>
      {children}
    </div>
  );
}

function ListRow({ icon, title, subtitle, trailing, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-3 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-sm group-hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-headline font-bold text-sm tracking-tight group-hover:text-primary transition-colors uppercase">{title}</p>
          {subtitle && (
            <p className="text-[9px] font-label text-on-surface-variant tracking-wider uppercase">{subtitle}</p>
          )}
        </div>
      </div>
      {trailing}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('campeonatos');
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userTimes, setUserTimes] = useState([]);
  const [userChampionships, setUserChampionships] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');

  const loadData = async (user) => {
    try {
      setIsLoading(true);
      let p = await getProfile(user.id);
      
      if (!p) {
        const usernameBase = user.email ? user.email.split('@')[0] : 'piloto';
        const { data } = await supabase.from('profiles').insert([{
          id: user.id,
          username: usernameBase + Math.floor(Math.random() * 1000),
          full_name: user.user_metadata?.full_name || 'Piloto Nuevo'
        }]).select().single();
        
        p = data || { id: user.id, full_name: user.user_metadata?.full_name || 'Piloto Nuevo', username: usernameBase };
      }
      setUserProfile(p);

      const times = await getUserLapTimes(user.id);
      setUserTimes(times || []);

      if (user.email) {
        const invites = await getPendingInvitations(user.email);
        setPendingInvites(invites || []);
      }

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

      const tracks = await getTracks();
      setAllTracks(tracks || []);
      if (tracks && tracks.length > 0) {
        setSelectedTrackId(tracks[0].id);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      try {
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
      } catch (error) {
        console.error("Error loading session:", error);
        setIsLoading(false);
      }
    }
    
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
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !sessionUser) return;

    const tab = searchParams.get('tab');
    const shouldUpload = searchParams.get('subir-tiempo') === '1';

    if (tab === 'tiempos' || shouldUpload) {
      setActiveTab('tiempos');
    }

    if (shouldUpload) {
      setIsTimeModalOpen(true);
    }

    if (tab || shouldUpload) {
      setSearchParams({}, { replace: true });
    }
  }, [isLoading, sessionUser, searchParams, setSearchParams]);

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
      
      setTimeInput('');
      setIsTimeModalOpen(false);

      if (sessionUser) {
        const times = await getUserLapTimes(sessionUser.id);
        setUserTimes(times || []);
      }
      window.dispatchEvent(new Event('lap-times-updated'));
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
      
      if (sessionUser) {
        await loadData(sessionUser);
      }
    } catch (error) {
      console.error("Error al aceptar invitación:", error);
      alert("Hubo un problema al aceptar la invitación.");
    }
  };

  if (isLoading) return (
    <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-primary" size={36} />
      <span className="text-on-surface-variant font-label tracking-widest uppercase text-sm">Cargando perfil...</span>
    </div>
  );

  if (!sessionUser || !userProfile) {
    return <Auth />;
  }

  const fastestLapMs = userTimes.length > 0 ? Math.min(...userTimes.map(t => t.lap_time_ms)) : null;
  const totalPoints = userChampionships.reduce((a,c) => a + (c.points || 0), 0);
  const userLevel = Math.floor(totalPoints / 100) + 1;

  return (
    <div className="text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <section className="relative w-full h-[300px] md:h-[480px] overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
          <img 
            alt="Hero Profile" 
            className="w-full h-full object-cover object-top brightness-75 grayscale-[0.2]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtypMzZ2sYCtTttlHvo6uSC83NO7eQ95fPqciLokYXmMOZbPJqmxXWw0Vu5-Pj7TvGEYnZ09vGOx55r-ROicmd7l7ZRIo8eAwvEQPFe-VdkBiY-Y7r6kepIVHK7uLrAzLGLJJL7Y9xwItjLi0bOJ8fgKG36sdmx-edj9x48N0Vxb62f66jci7s-B-p0upE4gQhRY6_YJYHkutoPIpq2xkyETbTbUFKvo8Qfaya1EMt73H-qKepJDn9Y-G9ehbheX4NARfgQH2WhVlE"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 md:left-8 md:right-8">
          <div className="flex flex-col gap-3 max-w-7xl mx-auto">
            <div className="inline-flex self-start px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-[0.2em] rounded-sm">
              NIVEL {userLevel}
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold italic tracking-tighter text-on-surface uppercase leading-none truncate flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-dim text-4xl md:text-5xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              {userProfile.full_name || 'PILOTO'}
            </h1>
            <p className="text-primary font-headline font-medium tracking-widest text-sm opacity-80 uppercase truncate">
              @{userProfile.username || 'USUARIO'} // {userProfile.location || 'BOGOTÁ, COLOMBIA'}
            </p>
          </div>
        </div>
      </section>

      <PageContainer compact className="pt-6 md:pt-8 pb-16">
        {pendingInvites.length > 0 && (
          <ContentSection className="p-4 border border-tertiary-fixed/30 bg-tertiary-fixed/5 rounded-sm fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-fixed">mail</span>
              <h3 className="font-headline font-bold text-tertiary-fixed uppercase tracking-widest text-sm">¡Invitaciones Pendientes!</h3>
            </div>
            <div className="flex flex-col gap-3">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-sm">
                  <span className="font-label text-sm uppercase">Campeonato: <strong className="text-white">{invite.championships?.name}</strong></span>
                  <button 
                    className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                    onClick={() => handleAcceptInvite(invite.id, invite.championship_id, invite.championships?.name)}
                  >
                    Aceptar y Unirme
                  </button>
                </div>
              ))}
            </div>
          </ContentSection>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <StatCard label="CAMPEONATOS" icon="emoji_events" iconClassName="text-primary" accent>
            <div className="text-4xl font-display font-bold">{userChampionships.length}</div>
          </StatCard>
          <StatCard label="MEJOR VUELTA" icon="timer" iconClassName="text-tertiary-fixed">
            <div className="text-4xl font-display font-bold text-tertiary-fixed">{formatMsToTime(fastestLapMs)}</div>
          </StatCard>
          <StatCard label="PUNTOS TOTALES" icon="analytics" iconClassName="text-on-surface-variant">
            <div className="flex flex-col gap-4">
              <div className="text-4xl font-display font-bold">{totalPoints}</div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(100, (totalPoints % 100))}%`, boxShadow: '0 0 10px rgba(255,143,119,0.5)' }}
                />
              </div>
            </div>
          </StatCard>
        </section>

        <ContentSection className="w-full max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center overflow-x-auto scrollbar-hide gap-4">
              <TabsList className="w-full md:w-auto flex shrink-0">
                <TabsTrigger value="campeonatos" className="flex-1 md:flex-none">MIS CAMPEONATOS</TabsTrigger>
                <TabsTrigger value="tiempos" className="flex-1 md:flex-none">MIS TIEMPOS</TabsTrigger>
              </TabsList>
              <div className="h-px flex-grow bg-outline-variant/30 hidden md:block" />
            </div>

            <TabsContent value="campeonatos">
              <div className="flex flex-col gap-4">
                {userChampionships.length === 0 ? (
                  <p className="text-on-surface-variant text-sm font-label uppercase">NO ESTÁS INSCRITO A NINGÚN CAMPEONATO.</p>
                ) : (
                  userChampionships.map(uc => (
                    <ListRow
                      key={uc.championship_id}
                      icon="emoji_events"
                      title={uc.championships?.name}
                      subtitle={`ESTADO: ${uc.championships?.status} • ${uc.points} PUNTOS`}
                      trailing={<span className="material-symbols-outlined text-tertiary-fixed text-sm">arrow_forward_ios</span>}
                      onClick={() => navigate(`/championships/${uc.championship_id}`)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="tiempos">
              <div className="flex flex-col gap-4">
                {userTimes.length === 0 ? (
                  <p className="text-on-surface-variant text-sm font-label uppercase">NO HAS REGISTRADO NINGÚN TIEMPO.</p>
                ) : (
                  userTimes.map(time => (
                    <ListRow
                      key={time.id}
                      icon="timer"
                      title={time.tracks?.name}
                      subtitle={time.tracks?.location}
                      trailing={<span className="font-display font-bold text-tertiary-fixed tracking-wider">{formatMsToTime(time.lap_time_ms)}</span>}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ContentSection>

        <ContentSection className="w-full max-w-lg">
          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="bg-surface-container-highest p-6 rounded-sm text-left flex items-center justify-between active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col gap-1">
              <p className="font-headline font-bold tracking-[0.1em] text-primary uppercase">REGISTRAR TIEMPO</p>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">AÑADIR NUEVO RÉCORD DE VUELTA</p>
            </div>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">add_circle</span>
          </button>

          <button
            type="button"
            onClick={async () => await supabase.auth.signOut()}
            className="bg-surface-container-highest p-6 rounded-sm text-left flex items-center justify-between active:scale-95 transition-all group"
          >
            <div className="flex flex-col gap-1">
              <p className="font-headline font-bold tracking-[0.1em] text-error uppercase">CERRAR SESIÓN</p>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">SALIR DE LA CUENTA ACTUAL</p>
            </div>
            <span className="material-symbols-outlined text-error group-hover:translate-x-2 transition-transform">logout</span>
          </button>
        </ContentSection>
      </PageContainer>

      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-high p-6 w-full max-w-md rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl uppercase tracking-widest text-white">REGISTRAR TIEMPO</h3>
              <button type="button" onClick={() => setIsTimeModalOpen(false)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {timeError && (
              <div className="bg-error/10 border border-error/50 p-3 rounded-sm">
                <p className="text-error font-label text-xs uppercase tracking-wider">{timeError}</p>
              </div>
            )}

            <form onSubmit={handleRegisterLapTime} className="flex flex-col gap-6">
              <FormSection maxWidth="full">
                <div className="flex flex-col gap-2">
                  <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest">CIRCUITO</label>
                  <SelectNative 
                    value={selectedTrackId} 
                    onChange={e => setSelectedTrackId(e.target.value)} 
                    required
                    className="w-full"
                  >
                    <option value="" disabled>SELECCIONA UNA PISTA...</option>
                    {allTracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
                    ))}
                  </SelectNative>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest">TIEMPO (MM:SS.SSS O SS.SSS)</label>
                  <Input 
                    type="text" 
                    placeholder="00:44.520" 
                    value={timeInput} 
                    onChange={e => setTimeInput(e.target.value)} 
                    required 
                    className="w-full text-tertiary-fixed font-display font-bold tracking-widest text-xl placeholder:text-outline-variant" 
                  />
                </div>
              </FormSection>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTimeModalOpen(false)} 
                  disabled={isSubmittingTime}
                  className="px-6 py-3 font-headline font-bold uppercase tracking-widest text-sm text-on-surface hover:bg-surface-variant transition-colors rounded-sm"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingTime}
                  className="px-6 py-3 bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmittingTime ? <Loader2 className="animate-spin" size={16} /> : 'REGISTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
