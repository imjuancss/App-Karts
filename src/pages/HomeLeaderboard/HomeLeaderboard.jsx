import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import KineticButton from '@/components/ui/KineticButton';
import { FilterGroup, FilterItem } from '@/components/ui/filter-group';
import RegisterTimeModal from '@/components/modals/RegisterTimeModal';
import { useToast } from '@/components/ui/toast';
import { formatMsToTime, formatGap } from '@/lib/formatters';



import ProofReviewModal from '@/components/modals/ProofReviewModal';
import { FileCheck } from 'lucide-react';

const ORIGINAL_VISUAL_STYLES = [
  { teamColor: "border-yellow-300", hasPole: true, textColor: "text-yellow-300", textShadow: "[text-shadow:_0px_0px_8px_rgb(255_212_58_/_0.50)]", filterColor: "0 0 0 0 1 0 0 0 0 0.831373 0 0 0 0 0.227451 0 0 0 0.5 0", poleSvgFill: "#B28B00", timeStroke: "#AA22DC", timeTextColor: "text-fuchsia-600" },
  { teamColor: "border-zinc-400", hasPole: true, textColor: "text-zinc-400", textShadow: "[text-shadow:_0px_0px_8px_rgb(186_186_186_/_0.50)]", filterColor: "0 0 0 0 0.729412 0 0 0 0 0.729412 0 0 0 0 0.729412 0 0 0 0.5 0", poleSvgFill: "#898989", timeStroke: "white", timeTextColor: "text-lime-400" },
  { teamColor: "border-orange-400", hasPole: true, textColor: "text-orange-400", textShadow: "[text-shadow:_0px_0px_8px_rgb(207_136_50_/_0.50)]", filterColor: "0 0 0 0 0.811765 0 0 0 0 0.533333 0 0 0 0 0.196078 0 0 0 0.5 0", poleSvgFill: "#9D6119", timeStroke: "white", timeTextColor: "text-lime-400" }
];

export default function HomeLeaderboard() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('historical');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedProofLog, setSelectedProofLog] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch tracks list on mount
  useEffect(() => {
    const fetchTracksList = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('id, name, cover_image, location')
          .order('name', { ascending: true });
        if (error) { console.error(error); throw new Error("Ocurrió un error en el servidor. Por favor, inténtalo de nuevo."); }
        setTracks(data || []);
        if (data && data.length > 0) {
          setSelectedTrackId(data[0].id);
        }
      } catch (e) {
        console.error('Error fetching tracks for selector:', e);
      }
    };
    fetchTracksList();
  }, []);

  // Fetch realtime leaderboard data from Supabase
  useEffect(() => {
    if (!selectedTrackId || selectedTrackId.length < 30) return;
    setTimeout(() => setIsLoading(true), 0);
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('lap_times')
          .select(`
            id,
            lap_time_ms,
            proof_image_url,
            verification_status,
            created_at,
            profiles (username, full_name, avatar_url),
            tracks (name, location, cover_image)`
          )
          .eq('track_id', selectedTrackId)
          .order('lap_time_ms', { ascending: true });
        if (error) { console.error(error); throw new Error("Ocurrió un error en el servidor. Por favor, inténtalo de nuevo."); }

        // Apply time filters
        const now = Date.now();
        const weekMs = 7 * 86400000;
        const monthMs = 30 * 86400000;
        let filtered = data || [];
        if (selectedTimeFilter === 'week') {
          filtered = data.filter(d => (now - new Date(d.created_at).getTime()) <= weekMs);
        } else if (selectedTimeFilter === 'month') {
          filtered = data.filter(d => (now - new Date(d.created_at).getTime()) <= monthMs);
        }

        // Map to UI format
        const leaderMs = filtered[0]?.lap_time_ms;
        const mapped = filtered.map((row, idx) => {
          const visualStyle = idx < 3 ? ORIGINAL_VISUAL_STYLES[idx] : { hasPole: false, timeStroke: "white", timeTextColor: "text-white" };
          return {
            id: row.id,
            name: row.profiles?.full_name || row.profiles?.username || 'Piloto',
            profiles: row.profiles,
            tracks: row.tracks,
            lapTimeMs: row.lap_time_ms,
            proof_image_url: row.proof_image_url,
            verification_status: row.verification_status,
            created_at: row.created_at,
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

  // Scroll-Linked Animation — DOM-direct, zero re-render
  const scrollContainerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const rafId = useRef(null);
  const lastScrollTop = useRef(0);
  const currentHeaderHeight = useRef(0);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const selectedTrackCover = selectedTrack?.cover_image || 'https://placehold.co/800x400/121212/333333';
  const MOBILE_MAX_H = 100;
  const DESKTOP_BREAKPOINT = 768;

  const handleScroll = () => {
    // Desktop: CSS classes handle static layout, skip JS entirely
    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = mapContainerRef.current;
      const container = scrollContainerRef.current;
      if (!el || !container) return;

      const currentScrollTop = container.scrollTop;
      const delta = lastScrollTop.current - currentScrollTop; // positive = scroll up, negative = scroll down

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

  // Seed initial styles on mobile only
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

  const handleOpenTimeModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Atención',
        description: 'Debes iniciar sesión para registrar tu tiempo.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    setIsTimeModalOpen(true);
  };  return (
    <div className="fade-in w-full h-[calc(100dvh-136px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] flex flex-col items-center font-sans">
      <div className="w-full h-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 relative flex flex-col">

        {/* Zona Superior Fija — Premium */}
        <div className="flex-shrink-0 z-40 bg-gradient-to-b from-[rgba(10,10,10,0.95)] to-transparent backdrop-blur-xl pb-2 pt-4 px-4 w-full flex flex-col gap-4 border-b border-white/[0.03]">
          


          {/* Header text and location */}
          <div className="self-stretch flex flex-col justify-start items-start md:gap-4">

            {/* Track Selector (Shadcn UI) */}
            <div className="w-full md:mb-0">
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger className="w-full rounded-none font-bold uppercase text-xs tracking-wide border-none bg-transparent shadow-none p-0 h-auto justify-start focus:ring-0">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary-dim" />
                    <SelectValue placeholder="Selecciona una pista">
                      {tracks.find(t => t.id === selectedTrackId)?.name || 'Selecciona una pista'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start" sideOffset={8} className="rounded-none bg-surface-container border-none text-white shadow-lg">
                  {tracks.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase cursor-pointer py-2">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Map Silhouette & Background — scroll-linked mobile / static desktop */}
            <div
              ref={mapContainerRef}
              className="w-full rounded-none overflow-hidden shrink-0 mb-2 md:h-[140px] md:opacity-100 md:mb-4"
              style={{ willChange: 'height, opacity' }}
            >
              <div className="w-full h-full relative rounded-none flex items-center justify-center border-none bg-transparent scanline-overlay" style={{ minHeight: '100%' }}>
                <img
                  className="w-full h-full object-cover absolute inset-0 opacity-30 mix-blend-luminosity"
                  src={selectedTrackCover}
                  alt={selectedTrack?.name ? `Portada de ${selectedTrack.name}` : 'Portada del circuito'}
                  fetchpriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30"></div>

                <div className="z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(255,49,0,0.08)]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                      <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z" strokeDasharray="4 4" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase">Mapa del Circuito</span>
                </div>
              </div>
            </div>

            {/* Time filters */}
            <FilterGroup value={selectedTimeFilter} onValueChange={setSelectedTimeFilter} className="w-full flex">
              <FilterItem value="week" className="flex-1">Esta semana</FilterItem>
              <FilterItem value="month" className="flex-1">Este mes</FilterItem>
              <FilterItem value="historical" className="flex-1">Histórico</FilterItem>
            </FilterGroup>
          </div>

          {/* Títulos de Columnas — Premium Telemetry */}
          <div className="flex justify-between items-center w-full px-2 mt-2 py-2 bg-white/[0.02] rounded-sm border border-white/[0.03]">
            <div className="flex items-center gap-4">
              <div className="text-white/30 text-[11px] font-bold font-mono tracking-[0.2em] w-[32px] text-center">POS</div>
              <div className="text-white/30 text-[11px] font-bold font-mono tracking-[0.2em] text-left">DRIVER</div>
            </div>
            <div className="text-white/30 text-[11px] font-bold font-mono tracking-[0.2em] text-right">LAP</div>
          </div>
        </div>

        {/* Zona de Scroll (Lista) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pb-32 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >

          <div className="self-stretch flex-1 inline-flex justify-center items-start gap-2.5 w-full">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 w-full slide-up">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-on-surface-variant text-sm font-sans">Cargando tiempos...</p>
                </div>
              ) : filteredLeaderboard.map((driver) => (
                  <div 
                    key={driver.id} 
                    data-pole={driver.hasPole ? "Yes" : "No"} 
                    onClick={() => {
                      setSelectedProofLog(driver);
                      setIsProofModalOpen(true);
                    }}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProofLog(driver);
                        setIsProofModalOpen(true);
                      }
                    }}
                    className={`self-stretch h-[52px] pl-[4px] pr-[8px] border-l-2 ${
                      driver.hasPole 
                        ? `bg-gradient-to-r from-surface-container to-surface-container-high ${driver.teamColor}` 
                        : 'bg-surface-container border-transparent'
                    } inline-flex justify-between items-center overflow-visible transition-all duration-300 hover:bg-white/[0.06] cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary`}
                  >
                    <div className="flex-1 flex justify-start items-center gap-1">
                      <div className="flex-1 flex justify-start items-center gap-1">
                        <div data-position={driver.position} data-type="Number" className="w-[42px] inline-flex flex-col justify-start items-center">
                          <div className="w-4 h-4 flex flex-col justify-center items-center gap-2.5">
                            <div className={`text-center justify-center ${driver.textColor || 'text-white/80'} text-lg font-extrabold font-mono italic`}>
                              {driver.position}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-start items-center gap-2 min-w-0">
                          <img src={driver.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${driver.id}`} className="w-8 h-8 object-cover rounded-full shrink-0" alt={driver.name} />
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-center justify-start text-white text-base font-medium font-space truncate group-hover:text-primary transition-colors">
                              {driver.name}
                            </div>
                            {driver.proof_image_url && (
                              <span title="Ticket comprobado" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tertiary-fixed bg-tertiary-fixed/10 border border-tertiary-fixed/30 px-1.5 py-0.5 rounded shrink-0">
                                <FileCheck size={11} />
                                <span className="hidden sm:inline">Ticket</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex flex-col justify-center items-end">
                      <div className="inline-flex justify-center items-center gap-1">
                        <div data-svg-wrapper className="relative">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_39_2140)">
                              <path d="M7.3125 1.125H10.6875" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 15.75C12.4173 15.75 15.1875 12.9798 15.1875 9.5625C15.1875 6.14524 12.4173 3.375 9 3.375C5.58274 3.375 2.8125 6.14524 2.8125 9.5625C2.8125 12.9798 5.58274 15.75 9 15.75Z" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 9.5625L11.8125 6.75" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                              <clipPath id="clip0_39_2140">
                                <rect width="18" height="18" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                        <div className={`text-center justify-start ${driver.timeTextColor} text-sm font-normal font-mono`}>{driver.bestTime}</div>
                      </div>
                      <div className="text-center justify-start text-white/60 text-[11px] font-normal font-mono">{driver.gap}</div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAB Subir tiempos */}
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] md:bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl pointer-events-none z-[95] flex flex-col justify-center items-center p-4">
          <KineticButton 
            variant="contained" 
            color="primary" 
            onClick={handleOpenTimeModal}
            className="cursor-pointer pointer-events-auto h-12 px-8 shadow-[0_0_40px_rgba(225,42,0,0.4)]"
          >
            <div data-svg-wrapper className="relative text-black">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_45_2173)">
                  <path d="M16.875 10.625C16.875 6.82804 13.797 3.75 10 3.75C6.20304 3.75 3.125 6.82804 3.125 10.625C3.125 14.422 6.20304 17.5 10 17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 10.625L13.125 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.125 1.25H11.875" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.6875 14.875H15.8125" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14.25 13.3125V16.4375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.375 14.875C17.375 16.6009 15.9759 18 14.25 18C12.5241 18 11.125 16.6009 11.125 14.875C11.125 13.1491 12.5241 11.75 14.25 11.75C15.9759 11.75 17.375 13.1491 17.375 14.875Z" stroke="currentColor" />
                </g>
                <defs>
                  <clipPath id="clip0_45_2173">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className="font-space uppercase tracking-wide text-black text-sm">Subir Mi tiempo</span>
          </KineticButton>
        </div>
      </div>
      
      <RegisterTimeModal 
        isOpen={isTimeModalOpen} 
        onClose={() => setIsTimeModalOpen(false)} 
        initialTrackId={selectedTrackId}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      <ProofReviewModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        logTimeData={selectedProofLog}
      />
    </div>
  );
}
