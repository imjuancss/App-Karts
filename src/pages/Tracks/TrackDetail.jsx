import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrackById, getRecentTrackLapTimes, registerLapTime, getTrackReviews, addTrackReview } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

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
    return <div className="flex justify-center p-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  if (!track) {
    return <div className="p-20 text-center"><p className="text-on-surface-variant">Pista no encontrada o eliminada.</p></div>;
  }

  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen pb-20 fade-in">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-surface-container-highest/40 backdrop-blur-[12px] border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
        <div className="flex items-center justify-between px-4 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/tracks')} className="active:scale-90 transition-transform flex items-center">
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <h1 className="font-headline uppercase tracking-widest text-sm font-bold text-on-surface truncate max-w-[200px] md:max-w-xs">
              {track.name}
            </h1>
          </div>
          <button className="active:scale-95 duration-150">
            <span className="material-symbols-outlined text-primary-fixed">share</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-24">
        {/* Hero Section */}
        <section className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden">
          <img 
            className="w-full h-full object-cover grayscale-[0.2] hover:scale-105 transition-transform duration-1000" 
            src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
            alt={track.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md px-3 py-1 rounded-sm border border-primary/20 mb-3">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="font-headline font-bold text-sm tracking-widest text-primary">TRACK DETAILS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline uppercase leading-none mb-2">{track.name}</h2>
          </div>
        </section>

        {/* Technical Telemetry / Quick Info */}
        <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-surface-container-highest rounded-sm">
                <span className="material-symbols-outlined text-tertiary-fixed">location_on</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Ubicación</p>
                <p className="font-headline font-medium">{track.location || 'Ubicación no especificada'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-surface-container-highest rounded-sm">
                <span className="material-symbols-outlined text-tertiary-fixed">payments</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Precio por Carrera</p>
                <p className="font-headline font-medium text-tertiary-fixed-dim">{track.cost_info || 'Consultar costo'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-surface-container-highest rounded-sm">
                <span className="material-symbols-outlined text-tertiary-fixed">schedule</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Horarios de Operación</p>
                <div className="space-y-1 mt-1 text-sm text-on-surface/80">
                  {formatSchedule(track.schedule)}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => navigate(`/championships/new?trackId=${track.id}`)} 
                className="flex-1 bg-gradient-to-tr from-primary-dim to-primary px-6 py-4 rounded-sm font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-on-primary-fixed"
              >
                Crear Campeonato
                <span className="material-symbols-outlined text-lg">flag</span>
              </button>
              <button 
                onClick={() => setIsTimeModalOpen(true)} 
                className="flex-1 border border-outline-variant px-6 py-4 rounded-sm font-headline font-bold text-sm tracking-widest uppercase hover:bg-surface-variant active:scale-95 transition-all text-on-surface"
              >
                Registrar Tiempo
              </button>
            </div>
          </div>

          {/* Kinetic Leaderboard Preview / Bento */}
          <div className="bg-surface-container-low p-1 rounded-sm">
            <div className="bg-surface-container rounded-sm h-full p-6 border-l-4 border-tertiary-fixed">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold uppercase tracking-widest text-lg">Mejores Tiempos</h3>
                <span className="material-symbols-outlined text-tertiary-fixed animate-pulse">timer</span>
              </div>
              <div className="space-y-3 overflow-hidden">
                {recentTimes.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">Aún no hay tiempos registrados.</p>
                ) : (
                  recentTimes.slice(0, 4).map((time, idx) => (
                    <div key={time.id} className={`flex items-center justify-between p-3 rounded-sm group transition-colors ${idx === 0 ? 'bg-surface-container-highest hover:bg-tertiary/10' : 'bg-surface-container-highest/50'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`font-headline font-bold ${idx === 0 ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className={`text-sm ${idx === 0 ? 'font-medium text-on-surface' : 'text-on-surface'}`}>@{time.profiles?.username || 'piloto'}</p>
                          <p className="text-[11px] text-on-surface-variant uppercase tracking-tighter">{time.profiles?.full_name || 'Piloto Nuevo'}</p>
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${idx === 0 ? 'text-tertiary-fixed' : 'text-on-surface'}`}>{formatMsToTime(time.lap_time_ms)}</span>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => setActiveTab('info')} 
                className="w-full mt-6 py-2 text-xs font-headline font-bold tracking-widest uppercase text-tertiary-fixed border-b border-tertiary/20 hover:text-white transition-colors"
              >
                Ver Tabla Completa
              </button>
            </div>
          </div>
        </section>

        {/* Detail Tabs Section */}
        <section className="mt-12 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <TabsList className="w-full md:w-auto flex">
                <TabsTrigger value="info" className="flex-1 md:flex-none">Información General</TabsTrigger>
                <TabsTrigger value="map" className="flex-1 md:flex-none">Mapa del Circuito</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1 md:flex-none">Comentarios</TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-8 space-y-12">
              <TabsContent value="info" className="max-w-3xl fade-in mt-0">
                <h3 className="font-headline font-bold uppercase tracking-widest text-xl mb-4">Acerca del Circuito</h3>
                <p className="text-on-surface-variant leading-relaxed font-light">
                  {track.description || 'Un circuito diseñado para la alta velocidad y exigencia técnica. Cuenta con zonas de frenado fuerte y curvas encadenadas. Ideal tanto para principiantes como para expertos buscando mejorar sus tiempos.'}
                </p>

                <div className="mt-12">
                  <h3 className="font-headline font-bold uppercase tracking-widest text-xl mb-6">Ranking Completo</h3>
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-2 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-surface-variant">
                      <div className="col-span-2 md:col-span-1">Pos</div>
                      <div className="col-span-6 md:col-span-8">Piloto</div>
                      <div className="col-span-4 md:col-span-3 text-right">Tiempo</div>
                    </div>
                    
                    {recentTimes.length === 0 ? (
                      <p className="py-4 text-on-surface-variant text-sm">Aún no hay tiempos registrados.</p>
                    ) : (
                      recentTimes.map((time, idx) => (
                        <div key={time.id} className="grid grid-cols-12 gap-2 py-4 border-b border-surface-container items-center group hover:bg-surface-container-low transition-colors px-2">
                          <div className={`col-span-2 md:col-span-1 font-headline font-bold ${idx === 0 ? 'text-tertiary-fixed' : ''}`}>{idx + 1}</div>
                          <div className="col-span-6 md:col-span-8">
                            <span className="block text-sm font-medium">@{time.profiles?.username || 'piloto'}</span>
                            <span className="block text-[11px] text-on-surface-variant">{time.profiles?.full_name || 'Piloto Nuevo'}</span>
                          </div>
                          <div className={`col-span-4 md:col-span-3 text-right font-mono ${idx === 0 ? 'text-tertiary-fixed font-bold' : ''}`}>{formatMsToTime(time.lap_time_ms)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="map" className="max-w-3xl text-center py-4 fade-in mt-0">
                {track.trazado ? (
                  <div className="p-4 bg-black/40 rounded-sm border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                    <img 
                      src={track.trazado} 
                      alt={`Trazado de ${track.name}`} 
                      className="w-full h-auto max-h-[500px] object-contain rounded-sm" 
                    />
                    <p className="text-on-surface-variant text-sm mt-4 italic">Mapa técnico y trazado oficial del circuito.</p>
                  </div>
                ) : (
                  <div className="py-20 px-6 bg-surface-container-highest/20 rounded-sm border border-dashed border-outline-variant/30 max-w-lg mx-auto">
                    <span className="material-symbols-outlined text-4xl mb-4 opacity-50 text-on-surface-variant">map</span>
                    <h4 className="font-headline font-bold mb-2">Plano del circuito en construcción</h4>
                    <p className="text-on-surface-variant text-sm">El creador o el administrador aún no han cargado la imagen del trazado para esta pista.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="max-w-3xl fade-in mt-0">
                <h3 className="font-headline font-bold uppercase tracking-widest text-xl mb-6">Reseñas y Comentarios</h3>
                <div className="space-y-6 mb-10">
                  {reviews.length === 0 ? (
                    <p className="text-on-surface-variant">No hay reseñas todavía. ¡Sé el primero en comentar!</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="p-6 bg-surface-container-highest rounded-sm border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            {review.profiles?.avatar_url ? (
                              <img src={review.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-bold">
                                {(review.profiles?.username || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold">@{review.profiles?.username || 'Usuario'}</p>
                              <p className="text-xs text-on-surface-variant">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'text-primary' : 'text-on-surface-variant/30'}`} style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-on-surface/90 text-sm mt-3 leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div className="p-6 bg-surface-container-low rounded-sm border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                  <h4 className="font-headline font-bold mb-4 uppercase tracking-widest text-sm">Deja tu reseña</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-on-surface-variant uppercase tracking-widest">Calificación:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setNewReviewRating(star)} className="hover:scale-110 transition-transform">
                            <span className={`material-symbols-outlined ${star <= newReviewRating ? 'text-primary' : 'text-on-surface-variant/30'}`} style={{ fontVariationSettings: star <= newReviewRating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      className="w-full"
                      placeholder="Escribe tu experiencia en esta pista..."
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleAddReview}
                        disabled={isSubmittingReview || !sessionUser}
                        className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-sm text-xs font-headline font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmittingReview ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : (sessionUser ? 'Publicar Reseña' : 'Inicia Sesión para Publicar')}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>

      {/* Time Modal */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-sm border-none shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-6">
            <h3 className="font-headline font-bold text-xl uppercase tracking-widest mb-4">Registrar Mi Tiempo</h3>
            {timeError && (
              <p className="text-error text-sm mb-4 bg-error/10 p-2 rounded-sm border border-error/20">{timeError}</p>
            )}
            <form onSubmit={handleRegisterTime}>
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Tu mejor tiempo (mm:ss.SSS o ss.SSS)</label>
                <Input 
                  type="text" 
                  placeholder="Ej: 00:44.520 o 44.520" 
                  value={timeInput} 
                  onChange={e => setTimeInput(e.target.value)} 
                  required 
                  className="w-full font-mono"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime} className="px-4 py-2 border border-outline-variant/50 rounded-sm text-xs font-headline font-bold uppercase tracking-widest hover:bg-surface-variant transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmittingTime} className="bg-primary text-on-primary px-6 py-2 rounded-sm text-xs font-headline font-bold uppercase tracking-widest hover:brightness-110 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingTime ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
