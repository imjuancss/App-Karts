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

  // Fetch tracks list on mount
  useEffect(() => {
    const fetchTracksList = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('id, name, cover_image')
          .order('name', { ascending: true });
        if (error) throw error;
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

        // Apply time filters
        const now = Date.now();
        const weekMs = 7 * 86400000;
        const monthMs = 30 * 86400000;
        let filtered = data;
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



  return (
    <div className="fade-in w-full h-[calc(100dvh-70px)] md:h-[calc(100dvh-4rem)] flex flex-col items-center font-sans">
      <div className="w-full h-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 relative flex flex-col">

        {/* Zona Superior Fija */}
        <div className="flex-shrink-0 z-40 bg-transparent backdrop-blur-md pb-2 pt-4 px-4 w-full flex flex-col gap-4">
          


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
              <div className="w-full h-full relative rounded-none flex items-center justify-center border-none bg-transparent" style={{ minHeight: '100%' }}>
                <img 
                  className="w-full h-full object-cover absolute inset-0 opacity-30 mix-blend-luminosity" 
                  src={selectedTrackCover}
                  alt={selectedTrack?.name ? `Portada de ${selectedTrack.name}` : 'Portada del circuito'}
                  fetchpriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="z-10 flex flex-col items-center justify-center pointer-events-none">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2 drop-shadow-md text-on-surface-variant">
                    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z" strokeDasharray="4 4" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  <span className="text-white/50 text-[11px] font-mono tracking-widest uppercase">Mapa del Circuito</span>
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

          {/* Títulos de Columnas */}
          <div className="flex justify-between items-center w-full px-2 mt-2">
            <div className="flex items-center gap-4">
              <div className="text-white/40 text-[11px] font-bold font-sans tracking-widest w-[32px] text-center">POS</div>
              <div className="text-white/40 text-[11px] font-bold font-sans tracking-widest text-left">DRIVER</div>
            </div>
            <div className="text-white/40 text-[11px] font-bold font-sans tracking-widest text-right">LAP</div>
          </div>
        </div>

        {/* Zona de Scroll (Lista) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pb-24 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >

          <div className="self-stretch flex-1 inline-flex justify-center items-start gap-2.5 w-full">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 w-full slide-up">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-on-surface-variant text-sm font-sans">Cargando tiempos...</p>
                </div>
              ) : filteredLeaderboard.map((driver) => {
                if (driver.hasPole) {
                  return (
                    <div key={driver.id} data-pole="Yes" className={`self-stretch h-[52px] pl-[4px] pr-[8px] bg-surface-container border-l-2 ${driver.teamColor} inline-flex justify-between items-center overflow-visible`}>
                      <div className="flex-1 flex justify-start items-center gap-1">
                        <div className="flex-1 flex justify-start items-center gap-1">
                          <div data-position={driver.position} data-type="Number" className="w-[42px] inline-flex flex-col justify-start items-center">
                            <div className="w-4 h-4 flex flex-col justify-center items-center gap-2.5">
                              <div className={`text-center justify-center ${driver.textColor} text-lg font-extrabold font-mono ${driver.textShadow} italic`}>{driver.position}</div>
                            </div>
                            <div data-svg-wrapper>
                              <svg width="40" height="8" viewBox="0 8 40 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                                <g filter={`url(#filter0_d_89_${driver.id})`}>
                                  <path d="M31.9743 8C32.1067 8.9978 31.7342 9.60834 30.837 9.92299C30.5622 10.2515 30.2292 10.6121 29.8359 10.9833C30.4761 10.7597 31.067 10.9338 31.5814 11.4208C31.3067 11.731 30.8511 11.9568 30.443 11.9766C29.9432 12.0007 29.5799 11.835 29.2209 11.529C28.8625 11.8284 28.4664 12.1283 28.0323 12.4185C28.8671 12.2835 29.5292 12.6599 29.9776 13.4341C29.5772 13.6743 29.0182 13.7661 28.5702 13.6484C28.0594 13.5143 27.7198 13.2156 27.443 12.7913C27.0584 13.0215 26.6484 13.2424 26.212 13.4475C26.5197 13.4532 26.7691 13.4974 27.0937 13.6607C27.5634 13.897 27.986 14.3968 28.1495 14.904C27.0107 15.3504 25.9198 14.8848 25.395 13.7991C25.0279 13.9438 24.6448 14.0767 24.2455 14.1953C24.4069 14.2326 24.5647 14.2862 24.7142 14.3605C25.3676 14.6891 25.6885 15.2274 25.9151 15.9029C24.9922 16.1417 24.0683 15.9342 23.4676 15.144C23.2995 14.9229 23.2005 14.7219 23.1082 14.481C22.1525 14.6811 21.1172 14.8002 20 14.8002C18.8837 14.8002 17.849 14.6819 16.8939 14.4821C16.4001 15.6916 15.395 16.2369 14.0937 15.904C14.3792 15.0183 14.9014 14.3899 15.7567 14.1964C15.3587 14.0783 14.9765 13.9466 14.6105 13.8024C14.104 14.9015 12.9833 15.3256 11.8571 14.9029C11.947 14.6119 12.1881 14.239 12.4073 14.0324C12.876 13.5907 13.2547 13.4707 13.7935 13.4509C13.3573 13.2461 12.947 13.0257 12.5625 12.7957C11.9938 13.7069 10.971 13.9414 10.0279 13.433C10.4694 12.6627 11.1383 12.2869 11.9643 12.4163C11.5329 12.1277 11.1389 11.83 10.7823 11.5324C10.0393 12.1792 9.12834 12.1163 8.42186 11.4208C8.93928 10.927 9.51816 10.7679 10.1629 10.9844C9.7694 10.613 9.43666 10.2516 9.16182 9.92299C8.44392 9.70965 7.97412 9.1102 8.0011 8.31808C8.00475 8.21149 8.01865 8.10691 8.03124 8.00112C8.85262 8.18334 9.30368 8.7432 9.33927 9.50892C9.40796 9.57751 9.47876 9.64738 9.55132 9.71875C9.50289 9.32345 9.62392 8.94608 9.87945 8.54129C10.558 9.03445 10.7445 9.81571 10.423 10.5368C10.6116 10.7046 10.8108 10.874 11.0201 11.0446C10.9216 10.5981 11.026 10.1548 11.2924 9.702C12.0466 10.202 12.2612 10.9752 11.9765 11.769C12.2042 11.9273 12.4421 12.0835 12.6908 12.2355C12.4244 11.6842 12.4685 11.0745 12.7801 10.4554C13.6217 10.9469 14.0221 11.8282 13.6886 12.7879C13.9962 12.9423 14.3176 13.0891 14.654 13.2254C14.153 12.5543 14.1168 11.8024 14.4799 10.9386C15.278 11.3353 15.8018 12.0913 15.7466 13.0145C15.7342 13.2222 15.6953 13.3965 15.6395 13.5792C16.0779 13.7176 16.5384 13.8371 17.0223 13.9353C16.2843 13.3439 16.0786 12.5536 16.2689 11.51C17.3039 11.8157 17.9021 12.441 18.0513 13.5379C18.0558 13.7973 18.0571 13.9174 18.0323 14.1027C18.6527 14.1824 19.3077 14.2288 20 14.2288C20.6955 14.2288 21.3535 14.182 21.9765 14.1015C21.8342 12.8154 22.469 11.8827 23.7366 11.5112C23.9446 12.5495 23.7129 13.3427 22.9799 13.9353C23.4642 13.8369 23.9251 13.7168 24.3638 13.5781C24.0209 12.5005 24.5036 11.4437 25.5256 10.9397C25.9099 11.7627 25.8397 12.5601 25.3493 13.2232C25.6876 13.0859 26.0111 12.9389 26.3203 12.7835C26.008 11.8345 26.3288 10.9949 27.2254 10.4565C27.3854 10.7344 27.4946 11.144 27.4888 11.4654C27.4833 11.7592 27.4259 12.0044 27.3203 12.2277C27.565 12.0778 27.7991 11.9239 28.0234 11.7678C27.7279 10.9736 27.9828 10.2071 28.7109 9.70312C28.829 9.87064 28.9439 10.1544 28.9821 10.356C29.0303 10.6106 29.03 10.8293 28.9865 11.0368C29.1932 10.8682 29.3906 10.7016 29.5769 10.5357C29.2509 9.81316 29.4585 9.05297 30.1249 8.54018C30.3896 8.93492 30.5018 9.31766 30.4508 9.71651C30.52 9.64843 30.5871 9.58118 30.6528 9.51562C30.6699 8.75718 31.2009 8.18815 31.9743 8Z" fill={driver.poleSvgFill} />
                                </g>
                                <defs>
                                  <filter id={`filter0_d_89_${driver.id}`} x="0" y="0" width="40.0002" height="24.0002" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset />
                                    <feGaussianBlur stdDeviation="4" />
                                    <feComposite in2="hardAlpha" operator="out" />
                                    <feColorMatrix type="matrix" values={driver.filterColor} />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result={`effect1_dropShadow_89_${driver.id}`} />
                                    <feBlend mode="normal" in="SourceGraphic" in2={`effect1_dropShadow_89_${driver.id}`} result="shape" />
                                  </filter>
                                </defs>
                              </svg>
                            </div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-8 h-8 object-cover" alt={driver.name} />
                            <div className="text-center justify-start text-white text-base font-medium font-space">{driver.name}</div>
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
                  );
                }

                // Normal positions 4-10
                return (
                  <div key={driver.id} data-pole="No" className="self-stretch h-[52px] pl-1 pr-2 bg-surface-container inline-flex justify-between items-center overflow-visible">
                    <div className="flex-1 flex justify-start items-center gap-1">
                      <div className="flex-1 flex justify-start items-center gap-1">
                        <div data-position={driver.position} data-type="Number" className="w-[42px] inline-flex flex-col justify-center items-center">
                          <div className="w-4 h-4 flex flex-col justify-center items-center gap-2.5">
                            <div className="text-center justify-center text-white/80 text-lg font-extrabold font-mono italic">{driver.position}</div>
                          </div>
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-8 h-8 object-cover" alt={driver.name} />
                          <div className="text-center justify-start text-white text-base font-medium font-space">{driver.name}</div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex flex-col justify-center items-end">
                      <div className="inline-flex justify-center items-center gap-1">
                        <div data-svg-wrapper className="relative">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_39_2092)">
                              <path d="M7.3125 1.125H10.6875" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 15.75C12.4173 15.75 15.1875 12.9798 15.1875 9.5625C15.1875 6.14524 12.4173 3.375 9 3.375C5.58274 3.375 2.8125 6.14524 2.8125 9.5625C2.8125 12.9798 5.58274 15.75 9 15.75Z" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 9.5625L11.8125 6.75" stroke={driver.timeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                              <clipPath id="clip0_39_2092">
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
                );
              })}
            </div>
          </div>
        </div>

        {/* FAB Subir tiempos */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl pointer-events-none z-50 flex flex-col justify-center items-center p-4">
          <KineticButton 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/profile')} 
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
    </div>
  );
}
