import { useState, useEffect } from 'react';
import { Radio, Calendar, ExternalLink, Clock, RotateCw, Volume2, Info, Loader2 } from 'lucide-react';
import { getMotorsportNews, checkAndUpdateNews, fetchExternalMotorsportNews } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';

export default function Live() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Actualizando...');

  const todayRaces = [
    {
      id: 1,
      series: 'Formula 1',
      event: 'GP de España (Barcelona)',
      session: 'Prácticas Libres 1 (FP1)',
      time: '13:30 (Esp) / 07:30 (Col)',
      status: 'Finalizado',
      badgeClass: 'bg-primary/10 text-primary-dim'
    },
    {
      id: 2,
      series: 'Formula 1',
      event: 'GP de España (Barcelona)',
      session: 'Prácticas Libres 2 (FP2)',
      time: '17:00 (Esp) / 11:00 (Col)',
      status: 'Próximamente',
      badgeClass: 'bg-primary/10 text-primary-dim'
    },
    {
      id: 3,
      series: 'MotoGP',
      event: 'GP de República Checa (Brno)',
      session: 'Prácticas Libres 1',
      time: 'Viernes 19/Junio',
      status: 'Próximamente',
      badgeClass: 'bg-error-container/30 text-error'
    },
    {
      id: 4,
      series: 'IndyCar',
      event: 'GP de Road America',
      session: 'Prácticas Libres 1',
      time: 'Viernes 19/Junio',
      status: 'Próximamente',
      badgeClass: 'bg-tertiary-container/20 text-tertiary-fixed'
    },
    {
      id: 5,
      series: 'WRC',
      event: 'Rally Acrópolis de Grecia',
      session: 'Shakedown',
      time: 'Jueves 25/Junio',
      status: 'Próximamente',
      badgeClass: 'bg-surface-variant text-on-surface-variant'
    },
    {
      id: 6,
      series: 'WEC',
      event: '24 Horas de Le Mans',
      session: 'Carrera de Resistencia (24h)',
      time: 'Sábado 13/Junio - 16:00 (Esp) / 09:00 (Col)',
      status: 'Próximamente',
      badgeClass: 'bg-surface-variant text-on-surface-variant'
    }
  ];

  const filteredRaces = selectedCategory === 'Todos'
    ? todayRaces
    : todayRaces.filter(race => race.series === selectedCategory);

  async function loadData(forceUpdate = false) {
    if (forceUpdate) {
      setIsUpdating(true);
      setLastUpdatedText('Actualizando feeds...');
    } else {
      setIsLoading(true);
    }

    try {
      let dbNews = [];
      try {
        dbNews = await getMotorsportNews();
      } catch (err) {
        console.warn("Base de datos no disponible para cargar noticias:", err);
      }

      if (dbNews && dbNews.length > 0) {
        setNews(dbNews);
        setFilteredNews(dbNews);
        setIsLoading(false);
        const newest = new Date(dbNews[0].created_at);
        setLastUpdatedText(`Sincronizado: ${newest.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      }

      if (forceUpdate || !dbNews || dbNews.length === 0) {
        let externalNews = [];
        try {
          externalNews = await fetchExternalMotorsportNews();
        } catch (err) {
          console.error("Error obteniendo noticias externas:", err);
        }

        if (externalNews && externalNews.length > 0) {
          setNews(externalNews);
          setFilteredNews(externalNews);
          setLastUpdatedText(`Sincronizado (Local): ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
        }

        checkAndUpdateNews().catch(err => {
          console.warn("Sincronización de base de datos fallida en segundo plano:", err);
        });
      } else {
        checkAndUpdateNews().then(async () => {
          try {
            const updatedDbNews = await getMotorsportNews();
            if (updatedDbNews && updatedDbNews.length > 0 && 
                (updatedDbNews.length !== dbNews.length || 
                 (updatedDbNews[0] && dbNews[0] && updatedDbNews[0].id !== dbNews[0].id))) {
              setNews(updatedDbNews);
              setFilteredNews(updatedDbNews);
              const newest = new Date(updatedDbNews[0].created_at);
              setLastUpdatedText(`Sincronizado: ${newest.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
            }
          } catch (e) {
            console.warn("No se pudo refrescar datos de DB:", e);
          }
        }).catch(err => console.warn("Error en sincronización silenciosa:", err));
      }
    } catch (err) {
      console.error("Error cargando noticias:", err);
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, news]);

  const getBadgeClass = (category) => {
    switch(category?.toLowerCase()) {
      case 'formula 1': return 'bg-primary/10 text-primary-dim';
      case 'motogp': return 'bg-error-container/30 text-error';
      case 'indycar': return 'bg-tertiary-container/20 text-tertiary-fixed';
      case 'wrc': return 'bg-surface-variant text-on-surface-variant';
      case 'wec': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const categories = ['Todos', 'Formula 1', 'MotoGP', 'IndyCar', 'WRC', 'WEC'];

  return (
    <div className="fade-in max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-4 items-center">
            <h3 className="text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
              <Radio className="text-primary" size={36} /> Motorsport En Vivo
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-error-container/20 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="text-error text-xs font-bold font-sans tracking-widest uppercase">EN VIVO</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-base">
            Panel unificado de noticias y transmisiones de las categorías reinas del automovilismo mundial.
          </p>
        </div>

        <div className="flex flex-row gap-4 items-center">
          <span className="text-sm text-on-surface-variant/50 font-mono">{lastUpdatedText}</span>
          <KineticButton 
            variant="outlined" 
            onClick={() => loadData(true)} 
            disabled={isUpdating}
            className="p-2 min-w-0"
          >
            <RotateCw size={18} className={isUpdating ? "animate-spin text-primary" : "text-on-surface"} />
          </KineticButton>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-8 border-b border-surface-container-high pb-4">
        <FilterGroup value={selectedCategory} onValueChange={setSelectedCategory} className="w-full my-5">
          {categories.map(cat => (
            <FilterItem key={cat} value={cat}>
              {cat}
            </FilterItem>
          ))}
        </FilterGroup>
      </div>

      {/* Grid Layout Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Noticias */}
        <div className="md:col-span-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-on-surface-variant font-sans">Sintonizando transmisiones externas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up">
              {filteredNews.map((item, index) => (
                <div
                  key={item.id || item.link || index}
                  className="bg-surface-container rounded-2xl flex flex-col h-full overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-3 flex-grow">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant/70">
                      <span className="font-bold">{item.source}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} /> 
                        {new Date(item.pub_date).toLocaleDateString([], {day: 'numeric', month: 'short'})} a las {new Date(item.pub_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-on-surface line-clamp-2 leading-tight">
                      {item.title}
                    </h4>

                    <p className="text-sm text-on-surface-variant line-clamp-3">
                      {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-surface-container-high flex justify-end">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-tertiary transition-colors"
                      >
                        Leer artículo <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNews.length === 0 && (
                <div className="col-span-full py-20 text-center bg-surface-container/50 rounded-2xl p-8">
                  <Info size={32} className="mx-auto mb-2 text-on-surface-variant/50" />
                  <p className="text-on-surface-variant">No hay noticias en vivo disponibles en este momento para {selectedCategory}.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Widgets Embebidos y Agenda */}
        <div className="md:col-span-4 slide-up">
          <div className="flex flex-col gap-6">
            
            {/* Widget 1: Próximas Sesiones */}
            <div className="bg-surface-container rounded-2xl p-6">
              <div className="flex flex-row gap-3 items-center mb-4 border-b border-surface-container-high pb-3">
                <Calendar className="text-primary" size={20} />
                <div>
                  <h6 className="text-lg font-bold text-on-surface leading-tight">Próximas Sesiones</h6>
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono">Calendario Oficial</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {filteredRaces.map((race) => (
                  <div 
                    key={race.id} 
                    className="p-4 rounded-lg bg-surface-container-high flex flex-col gap-1 transition-colors hover:bg-surface-variant/30"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${race.badgeClass}`}>{race.series}</span>
                      <span className="text-xs font-mono font-bold text-on-surface-variant">{race.time}</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">{race.event}</p>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-on-surface-variant">{race.session}</span>
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                        race.status === 'En Vivo' ? 'bg-error-container/20 text-error animate-pulse' :
                        race.status === 'Finalizado' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {race.status}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredRaces.length === 0 && (
                  <span className="text-xs text-on-surface-variant text-center py-4">
                    No hay sesiones programadas para esta categoría.
                  </span>
                )}
              </div>
            </div>

            {/* Widget 2: Información de Sincronización */}
            <div className="bg-surface-variant/30 rounded-lg p-4 flex flex-row gap-3 items-start border-l-2 border-primary">
              <Volume2 size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-on-surface-variant">
                Las noticias y horarios se sincronizan automáticamente cada hora en base a la actividad del usuario en la plataforma.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
