import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { getTracks } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import { Input } from '../../components/ui/input';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

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

    const type = t.circuit_type || 'kart';
    if (categoryFilter === 'kart') return matchesSearch && type === 'kart';
    if (categoryFilter === 'autodromo') return matchesSearch && type === 'autodromo';
    return matchesSearch;
  });

  return (
    <PageContainer className="fade-in">
      <PageHeader
        layout="row"
        title="Pistas de Karts"
        description="Encuentra los mejores circuitos para correr en la región"
        icon={
          <span className="material-symbols-outlined text-primary-dim text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
        }
        actions={
          <KineticButton
            variant="contained"
            color="primary"
            onClick={() => navigate('/tracks/new')}
            className="shrink-0 font-headline font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 shadow-[0_0_40px_rgba(225,42,0,0.4)]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>Crear Pista</span>
          </KineticButton>
        }
      />

      <div className="flex flex-col gap-4 w-full">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary-dim transition-colors" style={{ fontSize: '18px' }}>search</span>
          </div>
          <Input
            className="pl-16 pr-6 py-6 text-[11px] font-label font-medium uppercase tracking-[0.1em] w-full"
            placeholder="BUSCAR PISTA POR NOMBRE, CIUDAD O CATEGORIA..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterGroup value={categoryFilter} onValueChange={setCategoryFilter} className="flex w-full justify-start">
          <FilterItem value="all" className="shrink-0 text-[10px] sm:text-xs">TODOS</FilterItem>
          <FilterItem value="kart" className="shrink-0 text-[10px] sm:text-xs">KARTS</FilterItem>
          <FilterItem value="autodromo" className="shrink-0 text-[10px] sm:text-xs">AUTÓDROMO</FilterItem>
        </FilterGroup>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start slide-up">
        {isLoading ? (
          <div className="col-span-full flex flex-col justify-center items-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-on-surface-variant text-sm font-sans">Cargando circuitos...</p>
          </div>
        ) : (
          filteredTracks.map(track => {
            const hasHighRating = track.rating_avg !== null && Number(track.rating_avg) >= 4.8;
            return (
              <KineticCard
                key={track.id}
                image={track.cover_image || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'}
                imageAlt={track.name}
                badge={
                  hasHighRating ? (
                    <div className="bg-tertiary-fixed text-black px-2 py-1 flex items-center gap-1.5 shadow-[0_0_40px_rgba(202,253,0,0.15)] rounded-sm select-none">
                      <span className="font-headline text-[11px] font-bold tracking-widest uppercase">HOT TRACK</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    </div>
                  ) : null
                }
                title={
                  <div className="flex justify-between items-start w-full gap-4">
                    <span className="font-headline text-xl font-bold tracking-tight text-on-surface leading-snug group-hover:text-primary-dim transition-colors line-clamp-2">
                      {track.name}
                    </span>
                    <div className="flex items-center gap-1 bg-surface-container-highest px-3 py-1 shrink-0 rounded-sm">
                      <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-headline font-bold text-tertiary-fixed text-sm neon-glow">
                        {track.rating_avg !== null ? Number(track.rating_avg).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                }
                subtitle={
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="font-body text-[11px] tracking-wide uppercase">{track.location}</span>
                  </div>
                }
                footer={
                  <button
                    type="button"
                    onClick={() => navigate(`/tracks/${track.id}`)}
                    className="w-full relative overflow-hidden group/btn py-3 flex justify-between items-center px-6 active:scale-[0.98] transition-transform rounded-sm border-none cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dim via-primary-fixed to-primary-dim opacity-100 group-hover/btn:animate-pulse" />
                    <span className="font-headline font-bold text-xs tracking-[0.15em] uppercase text-black relative z-10">VER DETALLES</span>
                    <span className="material-symbols-outlined text-black group-hover/btn:translate-x-1 transition-transform relative z-10" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                }
              >
                <div className="bg-surface-container-high/50 p-4 border-l-2 border-primary-dim rounded-r-sm">
                  <p className="font-body text-xs text-on-surface leading-relaxed tracking-wide line-clamp-2">
                    {track.cost_info || 'Consultar costo'}
                  </p>
                </div>
              </KineticCard>
            );
          })
        )}
        {!isLoading && filteredTracks.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-on-surface-variant font-headline text-lg uppercase tracking-wider">No se encontraron pistas.</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
        <div className="xl:col-span-3 bg-surface-container-low p-6 md:p-8 rounded-sm border border-outline-variant/10 flex flex-col gap-6">
          <div className="flex justify-between items-center gap-4">
            <h4 className="font-headline font-bold text-xl uppercase tracking-widest italic text-white">Live Leaderboard</h4>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="text-[11px] font-bold text-error uppercase tracking-widest hidden sm:inline">Live Track Status</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-surface-container-high/50 border-l-2 border-tertiary-fixed rounded-r-sm hover:bg-surface-container-highest transition-colors gap-4">
              <div className="flex items-center gap-4">
                <span className="font-headline font-bold text-lg text-tertiary-fixed w-8">#1</span>
                <span className="font-headline font-bold uppercase text-white">J. Sanchez</span>
              </div>
              <div className="flex gap-4 sm:gap-12 items-center">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold font-label">Best: 00:44.120</span>
                <span className="font-display font-bold text-tertiary-fixed text-lg neon-glow">43.882s</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-surface-container-high/50 border-l-2 border-on-surface-variant/20 rounded-r-sm hover:bg-surface-container-highest transition-colors gap-4">
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

        <div className="bg-primary-dim p-6 md:p-8 rounded-sm flex flex-col justify-between gap-6 overflow-hidden relative group">
          <div className="relative z-10 flex flex-col gap-4">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">Next GP Event</span>
            <h4 className="font-headline font-bold text-4xl italic text-white leading-none uppercase tracking-tighter">Velocity Masters</h4>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Nov 24 • Cajicá Circuit</p>
          </div>
          <KineticButton
            variant="contained"
            color="inherit"
            className="relative z-10 bg-white text-primary-dim hover:bg-white/90 font-headline text-xs self-start border-none"
          >
            Register Now
          </KineticButton>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={160} className="text-white" fill="currentColor" />
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
