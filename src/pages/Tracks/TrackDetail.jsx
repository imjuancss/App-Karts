import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, Calendar } from 'lucide-react';
import { getTrackById } from '../../services/api';
import './Tracks.css';

export default function TrackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrack() {
      setIsLoading(true);
      const data = await getTrackById(id);
      setTrack(data);
      setIsLoading(false);
    }
    loadTrack();
  }, [id]);

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
            <span><Clock size={18}/> Mar-Dom, 10am-10pm</span>
          </div>
          
          <div className="track-actions">
            <button className="primary-btn">Crear Campeonato Aquí</button>
            <button className="secondary-btn">Registrar Tiempo</button>
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
                Un circuito diseñado para la alta velocidad y exigencia técnica. Cuenta con zonas de frenado fuerte y curvas encadenadas.
                Ideal tanto para principiantes como para expertos buscando mejorar sus tiempos.
              </p>
              
              <h3 style={{margin: '2rem 0 1rem'}}>Mejores Tiempos Recientes</h3>
              <div className="times-list">
                <div className="time-row">
                  <span className="time-user">1. @juancakart</span>
                  <span className="time-value">44.52s</span>
                </div>
                <div className="time-row">
                  <span className="time-user">2. @racer_x</span>
                  <span className="time-value">44.89s</span>
                </div>
              </div>
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
    </div>
  );
}
