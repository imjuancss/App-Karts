import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Search } from 'lucide-react';
import { getTracks } from '../../services/api';

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

      {/* SEARCH / FILTER COMPONENT */}
      <section className="mb-12">
        <div className="relative bg-card p-1 rounded-sm border border-border/50">
          <div className="flex items-center gap-x-4 px-6 h-16">
            <Filter className="text-muted-foreground" size={24} />
            <input 
              className="flex-1 bg-transparent border-none text-xl font-heading font-medium tracking-tight focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-white" 
              placeholder="BUSCAR PISTA POR NOMBRE, CIUDAD O CATEGORIA..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="hidden sm:flex gap-x-2">
              <button className="bg-white/5 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all">Indoor</button>
              <button className="bg-white/5 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all">Outdoor</button>
            </div>
          </div>
        </div>
      </section>

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
        {!isLoading && filteredTracks.length === 0 && (
          <div className="text-muted-foreground col-span-full">No se encontraron pistas.</div>
        )}
      </div>

      {/* PERFORMANCE STATS SECTION (Bento Style) */}
      <section className="mt-16 grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-card p-8 rounded-sm border border-border/50">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-heading font-bold text-xl uppercase tracking-widest italic text-white">Live Leaderboard</h4>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
              <span className="text-[10px] font-bold text-destructive uppercase tracking-widest hidden sm:inline">Live Track Status</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-sm hover:bg-white/10 transition-colors gap-y-4">
              <div className="flex items-center gap-4">
                <span className="font-heading font-bold text-lg text-[#cafd00] w-8">#1</span>
                <span className="font-heading font-bold uppercase text-white">J. Sanchez</span>
              </div>
              <div className="flex gap-4 sm:gap-12 items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Best: 00:44.120</span>
                <span className="font-heading font-bold text-[#cafd00] tabular-nums text-lg">43.882s</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-sm hover:bg-white/10 transition-colors gap-y-4">
              <div className="flex items-center gap-4">
                <span className="font-heading font-bold text-lg text-muted-foreground w-8">#2</span>
                <span className="font-heading font-bold uppercase text-white">M. Verstappen</span>
              </div>
              <div className="flex gap-4 sm:gap-12 items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Best: 00:44.550</span>
                <span className="font-heading font-bold tabular-nums text-white text-lg">44.021s</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#e12a00] p-8 rounded-sm flex flex-col justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Next GP Event</span>
            <h4 className="font-heading font-bold text-4xl italic text-white mt-4 leading-none uppercase tracking-tighter">Velocity Masters</h4>
            <p className="text-white/60 text-xs mt-4 font-medium uppercase tracking-widest">Nov 24 • Cajicá Circuit</p>
          </div>
          <button className="relative z-10 bg-white text-[#e12a00] px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest mt-8 self-start active:scale-95 transition-transform hover:bg-white/90">
            Register Now
          </button>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={160} className="text-white" fill="currentColor" />
          </div>
        </div>
      </section>
    </div>
  );
}
