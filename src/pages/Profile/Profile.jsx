import { useState } from 'react';
import { MapPin, Trophy, Calendar, Map, MessageSquare } from 'lucide-react';
import './Profile.css';

// Mock Data
const MOCK_USER = {
  name: "Juan Camilo",
  username: "@juancakart",
  bio: "Amante de la velocidad y los motores. Siempre buscando romper mis propios récords.",
  location: "Bogotá, Colombia",
  joined: "Marzo 2026",
  avatar: "https://i.pravatar.cc/150?u=juancamilo",
  stats: {
    championships: 4,
    tracks: 2,
    races: 34
  }
};

const MOCK_TRACKS = [
  { id: 1, name: "Circuito Xtreme Karts", location: "Cajicá", rating: 4.8 },
  { id: 2, name: "Kartódromo XRP", location: "Cajicá", rating: 4.5 }
];

const MOCK_CHAMPS = [
  { id: 1, name: "Copa Primavera 2026", status: "Activo" },
  { id: 2, name: "Liga Nocturna", status: "Próximamente" }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('campeonatos');

  return (
    <div className="profile-container fade-in">
      {/* Header */}
      <section className="profile-header glass-panel">
        <div className="profile-cover"></div>
        <div className="profile-info-wrapper">
          <img src={MOCK_USER.avatar} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <div className="profile-title">
              <h1>{MOCK_USER.name}</h1>
              <span className="username">{MOCK_USER.username}</span>
            </div>
            <p className="profile-bio">{MOCK_USER.bio}</p>
            <div className="profile-meta">
              <span><MapPin size={16}/> {MOCK_USER.location}</span>
              <span><Calendar size={16}/> Miembro desde {MOCK_USER.joined}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="primary-btn">Editar Perfil</button>
            <button className="secondary-btn">Compartir</button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{MOCK_USER.stats.races}</span>
            <span className="stat-label">Carreras</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{MOCK_USER.stats.championships}</span>
            <span className="stat-label">Campeonatos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{MOCK_USER.stats.tracks}</span>
            <span className="stat-label">Pistas Creadas</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'campeonatos' ? 'active' : ''}`}
          onClick={() => setActiveTab('campeonatos')}
        >
          <Trophy size={18}/> Mis Campeonatos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pistas' ? 'active' : ''}`}
          onClick={() => setActiveTab('pistas')}
        >
          <Map size={18}/> Mis Pistas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'actividad' ? 'active' : ''}`}
          onClick={() => setActiveTab('actividad')}
        >
          <MessageSquare size={18}/> Actividad
        </button>
      </div>

      {/* Tab Content */}
      <section className="tab-content glass-panel">
        {activeTab === 'campeonatos' && (
          <div className="content-grid list-view fade-in">
            {MOCK_CHAMPS.map(champ => (
              <div key={champ.id} className="list-item">
                <div className="item-icon"><Trophy size={24} color="var(--accent)"/></div>
                <div className="item-details">
                  <h3>{champ.name}</h3>
                  <p>Estado: {champ.status}</p>
                </div>
                <button className="secondary-btn" style={{padding: '0.5rem 1rem'}}>Ver Detalles</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pistas' && (
          <div className="content-grid list-view fade-in">
            {MOCK_TRACKS.map(track => (
              <div key={track.id} className="list-item">
                <div className="item-icon"><Map size={24} color="var(--text-secondary)"/></div>
                <div className="item-details">
                  <h3>{track.name}</h3>
                  <p>{track.location} • ⭐ {track.rating}</p>
                </div>
                <button className="secondary-btn" style={{padding: '0.5rem 1rem'}}>Ver Pista</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'actividad' && (
          <div className="activity-feed fade-in">
            <p style={{color: 'var(--text-secondary)'}}>No hay actividad reciente.</p>
          </div>
        )}
      </section>
    </div>
  );
}
