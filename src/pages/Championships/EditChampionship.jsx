import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Plus, Loader2, Award } from 'lucide-react';
import { getChampionshipById, updateChampionship } from '../../services/api';
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

export default function EditChampionship() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizeLabel, setPrizeLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadChampionship() {
      setIsLoading(true);
      try {
        const champ = await getChampionshipById(id);
        if (champ) {
          setName(champ.name || '');
          setDescription(champ.description || '');
          setPrizeLabel(champ.prize_label || '');
          setStartDate(champ.start_date || '');
          setEndDate(champ.end_date || '');
          setEntryFee(champ.entry_fee ? champ.entry_fee.toString() : '');
        } else {
          setErrorMsg('Campeonato no encontrado.');
        }
      } catch {
        setErrorMsg('Error al cargar campeonato.');
      } finally {
        setIsLoading(false);
      }
    }
    loadChampionship();
  }, [id]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await updateChampionship(id, {
        name,
        description,
        prize_label: prizeLabel,
        start_date: startDate || null,
        end_date: endDate || null,
        entry_fee: entryFee ? Number(entryFee) : 0,
      });

      navigate('/championships');
    } catch {
      console.error("error");
      setErrorMsg( 'Error al editar el campeonato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateFormLayout
      backLabel="Volver"
      onBack={() => navigate(`/championships/${id}`)}
      title="Editar Torneo"
      description="Modifica los detalles generales del campeonato."
      errorMsg={errorMsg}
      isLoading={isLoading}
      loadingMessage="Cargando información del campeonato..."
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



        <KineticButton
          type="submit"
          variant="contained"
          color="primary"
          className="w-full min-h-12 md:min-h-14 font-headline font-bold uppercase tracking-widest"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Guardar cambios'}
        </KineticButton>
      </form>
    </CreateFormLayout>
  );
}
