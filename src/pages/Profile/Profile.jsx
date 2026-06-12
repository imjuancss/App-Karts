import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Calendar, MessageSquare, Clock, Plus, MailOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getUserLapTimes, registerLapTime, getTracks, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';


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
}

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

  if (isLoading) return <div className="fade-in"><Typography color="text.secondary">Cargando perfil...</Typography></div>;

  if (!sessionUser || !userProfile) {
    return (
      <div className="fade-in text-center max-w-md mx-auto mt-10">
        <Typography variant="h4" fontWeight="bold" color="white" mb={2}>Aún no has iniciado sesión</Typography>
        <Typography color="text.secondary" mb={4}>Conéctate o vuelve a iniciar sesión con tu cuenta recién creada.</Typography>
        <KineticButton variant="contained" fullWidth onClick={() => navigate('/login')}>Iniciar Sesión / Registro</KineticButton>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Invitaciones Pendientes Banner */}
      {pendingInvites.length > 0 && (
        <KineticCard sx={{ p: 3, mb: 4, borderColor: '#FF3100', background: 'rgba(255, 49, 0, 0.05)' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <MailOpen size={24} color="#FF3100" />
            <Typography variant="h6" fontWeight="bold" color="white">¡Tienes invitaciones a torneos!</Typography>
          </Stack>
          <Stack spacing={2}>
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/20 p-3 md:p-4 rounded-lg gap-3">
                <Typography variant="body2" color="white">
                  Te invitaron a participar en: <span className="font-bold">{invite.championships?.name}</span>
                </Typography>
                <KineticButton 
                  variant="contained" 
                  size="small"
                  onClick={() => handleAcceptInvite(invite.id, invite.championship_id, invite.championships?.name)}
                >
                  Aceptar y Unirme
                </KineticButton>
              </div>
            ))}
          </Stack>
        </KineticCard>
      )}

      {/* Header */}
      <KineticCard sx={{ p: 0, overflow: 'hidden', mb: 6 }}>
        <div className="h-32 md:h-48 bg-gradient-to-r from-[#FF3100]/20 to-transparent relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        
        <div className="px-4 md:px-8 pb-6 md:pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20 mb-6">
            <img 
              src={userProfile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.username}`} 
              alt="Avatar" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-[#0e0e0e] bg-[#1a1e24] object-cover" 
            />
            
            <div className="flex-grow pt-4 md:pt-0">
              <Typography variant="h3" fontWeight="bold" color="white" className="leading-tight">{userProfile.full_name || 'Piloto'}</Typography>
              <Typography variant="subtitle1" color="#FF3100" fontWeight="bold" mb={2}>@{userProfile.username || 'usuario'}</Typography>
              
              <Typography variant="body2" color="text.secondary" mb={3} maxWidth="600px">
                {userProfile.bio || 'Sin biografía.'}
              </Typography>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={16}/> {userProfile.location || 'Bogotá, Colombia'}</span>
                <span className="flex items-center gap-1"><Calendar size={16}/> Miembro desde {new Date(userProfile.created_at).getFullYear()}</span>
              </div>
            </div>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="w-full md:w-auto mt-4 md:mt-0">
              <KineticButton variant="contained" onClick={() => setIsTimeModalOpen(true)} startIcon={<Plus size={16}/>}>
                Registrar Tiempo
              </KineticButton>
              <KineticButton variant="outlined" onClick={async () => await supabase.auth.signOut()}>
                Cerrar Sesión
              </KineticButton>
            </Stack>
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
      </KineticCard>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <KineticButton
          variant={activeTab === 'campeonatos' ? 'contained' : 'outlined'}
          color={activeTab === 'campeonatos' ? 'primary' : 'inherit'}
          onClick={() => setActiveTab('campeonatos')}
          startIcon={<Trophy size={18}/>}
          sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
        >
          Mis Campeonatos ({userChampionships.length})
        </KineticButton>

        <KineticButton
          variant={activeTab === 'tiempos' ? 'contained' : 'outlined'}
          color={activeTab === 'tiempos' ? 'primary' : 'inherit'}
          onClick={() => setActiveTab('tiempos')}
          startIcon={<Clock size={18}/>}
          sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
        >
          Mis Tiempos ({userTimes.length})
        </KineticButton>

        <KineticButton
          variant={activeTab === 'actividad' ? 'contained' : 'outlined'}
          color={activeTab === 'actividad' ? 'primary' : 'inherit'}
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
          <div className="fade-in">
             {userChampionships.length === 0 ? (
               <Typography color="text.secondary">Aún no te has inscrito a ningún campeonato.</Typography>
             ) : (
               <div className="flex flex-col gap-4">
                 {userChampionships.map(uc => (
                   <div 
                     key={uc.championship_id} 
                     onClick={() => navigate(`/championships/${uc.championship_id}`)}
                     className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-[#FF3100]/50 hover:bg-white/10 transition-all gap-4"
                   >
                     <div>
                       <Typography variant="h6" fontWeight="bold" color="white" mb={0.5}>{uc.championships?.name}</Typography>
                       <Typography variant="body2" color="text.secondary">Estado: {uc.championships?.status}</Typography>
                     </div>
                     <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg">
                       <Typography variant="body1" fontWeight="bold" color="#FF3100">{uc.points} pts</Typography>
                       <Trophy size={18} color="#FF3100" />
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'tiempos' && (
          <div className="fade-in">
            {userTimes.length === 0 ? (
              <Typography color="text.secondary">No has registrado ningún tiempo todavía.</Typography>
            ) : (
              <div className="flex flex-col gap-3">
                {userTimes.map(time => (
                  <div key={time.id} className="flex justify-between items-center p-4 bg-black/30 border-l-4 border-[#FF3100] rounded-r-xl">
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold" color="white" mb={0.5}>{time.tracks?.name}</Typography>
                      <Typography variant="body2" color="text.secondary" className="flex items-center gap-1">
                        <MapPin size={12}/>{time.tracks?.location}
                      </Typography>
                    </div>
                    <Typography variant="h6" className="font-mono" fontWeight="bold" color="white">
                      {formatMsToTime(time.lap_time_ms)}
                    </Typography>
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
      <Dialog 
        open={isTimeModalOpen} 
        onClose={() => setIsTimeModalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#121212',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" color="white">Registrar Tiempo</Typography>
        </DialogTitle>
        <DialogContent>
          {timeError && (
            <Typography color="error" variant="body2" mb={2}>{timeError}</Typography>
          )}
          <form id="time-form" onSubmit={handleRegisterLapTime}>
            <Stack spacing={3} mt={1}>
              <KineticInput
                select
                label="Seleccionar Circuito"
                value={selectedTrackId} 
                onChange={e => setSelectedTrackId(e.target.value)} 
                required
                fullWidth
              >
                <MenuItem value="" disabled>Selecciona una pista...</MenuItem>
                {allTracks.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.location})</MenuItem>
                ))}
              </KineticInput>
              <KineticInput
                label="Tu mejor tiempo"
                fullWidth
                placeholder="Ej: 00:44.520 o 44.520"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                required
                sx={{ input: { fontFamily: 'monospace' } }}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <KineticButton variant="outlined" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>
            Cancelar
          </KineticButton>
          <KineticButton variant="contained" type="submit" form="time-form" disabled={isSubmittingTime}>
            {isSubmittingTime ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
          </KineticButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
