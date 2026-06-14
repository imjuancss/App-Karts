import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Loader2, Award } from 'lucide-react';
import { getTracks, createChampionship } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

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
    { track_id: '', date: '' }
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
        { track_id: (tracks && tracks[2]?.id) || '', date: '' }
      ]);
      setIsLoadingTracks(false);
    }
    loadTracks();
  }, [preselectedTrackId]);

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      { track_id: allTracks[0]?.id || '', date: '' }
    ]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 3) {
      setErrorMsg('Un campeonato debe tener como mínimo 3 fechas/pistas.');
      return;
    }
    const updated = rounds.filter((_, i) => i !== idx);
    setRounds(updated);
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = rounds.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setRounds(updated);
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
        entry_fee: entryFee ? Number(entryFee) : 0
      }, rounds);

      alert('¡Campeonato creado exitosamente!');
      navigate('/championships');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al crear el campeonato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTracks) {
    return <div className="min-h-screen flex items-center justify-center fade-in text-on-surface-variant"><p>Cargando pistas disponibles...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 fade-in px-4 py-8">
      <div className="max-w-3xl mx-auto w-full">
        <button 
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 font-medium" 
          onClick={() => navigate('/championships')}
        >
          <ArrowLeft size={20}/> Volver
        </button>

        <div className="bg-surface-container-low rounded-sm p-8 md:p-10 border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Crear Nuevo Torneo</h1>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-error-container/20 text-error rounded-sm text-sm border-none">
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Nombre del Torneo</label>
              <Input 
                type="text" 
                placeholder="Ej: Gran Copa Bogotá Karting" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="bg-surface-container border-none text-on-surface py-6 px-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Inicio</label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="bg-surface-container border-none text-on-surface py-6 px-4"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Fin</label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="bg-surface-container border-none text-on-surface py-6 px-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Premio Especial</label>
                <div className="relative flex items-center">
                  <Award size={18} className="absolute left-4 text-on-surface-variant opacity-50" />
                  <Input 
                    type="text" 
                    placeholder="Ej: Trofeo + Casco Sparco" 
                    value={prizeLabel} 
                    onChange={e => setPrizeLabel(e.target.value)} 
                    className="pl-12 bg-surface-container border-none text-on-surface py-6 pr-4 w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Inscripción (COP)</label>
                <Input 
                  type="number" 
                  placeholder="Ej: 25000" 
                  value={entryFee} 
                  onChange={e => setEntryFee(e.target.value)} 
                  className="bg-surface-container border-none text-on-surface py-6 px-4"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Descripción y Reglas</label>
              <Textarea 
                rows="3" 
                placeholder="Escribe detalles del campeonato, premios extra, categorías..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full resize-y"
              />
            </div>

            <div className="mt-8 pt-8 bg-surface-container-high/30 -mx-8 px-8 pb-8 rounded-b-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-on-surface">Calendario de Rondas</h3>
                <button 
                  type="button" 
                  onClick={handleAddRound}
                  className="bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant px-4 py-2 rounded-sm text-sm flex items-center gap-2 font-bold uppercase tracking-wider transition-colors"
                >
                  <Plus size={16}/> Añadir Ronda
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {rounds.map((round, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-surface-container p-4 rounded-sm border-none"
                  >
                    <div className="font-bold text-primary-dim self-start md:self-center pt-2 md:pt-0">
                      #{idx + 1}
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pista / Circuito</label>
                      <Select value={round.track_id} onValueChange={(val) => handleRoundChange(idx, 'track_id', val)}>
                        <SelectTrigger className="w-full bg-surface-container-high border-none text-on-surface h-12">
                          <SelectValue placeholder="Selecciona una pista..." />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-highest border-none text-on-surface">
                          {allTracks.map(t => (
                            <SelectItem key={t.id} value={t.id} className="hover:bg-surface-variant focus:bg-surface-variant cursor-pointer">
                              {t.name} ({t.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Fecha</label>
                      <Input 
                        type="date" 
                        value={round.date} 
                        onChange={e => handleRoundChange(idx, 'date', e.target.value)} 
                        required 
                        className="bg-surface-container-high border-none text-on-surface h-12 px-4"
                      />
                    </div>

                    {rounds.length > 3 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRound(idx)}
                        className="bg-error-container/10 text-error hover:bg-error-container/20 p-3 rounded-sm flex items-center justify-center transition-colors border-none self-end md:self-auto h-12 w-full md:w-auto"
                      >
                        <Trash2 size={18}/>
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
              className="w-full mt-4 h-14 text-lg font-bold uppercase tracking-widest"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Crear Campeonato'}
            </KineticButton>
          </form>
        </div>
      </div>
    </div>
  );
}
