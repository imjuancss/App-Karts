import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy } from 'lucide-react';
import { getChampionships } from '../../services/api';
import './Championships.css';

export default function ChampionshipsList() {
  const navigate = useNavigate();
  const [champs, setChamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChamps() {
      setIsLoading(true);
      const data = await getChampionships();
      setChamps(data || []);
      setIsLoading(false);
    }
    loadChamps();
  }, []);

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
        {isLoading ? (
          <p style={{color: 'var(--text-secondary)'}}>Cargando campeonatos...</p>
        ) : (
          champs.map(champ => (
            <div key={champ.id} className="champ-card glass-panel" onClick={() => navigate(`/championships/${champ.id}`)}>
              <div className="champ-card-header">
                <span className={`status-badge ${champ.status?.includes('Abiertas') ? 'open' : ''}`}>{champ.status || 'Definido'}</span>
                <span className="type-badge">{champ.type || 'Open'}</span>
              </div>
              
              <h3 className="champ-name">{champ.name}</h3>
              <p className="champ-track">{champ.tracks?.name || 'Pista no asignada'}</p>
              
              <div className="champ-meta">
                <span><Calendar size={16}/> {champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</span>
                <span><Users size={16}/> - Pilotos</span>
              </div>
            </div>
          ))
        )}
        {!isLoading && champs.length === 0 && (
          <p style={{color: 'var(--text-secondary)'}}>No se encontraron campeonatos activos.</p>
        )}
      </div>
    </div>
  );
}
