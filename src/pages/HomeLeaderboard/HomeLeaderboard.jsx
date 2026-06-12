import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Trophy, Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import KineticCard from '../../components/ui/KineticCard';
import KineticButton from '../../components/ui/KineticButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const formatMsToTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const formatGap = (leaderMs, currentMs) => {
  if (leaderMs === currentMs) return "Leader";
  const diff = currentMs - leaderMs;
  const seconds = Math.floor(diff / 1000);
  const milliseconds = diff % 1000;
  return `+${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
};

const ORIGINAL_VISUAL_STYLES = [
  { teamColor: "#FFD700", hasPole: true, textColor: "text-yellow-300", timeStroke: "#FFD700", timeTextColor: "text-yellow-300" },
  { teamColor: "#C0C0C0", hasPole: true, textColor: "text-gray-300", timeStroke: "#C0C0C0", timeTextColor: "text-gray-300" },
  { teamColor: "#CD7F32", hasPole: true, textColor: "text-orange-400", timeStroke: "#CD7F32", timeTextColor: "text-orange-400" }
];

export default function HomeLeaderboard() {
  const [selectedTrackId, setSelectedTrackId] = useState('track1');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('historical');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('lap_times')
          .select(`
            lap_time_ms,
            profiles (username, full_name),
            tracks (name, location, cover_image),
            created_at`
          )
          .eq('track_id', selectedTrackId)
          .order('lap_time_ms', { ascending: true });
        if (error) throw error;

        const now = Date.now();
        const weekMs = 7 * 86400000;
        const monthMs = 30 * 86400000;
        let filtered = data;
        if (selectedTimeFilter === 'week') {
          filtered = data.filter(d => (now - new Date(d.created_at).getTime()) <= weekMs);
        } else if (selectedTimeFilter === 'month') {
          filtered = data.filter(d => (now - new Date(d.created_at).getTime()) <= monthMs);
        }

        const leaderMs = filtered[0]?.lap_time_ms;
        const mapped = filtered.map((row, idx) => {
          const visualStyle = idx < 3 ? ORIGINAL_VISUAL_STYLES[idx] : { hasPole: false, teamColor: "transparent", timeStroke: "white", timeTextColor: "text-white" };
          return {
            id: row.id,
            name: row.profiles?.full_name || row.profiles?.username || 'Piloto',
            lapTimeMs: row.lap_time_ms,
            trackId: selectedTrackId,
            position: idx + 1,
            bestTime: formatMsToTime(row.lap_time_ms),
            gap: leaderMs !== undefined ? formatGap(leaderMs, row.lap_time_ms) : '',
            ...visualStyle,
          };
        });
        setFilteredLeaderboard(mapped);
      } catch (e) {
        console.error('Error loading leaderboard:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedTrackId, selectedTimeFilter]);

  const scrollContainerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const rafId = useRef(null);
  const lastScrollTop = useRef(0);
  const currentHeaderHeight = useRef(0);

  const MOBILE_MAX_H = 100;
  const DESKTOP_BREAKPOINT = 768;

  const handleScroll = () => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = mapContainerRef.current;
      const container = scrollContainerRef.current;
      if (!el || !container) return;

      const currentScrollTop = container.scrollTop;
      const delta = lastScrollTop.current - currentScrollTop;

      let newH = currentHeaderHeight.current + delta;
      newH = Math.min(MOBILE_MAX_H, Math.max(0, newH));

      const ratio = newH / MOBILE_MAX_H;
      el.style.height = `${newH}px`;
      el.style.opacity = ratio;
      el.style.marginTop = `${ratio * 8}px`;

      lastScrollTop.current = currentScrollTop;
      currentHeaderHeight.current = newH;
    });
  };

  useEffect(() => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    const el = mapContainerRef.current;
    if (!el) return;
    currentHeaderHeight.current = MOBILE_MAX_H;
    el.style.height = `${MOBILE_MAX_H}px`;
    el.style.opacity = '1';
    el.style.marginTop = '8px';
    el.style.marginBottom = '8px';
  }, []);

  return (
    <div className="w-full h-[calc(100dvh-70px)] md:h-[calc(100dvh-4rem)] flex flex-col items-center">
      <div className="w-full h-full max-w-md mx-auto md:max-w-2xl relative flex flex-col">

        <div className="flex-shrink-0 z-40 pb-2 pt-4 px-4 w-full flex flex-col gap-4">
          <div className="self-stretch flex flex-col justify-start items-start md:gap-4">
            
            {/* Track Selector */}
            <div className="w-full md:mb-0">
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger className="w-full rounded-none font-bold uppercase text-xs tracking-wide border-none bg-transparent shadow-none p-0 h-auto justify-start focus:ring-0 text-white">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#FF3100]" />
                    <SelectValue placeholder="Selecciona una pista">
                      {selectedTrackId === 'track1' ? 'CITY KARTS - CC. SANTAFÉ BOGOTÁ' : 'XTREME KARTS CAJICÁ'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" sideOffset={8} className="bg-[#1a1a1a] border-white/10 text-white rounded-md">
                  <SelectItem value="track1" className="text-xs font-bold uppercase cursor-pointer py-3 focus:bg-white/10">CITY KARTS - CC. SANTAFÉ BOGOTÁ</SelectItem>
                  <SelectItem value="track2" className="text-xs font-bold uppercase cursor-pointer py-3 focus:bg-white/10">XTREME KARTS CAJICÁ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Header Map */}
            <div
              ref={mapContainerRef}
              className="w-full rounded-md overflow-hidden shrink-0 mb-2 md:h-[140px] md:opacity-100 md:mb-4 border border-white/10 relative"
              style={{ willChange: 'height, opacity' }}
            >
              <img 
                className="w-full h-full object-cover absolute inset-0 opacity-40 mix-blend-luminosity" 
                src="https://placehold.co/800x400/121212/333333" 
                alt="Track cover" 
                fetchpriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1 drop-shadow-md">
                  <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z" strokeDasharray="4 4" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <span className="text-white/60 text-[10px] font-mono tracking-widest uppercase font-bold drop-shadow-md">Mapa del Circuito</span>
              </div>
            </div>

            {/* Time filters */}
            <Stack direction="row" spacing={1} sx={{ width: '100%', mb: 1 }}>
              {['week', 'month', 'historical'].map((filter) => (
                <KineticButton
                  key={filter}
                  variant={selectedTimeFilter === filter ? 'contained' : 'outlined'}
                  color={selectedTimeFilter === filter ? 'primary' : 'inherit'}
                  onClick={() => setSelectedTimeFilter(filter)}
                  sx={{ flex: 1, py: 1, fontSize: '0.75rem' }}
                >
                  {filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Histórico'}
                </KineticButton>
              ))}
            </Stack>
          </div>

          <div className="flex justify-between items-center w-full px-2 mt-1 mb-1">
            <div className="flex items-center gap-6">
              <div className="text-white/40 text-[10px] font-bold tracking-widest w-[24px] text-center">POS</div>
              <div className="text-white/40 text-[10px] font-bold tracking-widest text-left">DRIVER</div>
            </div>
            <div className="text-white/40 text-[10px] font-bold tracking-widest text-right">LAP</div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pb-28 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <Stack spacing={1.5} sx={{ w: '100%' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center w-full py-16 gap-4 opacity-70">
                <div className="w-8 h-8 border-[3px] border-[#FF3100] border-t-transparent rounded-full animate-spin"></div>
                <Typography variant="body2" color="text.secondary">Cargando tiempos...</Typography>
              </div>
            ) : filteredLeaderboard.map((driver) => {
              const isPodium = driver.hasPole;
              
              return (
                <KineticCard 
                  key={driver.id} 
                  sx={{ 
                    p: 1.5, 
                    borderLeft: isPodium ? `4px solid ${driver.teamColor}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isPodium ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[24px] flex justify-center">
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'Space Grotesk, sans-serif', 
                          fontWeight: 'bold', 
                          fontStyle: 'italic',
                          color: isPodium ? driver.teamColor : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        {driver.position}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-9 h-9 object-cover rounded" alt={driver.name} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                        {driver.name}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <Timer size={14} color={driver.timeStroke} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontWeight: isPodium ? 'bold' : 'normal',
                          color: driver.timeStroke !== "white" ? driver.timeStroke : 'white'
                        }}
                      >
                        {driver.bestTime}
                      </Typography>
                    </div>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.65rem'
                      }}
                    >
                      {driver.gap}
                    </Typography>
                  </div>
                </KineticCard>
              );
            })}
          </Stack>
        </div>

        <div className="absolute bottom-0 w-full left-0 pointer-events-none z-50 flex justify-center items-center p-4 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/90 to-transparent pb-6 pt-10">
          <div className="pointer-events-auto w-full">
            <KineticButton 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ boxShadow: '0 0 20px rgba(255, 49, 0, 0.4)' }}
            >
              SUBIR MI TIEMPO
            </KineticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
