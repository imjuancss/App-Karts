import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, Plus, Loader2, Award } from 'lucide-react';
import { getTracks, createChampionship } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import CreateFormLayout, { FormSectionDivider } from '../../components/layout/CreateFormLayout';
import FormSection from '../../components/layout/FormSection';
import FormField from '../../components/forms/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function CreateChampionship() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTrackId = searchParams.get('trackId') || '';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizeLabel, setPrizeLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState('');

  const [allTracks, setAllTracks] = useState([]);
  const [rounds, setRounds] = useState([
    { track_id: '', date: '' },
    { track_id: '', date: '' },
    { track_id: '', date: '' },
  ]);

  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadTracks() {
      setIsLoadingTracks(true);
      const tracks = await getTracks();
      setAllTracks(tracks || []);

      const initialTrackId = preselectedTrackId || (tracks && tracks[0]?.id) || '';

      setRounds([
        { track_id: initialTrackId, date: '' },
        { track_id: (tracks && tracks[1]?.id) || '', date: '' },
        { track_id: (tracks && tracks[2]?.id) || '', date: '' },
      ]);
      setIsLoadingTracks(false);
    }
    loadTracks();
  }, [preselectedTrackId]);

  const handleAddRound = () => {
    setRounds([...rounds, { track_id: allTracks[0]?.id || '', date: '' }]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 3) {
      setErrorMsg('Un campeonato debe tener como mínimo 3 fechas/pistas.');
      return;
    }
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleRoundChange = (idx, field, value) => {
    setRounds(rounds.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (rounds.length < 3) {
        throw new Error('Debes seleccionar al menos 3 pistas (fechas) para crear el torneo.');
      }

      for (let i = 0; i < rounds.length; i++) {
        if (!rounds[i].track_id) {
          throw new Error(`Por favor selecciona una pista para la Fecha ${i + 1}`);
        }
        if (!rounds[i].date) {
          throw new Error(`Por favor selecciona una fecha válida para la Fecha ${i + 1}`);
        }
      }

      await createChampionship({
        name,
        description,
        prize_label: prizeLabel,
        start_date: startDate || null,
        end_date: endDate || null,
        entry_fee: entryFee ? Number(entryFee) : 0,
      }, rounds);

      navigate('/championships');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al crear el campeonato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateFormLayout
      backLabel="Volver"
      onBack={() => navigate('/championships')}
      title="Crear Nuevo Torneo"
      description="Configura las fechas, premios y rondas de tu campeonato."
      errorMsg={errorMsg}
      isLoading={isLoadingTracks}
      loadingMessage="Cargando pistas disponibles..."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormSection maxWidth="full">
          <FormField label="Nombre del torneo">
            <Input
              type="text"
              placeholder="Ej: Gran Copa Bogotá Karting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Inicio">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="Fin">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Premio especial">
              <div className="relative flex items-center">
                <Award size={18} className="absolute left-4 text-on-surface-variant opacity-50 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Ej: Trofeo + Casco Sparco"
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  className="pl-12"
                />
              </div>
            </FormField>
            <FormField label="Inscripción (COP)">
              <Input
                type="number"
                placeholder="Ej: 25000"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Descripción y reglas">
            <Textarea
              rows={3}
              placeholder="Escribe detalles del campeonato, premios extra, categorías..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y"
            />
          </FormField>
        </FormSection>

        <div className="flex flex-col gap-4 md:gap-6">
          <FormSectionDivider
            title="Calendario de rondas"
            action={
              <button
                type="button"
                onClick={handleAddRound}
                className="w-full sm:w-auto bg-surface-container hover:bg-surface-container-high text-on-surface-variant px-4 py-2.5 rounded-sm text-xs flex items-center justify-center gap-2 font-label font-bold uppercase tracking-wider transition-colors min-h-11"
              >
                <Plus size={16} /> Añadir ronda
              </button>
            }
          />

          <div className="flex flex-col gap-4">
            {rounds.map((round, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-4 items-stretch md:items-end bg-surface-container p-4 rounded-sm"
              >
                <div className="font-headline font-bold text-primary-dim text-sm md:self-center md:pt-0 shrink-0">
                  #{idx + 1}
                </div>

                <FormField label="Pista / circuito" className="flex-1">
                  <Select value={round.track_id} onValueChange={(val) => handleRoundChange(idx, 'track_id', val)}>
                    <SelectTrigger className="w-full bg-surface-container-high border-none text-on-surface h-12">
                      <SelectValue placeholder="Selecciona una pista..." />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-highest border-none text-on-surface">
                      {allTracks.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="hover:bg-surface-variant focus:bg-surface-variant cursor-pointer">
                          {t.name} ({t.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Fecha" className="flex-1">
                  <Input
                    type="date"
                    value={round.date}
                    onChange={(e) => handleRoundChange(idx, 'date', e.target.value)}
                    required
                    className="h-12"
                  />
                </FormField>

                {rounds.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    className="bg-error/10 text-error hover:bg-error/20 p-3 rounded-sm flex items-center justify-center transition-colors border-none min-h-12 w-full md:w-12 shrink-0"
                    aria-label={`Eliminar ronda ${idx + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <KineticButton
          type="submit"
          variant="contained"
          color="primary"
          className="w-full min-h-12 md:min-h-14 font-headline font-bold uppercase tracking-widest"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Crear campeonato'}
        </KineticButton>
      </form>
    </CreateFormLayout>
  );
}
