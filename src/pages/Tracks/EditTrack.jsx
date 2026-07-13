import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getTrackById, updateTrack, getProfile, uploadTrackCover, deleteTrack } from '../../services/api';
import { supabase } from '../../lib/supabase';
import KineticButton from '../../components/ui/KineticButton';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import CreateFormLayout from '../../components/layout/CreateFormLayout';
import FormSection from '../../components/layout/FormSection';
import FormField from '../../components/forms/FormField';
import CoverImageField from '../../components/forms/CoverImageField';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop';

export default function EditTrack() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [costInfo, setCostInfo] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [circuitType, setCircuitType] = useState('kart');
  const [coverImage, setCoverImage] = useState('');
  const [trazado, setTrazado] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkPermissionsAndLoad() {
      setIsLoading(true);
      setErrorMsg('');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          setErrorMsg('Debes iniciar sesión para editar un circuito.');
          setIsLoading(false);
          return;
        }

        const trackData = await getTrackById(id);
        if (!trackData) {
          setErrorMsg('Circuito no encontrado.');
          setIsLoading(false);
          return;
        }

        const userProfile = await getProfile(user.id);
        const isAdmin = userProfile?.role === 'admin';

        if (!isAdmin) {
          navigate(`/tracks/${id}`);
          return;
        }

        setName(trackData.name || '');
        setLocation(trackData.location || '');
        setCostInfo(trackData.cost_info || '');
        setDescription(trackData.description || '');
        setCoverImage(trackData.cover_image || '');
        setCircuitType(trackData.circuit_type || 'kart');
        setTrazado(trackData.trazado || '');

        if (trackData.schedule) {
          if (typeof trackData.schedule === 'string') {
            setSchedule(trackData.schedule);
          } else if (typeof trackData.schedule === 'object') {
            if (trackData.schedule.horario) {
              setSchedule(trackData.schedule.horario);
            } else {
              setSchedule(JSON.stringify(trackData.schedule));
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar pista para edición:', error);
        setErrorMsg('Error al cargar la información de la pista.');
      } finally {
        setIsLoading(false);
      }
    }

    checkPermissionsAndLoad();
  }, [id, navigate]);

  const handleCoverSelect = async (file) => {
    setErrorMsg('');
    setIsUploadingCover(true);
    try {
      const url = await uploadTrackCover(file);
      setCoverImage(url);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setErrorMsg(error.message || 'No se pudo subir la imagen.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este circuito? Esta acción no se puede deshacer y eliminará todos los tiempos de vuelta y campeonatos asociados.')) {
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      await deleteTrack(id);
      navigate('/tracks');
    } catch (error) {
      console.error('Error al eliminar la pista:', error);
      setErrorMsg(error.message || 'Error al eliminar el circuito.');
      setIsDeleting(false);
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
      } catch { /* ignore */ }

      await updateTrack(id, {
        name,
        location,
        cost_info: costInfo,
        schedule: scheduleObj,
        description,
        circuit_type: circuitType,
        cover_image: coverImage || DEFAULT_COVER,
        trazado: trazado || null,
      });

      navigate(`/tracks/${id}`);
    } catch (error) {
      console.error('Error al actualizar la pista:', error);
      setErrorMsg(error.message || 'Error al actualizar el circuito.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errorMsg && !name && !isLoading) {
    return (
      <PageContainer compact className="items-center justify-center fade-in">
        <GlassCard variant="low" className="w-full max-w-md mx-auto">
          <ContentSection>
            <p className="text-error font-label text-sm uppercase tracking-wider">{errorMsg}</p>
            <KineticButton variant="contained" onClick={() => navigate('/tracks')}>Volver a pistas</KineticButton>
          </ContentSection>
        </GlassCard>
      </PageContainer>
    );
  }

  return (
    <CreateFormLayout
      backLabel="Cancelar"
      onBack={() => navigate(`/tracks/${id}`)}
      title="Editar circuito"
      description="Actualiza la información del circuito y su foto de portada."
      errorMsg={errorMsg}
      isLoading={isLoading}
      loadingMessage="Cargando pista..."
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

          <FormField label="URL de imagen del trazado" hint="Imagen del layout del circuito.">
            <Input
              type="url"
              placeholder="Ej: https://..."
              value={trazado}
              onChange={(e) => setTrazado(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Descripción y detalles">
            <Textarea
              rows={4}
              placeholder="Detalles sobre el trazado, asfalto, exigencia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
        </FormSection>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <KineticButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || isUploadingCover || isDeleting}
            className="flex-1 min-h-12 md:min-h-14 font-headline font-bold uppercase tracking-widest"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Guardar cambios'}
          </KineticButton>

          <KineticButton
            type="button"
            variant="contained"
            color="error"
            disabled={isSubmitting || isUploadingCover || isDeleting}
            onClick={handleDelete}
            className="flex-1 min-h-12 md:min-h-14 font-headline font-bold uppercase tracking-widest"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={24} /> : 'Eliminar circuito'}
          </KineticButton>
        </div>
      </form>
    </CreateFormLayout>
  );
}
