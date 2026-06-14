import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Zap, Loader2 } from 'lucide-react';
import { getTracks } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';

export default function TracksList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    
    const isIndoor = t.name?.toLowerCase().includes('indoor') || t.description?.toLowerCase().includes('indoor');
    if (categoryFilter === 'indoor') return matchesSearch && isIndoor;
    if (categoryFilter === 'outdoor') return matchesSearch && !isIndoor;
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12 pb-20 font-body">
      
      {/* Hero Title Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl md:text-6xl font-bold uppercase tracking-tight leading-none">
            Pistas de Karts
          </h2>
          <p className="font-body text-on-surface-variant text-base tracking-wide">
            Encuentra los mejores circuitos para correr en la región
          </p>
        </div>
        
        {/* Technical Search/Filter Bar */}
        <div className="w-full md:w-[500px] space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary-dim transition-colors" style={{ fontSize: '18px' }}>search</span>
            </div>
            <Input 
              className="pl-16 pr-6 py-6 text-[11px] font-label font-medium uppercase tracking-[0.1em]" 
              placeholder="BUSCAR PISTA POR NOMBRE, CIUDAD O CATEGORIA..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <FilterGroup value={categoryFilter} onValueChange={(val) => setCategoryFilter(categoryFilter === val ? 'all' : val)} className="flex w-full">
            <FilterItem value="indoor" className="flex-1">INDOOR</FilterItem>
            <FilterItem value="outdoor" className="flex-1">OUTDOOR</FilterItem>
          </FilterGroup>
        </div>
      </header>

      {/* Featured Circuit Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full flex flex-col justify-center items-center py-16 gap-2">
            <Loader2 className="animate-spin text-primary-dim" size={36} />
            <span className="text-on-surface-variant text-sm font-label uppercase tracking-wider">Cargando circuitos...</span>
          </div>
        ) : (
          filteredTracks.map(track => {
            const hasHighRating = track.rating_avg !== null && Number(track.rating_avg) >= 4.8;
            return (
              <div key={track.id} className="group relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-dim/5 blur-3xl rounded-full"></div>
                <div className="relative rounded-sm overflow-hidden bg-surface-container-low border border-outline-variant/10">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      alt={track.name} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                      src={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'} 
                    />
                    {hasHighRating && (
                      <div className="absolute top-4 right-4 bg-tertiary-fixed text-black px-2 py-1 flex items-center gap-1.5 shadow-[0_0_40px_rgba(202,253,0,0.15)] rounded-sm select-none">
                        <span className="font-headline text-[11px] font-bold tracking-widest uppercase">HOT TRACK</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                  </div>
                  
                  <div className="p-5 relative">
                    <div className="flex justify-between items-start mb-8 gap-4">
                      <div>
                        <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface leading-snug mb-3 group-hover:text-primary-dim transition-colors">{track.name}</h3>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          <span className="font-body text-[11px] tracking-wide uppercase">{track.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-highest px-4 py-1.5 shrink-0 rounded-sm">
                        <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-headline font-bold text-tertiary-fixed text-sm neon-glow">
                          {track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-surface-container-high/50 p-8 border-l-2 border-primary-dim rounded-r-sm">
                        <p className="font-body text-xs text-on-surface leading-relaxed tracking-wide">{track.cost_info || 'Consultar costo'}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/tracks/${track.id}`)}
                        className="w-full relative overflow-hidden group/btn py-4 flex justify-between items-center px-8 active:scale-[0.98] transition-transform rounded-sm border-none cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dim via-primary-fixed to-primary-dim opacity-100 group-hover/btn:animate-pulse"></div>
                        <span className="font-headline font-bold text-xs tracking-[0.15em] uppercase text-black relative z-10">VER DETALLES</span>
                        <span className="material-symbols-outlined text-black group-hover/btn:translate-x-1 transition-transform relative z-10" style={{ fontSize: '16px' }}>arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!isLoading && filteredTracks.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-on-surface-variant font-headline text-lg uppercase tracking-wider">No se encontraron pistas.</p>
          </div>
        )}
      </section>

      {/* PERFORMANCE STATS SECTION (Bento Style) */}
      <section className="mt-16 grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-surface-container-low p-10 rounded-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline font-bold text-xl uppercase tracking-widest italic text-white">Live Leaderboard</h4>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="text-[11px] font-bold text-error uppercase tracking-widest hidden sm:inline">Live Track Status</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-surface-container-high/50 border-l-2 border-tertiary-fixed rounded-r-sm hover:bg-surface-container-highest transition-colors gap-y-4">
              <div className="flex items-center gap-4">
                <span className="font-headline font-bold text-lg text-tertiary-fixed w-8">#1</span>
                <span className="font-headline font-bold uppercase text-white">J. Sanchez</span>
              </div>
              <div className="flex gap-4 sm:gap-12 items-center">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold font-label">Best: 00:44.120</span>
                <span className="font-display font-bold text-tertiary-fixed text-lg neon-glow">43.882s</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-surface-container-high/50 border-l-2 border-on-surface-variant/20 rounded-r-sm hover:bg-surface-container-highest transition-colors gap-y-4">
              <div className="flex items-center gap-4">
                <span className="font-headline font-bold text-lg text-on-surface-variant/60 w-8">#2</span>
                <span className="font-headline font-bold uppercase text-white">M. Verstappen</span>
              </div>
              <div className="flex gap-4 sm:gap-12 items-center">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold font-label">Best: 00:44.550</span>
                <span className="font-display font-bold text-white text-lg">44.021s</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-dim p-8 rounded-sm flex flex-col justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">Next GP Event</span>
            <h4 className="font-headline font-bold text-4xl italic text-white mt-4 leading-none uppercase tracking-tighter">Velocity Masters</h4>
            <p className="text-white/60 text-xs mt-4 font-medium uppercase tracking-widest">Nov 24 • Cajicá Circuit</p>
          </div>
          <KineticButton 
            variant="contained"
            color="inherit"
            className="relative z-10 bg-white text-primary-dim hover:bg-white/90 font-headline text-xs mt-8 self-start border-none"
          >
            Register Now
          </KineticButton>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={160} className="text-white" fill="currentColor" />
          </div>
        </div>
      </section>

      {/* Bottom Action Floating Button */}
      <div className="fixed bottom-8 right-6 md:right-12 z-50">
        <button 
          onClick={() => navigate('/tracks/new')}
          className="w-16 h-16 bg-tertiary-fixed text-black shadow-[0_0_30px_rgba(202,253,0,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 rounded-sm border-none cursor-pointer"
        >
          <span className="material-symbols-outlined font-bold" style={{ fontSize: '30px' }}>add</span>
        </button>
      </div>

    </div>
  );
}
