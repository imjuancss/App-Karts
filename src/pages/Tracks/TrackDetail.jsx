import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Loader2 } from 'lucide-react';
import { getTrackById, getRecentTrackLapTimes, registerLapTime } from '../../services/api';
import './Tracks.css';

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

  const loadTrackData = async () => {
    setIsLoading(true);
    const data = await getTrackById(id);
    setTrack(data);
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
        <img src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} alt={track.name} className="track-cover-large" />
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

      <div className="track-layout glass-panel">
        <div className="layout-tabs">
          <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Información General</button>
          <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Mapa del Circuito</button>
          <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Comentarios</button>
        </div>
        
        <div className="layout-content">
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
             <div className="fade-in" style={{textAlign: 'center', padding: '2rem'}}>
               <p style={{color: 'var(--text-secondary)'}}>Plano del circuito en construcción...</p>
             </div>
          )}
          {activeTab === 'comments' && (
             <div className="fade-in">
               <div className="comment-box">
                 <textarea placeholder="Escribe un comentario o reseña..." rows="3"></textarea>
                 <button className="primary-btn" style={{marginTop: '1rem'}}>Publicar</button>
               </div>
             </div>
          )}
        </div>
      </div>

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
