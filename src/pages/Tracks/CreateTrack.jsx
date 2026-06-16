import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import KineticButton from '../../components/ui/KineticButton';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';
import CreateFormLayout from '../../components/layout/CreateFormLayout';
import FormSection from '../../components/layout/FormSection';
import FormField from '../../components/forms/FormField';
import CoverImageField from '../../components/forms/CoverImageField';
import { createTrack, uploadTrackCover } from '../../services/api';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop';

export default function CreateTrack() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [costInfo, setCostInfo] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [circuitType, setCircuitType] = useState('kart');
  const [coverImage, setCoverImage] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCoverSelect = async (file) => {
    setErrorMsg('');
    setIsUploadingCover(true);
    try {
      const url = await uploadTrackCover(file);
      setCoverImage(url);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setCoverImage('');
      setErrorMsg(error.message || 'No se pudo subir la imagen.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let scheduleObj = { horario: schedule };
      try {
        if (schedule.startsWith('{')) {
          scheduleObj = JSON.parse(schedule);
        }
      } catch {
        // Fallback a texto plano
      }

      await createTrack({
        name,
        location,
        cost_info: costInfo,
        schedule: scheduleObj,
        description,
        circuit_type: circuitType,
        cover_image: coverImage || DEFAULT_COVER,
      });

      navigate('/tracks');
    } catch (error) {
      console.error('Error al crear la pista:', error);
      setErrorMsg(error.message || 'Error al registrar el circuito.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateFormLayout
      backLabel="Volver"
      onBack={() => navigate('/tracks')}
      title="Crear Nuevo Circuito"
      description="Registra una pista o autódromo para que otros pilotos puedan encontrarlo y competir."
      errorMsg={errorMsg}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormSection maxWidth="full">
          <FormField label="Nombre del circuito">
            <Input
              type="text"
              placeholder="Ej: Circuito Xtreme Karts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Tipo de circuito">
            <FilterGroup value={circuitType} onValueChange={setCircuitType} className="w-full flex">
              <FilterItem value="kart" className="flex-1 min-w-0 text-[10px] sm:text-xs px-2 sm:px-4">
                Pista de Karts
              </FilterItem>
              <FilterItem value="autodromo" className="flex-1 min-w-0 text-[10px] sm:text-xs px-2 sm:px-4">
                Autódromo
              </FilterItem>
            </FilterGroup>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Ubicación / ciudad">
              <Input
                type="text"
                placeholder="Ej: Bogotá"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Costo por heat (aprox.)">
              <Input
                type="text"
                placeholder="Ej: $50.000"
                value={costInfo}
                onChange={(e) => setCostInfo(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Horarios de atención">
            <Input
              type="text"
              placeholder="Ej: Mar-Dom: 10am - 10pm"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </FormField>

          <CoverImageField
            value={coverImage}
            onChange={setCoverImage}
            onFileSelect={handleCoverSelect}
            isUploading={isUploadingCover}
            disabled={isSubmitting}
          />

          <FormField label="Descripción y detalles">
            <Textarea
              rows={4}
              placeholder="Detalles sobre el trazado, asfalto, exigencia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
        </FormSection>

        <KineticButton
          type="submit"
          variant="contained"
          color="primary"
          className="w-full min-h-12 md:min-h-14 font-headline font-bold uppercase tracking-widest"
          disabled={isSubmitting || isUploadingCover}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Registrar circuito'}
        </KineticButton>
      </form>
    </CreateFormLayout>
  );
}
