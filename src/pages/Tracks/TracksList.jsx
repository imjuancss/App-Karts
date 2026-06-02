import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Search } from 'lucide-react';
import { getTracks } from '../../services/api';
import './Tracks.css';

export default function TracksList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTracks() {
      setIsLoading(true);
      const data = await getTracks();
      setTracks(data || []);
      setIsLoading(false);
    }
    loadTracks();
  }, []);

  const filteredTracks = tracks.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="tracks-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Pistas de Karts</h1>
          <p className="subtitle">Encuentra los mejores circuitos para correr</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/tracks/new')}>
          Registrar Nueva Pista
        </button>
      </div>

      <div className="search-bar glass-panel">
        <Search size={20} color="var(--text-secondary)"/>
        <input 
          type="text" 
          placeholder="Buscar pista por nombre o ciudad..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tracks-grid">
        {isLoading ? (
          <p style={{color: 'var(--text-secondary)'}}>Cargando pistas...</p>
        ) : (
          filteredTracks.map(track => (
            <div key={track.id} className="track-card glass-panel" onClick={() => navigate(`/tracks/${track.id}`)}>
              <img src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} alt={track.name} className="track-image" />
              <div className="track-info">
                <h3>{track.name}</h3>
                <div className="track-meta">
                  <span><MapPin size={16}/> {track.location}</span>
                  <span className="rating"><Star size={16} fill="var(--accent)" color="var(--accent)"/> {track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}</span>
                </div>
                <p className="track-cost">{track.cost_info || 'Consultar costo'}</p>
              </div>
            </div>
          ))
        )}
        {!isLoading && filteredTracks.length === 0 && (
          <p style={{color: 'var(--text-secondary)'}}>No se encontraron pistas.</p>
        )}
      </div>
    </div>
  );
}
