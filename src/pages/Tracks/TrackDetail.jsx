import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Loader2, Edit3 } from 'lucide-react';
import { getTrackById, getRecentTrackLapTimes, registerLapTime, getProfile } from '../../services/api';
import { supabase } from '../../lib/supabase';
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

const formatSchedule = (sched) => {
  if (!sched) return 'Horario no definido';
  if (typeof sched === 'string') return sched;
  if (typeof sched === 'object') {
    if (sched.horario) return sched.horario;
    return Object.entries(sched)
      .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: ${val}`)
      .join(' | ');
  }
  return 'Consultar horario';
};

export default function TrackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [track, setTrack] = useState(null);
  const [recentTimes, setRecentTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const loadTrackData = async () => {
    setIsLoading(true);
    const data = await getTrackById(id);
    setTrack(data);
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    setSessionUser(user);
    
    if (user) {
      const profile = await getProfile(user.id);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }

    if (data) {
      const times = await getRecentTrackLapTimes(id);
      setRecentTimes(times || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTrackData();
  }, [id]);

  const handleRegisterTime = async (e) => {
    e.preventDefault();
    setIsSubmittingTime(true);
    setTimeError('');

    try {
      const ms = parseTimeToMs(timeInput);
      if (ms <= 0) {
        throw new Error("Por favor ingresa un tiempo válido en formato mm:ss.SSS o ss.SSS");
      }
      
      await registerLapTime(id, ms);
      
      setTimeInput('');
      setIsTimeModalOpen(false);
      
      const times = await getRecentTrackLapTimes(id);
      setRecentTimes(times || []);
      alert('¡Tiempo registrado con éxito!');
    } catch (err) {
      console.error(err);
      setTimeError(err.message || 'Ocurrió un error al registrar el tiempo.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  if (isLoading) {
    return (
      <div className="track-detail-container fade-in px-4 py-10" style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--accent)' }} />
        <Typography color="text.secondary">Cargando información de la pista...</Typography>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="track-detail-container fade-in px-4 py-10 text-center">
        <Typography color="error">Pista no encontrada o eliminada.</Typography>
      </div>
    );
  }

  return (
    <div className="track-detail-container fade-in px-4 py-6 md:py-10 max-w-6xl mx-auto">
      <Stack direction="row" mb={3}>
        <KineticButton 
          variant="text" 
          color="secondary" 
          onClick={() => navigate('/tracks')}
          startIcon={<ArrowLeft size={20}/>}
        >
          Volver a pistas
        </KineticButton>
      </Stack>

      <KineticCard sx={{ mb: 4, p: 0, overflow: 'hidden' }} noPadding>
        <div style={{ position: 'relative' }}>
          <img 
            src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
            alt={track.name} 
            className="w-full h-64 md:h-96 object-cover block"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] to-transparent pointer-events-none" />
        </div>
        
        <div className="p-6 md:p-8 relative z-10 -mt-20 md:-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Typography variant="h2" sx={{ color: 'white', mb: 1 }}>{track.name}</Typography>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
                <span className="flex items-center gap-1">
                  <Star size={18} color="var(--accent)" fill="var(--accent)" />
                  <span className="font-bold text-white">{track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}</span>
                </span>
                <span className="flex items-center gap-1"><MapPin size={18} className="opacity-70" /> {track.location}</span>
                <span className="flex items-center gap-1"><DollarSign size={18} className="opacity-70" /> {track.cost_info || 'Consultar costo'}</span>
                <span className="flex items-center gap-1"><Clock size={18} className="opacity-70" /> {formatSchedule(track.schedule)}</span>
              </div>
            </div>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <KineticButton variant="contained" onClick={() => navigate(`/championships/new?trackId=${track.id}`)}>
                Crear Campeonato
              </KineticButton>
              <KineticButton variant="outlined" color="secondary" onClick={() => setIsTimeModalOpen(true)}>
                Registrar Tiempo
              </KineticButton>
              {sessionUser && (sessionUser.id === track.creator_id || userProfile?.role === 'admin') && (
                <KineticButton variant="outlined" color="inherit" onClick={() => navigate(`/tracks/${track.id}/edit`)} startIcon={<Edit3 size={16} />}>
                  Editar Circuito
                </KineticButton>
              )}
            </Stack>
          </div>
        </div>
      </KineticCard>

      <KineticCard sx={{ p: { xs: 2, md: 4 } }}>
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <KineticButton
            variant={activeTab === 'info' ? 'contained' : 'outlined'}
            color={activeTab === 'info' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('info')}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Información General
          </KineticButton>
          <KineticButton
            variant={activeTab === 'map' ? 'contained' : 'outlined'}
            color={activeTab === 'map' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('map')}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Mapa del Circuito
          </KineticButton>
          <KineticButton
            variant={activeTab === 'comments' ? 'contained' : 'outlined'}
            color={activeTab === 'comments' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('comments')}
            sx={{ flexShrink: 0, px: 3, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
          >
            Comentarios
          </KineticButton>
        </div>
        
        <div>
          {activeTab === 'info' && (
            <div className="fade-in space-y-8">
              <section>
                <Typography variant="h4" mb={2}>Acerca del Circuito</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {track.description || 'Un circuito diseñado para la alta velocidad y exigencia técnica. Cuenta con zonas de frenado fuerte y curvas encadenadas. Ideal tanto para principiantes como para expertos buscando mejorar sus tiempos.'}
                </Typography>
              </section>
              
              <section>
                <Typography variant="h4" mb={3}>Mejores Tiempos Recientes</Typography>
                {recentTimes.length === 0 ? (
                  <Typography color="text.secondary">Aún no hay tiempos registrados en esta pista.</Typography>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentTimes.map((time, idx) => (
                      <div key={time.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="font-medium">
                          <span className="text-[#cafd00] mr-2">{idx + 1}.</span> 
                          @{time.profiles?.username || 'piloto'} {time.profiles?.full_name ? <span className="opacity-50 font-normal">({time.profiles.full_name})</span> : ''}
                        </span>
                        <span className="font-mono text-lg font-bold tracking-tight text-[#FF3100]">{formatMsToTime(time.lap_time_ms)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="fade-in text-center py-4">
              {track.trazado ? (
                <div className="max-w-3xl mx-auto p-4 bg-black/40 rounded-xl border border-white/10">
                  <img 
                    src={track.trazado} 
                    alt={`Trazado de ${track.name}`} 
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg" 
                  />
                  <Typography variant="body2" color="text.secondary" mt={2} fontStyle="italic">
                    Mapa técnico y trazado oficial del circuito.
                  </Typography>
                </div>
              ) : (
                <div className="py-16 px-4 bg-white/5 rounded-xl border border-dashed border-white/20 max-w-lg mx-auto">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z" strokeDasharray="3 3" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  <Typography variant="h6" mb={1}>Plano del circuito en construcción</Typography>
                  <Typography variant="body2" color="text.secondary">
                    El creador o el administrador aún no han cargado la imagen del trazado para esta pista.
                  </Typography>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
             <div className="fade-in">
               <Stack spacing={2} sx={{ maxWidth: 600 }}>
                 <KineticInput
                   placeholder="Escribe un comentario o reseña..."
                   multiline
                   rows={3}
                   fullWidth
                 />
                 <div className="text-right">
                   <KineticButton variant="contained">Publicar</KineticButton>
                 </div>
               </Stack>
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
          <DialogTitle sx={{ color: 'white' }}>Registrar Mi Tiempo</DialogTitle>
          <DialogContent>
            {timeError && (
              <Typography color="error" variant="body2" mb={2}>{timeError}</Typography>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ingresa tu mejor tiempo en la pista. Formato aceptado: mm:ss.SSS o ss.SSS
            </Typography>
            <KineticInput
              label="Tu mejor tiempo"
              placeholder="Ej: 00:44.520"
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              fullWidth
              autoFocus
              required
              slotProps={{
                input: {
                  style: { fontFamily: 'monospace' }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <KineticButton variant="text" color="inherit" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>
              Cancelar
            </KineticButton>
            <KineticButton type="submit" variant="contained" disabled={isSubmittingTime}>
              {isSubmittingTime ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
            </KineticButton>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
