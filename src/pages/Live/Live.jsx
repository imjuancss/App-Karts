import { useState, useEffect } from 'react';
import { Radio, Calendar, ExternalLink, Clock, RotateCw, Volume2, Info } from 'lucide-react';
import { getMotorsportNews, checkAndUpdateNews, fetchExternalMotorsportNews } from '../../services/api';
import KineticCard from '../../components/ui/KineticCard';
import KineticButton from '../../components/ui/KineticButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import './Live.css';

export default function Live() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Actualizando...');

  // Mock de Carreras del Día (dinámico según fecha actual)
  const today = new Date();
  const formattedDateString = today.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const todayRaces = [
    {
      id: 1,
      series: 'Formula 1',
      event: 'GP de España (Barcelona)',
      session: 'Prácticas Libres 1 (FP1)',
      time: '13:30 (Esp) / 07:30 (Col)',
      status: 'Finalizado',
      badgeClass: 'badge-f1'
    },
    {
      id: 2,
      series: 'Formula 1',
      event: 'GP de España (Barcelona)',
      session: 'Prácticas Libres 2 (FP2)',
      time: '17:00 (Esp) / 11:00 (Col)',
      status: 'Próximamente',
      badgeClass: 'badge-f1'
    },
    {
      id: 3,
      series: 'MotoGP',
      event: 'GP de República Checa (Brno)',
      session: 'Prácticas Libres 1',
      time: 'Viernes 19/Junio',
      status: 'Próximamente',
      badgeClass: 'badge-motogp'
    },
    {
      id: 4,
      series: 'IndyCar',
      event: 'GP de Road America',
      session: 'Prácticas Libres 1',
      time: 'Viernes 19/Junio',
      status: 'Próximamente',
      badgeClass: 'badge-indycar'
    },
    {
      id: 5,
      series: 'WRC',
      event: 'Rally Acrópolis de Grecia',
      session: 'Shakedown',
      time: 'Jueves 25/Junio',
      status: 'Próximamente',
      badgeClass: 'badge-wrc'
    },
    {
      id: 6,
      series: 'WEC',
      event: '24 Horas de Le Mans',
      session: 'Carrera de Resistencia (24h)',
      time: 'Sábado 13/Junio - 16:00 (Esp) / 09:00 (Col)',
      status: 'Próximamente',
      badgeClass: 'badge-wec'
    }
  ];

  const filteredRaces = selectedCategory === 'Todos'
    ? todayRaces
    : todayRaces.filter(race => race.series === selectedCategory);

  // Carga inicial y lógica de verificación de actualización
  async function loadData(forceUpdate = false) {
    if (forceUpdate) {
      setIsUpdating(true);
      setLastUpdatedText('Actualizando feeds...');
    } else {
      setIsLoading(true);
    }

    try {
      // 1. Cargar noticias existentes de la DB (para visualización instantánea)
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

      // 2. Si es carga inicial, actualización forzada, o la DB está vacía/incompleta:
      if (forceUpdate || !dbNews || dbNews.length === 0) {
        // Intentar traer noticias externas directamente para mostrarlas de inmediato en la UI
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

        // De fondo, intentar sincronizar con la base de datos (por si ya existe la tabla)
        checkAndUpdateNews().catch(err => {
          console.warn("Sincronización de base de datos fallida en segundo plano:", err);
        });
      } else {
        // Ejecutar verificación en segundo plano de forma silenciosa si ya tenemos datos
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

  // Filtrado de noticias por categoría
  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, news]);

  // Manejador para categoría badge CSS
  const getBadgeClass = (category) => {
    switch(category?.toLowerCase()) {
      case 'formula 1':
        return 'badge-f1';
      case 'motogp':
        return 'badge-motogp';
      case 'indycar':
        return 'badge-indycar';
      case 'wrc':
        return 'badge-wrc';
      case 'wec':
        return 'badge-wec';
      default:
        return 'badge-general';
    }
  };

  const categories = ['Todos', 'Formula 1', 'MotoGP', 'IndyCar', 'WRC', 'WEC'];

  return (
    <div className="fade-in px-4 py-6 md:py-10 max-w-7xl mx-auto pb-24">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Typography variant="h3" fontWeight="bold" color="white" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Radio className="text-[#FF3100]" size={36} /> Motorsport En Vivo
            </Typography>
            <div className="live-indicator-container">
              <span className="live-indicator-dot"></span>
              <span className="text-white text-xs font-bold font-sans tracking-widest uppercase">EN VIVO</span>
            </div>
          </Stack>
          <Typography variant="subtitle1" color="text.secondary">
            Panel unificado de noticias y transmisiones de las categorías reinas del automovilismo mundial.
          </Typography>
        </div>

        <Stack direction="row" spacing={2} alignItems="center">
          <span className="text-sm text-white/50 font-mono">{lastUpdatedText}</span>
          <KineticButton 
            variant="outlined" 
            onClick={() => loadData(true)} 
            disabled={isUpdating}
            style={{ minWidth: 'auto', padding: '8px' }}
          >
            <RotateCw size={18} className={isUpdating ? "animate-spin text-[#FF3100]" : "text-white"} />
          </KineticButton>
        </Stack>
      </div>

      {/* Barra de Filtros (Encima de todo el contenido) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/5 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Layout Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Noticias */}
        <div className="md:col-span-8">

          {/* Listado de Noticias */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <CircularProgress color="primary" />
              <Typography color="text.secondary" className="font-sans">Sintonizando transmisiones externas...</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up">
              {filteredNews.map((item, index) => (
                <KineticCard
                  key={item.id || item.link || index}
                  className="news-card"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    p: 0,
                    overflow: 'hidden',
                  }}
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
                      <span className={`category-badge ${getBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <Stack spacing={1.5} sx={{ p: 3, flexGrow: 1 }}>
                    <div className="flex justify-between items-center text-xs text-white/50">
                      <span className="font-bold">{item.source}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} /> 
                        {new Date(item.pub_date).toLocaleDateString([], {day: 'numeric', month: 'short'})} a las {new Date(item.pub_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <Typography variant="h6" fontWeight="bold" color="white" className="line-clamp-2 leading-tight">
                      {item.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" className="line-clamp-3">
                      {item.description}
                    </Typography>

                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-end">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3100] hover:text-[#cafd00] transition"
                      >
                        Leer artículo <ExternalLink size={12} />
                      </a>
                    </div>
                  </Stack>
                </KineticCard>
              ))}

              {filteredNews.length === 0 && (
                <div className="col-span-full py-16 text-center glass-panel p-6">
                  <Info size={32} className="mx-auto mb-2 text-white/30" />
                  <Typography color="text.secondary">No hay noticias en vivo disponibles en este momento para {selectedCategory}.</Typography>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Widgets Embebidos y Agenda */}
        <div className="md:col-span-4 slide-up">
          <Stack spacing={4}>
            
            {/* Widget 1: Próximas Sesiones */}
            <KineticCard sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', pb: 1.5 }}>
                <Calendar className="text-[#FF3100]" size={20} />
                <div>
                  <Typography variant="h6" fontWeight="bold" color="white">Próximas Sesiones</Typography>
                  <span className="text-[10px] text-white/50 uppercase font-mono">Calendario Oficial</span>
                </div>
              </Stack>
              
              <Stack spacing={2}>
                {filteredRaces.map((race) => (
                  <div 
                    key={race.id} 
                    className="p-3 rounded-[2px] bg-white/5 border border-white/5 flex flex-col gap-1 transition hover:bg-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`category-badge ${race.badgeClass}`}>{race.series}</span>
                      <span className="text-xs font-mono font-bold text-white/70">{race.time}</span>
                    </div>
                    <Typography variant="body2" fontWeight="bold" color="white">{race.event}</Typography>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-white/60">{race.session}</span>
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] ${
                        race.status === 'En Vivo' ? 'bg-[#FF3100]/20 text-[#FF3100] animate-pulse' :
                        race.status === 'Finalizado' ? 'bg-white/10 text-white/40' :
                        'bg-white/5 text-white/60'
                      }`}>
                        {race.status}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredRaces.length === 0 && (
                  <span className="text-xs text-white/40 font-sans text-center py-4">
                    No hay sesiones programadas para esta categoría.
                  </span>
                )}
              </Stack>
            </KineticCard>

            {/* Widget 2: Información de Sincronización */}
            <Alert 
              severity="info" 
              icon={<Volume2 size={18} />}
              sx={{ 
                backgroundColor: 'rgba(26, 30, 36, 0.4)', 
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontFamily: '"Outfit", sans-serif',
                '& .MuiAlert-icon': { color: 'var(--accent)' }
              }}
            >
              Las noticias y horarios se sincronizan automáticamente cada hora en base a la actividad del usuario en la plataforma.
            </Alert>

          </Stack>
        </div>

      </div>
    </div>
  );
}
