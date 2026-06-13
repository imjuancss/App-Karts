import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getTracks, registerLapTime } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import './HomeLeaderboard.css';

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



export default function HomeLeaderboard() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('historical');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Auth state
  const [sessionUser, setSessionUser] = useState(null);

  // Modal registration state
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [modalSelectedTrackId, setModalSelectedTrackId] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');

  // Initial load of tracks and user session
  useEffect(() => {
    async function initialize() {
      try {
        const trackData = await getTracks();
        setTracks(trackData || []);
        if (trackData && trackData.length > 0) {
          setSelectedTrackId(trackData[0].id);
          setModalSelectedTrackId(trackData[0].id);
        }
      } catch (err) {
        console.error('Error loading tracks:', err);
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user || null);
    }
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch leaderboard times when track, filter or reload changes
  useEffect(() => {
    if (!selectedTrackId) return;
    setIsLoading(true);
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('lap_times')
          .select(`
            id,
            lap_time_ms,
            user_id,
            profiles (username, full_name, avatar_url),
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
          return {
            id: row.id,
            driverId: row.user_id,
            name: row.profiles?.full_name || row.profiles?.username || 'Piloto',
            avatarUrl: row.profiles?.avatar_url,
            lapTimeMs: row.lap_time_ms,
            trackId: selectedTrackId,
            position: idx + 1,
            bestTime: formatMsToTime(row.lap_time_ms),
            gap: leaderMs !== undefined ? formatGap(leaderMs, row.lap_time_ms) : '',
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
  }, [selectedTrackId, selectedTimeFilter, reloadTrigger]);

  const parseTimeToMs = (timeStr) => {
    const parts = timeStr.trim().split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secsParts = parts[1].split('.');
      const secs = parseInt(secsParts[0], 10);
      const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
      return (mins * 60000) + (secs * 1000) + ms;
    } else if (parts.length === 1) {
      const secsParts = parts[0].split('.');
      const secs = parseInt(secsParts[0], 10);
      const ms = secsParts[1] ? parseInt(secsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
      return (secs * 1000) + ms;
    }
    return 0;
  };

  const handleOpenTimeModal = () => {
    if (!sessionUser) {
      alert('Debes iniciar sesión para subir tu tiempo.');
      return;
    }
    setModalSelectedTrackId(selectedTrackId);
    setIsTimeModalOpen(true);
  };

  const handleRegisterLapTime = async (e) => {
    e.preventDefault();
    setIsSubmittingTime(true);
    setTimeError('');

    try {
      const ms = parseTimeToMs(timeInput);
      if (ms <= 0) {
        throw new Error("Ingresa un tiempo válido (mm:ss.SSS o ss.SSS)");
      }
      if (!modalSelectedTrackId) {
        throw new Error("Por favor selecciona una pista");
      }

      await registerLapTime(modalSelectedTrackId, ms);
      
      // Resetear formulario
      setTimeInput('');
      setIsTimeModalOpen(false);

      // Recargar si la pista del modal coincide con la actual
      if (modalSelectedTrackId === selectedTrackId) {
        setReloadTrigger(prev => prev + 1);
      }
      alert('¡Tiempo registrado con éxito!');
    } catch (err) {
      console.error(err);
      setTimeError(err.message || 'Error al guardar el tiempo.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  const scrollContainerRef = useRef(null);

  return (
    <div className="w-full h-[calc(100dvh-70px)] md:h-[calc(100dvh-4rem)] flex flex-col items-center">
      <div className="w-full h-full max-w-md mx-auto md:max-w-2xl relative flex flex-col">

        {/* BEGIN: HeaderNav */}
        <header className="pt-6 px-6 pb-4 flex justify-center flex-shrink-0" data-purpose="location-selector">
          <div className="flex items-center justify-center w-full">
            {tracks.length > 0 && (
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-zinc-400 uppercase border-none bg-transparent shadow-none p-0 h-auto focus:ring-0 mx-auto cursor-pointer">
                  <svg className="h-4 w-4 text-[#FF3100]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <SelectValue placeholder="Selecciona una pista">
                    {selectedTrack?.name ? selectedTrack.name.toUpperCase() : 'SELECCIONA UNA PISTA'}
                  </SelectValue>
                  <svg className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </SelectTrigger>
                <SelectContent align="start" className="bg-[#1a1a1a] border-white/10 text-white rounded-md max-h-[300px] overflow-y-auto">
                  {tracks.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase cursor-pointer py-3 focus:bg-white/10">
                      {t.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </header>
        {/* END: HeaderNav */}

        {/* BEGIN: CircuitStats */}
        <section className="px-4 py-4 flex-shrink-0" data-purpose="circuit-info">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background track image or cover image */}
            <img 
              className="w-full h-full object-cover absolute inset-0 opacity-15 mix-blend-luminosity pointer-events-none" 
              src={selectedTrack?.cover_image || "https://placehold.co/800x400/121212/333333"} 
              alt="Track map" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/50 via-transparent to-transparent pointer-events-none"></div>

            <div className="flex items-center gap-6 z-10">
              <span className="text-6xl font-bold text-zinc-800 tracking-tighter">800</span>
              <div className="flex flex-col items-center">
                <svg className="h-10 w-10 text-[#FF3100]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              <span className="text-6xl font-bold text-zinc-800 tracking-tighter">400</span>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase z-10">Mapa del circuito</p>
          </div>
        </section>
        {/* END: CircuitStats */}

        {/* BEGIN: Tabs */}
        <nav className="px-4 mt-2 flex-shrink-0" data-purpose="time-filters">
          <div className="grid grid-cols-3 bg-zinc-900/80 p-1 rounded-md border border-zinc-800">
            <button 
              onClick={() => setSelectedTimeFilter('week')}
              className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
                selectedTimeFilter === 'week' 
                  ? 'text-white bg-zinc-700/50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Esta semana
            </button>
            <button 
              onClick={() => setSelectedTimeFilter('month')}
              className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
                selectedTimeFilter === 'month' 
                  ? 'text-white bg-zinc-700/50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Este mes
            </button>
            <button 
              onClick={() => setSelectedTimeFilter('historical')}
              className={`py-2 text-xs font-medium rounded transition-all cursor-pointer ${
                selectedTimeFilter === 'historical' 
                  ? 'text-white bg-zinc-700/50 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Histórico
            </button>
          </div>
        </nav>
        {/* END: Tabs */}

        {/* Table Header */}
        <div className="grid grid-cols-[3.5rem_1fr_6rem] px-6 mb-2 mt-6 flex-shrink-0">
          <span className="text-[10px] font-bold text-zinc-600 tracking-widest">POS</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-widest">DRIVER</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-widest text-right px-2">LAP</span>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pb-28 w-full no-scrollbar"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center w-full py-16 gap-4 opacity-70">
              <div className="w-8 h-8 border-[3px] border-[#FF3100] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 text-sm">Cargando tiempos...</p>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-16 opacity-75">
              <p className="text-zinc-500 text-sm">No hay tiempos registrados para este circuito.</p>
            </div>
          ) : (
            <div className="space-y-[2px]">
              {filteredLeaderboard.map((driver, idx) => {
                const pos = idx + 1;
                
                // Podium or rank specific style
                let rowClass = "";
                if (pos === 1) rowClass = "leader-row leader-row-1 bg-zinc-900/30";
                else if (pos === 2) rowClass = "leader-row leader-row-2 bg-zinc-900/30";
                else if (pos === 3) rowClass = "leader-row leader-row-3 bg-zinc-900/30";
                else {
                  // Alternating bg for ranks 5, 7, 9... (index is even)
                  rowClass = `border-l-3 border-transparent ${pos % 2 === 1 ? 'bg-zinc-900/20' : ''}`;
                }

                // Time text and label colors
                let timeClass = "text-zinc-200 font-medium text-sm";
                let gapClass = "text-zinc-600";
                if (pos === 1) {
                  timeClass = "text-[#FF3100] font-bold text-sm tracking-tighter";
                  gapClass = "text-zinc-500 uppercase";
                } else if (pos === 2 || pos === 3) {
                  timeClass = "text-lime-400 font-bold text-sm tracking-tighter";
                  gapClass = "text-zinc-500";
                }

                return (
                  <div 
                    key={driver.id} 
                    className={`grid grid-cols-[3.5rem_1fr_6rem] items-center py-2 px-4 ${rowClass}`}
                  >
                    {/* Position Column */}
                    <div className="flex flex-col items-center">
                      {pos === 1 ? (
                        <>
                          <span className="italic font-black text-xl text-yellow-500">1</span>
                          <span className="text-[6px] text-yellow-500/50 -mt-1 tracking-tighter">🏆</span>
                        </>
                      ) : pos === 2 ? (
                        <span className="italic font-black text-xl text-slate-400">2</span>
                      ) : pos === 3 ? (
                        <span className="italic font-black text-xl text-orange-700">3</span>
                      ) : (
                        <span className="italic font-bold text-lg text-zinc-700">{pos}</span>
                      )}
                    </div>

                    {/* Driver Column */}
                    <div className="flex items-center gap-3">
                      <img 
                        alt={driver.name} 
                        className="w-8 h-8 rounded-sm object-cover filter grayscale" 
                        src={driver.avatarUrl || `https://i.pravatar.cc/150?u=${driver.driverId}`} 
                      />
                      <span className={`text-sm tracking-tight ${pos <= 3 ? 'font-semibold' : 'font-medium text-zinc-300'}`}>
                        {driver.name}
                      </span>
                    </div>

                    {/* Time Column */}
                    <div className="text-right">
                      <div className={timeClass}>{driver.bestTime}</div>
                      <div className={`text-[9px] tracking-tighter ${gapClass}`}>{driver.gap}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BEGIN: StickyFooterCTA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/95 to-transparent flex justify-center w-full z-50 pointer-events-none" data-purpose="bottom-cta">
          <button 
            onClick={handleOpenTimeModal}
            className="glow-button kinetic-gradient w-full text-white font-black py-4 rounded-md flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer pointer-events-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              <path d="M12 4v2m0 12v2m8-8h-2M6 12H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
            <span className="uppercase tracking-widest text-sm">Subir mi tiempo</span>
          </button>
        </div>
        {/* END: StickyFooterCTA */}

      </div>

      {/* Modal Registrar Tiempo */}
      <Dialog 
        open={isTimeModalOpen} 
        onClose={() => !isSubmittingTime && setIsTimeModalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#121212',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" color="white">Registrar Tiempo</Typography>
        </DialogTitle>
        <DialogContent>
          {timeError && (
            <Typography color="error" variant="body2" mb={2}>{timeError}</Typography>
          )}
          <form id="time-form" onSubmit={handleRegisterLapTime}>
            <Stack spacing={3} mt={1}>
              <KineticInput
                select
                label="Seleccionar Circuito"
                value={modalSelectedTrackId} 
                onChange={e => setModalSelectedTrackId(e.target.value)} 
                required
                fullWidth
              >
                <MenuItem value="" disabled>Selecciona una pista...</MenuItem>
                {tracks.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.location})</MenuItem>
                ))}
              </KineticInput>
              <KineticInput
                label="Tu mejor tiempo"
                fullWidth
                placeholder="Ej: 00:44.520 o 44.520"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                required
                sx={{ input: { fontFamily: 'monospace' } }}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <KineticButton variant="outlined" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmittingTime}>
            Cancelar
          </KineticButton>
          <KineticButton variant="contained" type="submit" form="time-form" disabled={isSubmittingTime}>
            {isSubmittingTime ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
          </KineticButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

