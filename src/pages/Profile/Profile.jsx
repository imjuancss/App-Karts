import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getUserLapTimes, registerLapTime, getTracks, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';
import { Input } from '../../components/ui/input';
import { SelectNative } from '../../components/ui/select-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

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
    try {
      setIsLoading(true);
      let p = await getProfile(user.id);
      
      // Si por alguna razón el trigger falló, intentamos crearlo manualmente
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

      // Cargar tiempos de vuelta
      const times = await getUserLapTimes(user.id);
      setUserTimes(times || []);

      // Cargar invitaciones pendientes
      if (user.email) {
        const invites = await getPendingInvitations(user.email);
        setPendingInvites(invites || []);
      }

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
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-2 uppercase">Aún no has iniciado sesión</h2>
        <p className="text-on-surface-variant font-body mb-8">Conéctate o vuelve a iniciar sesión con tu cuenta.</p>
        <button onClick={() => navigate('/login')} className="bg-primary text-on-primary px-8 py-3 rounded-sm font-headline font-bold uppercase tracking-widest active:scale-95 transition-transform">
          Iniciar Sesión / Registro
        </button>
      </div>
    );
  }

  const fastestLapMs = userTimes.length > 0 ? Math.min(...userTimes.map(t => t.lap_time_ms)) : null;
  const totalPoints = userChampionships.reduce((a,c) => a + (c.points || 0), 0);
  const userLevel = Math.floor(totalPoints / 100) + 1;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen pb-16">
      
      {/* Banner Invitaciones */}
      {pendingInvites.length > 0 && (
        <div className="mx-6 mt-6 p-4 border border-tertiary-fixed/30 bg-tertiary-fixed/5 rounded-sm fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary-fixed">mail</span>
            <h3 className="font-headline font-bold text-tertiary-fixed uppercase tracking-widest text-sm">¡Invitaciones Pendientes!</h3>
          </div>
          <div className="space-y-3">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3 rounded-sm">
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
        </div>
      )}

      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative w-full h-[300px] md:h-[530px] overflow-hidden">
          <div className="absolute inset-0" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
            <img 
              alt="Hero Profile" 
              className="w-full h-full object-cover object-top brightness-75 grayscale-[0.2]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtypMzZ2sYCtTttlHvo6uSC83NO7eQ95fPqciLokYXmMOZbPJqmxXWw0Vu5-Pj7TvGEYnZ09vGOx55r-ROicmd7l7ZRIo8eAwvEQPFe-VdkBiY-Y7r6kepIVHK7uLrAzLGLJJL7Y9xwItjLi0bOJ8fgKG36sdmx-edj9x48N0Vxb62f66jci7s-B-p0upE4gQhRY6_YJYHkutoPIpq2xkyETbTbUFKvo8Qfaya1EMt73H-qKepJDn9Y-G9ehbheX4NARfgQH2WhVlE"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-6 right-6">
            <div className="inline-block px-2 py-1 mb-3 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-[0.2em] rounded-sm">
              NIVEL {userLevel}
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold italic tracking-tighter text-on-surface uppercase leading-none truncate">
              {userProfile.full_name || 'PILOTO'}
            </h1>
            <p className="mt-2 text-primary font-headline font-medium tracking-widest text-sm opacity-80 uppercase truncate">
              @{userProfile.username || 'USUARIO'} // {userProfile.location || 'BOGOTÁ, COLOMBIA'}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="px-6 -mt-4 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container-low p-5 rounded-sm border-l-2 border-primary transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase">CAMPEONATOS</span>
              <span className="material-symbols-outlined text-primary text-xl">emoji_events</span>
            </div>
            <div className="text-4xl font-display font-bold">{userChampionships.length}</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-sm transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase">MEJOR VUELTA</span>
              <span className="material-symbols-outlined text-tertiary-fixed text-xl">timer</span>
            </div>
            <div className="text-4xl font-display font-bold text-tertiary-fixed">{formatMsToTime(fastestLapMs)}</div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-sm transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase">PUNTOS TOTALES</span>
              <span className="material-symbols-outlined text-on-surface-variant text-xl">analytics</span>
            </div>
            <div className="text-4xl font-display font-bold">{totalPoints}</div>
            <div className="mt-4 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (totalPoints % 100))}%`, boxShadow: '0 0 10px rgba(255,143,119,0.5)' }}></div>
            </div>
          </div>
        </section>

        {/* Action Tabs & Content */}
        <section className="mt-12 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center mb-6 overflow-x-auto scrollbar-hide">
              <TabsList className="w-full md:w-auto flex">
                <TabsTrigger value="campeonatos" className="flex-1 md:flex-none">MIS CAMPEONATOS</TabsTrigger>
                <TabsTrigger value="tiempos" className="flex-1 md:flex-none">MIS TIEMPOS</TabsTrigger>
              </TabsList>
              <div className="h-[1px] flex-grow bg-outline-variant/30 hidden md:block ml-4"></div>
            </div>

            <TabsContent value="campeonatos" className="space-y-4 mt-0">
              {userChampionships.length === 0 ? (
                <p className="text-on-surface-variant text-sm font-label uppercase">NO ESTÁS INSCRITO A NINGÚN CAMPEONATO.</p>
              ) : (
                userChampionships.map(uc => (
                  <div key={uc.championship_id} onClick={() => navigate(`/championships/${uc.championship_id}`)} className="flex items-center justify-between py-3 border-b border-outline-variant/10 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-sm group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">emoji_events</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm tracking-tight group-hover:text-primary transition-colors uppercase">{uc.championships?.name}</p>
                        <p className="text-[9px] font-label text-on-surface-variant tracking-wider uppercase">ESTADO: {uc.championships?.status} • {uc.points} PUNTOS</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-tertiary-fixed text-sm">arrow_forward_ios</span>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="tiempos" className="space-y-4 mt-0">
              {userTimes.length === 0 ? (
                <p className="text-on-surface-variant text-sm font-label uppercase">NO HAS REGISTRADO NINGÚN TIEMPO.</p>
              ) : (
                userTimes.map(time => (
                  <div key={time.id} className="flex items-center justify-between py-3 border-b border-outline-variant/10 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-sm group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">timer</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm tracking-tight group-hover:text-primary transition-colors uppercase">{time.tracks?.name}</p>
                        <p className="text-[9px] font-label text-on-surface-variant tracking-wider uppercase">{time.tracks?.location}</p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-tertiary-fixed tracking-wider">{formatMsToTime(time.lap_time_ms)}</span>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Technical Action Cards */}
        <section className="mt-12 px-6 grid grid-cols-1 gap-4">
          <button onClick={() => setIsTimeModalOpen(true)} className="bg-surface-container-highest p-6 rounded-sm text-left flex items-center justify-between active:scale-95 transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <p className="font-headline font-bold tracking-[0.1em] text-primary uppercase">REGISTRAR TIEMPO</p>
              <p className="text-[10px] text-on-surface-variant tracking-widest mt-1 uppercase">AÑADIR NUEVO RÉCORD DE VUELTA</p>
            </div>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">add_circle</span>
          </button>
          
          <button onClick={async () => await supabase.auth.signOut()} className="bg-surface-container-highest p-6 rounded-sm text-left flex items-center justify-between active:scale-95 transition-all group">
            <div>
              <p className="font-headline font-bold tracking-[0.1em] text-error uppercase">CERRAR SESIÓN</p>
              <p className="text-[10px] text-on-surface-variant tracking-widest mt-1 uppercase">SALIR DE LA CUENTA ACTUAL</p>
            </div>
            <span className="material-symbols-outlined text-error group-hover:translate-x-2 transition-transform">logout</span>
          </button>
        </section>
      </main>

      {/* Modal Registrar Tiempo */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-high p-6 w-full max-w-md rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl uppercase tracking-widest text-white">REGISTRAR TIEMPO</h3>
              <button onClick={() => setIsTimeModalOpen(false)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {timeError && (
              <div className="bg-error/10 border border-error/50 p-3 mb-6 rounded-sm">
                <p className="text-error font-label text-xs uppercase tracking-wider">{timeError}</p>
              </div>
            )}
            
            <form onSubmit={handleRegisterLapTime}>
              <div className="mb-6">
                <label className="block text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">CIRCUITO</label>
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
              <div className="mb-8">
                <label className="block text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">TIEMPO (MM:SS.SSS O SS.SSS)</label>
                <Input 
                  type="text" 
                  placeholder="00:44.520" 
                  value={timeInput} 
                  onChange={e => setTimeInput(e.target.value)} 
                  required 
                  className="w-full text-tertiary-fixed font-display font-bold tracking-widest text-xl placeholder:text-outline-variant" 
                />
              </div>
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
