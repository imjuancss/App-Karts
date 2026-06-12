import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, Plus } from 'lucide-react';
import { getTracks } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

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
    <div className="fade-in px-4 py-6 md:py-10 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Typography variant="h3" fontWeight="bold" color="white" mb={1}>Pistas de Karts</Typography>
          <Typography variant="subtitle1" color="text.secondary">Encuentra los mejores circuitos para correr</Typography>
        </div>
        <KineticButton variant="contained" onClick={() => navigate('/tracks/new')} startIcon={<Plus size={20}/>}>
          Registrar Nueva Pista
        </KineticButton>
      </div>

      <KineticCard sx={{ p: '12px 20px', mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Search size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <KineticInput
          fullWidth
          variant="outlined"
          placeholder="Buscar pista por nombre o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              style: { color: 'white', fontSize: '1.05rem' }
            }
          }}
        />
      </KineticCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Typography color="text.secondary">Cargando pistas...</Typography>
        ) : (
          filteredTracks.map(track => (
            <KineticCard 
              key={track.id} 
              onClick={() => navigate(`/tracks/${track.id}`)}
              sx={{ 
                cursor: 'pointer', 
                overflow: 'hidden',
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                p: 0,
                transition: 'transform 0.2s, border-color 0.2s',
                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(255, 49, 0, 0.4)' }
              }}
            >
              <img 
                src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
                alt={track.name} 
                className="w-full h-48 object-cover" 
              />
              <Stack spacing={2} p={3} flexGrow={1}>
                <Typography variant="h5" fontWeight="bold" color="white">{track.name}</Typography>
                
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={16}/> {track.location}</span>
                  <span className="flex items-center gap-1 font-bold text-[#FF3100]">
                    <Star size={16} fill="currentColor" /> {track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/10">
                  <Typography variant="body2" color="text.secondary">{track.cost_info || 'Consultar costo'}</Typography>
                </div>
              </Stack>
            </KineticCard>
          ))
        )}
        {!isLoading && filteredTracks.length === 0 && (
          <Typography color="text.secondary" className="col-span-full">No se encontraron pistas.</Typography>
        )}
      </div>
    </div>
  );
}
