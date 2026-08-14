import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ShieldCheck, Clock, MapPin, Calendar, User, FileText, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatMsToTime } from '../../lib/formatters';
import { supabase } from '../../lib/supabase';
import { deleteLapTime } from '../../services/api';
import { useToast } from '../ui/toast';
import ConfirmModal from './ConfirmModal';

export default function ProofReviewModal({
  isOpen,
  onClose,
  logTimeData,
  onDeleteSuccess
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !logTimeData) return null;

  const proofUrl = logTimeData.proof_image_url || logTimeData.proofImageUrl || null;
  const safeProofUrl = proofUrl?.startsWith('http') ? proofUrl : '#';
  const driverName = logTimeData.profiles?.username || logTimeData.driverName || 'Piloto Anónimo';
  const avatarUrl = logTimeData.profiles?.avatar_url || null;
  const trackName = logTimeData.tracks?.name || logTimeData.trackName || 'Circuito de Karting';
  const trackLocation = logTimeData.tracks?.location || logTimeData.trackLocation || '';
  const lapTimeMs = logTimeData.lap_time_ms || logTimeData.lapTimeMs || 0;
  const formattedTime = formatMsToTime(lapTimeMs);
  const createdAt = logTimeData.created_at ? new Date(logTimeData.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Fecha no especificada';
  const status = logTimeData.verification_status || 'pending';

  const isOwner = currentUserId && (
    logTimeData.user_id === currentUserId ||
    logTimeData.profiles?.id === currentUserId
  );

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmDelete(false);
    try {
      await deleteLapTime(logTimeData.id);
      toast({
        title: 'Tiempo eliminado',
        description: 'Tu registro de tiempo ha sido eliminado correctamente.',
        variant: 'success'
      });
      onDeleteSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar el tiempo.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar tiempo"
        message="¿Estás seguro de que deseas eliminar este tiempo registrado? Esta acción no se puede deshacer."
      />
      <div className="bg-surface-container-high w-full max-w-2xl sm:max-w-3xl md:max-w-4xl rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-outline-variant/20 bg-surface-container-highest/50 shrink-0 gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-sm bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-headline font-bold text-sm sm:text-base md:text-lg uppercase tracking-wider text-white truncate">
                AUDITORÍA DE TELEMETRÍA DE COMUNIDAD
              </h3>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Comprobación visual de ticket impreso vs datos digitados (Peer Review)
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="w-8 h-8 rounded-sm flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant transition-colors shrink-0 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Scrollable content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex flex-col gap-5 sm:gap-6">
          {/* Elemento Central Dominante: Foto del Ticket de Telemetría */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-on-surface-variant font-label uppercase tracking-wider">
              <span className="flex items-center gap-1.5 font-bold text-white truncate">
                <FileText size={14} className="text-primary shrink-0" />
                TICKET IMPRESO DE TELEMETRÍA (PRUEBA OBLIGATORIA)
              </span>
              {proofUrl && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer shrink-0 self-end sm:self-auto"
                >
                  <ZoomIn size={14} />
                  {isZoomed ? 'REDUCIR' : 'AMPLIAR FOTO'}
                </button>
              )}
            </div>

            <div className={`relative bg-black rounded-sm border border-outline-variant/30 overflow-hidden flex items-center justify-center transition-all duration-300 w-full ${
              isZoomed ? 'min-h-[350px] sm:min-h-[500px]' : 'min-h-[220px] sm:min-h-[280px] max-h-[420px]'
            }`}>
              {proofUrl ? (
                <>
                  <img
                    src={proofUrl}
                    alt="Ticket impreso de telemetria"
                    className={`w-full object-contain transition-all duration-300 ${
                      isZoomed ? 'max-h-[650px]' : 'max-h-[400px]'
                    }`}
                  />
                  <a
                    href={safeProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2.5 right-2.5 bg-black/80 hover:bg-black text-white text-[11px] font-bold px-2.5 py-1.5 rounded-sm border border-outline-variant/40 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Abrir archivo original</span>
                    <ExternalLink size={12} />
                  </a>
                </>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                  <FileText size={32} className="opacity-40" />
                  <p className="text-xs sm:text-sm font-bold">Sin foto de comprobante registrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Comparación Visual: Datos Ingresados por el Usuario */}
          <div className="bg-surface-container-low p-3.5 sm:p-5 rounded-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest truncate">
                DATOS DIGITADOS POR EL PILOTO
              </span>
              {status === 'verified' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-tertiary-fixed/15 text-tertiary-fixed border border-tertiary-fixed/30 self-start sm:self-auto shrink-0 whitespace-nowrap">
                  <ShieldCheck size={14} /> VERIFICADO POR COMUNIDAD
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30 self-start sm:self-auto shrink-0 whitespace-nowrap">
                  <Clock size={14} /> PENDIENTE DE REVISIÓN
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Tiempo de Vuelta */}
              <div className="flex flex-col gap-1 bg-surface-container-highest p-3 rounded-sm border border-outline-variant/10">
                <span className="text-[10px] sm:text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                  TIEMPO DE VUELTA REGISTRADO
                </span>
                <span className="font-mono font-bold text-xl sm:text-2xl text-tertiary-fixed tracking-wider">
                  {formattedTime}
                </span>
              </div>

              {/* Piloto */}
              <div className="flex flex-col gap-1 bg-surface-container-highest p-3 rounded-sm border border-outline-variant/10 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                  PILOTO DE KARTING
                </span>
                <div className="flex items-center gap-2 mt-0.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={driverName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={13} className="text-on-surface-variant" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-white truncate">{driverName}</span>
                </div>
              </div>

              {/* Circuito */}
              <div className="flex flex-col gap-1 bg-surface-container-highest p-3 rounded-sm border border-outline-variant/10 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                  CIRCUITO / PISTA
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white mt-0.5 min-w-0">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="truncate">{trackName} {trackLocation ? `(${trackLocation})` : ''}</span>
                </div>
              </div>

              {/* Fecha de Registro */}
              <div className="flex flex-col gap-1 bg-surface-container-highest p-3 rounded-sm border border-outline-variant/10 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                  FECHA Y HORA DE REGISTRO
                </span>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1 min-w-0">
                  <Calendar size={14} className="shrink-0" />
                  <span className="truncate">{createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-3.5 sm:p-4 border-t border-outline-variant/20 bg-surface-container-highest/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 shrink-0 w-full">
          <div className="w-full sm:w-auto">
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#FF3100]/15 hover:bg-[#FF3100]/25 text-[#FF3100] border border-[#FF3100]/40 font-headline font-bold uppercase tracking-wider text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(255,49,0,0.15)]"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>ELIMINAR MI TIEMPO</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface-container-highest text-white hover:bg-surface-variant border border-outline-variant/30 font-headline font-bold uppercase tracking-widest text-xs rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            CERRAR REVISIÓN
          </button>
        </div>
      </div>
    </div>
  );
}
