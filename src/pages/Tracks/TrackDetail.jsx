import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Loader2 } from 'lucide-react';
import { getTrackById, getRecentTrackLapTimes, registerLapTime, getTrackReviews, addTrackReview } from '../../services/api';
import { supabase } from '../../lib/supabase';

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

  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReviewText) return;
    setIsSubmittingReview(true);
    try {
      await addTrackReview(id, newReviewRating, newReviewText);
      const loadedReviews = await getTrackReviews(id);
      setReviews(loadedReviews || []);
      setNewReviewText('');
      setNewReviewRating(5);
      alert('Reseña publicada!');
    } catch {
      alert('Error al publicar reseña');
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const loadTrackData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setSessionUser(session?.user || null);
    const data = await getTrackById(id);
    setTrack(data);
    if (data) {
      const times = await getRecentTrackLapTimes(id);
      setRecentTimes(times || []);
      const r = await getTrackReviews(id);
      setReviews(r || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTrackData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // Limpiar y cerrar modal
      setTimeInput('');
      setIsTimeModalOpen(false);
      
      // Recargar tiempos
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
    return <div className="track-detail-container fade-in"><p>Cargando información de la pista...</p></div>;
  }

  if (!track) {
    return <div className="track-detail-container fade-in"><p>Pista no encontrada o eliminada.</p></div>;
  }

  return (
    <div className="track-detail-container fade-in">
      <button className="back-btn" onClick={() => navigate('/tracks')}>
        <ArrowLeft size={20}/> Volver a pistas
      </button>

      <div className="track-header glass-panel">
        <img 
          src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
          alt={track.name} 
          className="track-cover-large" 
          fetchpriority="high"
          decoding="async"
        />
        <div className="track-header-content">
          <div className="track-title-row">
            <h1>{track.name}</h1>
            <div className="rating-badge">
              <Star size={18} fill="var(--accent)" color="var(--accent)"/>
              <span>{track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}</span>
            </div>
          </div>
          <div className="track-meta-row">
            <span><MapPin size={18}/> {track.location}</span>
            <span><DollarSign size={18}/> {track.cost_info || 'Consultar costo'}</span>
            <span><Clock size={18}/> {formatSchedule(track.schedule)}</span>
          </div>
          
          <div className="track-actions">
            <button className="primary-btn" onClick={() => navigate(`/championships/new?trackId=${track.id}`)}>Crear Campeonato Aquí</button>
            <button className="secondary-btn" onClick={() => setIsTimeModalOpen(true)}>Registrar Tiempo</button>
          </div>
        </div>
      </div>

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
            <div className="fade-in">
              <h3 style={{marginBottom: '1rem'}}>Acerca del Circuito</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.6}}>
                {track.description || 'Un circuito diseñado para la alta velocidad y exigencia técnica. Cuenta con zonas de frenado fuerte y curvas encadenadas. Ideal tanto para principiantes como para expertos buscando mejorar sus tiempos.'}
              </p>
              
              <h3 style={{margin: '2rem 0 1rem'}}>Mejores Tiempos Recientes</h3>
              {recentTimes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aún no hay tiempos registrados en esta pista.</p>
              ) : (
                <div className="times-list">
                  {recentTimes.map((time, idx) => (
                    <div className="time-row" key={time.id}>
                      <span className="time-user">
                        {idx + 1}. @{time.profiles?.username || 'piloto'} {time.profiles?.full_name ? `(${time.profiles.full_name})` : ''}
                      </span>
                      <span className="time-value" style={{ fontFamily: 'monospace' }}>{formatMsToTime(time.lap_time_ms)}</span>
                    </div>
                  ))}
                </div>
              )}
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
               <div className="mb-10 max-w-2xl">
                 <Typography variant="h5" mb={3}>Reseñas y Comentarios</Typography>
                 
                 {/* Lista de reseñas */}
                 <Stack spacing={3} mb={5}>
                   {reviews.length === 0 ? (
                     <Typography color="text.secondary">No hay reseñas todavía. ¡Sé el primero en comentar!</Typography>
                   ) : (
                     reviews.map(review => (
                       <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             {review.profiles?.avatar_url ? (
                               <img src={review.profiles.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                 {(review.profiles?.username || 'U')[0].toUpperCase()}
                               </div>
                             )}
                             <div>
                               <Typography variant="subtitle2" fontWeight="bold">@{review.profiles?.username || 'Usuario'}</Typography>
                               <Typography variant="caption" color="text.secondary">
                                 {new Date(review.created_at).toLocaleDateString()}
                               </Typography>
                             </div>
                           </div>
                           <div className="flex gap-0.5">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} color={i < review.rating ? "var(--accent)" : "rgba(255,255,255,0.2)"} fill={i < review.rating ? "var(--accent)" : "transparent"} />
                             ))}
                           </div>
                         </div>
                         <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.8)' }}>
                           {review.comment}
                         </Typography>
                       </div>
                     ))
                   )}
                 </Stack>

                 {/* Formulario de nueva reseña */}
                 <div className="p-5 bg-black/40 rounded-xl border border-white/10">
                   <Typography variant="h6" mb={2}>Deja tu reseña</Typography>
                   <Stack spacing={2}>
                     <div className="flex items-center gap-2 mb-1">
                       <Typography variant="body2" color="text.secondary">Calificación:</Typography>
                       <div className="flex gap-1 cursor-pointer">
                         {[1, 2, 3, 4, 5].map(star => (
                           <Star 
                             key={star} 
                             size={24} 
                             color={star <= newReviewRating ? "var(--accent)" : "rgba(255,255,255,0.3)"} 
                             fill={star <= newReviewRating ? "var(--accent)" : "transparent"}
                             onClick={() => setNewReviewRating(star)}
                             className="transition-colors hover:scale-110"
                           />
                         ))}
                       </div>
                     </div>
                     <KineticInput
                       placeholder="Escribe tu experiencia en esta pista..."
                       multiline
                       rows={3}
                       fullWidth
                       value={newReviewText}
                       onChange={(e) => setNewReviewText(e.target.value)}
                     />
                     <div className="text-right mt-2">
                       <KineticButton 
                         variant="contained" 
                         onClick={handleAddReview}
                         disabled={isSubmittingReview || !sessionUser}
                       >
                         {isSubmittingReview ? <Loader2 className="animate-spin" size={20} /> : (sessionUser ? 'Publicar Reseña' : 'Inicia Sesión para Publicar')}
                       </KineticButton>
                     </div>
                   </Stack>
                 </div>
               </div>
             </div>
          )}
        </div>
      </KineticCard>

      {isTimeModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px', borderRadius: '12px', background: '#1e1e2f' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registrar Mi Tiempo</h3>
            {timeError && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{timeError}</p>
            )}
            <form onSubmit={handleRegisterTime}>
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
