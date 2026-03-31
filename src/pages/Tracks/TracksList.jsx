import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Plus, Search } from 'lucide-react';
import './Tracks.css';

export const MOCK_TRACKS_DATA = [
  { 
    id: 1, 
    name: "Circuito Xtreme Karts", 
    location: "Cajicá", 
    rating: 4.8, 
    cost: "$50.000 / heat",
    image: "https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop"
  },
  { 
    id: 2, 
    name: "Kartódromo XRP", 
    location: "Cajicá", 
    rating: 4.5,
    cost: "$45.000 / heat",
    image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=600&h=400&fit=crop"
  },
  { 
    id: 3, 
    name: "Indoor Karts Bogotá", 
    location: "Bogotá", 
    rating: 4.2,
    cost: "$35.000 / heat",
    image: "https://images.unsplash.com/photo-1534158485743-c0d11ce8e18b?w=600&h=400&fit=crop"
  }
];

export default function TracksList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTracks = MOCK_TRACKS_DATA.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tracks-container fade-in">
      <div className="page-header">
        <div>
          <h1>Pistas de Karts</h1>
          <p className="subtitle">Encuentra los mejores circuitos para correr</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/tracks/create')}>
          <Plus size={20}/> Crear Circuito
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
        {filteredTracks.map(track => (
          <div key={track.id} className="track-card glass-panel" onClick={() => navigate(`/tracks/${track.id}`)}>
            <img src={track.image} alt={track.name} className="track-image" />
            <div className="track-info">
              <h3>{track.name}</h3>
              <div className="track-meta">
                <span><MapPin size={16}/> {track.location}</span>
                <span className="rating"><Star size={16} fill="var(--accent)" color="var(--accent)"/> {track.rating}</span>
              </div>
              <p className="track-cost">{track.cost}</p>
            </div>
          </div>
        ))}
        {filteredTracks.length === 0 && (
          <p style={{color: 'var(--text-secondary)'}}>No se encontraron pistas.</p>
        )}
      </div>
    </div>
  );
}
