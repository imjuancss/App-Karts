import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Plus, Filter, ChevronRight, Zap } from 'lucide-react';
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
    <div className="fade-in max-w-[1400px] mx-auto">
      {/* HEADER ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-y-6">
        <div className="max-w-2xl">
          <h2 className="font-heading font-bold text-5xl italic tracking-tighter mb-4 leading-none uppercase text-white">Pistas de Karts</h2>
          <p className="text-muted-foreground font-body text-lg max-w-md">
            Los circuitos más exigentes del país. Filtrados por rendimiento, diseñados para la velocidad.
          </p>
        </div>
        <button 
          onClick={() => navigate('/tracks/new')} 
          className="kinetic-gradient px-8 py-4 flex items-center gap-x-3 rounded-sm group active:scale-95 transition-transform"
        >
          <Plus className="text-white" size={24} />
          <span className="font-heading font-bold text-white tracking-widest text-sm uppercase">Registrar Nueva Pista</span>
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

      {/* BENTO GRID CIRCUIT CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="text-muted-foreground">Cargando pistas...</div>
        ) : (
          filteredTracks.map(track => (
            <div 
              key={track.id}
              onClick={() => navigate(`/tracks/${track.id}`)}
              className="group cursor-pointer relative bg-card rounded-sm overflow-hidden flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-border/50 hover:border-primary/50"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
                  alt={track.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-[#cafd00] text-[#3a4a00] px-3 py-1 rounded-sm flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  <span className="font-heading font-bold text-xs">{track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-heading font-bold text-2xl mb-1 uppercase tracking-tighter italic text-white">{track.name}</h3>
                <div className="flex items-center gap-x-2 text-muted-foreground mb-6">
                  <MapPin size={16} />
                  <span className="text-[11px] font-body uppercase tracking-wider line-clamp-1">{track.location}</span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Pricing</span>
                    <span className="font-heading font-bold text-lg text-primary">
                      {track.cost_info ? track.cost_info.split(' ')[0] : '$46.000'} <span className="text-[10px] opacity-60 uppercase">{track.cost_info ? track.cost_info.split(' ').slice(1).join(' ') : 'COP'}</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Session</span>
                    <span className="font-heading font-bold text-lg text-white">10 MINS</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <div className="w-16 h-10 opacity-40 group-hover:opacity-100 transition-opacity">
                    <svg fill="none" stroke="#FF3100" strokeWidth="3" viewBox="0 0 100 60">
                      <path d="M10,30 Q30,10 50,30 T90,30 Q70,50 50,40 T10,30" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <button className="bg-white/5 w-10 h-10 flex items-center justify-center rounded-sm group-hover:bg-primary transition-colors">
                    <ChevronRight className="text-white" size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {!isLoading && filteredTracks.length === 0 && (
          <div className="text-muted-foreground col-span-full">No se encontraron pistas.</div>
        )}
      </section>

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
