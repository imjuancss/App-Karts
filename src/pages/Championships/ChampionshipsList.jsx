import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChampionships } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';

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
    <div className="relative min-h-[calc(100vh-4rem)] pb-12">
      {/* Visual Background Element: Kinetic Mesh Overlay */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-dim blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed/20 blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Hero Header Section */}
      <header className="relative pt-12 pb-8 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tighter uppercase leading-none">
            CAMPEONATOS ACTIVOS
          </h1>
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
      <main className="px-6 md:px-12 max-w-7xl mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <p className="text-on-surface-variant animate-pulse font-headline text-lg">Cargando campeonatos...</p>
            </div>
          ) : (
            champs.map(champ => {
              const isOpen = champ.status?.toLowerCase().includes('abierta') || champ.status?.toLowerCase().includes('abiertas');
              return (
                <div 
                  key={champ.id}
                  onClick={() => navigate(`/championships/${champ.id}`)}
                  className="group relative bg-surface-container-low rounded-sm p-8 flex flex-col justify-between min-h-[240px] card-hover border-none overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-dim/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-dim/10 transition-colors"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`font-label font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider ${isOpen ? 'bg-tertiary-fixed text-black' : 'bg-surface-container-highest text-on-surface-variant/40'}`}>
                        {champ.status ? champ.status.toUpperCase() : 'DEFINIDO'}
                      </span>
                      <span className="text-on-surface-variant/40 font-label font-bold text-[10px] px-4 py-0.5 bg-surface-container-highest rounded-sm uppercase tracking-wider">
                        {champ.type ? champ.type.toUpperCase() : 'LIGA'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-xl lg:text-2xl tracking-tight leading-tight">
                        {champ.name}
                      </h3>
                      <div className="flex items-center gap-2 text-on-surface-variant/70">
                        <span className="material-symbols-outlined text-lg">map</span>
                        <span className="font-label text-xs uppercase tracking-wide">
                          {champ.tracks?.name || 'Pista no asignada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 flex justify-between items-center text-on-surface-variant/60 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                      <span className="font-label text-xs">{champ.start_date || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span className="font-label text-xs uppercase tracking-tighter">Pilotos</span>
                    </div>
                  </div>
                </div>
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
