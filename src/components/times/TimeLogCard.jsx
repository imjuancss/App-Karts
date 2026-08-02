import React from 'react';
import { FileCheck, ShieldCheck, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatMsToTime } from '../../lib/formatters';

export default function TimeLogCard({
  log,
  onClick,
  position,
  showTrackInfo = true,
  className = ''
}) {
  if (!log) return null;

  const driverName = log.profiles?.full_name || log.profiles?.username || log.name || 'Piloto';
  const avatarUrl = log.profiles?.avatar_url || null;
  const trackName = log.tracks?.name || log.trackName || 'Circuito';
  const trackLocation = log.tracks?.location || log.trackLocation || '';
  const lapTimeFormatted = log.lapTimeMs ? formatMsToTime(log.lapTimeMs) : (log.bestTime || formatMsToTime(log.lap_time_ms || 0));
  const proofUrl = log.proof_image_url || log.proofImageUrl;
  const status = log.verification_status || 'pending';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(log);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(log)}
      onKeyDown={handleKeyDown}
      className={`group relative bg-surface-container-low hover:bg-surface-container-highest/80 p-4 sm:p-5 rounded-sm border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {/* Indicador visual de respaldo fotográfico / Speed line en hover */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-gradient-to-b group-hover:from-primary group-hover:to-tertiary-fixed transition-all rounded-l-sm" />

      {/* Izquierda: Posición + Piloto + Circuito */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {position !== undefined && (
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
            position === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
            position === 2 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/40' :
            position === 3 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/40' :
            'bg-surface-container-highest text-on-surface-variant'
          }`}>
            #{position}
          </div>
        )}

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={driverName} className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-on-surface-variant" />
          )}
        </div>

        {/* Info Piloto y Pista */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-headline font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
              {driverName}
            </h4>

            {/* Indicador de Respaldo Fotográfico Sutil */}
            {proofUrl && (
              <span
                title="Este tiempo cuenta con ticket de telemetría comprobado"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary-fixed/10 text-tertiary-fixed border border-tertiary-fixed/30 shrink-0"
              >
                <FileCheck size={12} />
                <span className="hidden sm:inline">TICKET</span>
              </span>
            )}
          </div>

          {showTrackInfo && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate mt-0.5">
              <MapPin size={12} className="shrink-0 text-primary/70" />
              <span className="truncate">{trackName} {trackLocation ? `(${trackLocation})` : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Derecha: Tiempo (Geist Mono) + Badge de Estado + Flecha */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end">
          <div className="font-mono font-bold text-lg sm:text-xl text-tertiary-fixed tracking-wider">
            {lapTimeFormatted}
          </div>
          {status === 'verified' ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary-fixed flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} /> VERIFICADO
            </span>
          ) : (
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/70 flex items-center gap-1 mt-0.5">
              <Clock size={11} /> PEER REVIEW
            </span>
          )}
        </div>

        <div className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}
