import { useState, useEffect } from 'react';
import UploadTimeForm from '../forms/UploadTimeForm';
import { registerLapTime, getTracks } from '../../services/api';
import { useToast } from '../ui/toast';

export default function RegisterTimeModal({ isOpen, onClose, onSuccess, initialTrackId = '' }) {
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(initialTrackId);
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getTracks().then(tracks => {
        setAllTracks(tracks || []);
        if (!selectedTrackId && tracks && tracks.length > 0) {
          setSelectedTrackId(tracks[0].id);
        }
      });
    }
  }, [isOpen, selectedTrackId]);

  if (!isOpen) return null;

  const handleFormSubmit = async ({ trackId, lapTimeMs, proofImageUrl }) => {
    setIsSubmittingTime(true);
    try {
      await registerLapTime(trackId, lapTimeMs, proofImageUrl);
      
      toast({
        title: '¡Tiempo registrado con éxito!',
        description: 'Tu tiempo y comprobante de ticket han sido enviados para Peer Review.',
        variant: 'success'
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error al registrar tiempo',
        description: err.message || 'Error al guardar el tiempo. Asegúrate de estar autenticado.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingTime(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 pb-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] sm:pb-4 overflow-y-auto">
      <div className="bg-surface-container-high p-4 sm:p-6 w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 sm:gap-6 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 sm:pb-4 gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-headline font-bold text-base sm:text-lg md:text-xl uppercase tracking-wider sm:tracking-widest text-white truncate">REGISTRAR TIEMPO CON TICKET</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">Sube la foto de tu comprobante de telemetría impreso</p>
          </div>
          <button type="button" aria-label="Cerrar modal" onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors shrink-0 p-1">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <UploadTimeForm
          tracks={allTracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmittingTime}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
