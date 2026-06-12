import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy } from 'lucide-react';
import { getChampionships } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

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
        <KineticButton variant="contained" onClick={() => navigate('/championships/new')} startIcon={<Trophy size={20}/>}>
          Nuevo Campeonato
        </KineticButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Typography color="text.secondary">Cargando campeonatos...</Typography>
        ) : (
          champs.map(champ => (
            <KineticCard 
              key={champ.id} 
              onClick={() => navigate(`/championships/${champ.id}`)}
              sx={{ p: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: 200, '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(255, 49, 0, 0.4)' }, transition: 'transform 0.2s, border-color 0.2s' }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${champ.status?.includes('Abiertas') ? 'bg-[#cafd00]/20 text-[#cafd00]' : 'bg-white/10 text-white/70'}`}>
                  {champ.status || 'Definido'}
                </span>
                <span className="text-xs uppercase tracking-wider text-gray-400">{champ.type || 'Open'}</span>
              </div>
              
              <Typography variant="h5" fontWeight="bold" color="white" mb={1}>{champ.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>{champ.tracks?.name || 'Pista no asignada'}</Typography>
              
              <div className="flex justify-between mt-auto pt-4 border-t border-white/10 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={16}/> {champ.start_date || 'TBD'} a {champ.end_date || 'TBD'}</span>
                <span className="flex items-center gap-1"><Users size={16}/> - Pilotos</span>
              </div>
            </KineticCard>
          ))
        )}
        {!isLoading && champs.length === 0 && (
          <Typography color="text.secondary" className="col-span-full">No se encontraron campeonatos activos.</Typography>
        )}
      </div>
    </div>
  );
}
