import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Clock, RotateCw, Volume2, Info, Loader2 } from 'lucide-react';
import { getMotorsportNews, checkAndUpdateNews, fetchExternalMotorsportNews, fetchMotorsportCalendars } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';

export default function Live() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [filteredCalendar, setFilteredCalendar] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Actualizando...');

  const loadCalendar = async () => {
    setIsCalendarLoading(true);
    try {
      const events = await fetchMotorsportCalendars();
      setCalendarEvents(events);
      if (selectedCategory === 'Todos') {
        setFilteredCalendar(events);
      } else {
        setFilteredCalendar(events.filter(race => race.series === selectedCategory));
      }
    } catch (e) {
      console.error("Error fetching calendar:", e);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  async function loadData(forceUpdate = false) {
    loadCalendar();
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
      setFilteredCalendar(calendarEvents);
    } else {
      setFilteredNews(news.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase()));
      setFilteredCalendar(calendarEvents.filter(item => item.series?.toLowerCase() === selectedCategory.toLowerCase()));
    }
  }, [selectedCategory, news, calendarEvents]);

  const getBadgeClass = (category) => {
    switch(category?.toLowerCase()) {
      case 'formula 1': return 'bg-primary/10 text-primary-dim';
      case 'motogp': return 'bg-error-container/30 text-error';
      case 'indycar': return 'bg-tertiary-container/20 text-tertiary-fixed';
      case 'wrc': return 'bg-surface-variant text-on-surface-variant';
      case 'wec': return 'bg-surface-variant text-on-surface-variant';
      case 'imsa': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const categories = ['Todos', 'Formula 1', 'MotoGP', 'IndyCar', 'WRC', 'WEC', 'IMSA'];

  return (
    <PageContainer className="fade-in">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3 font-headline">
              <span className="material-symbols-outlined text-primary-dim text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
              Motorsport En Vivo
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-error-container/20 rounded-sm whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="text-error text-xs font-bold font-sans tracking-widest uppercase">EN VIVO</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-base">
            Panel unificado de noticias y transmisiones de las categorías reinas del automovilismo mundial.
          </p>
        </div>
        <div className="flex flex-row gap-4 items-center shrink-0">
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
      </header>

      <FilterGroup value={selectedCategory} onValueChange={setSelectedCategory} className="w-full flex-wrap">
        {categories.map(cat => (
          <FilterItem key={cat} value={cat} className="shrink-0">
            {cat}
          </FilterItem>
        ))}
      </FilterGroup>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-on-surface-variant font-sans">Sintonizando transmisiones externas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up">
              {filteredNews.map((item, index) => (
                <KineticCard
                  key={item.id || item.link || index}
                  image={item.image_url}
                  imageAlt={item.title}
                  badge={
                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  }
                  metadata={
                    <>
                      <span className="font-bold">{item.source}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {new Date(item.pub_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </span>
                    </>
                  }
                  title={item.title}
                  description={item.description}
                  footer={
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-tertiary transition-colors"
                    >
                      Leer artículo <ExternalLink size={12} />
                    </a>
                  }
                />
              ))}

              {filteredNews.length === 0 && (
                <div className="col-span-full py-20 text-center bg-surface-container/50 rounded-sm p-8 flex flex-col items-center gap-3">
                  <Info size={32} className="text-on-surface-variant/50" />
                  <p className="text-on-surface-variant">No hay noticias en vivo disponibles en este momento para {selectedCategory}.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-4 slide-up">
          <ContentSection>
            <div className="bg-surface-container rounded-sm p-6 flex flex-col gap-4">
              <div className="flex flex-row gap-3 items-center">
                <Calendar className="text-primary shrink-0" size={20} />
                <div className="flex flex-col gap-1">
                  <h6 className="text-lg font-bold text-on-surface leading-tight">Próximas Sesiones</h6>
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono">Calendario Oficial</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {isCalendarLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : (
                  <>
                    {filteredCalendar.map((race) => (
                      <div
                        key={race.id}
                        className="p-4 rounded-sm bg-surface-container-high flex flex-col gap-2 transition-colors hover:bg-surface-variant/30"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(race.series)}`}>{race.series}</span>
                          <span className="text-xs font-mono font-bold text-on-surface-variant text-right">{race.time}</span>
                        </div>
                        <p className="text-sm font-bold text-on-surface">{race.event}</p>
                        <div className="flex justify-between items-center gap-2 text-xs">
                          <span className="text-on-surface-variant line-clamp-1">{race.session}</span>
                          <span className={`font-mono text-[10px] shrink-0 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                            race.status === 'En Vivo' ? 'bg-error-container/20 text-error animate-pulse' :
                            race.status === 'Finalizado' ? 'bg-surface-variant text-on-surface-variant' :
                            'bg-surface-container text-on-surface-variant'
                          }`}>
                            {race.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredCalendar.length === 0 && (
                      <span className="text-xs text-on-surface-variant text-center py-4">
                        No hay sesiones programadas para esta categoría en los próximos días.
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-surface-variant/30 rounded-sm p-4 flex flex-row gap-3 items-start border-l-2 border-primary">
              <Volume2 size={18} className="text-primary shrink-0" />
              <p className="text-sm text-on-surface-variant">
                Las noticias y horarios se sincronizan automáticamente cada hora en base a la actividad del usuario en la plataforma.
              </p>
            </div>
          </ContentSection>
        </div>
      </div>
    </PageContainer>
  );
}
