import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { SelectNative } from '../ui/select-native';
import FormSection from '../layout/FormSection';
import { registerLapTime, getTracks } from '../../services/api';
import { formatTimeInput } from '../../pages/Profile/Profile';
import { useToast } from '../ui/toast';
import { supabase } from '../../lib/supabase';

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

export default function RegisterTimeModal({ isOpen, onClose, onSuccess, initialTrackId = '' }) {
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(initialTrackId);
  const [timeInput, setTimeInput] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);
  const [timeError, setTimeError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getTracks().then(tracks => {
        setAllTracks(tracks || []);
        if (!selectedTrackId && tracks && tracks.length > 0) {
          setSelectedTrackId(tracks[0].id);
        }
      });
      setTimeInput('');
      setTimeError('');
    }
  }, [isOpen, selectedTrackId]);

  if (!isOpen) return null;

  const handleRegisterLapTime = async (e) => {
    e.preventDefault();
    setIsSubmittingTime(true);
    setTimeError('');

    try {
      const ms = parseTimeToMs(timeInput);
      if (ms <= 0) {
        throw new Error("Ingresa un tiempo válido (mm:ss.SSS o ss.SSS)");
      }
      if (!selectedTrackId) {
        throw new Error("Por favor selecciona una pista");
      }

      await registerLapTime(selectedTrackId, ms);
      
      toast({
        title: '¡Tiempo guardado exitosamente!',
        description: `Tu tiempo ha sido registrado en el circuito seleccionado.`,
        variant: 'success'
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setTimeError(err.message || 'Error al guardar el tiempo. Asegúrate de estar autenticado.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-high p-6 w-full max-w-md rounded-sm border border-outline-variant/30 fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-bold text-xl uppercase tracking-widest text-white">REGISTRAR TIEMPO</h3>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {timeError && (
          <div className="bg-error/10 border border-error/50 p-3 rounded-sm">
            <p className="text-error font-label text-xs uppercase tracking-wider">{timeError}</p>
          </div>
        )}

        <form onSubmit={handleRegisterLapTime} className="flex flex-col gap-6">
          <FormSection maxWidth="full">
            <div className="flex flex-col gap-2">
              <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest">CIRCUITO</label>
              <SelectNative 
                value={selectedTrackId} 
                onChange={e => setSelectedTrackId(e.target.value)} 
                required
                className="w-full"
              >
                <option value="" disabled>SELECCIONA UNA PISTA...</option>
                {allTracks.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
                ))}
              </SelectNative>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest">TIEMPO (MM:SS.SSS O SS.SSS)</label>
              <Input 
                type="text" 
                placeholder="Ej: 0:44.520" 
                value={timeInput} 
                onChange={e => setTimeInput(formatTimeInput(e.target.value))} 
                required 
                className="w-full text-tertiary-fixed font-display font-bold tracking-widest text-xl placeholder:text-outline-variant" 
              />
            </div>
          </FormSection>
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmittingTime}
              className="px-6 py-3 font-headline font-bold uppercase tracking-widest text-sm text-on-surface hover:bg-surface-variant transition-colors rounded-sm"
            >
              CANCELAR
            </button>
            <button 
              type="submit" 
              disabled={isSubmittingTime}
              className="px-6 py-3 bg-primary text-on-primary font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSubmittingTime ? <Loader2 className="animate-spin" size={16} /> : 'REGISTRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
