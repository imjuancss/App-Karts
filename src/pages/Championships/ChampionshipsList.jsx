import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChampionships } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import { Input } from '../../components/ui/input';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';
import { Loader2 } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

function getChampionshipTrackLabel(champ) {
  const trackNames = new Set();
  if (champ.tracks?.name) trackNames.add(champ.tracks.name);
  champ.championship_rounds?.forEach((round) => {
    if (round.tracks?.name) trackNames.add(round.tracks.name);
  });
  const names = Array.from(trackNames);
  if (names.length === 0) return 'Pista no asignada';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

function championshipHasTrack(champ, trackId) {
  if (champ.track_id === trackId) return true;
  return champ.championship_rounds?.some((round) => round.track_id === trackId) ?? false;
}

export default function ChampionshipsList() {
  const navigate = useNavigate();
  const [champs, setChamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('Todos');

  useEffect(() => {
    async function loadChamps() {
      setIsLoading(true);
      const data = await getChampionships();
      setChamps(data || []);
      setIsLoading(false);
    }
    loadChamps();
  }, []);

  const trackOptions = useMemo(() => {
    const map = new Map();
    champs.forEach((champ) => {
      if (champ.tracks?.id && champ.tracks?.name) {
        map.set(champ.tracks.id, champ.tracks.name);
      }
      champ.championship_rounds?.forEach((round) => {
        if (round.tracks?.id && round.tracks?.name) {
          map.set(round.tracks.id, round.tracks.name);
        }
      });
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }, [champs]);

  const filteredChamps = champs.filter((champ) => {
    const trackLabel = getChampionshipTrackLabel(champ).toLowerCase();
    const matchesSearch =
      champ.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      champ.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trackLabel.includes(searchTerm.toLowerCase());

    const matchesTrack =
      selectedTrack === 'Todos' || championshipHasTrack(champ, selectedTrack);

    return matchesSearch && matchesTrack;
  });

  const handleMouseMove = (e) => {
    const card = e.target.closest ? e.target.closest('.card-hover') : null;
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <PageContainer className="fade-in">
      <PageHeader
        layout="row"
        title="Campeonatos Activos"
        description="Domina el asfalto. Únete a las ligas de karting más competitivas y demuestra tu velocidad."
        icon={
          <span className="material-symbols-outlined text-primary-dim text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
        }
        actions={
          <KineticButton
            variant="contained"
            color="primary"
            onClick={() => navigate('/championships/new')}
            className="shrink-0 font-headline font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 shadow-[0_0_40px_rgba(225,42,0,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>NUEVO TORNEO</span>
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
            placeholder="BUSCAR CAMPEONATO POR NOMBRE, ESTADO O PISTA..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterGroup value={selectedTrack} onValueChange={setSelectedTrack} className="w-full flex-wrap">
          <FilterItem value="Todos" className="shrink-0">TODOS</FilterItem>
          {trackOptions.map(([trackId, trackName]) => (
            <FilterItem key={trackId} value={trackId} className="shrink-0">
              {trackName.toUpperCase()}
            </FilterItem>
          ))}
        </FilterGroup>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start slide-up">
        {isLoading ? (
          <div className="col-span-full flex flex-col justify-center items-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-on-surface-variant text-sm font-sans">Cargando campeonatos...</p>
          </div>
        ) : (
          filteredChamps.map(champ => {
            const isOpen = champ.status?.toLowerCase().includes('abierta') || champ.status?.toLowerCase().includes('abiertas');
            return (
              <KineticCard
                key={champ.id}
                className="card-hover"
                onClick={() => navigate(`/championships/${champ.id}`)}
                badge={
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-label font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider ${isOpen ? 'bg-tertiary-fixed text-black' : 'bg-surface-container-highest text-on-surface-variant/40'}`}>
                      {champ.status ? champ.status.toUpperCase() : 'DEFINIDO'}
                    </span>
                    <span className="text-on-surface-variant/40 font-label font-bold text-[10px] px-4 py-0.5 bg-surface-container-highest rounded-sm uppercase tracking-wider">
                      {champ.type ? champ.type.toUpperCase() : 'LIGA'}
                    </span>
                  </div>
                }
                title={champ.name}
                subtitle={
                  <div className="flex items-center gap-2 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-lg">map</span>
                    <span className="font-label text-xs uppercase tracking-wide">
                      {getChampionshipTrackLabel(champ)}
                    </span>
                  </div>
                }
                footer={
                  <div className="flex justify-between items-center w-full text-on-surface-variant/60 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                      <span className="font-label text-xs">{champ.start_date || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span className="font-label text-xs uppercase tracking-tighter">Pilotos</span>
                    </div>
                  </div>
                }
              />
            );
          })
        )}
        {!isLoading && filteredChamps.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-on-surface-variant font-headline text-lg">
              {champs.length === 0
                ? 'No se encontraron campeonatos activos.'
                : 'No hay campeonatos que coincidan con tu búsqueda o filtro.'}
            </p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
