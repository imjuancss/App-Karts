/* eslint-disable react-refresh/only-export-components */
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy } from 'lucide-react';
import './Championships.css';

export const MOCK_CHAMPS_DATA = [
  {
    id: 1,
    name: "Copa Primavera 2026",
    track: "Circuito Xtreme Karts",
    date: "15-Abril a 30-Mayo",
    participants: 24,
    status: "Inscripciones Abiertas",
    type: "Amateur"
  },
  {
    id: 2,
    name: "Liga Nocturna",
    track: "Kartódromo XRP",
    date: "01-Junio a 30-Julio",
    participants: 12,
    status: "Próximamente",
    type: "Pro"
  }
];

export default function ChampionshipsList() {
  const navigate = useNavigate();

  return (
    <div className="champs-container fade-in">
      <div className="page-header">
        <div>
          <h1>Campeonatos Activos</h1>
          <p className="subtitle">Únete a torneos y compite por la victoria</p>
        </div>
        <button className="primary-btn">
          <Trophy size={20}/> Nuevo Campeonato
        </button>
      </div>

      <div className="champs-grid">
        {MOCK_CHAMPS_DATA.map(champ => (
          <div key={champ.id} className="champ-card glass-panel" onClick={() => navigate(`/championships/${champ.id}`)}>
            <div className="champ-card-header">
              <span className={`status-badge ${champ.status.includes('Abiertas') ? 'open' : ''}`}>{champ.status}</span>
              <span className="type-badge">{champ.type}</span>
            </div>
            
            <h3 className="champ-name">{champ.name}</h3>
            <p className="champ-track">{champ.track}</p>
            
            <div className="champ-meta">
              <span><Calendar size={16}/> {champ.date}</span>
              <span><Users size={16}/> {champ.participants} Pilotos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
