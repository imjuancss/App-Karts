import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrackById, getRecentTrackLapTimes, registerLapTime, getTrackReviews, addTrackReview } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import KineticButton from '../../components/ui/KineticButton';
import GlassCard from '../../components/ui/GlassCard';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';

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

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-6">
      <div className="p-2 bg-surface-container-highest rounded-sm shrink-0">
        <span className="material-symbols-outlined text-tertiary-fixed">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-on-surface-variant text-xs uppercase tracking-widest">{label}</p>
        {children}
      </div>
    </div>
  );
}

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
      <PageContainer compact className="min-h-[40vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </PageContainer>
    );
  }

  if (!track) {
    return (
      <PageContainer compact className="min-h-[40vh] items-center justify-center">
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Pista no encontrada o eliminada.</p>
      </PageContainer>
    );
  }

  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen fade-in">
      <header className="sticky top-0 z-50 bg-surface-container-highest/40 backdrop-blur-[12px] border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
        <div className="flex items-center justify-between px-4 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/tracks')} className="active:scale-90 transition-transform flex items-center">
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <h1 className="font-headline uppercase tracking-widest text-sm font-bold text-on-surface truncate max-w-[200px] md:max-w-xs">
              {track.name}
            </h1>
          </div>
          <button type="button" className="active:scale-95 duration-150">
            <span className="material-symbols-outlined text-primary-fixed">share</span>
          </button>
        </div>
      </header>

      <section className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden">
        <img
          className="w-full h-full object-cover grayscale-[0.2] hover:scale-105 transition-transform duration-1000"
          src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'}
          alt={track.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8">
          <div className="flex flex-col gap-3 max-w-7xl mx-auto">
            <div className="inline-flex self-start items-center gap-2 bg-primary/10 backdrop-blur-md px-3 py-1 rounded-sm border border-primary/20">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="font-headline font-bold text-sm tracking-widest text-primary">TRACK DETAILS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline uppercase leading-none">{track.name}</h2>
          </div>
        </div>
      </section>

      <PageContainer compact className="pt-6 md:pt-8 pb-20">
        <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-surface-container p-6 rounded-sm flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <InfoRow icon="location_on" label="Ubicación">
                <p className="font-headline font-medium">{track.location || 'Ubicación no especificada'}</p>
              </InfoRow>
              <InfoRow icon="payments" label="Precio por Carrera">
                <p className="font-headline font-medium text-tertiary-fixed">{track.cost_info || 'Consultar costo'}</p>
              </InfoRow>
              <InfoRow icon="schedule" label="Horarios de Operación">
                <p className="text-sm text-on-surface/80">{formatSchedule(track.schedule)}</p>
              </InfoRow>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-outline-variant/10">
              <KineticButton
                onClick={() => navigate(`/championships/new?trackId=${track.id}`)}
                variant="contained"
                color="primary"
                className="flex-1 py-4 text-on-primary-container"
              >
                <span>Crear Campeonato</span>
                <span className="material-symbols-outlined text-lg">flag</span>
              </KineticButton>
              <KineticButton
                onClick={() => setIsTimeModalOpen(true)}
                variant="contained"
                color="secondary"
                className="flex-1 py-4"
              >
                Registrar Tiempo
              </KineticButton>
            </div>
          </div>

          <div className="bg-surface-container-low p-1 rounded-sm">
            <div className="bg-surface-container rounded-sm h-full p-6 border-l-4 border-tertiary-fixed flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold uppercase tracking-widest text-lg">Mejores Tiempos</h3>
                <span className="material-symbols-outlined text-tertiary-fixed animate-pulse">timer</span>
              </div>
              <div className="flex flex-col gap-3 overflow-hidden">
                {recentTimes.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">Aún no hay tiempos registrados.</p>
                ) : (
                  recentTimes.slice(0, 4).map((time, idx) => (
                    <div key={time.id} className={`flex items-center justify-between p-3 rounded-sm group transition-colors ${idx === 0 ? 'bg-surface-container-highest hover:bg-tertiary/10' : 'bg-surface-container-highest/50'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`font-headline font-bold ${idx === 0 ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-0.5">
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
                type="button"
                onClick={() => setActiveTab('info')}
                className="w-full py-2 text-xs font-headline font-bold tracking-widest uppercase text-tertiary-fixed hover:text-white transition-colors"
              >
                Ver Tabla Completa
              </button>
            </div>
          </div>
        </section>

        <ContentSection className="w-full max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="w-full md:w-auto flex">
                <TabsTrigger value="info" className="flex-1 md:flex-none">Información General</TabsTrigger>
                <TabsTrigger value="map" className="flex-1 md:flex-none">Mapa del Circuito</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1 md:flex-none">Comentarios</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="max-w-3xl">
              <ContentSection>
                <GlassCard variant="low">
                  <h3 className="font-headline font-bold uppercase tracking-widest text-xl">Acerca del Circuito</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">
                    {track.description || 'Un circuito diseñado para la alta velocidad y exigencia técnica. Cuenta con zonas de frenado fuerte y curvas encadenadas. Ideal tanto para principiantes como para expertos buscando mejorar sus tiempos.'}
                  </p>
                </GlassCard>

                <GlassCard variant="low">
                  <h3 className="font-headline font-bold uppercase tracking-widest text-xl">Ranking Completo</h3>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-12 gap-2 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                      <div className="col-span-2 md:col-span-1">Pos</div>
                      <div className="col-span-6 md:col-span-8">Piloto</div>
                      <div className="col-span-4 md:col-span-3 text-right">Tiempo</div>
                    </div>

                    {recentTimes.length === 0 ? (
                      <p className="py-4 text-on-surface-variant text-sm italic">Aún no hay tiempos registrados en este circuito.</p>
                    ) : (
                      recentTimes.map((time, idx) => (
                        <div key={time.id} className="grid grid-cols-12 gap-2 py-3 items-center group hover:bg-surface-container-highest/30 transition-colors px-2 rounded-sm">
                          <div className={`col-span-2 md:col-span-1 font-headline font-bold ${idx === 0 ? 'text-tertiary-fixed text-glow-neon' : 'text-on-surface-variant'}`}>{idx + 1}</div>
                          <div className="col-span-6 md:col-span-8 flex flex-col gap-0.5">
                            <span className="text-sm font-bold">@{time.profiles?.username || 'piloto'}</span>
                            <span className="text-[11px] text-on-surface-variant uppercase font-label tracking-wide">{time.profiles?.full_name || 'Piloto Nuevo'}</span>
                          </div>
                          <div className={`col-span-4 md:col-span-3 text-right font-mono ${idx === 0 ? 'text-tertiary-fixed font-bold' : 'text-on-surface'}`}>{formatMsToTime(time.lap_time_ms)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>
              </ContentSection>
            </TabsContent>

            <TabsContent value="map" className="max-w-3xl fade-in">
              {track.trazado ? (
                <div className="p-6 bg-black/40 rounded-sm shadow-[0_0_40px_rgba(255,255,255,0.02)] flex flex-col gap-4">
                  <img
                    src={track.trazado}
                    alt={`Trazado de ${track.name}`}
                    className="w-full h-auto max-h-[500px] object-contain rounded-sm"
                  />
                  <p className="text-on-surface-variant text-sm italic">Mapa técnico y trazado oficial del circuito.</p>
                </div>
              ) : (
                <div className="py-20 px-6 bg-surface-container-highest/20 rounded-sm border border-dashed border-outline-variant/30 max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-4xl opacity-50 text-on-surface-variant">map</span>
                  <h4 className="font-headline font-bold">Plano del circuito en construcción</h4>
                  <p className="text-on-surface-variant text-sm">El creador o el administrador aún no han cargado la imagen del trazado para esta pista.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="max-w-3xl fade-in">
              <ContentSection>
                <h3 className="font-headline font-bold uppercase tracking-widest text-xl">Reseñas y Comentarios</h3>

                <div className="flex flex-col gap-4">
                  {reviews.length === 0 ? (
                    <p className="text-on-surface-variant">No hay reseñas todavía. ¡Sé el primero en comentar!</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="p-6 bg-surface-container-highest rounded-sm shadow-[0_0_40px_rgba(255,255,255,0.02)] flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            {review.profiles?.avatar_url ? (
                              <img src={review.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-bold">
                                {(review.profiles?.username || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
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
                        <p className="text-on-surface/90 text-sm leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-surface-container-low rounded-sm shadow-[0_0_40px_rgba(255,255,255,0.02)] flex flex-col gap-4">
                  <h4 className="font-headline font-bold uppercase tracking-widest text-sm">Deja tu reseña</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-on-surface-variant uppercase tracking-widest">Calificación:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setNewReviewRating(star)} className="hover:scale-110 transition-transform">
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddReview}
                        disabled={isSubmittingReview || !sessionUser}
                        className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-sm text-xs font-headline font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmittingReview ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : (sessionUser ? 'Publicar Reseña' : 'Inicia Sesión para Publicar')}
                      </button>
                    </div>
                  </div>
                </div>
              </ContentSection>
            </TabsContent>
          </Tabs>
        </ContentSection>
      </PageContainer>

      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md p-6 flex flex-col gap-6">
            <h3 className="font-headline font-bold text-xl uppercase tracking-widest">Registrar Mi Tiempo</h3>
            {timeError && (
              <p className="text-error text-sm bg-error/10 p-3 rounded-sm border border-error/20">{timeError}</p>
            )}
            <form onSubmit={handleRegisterTime} className="flex flex-col gap-6">
              <FormSection maxWidth="full">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant">Tu mejor tiempo (mm:ss.SSS o ss.SSS)</label>
                  <Input
                    type="text"
                    placeholder="Ej: 00:44.520 o 44.520"
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    required
                    className="w-full font-mono"
                  />
                </div>
              </FormSection>
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
