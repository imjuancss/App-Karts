import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChampionships } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';

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

  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.card-hover');
    for (const card of cards) {
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
    <div className="flex flex-col gap-10 md:gap-16 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12 pb-20 relative">

      {/* Hero Header Section */}
      <header className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3 font-headline">
            <span className="material-symbols-outlined text-primary-dim text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            Campeonatos Activos
          </h3>
          <p className="font-body text-on-surface-variant text-sm md:text-base max-w-lg leading-relaxed">
            Domina el asfalto. Únete a las ligas de karting más competitivas y demuestra tu velocidad.
          </p>
        </div>
        <KineticButton 
          variant="contained"
          color="primary"
          onClick={() => navigate('/championships/new')}
          className="shrink-0 font-headline font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 shadow-[0_0_40px_rgba(225,42,0,0.4)] cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          <span>NUEVO TORNEO</span>
        </KineticButton>
      </header>

      {/* Main Content - Bento Inspired Grid */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <p className="text-on-surface-variant animate-pulse font-headline text-lg">Cargando campeonatos...</p>
            </div>
          ) : (
            champs.map(champ => {
              const isOpen = champ.status?.toLowerCase().includes('abierta') || champ.status?.toLowerCase().includes('abiertas');
              return (
              <KineticCard
                key={champ.id}
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
                      {champ.tracks?.name || 'Pista no asignada'}
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
          {!isLoading && champs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-on-surface-variant font-headline text-lg">No se encontraron campeonatos activos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
