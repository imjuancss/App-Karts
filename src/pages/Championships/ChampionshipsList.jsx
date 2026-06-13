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
    <div className="fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Typography variant="h3" fontWeight="bold" color="white" mb={1}>Campeonatos Activos</Typography>
          <Typography variant="subtitle1" color="text.secondary">Únete a torneos y compite por la victoria</Typography>
        </div>
        <button className="primary-btn" onClick={() => navigate('/championships/new')}>
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
