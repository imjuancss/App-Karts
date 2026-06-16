import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getTrackById, updateTrack, getProfile } from '../../services/api';
import { supabase } from '../../lib/supabase';
import KineticButton from '../../components/ui/KineticButton';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';

export default function EditTrack() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [costInfo, setCostInfo] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [trazado, setTrazado] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const isCreator = trackData.creator_id === user.id;

        if (!isCreator && !isAdmin) {
          alert('No tienes permisos para editar esta pista. Solo el creador o un administrador pueden editarla.');
          navigate(`/tracks/${id}`);
          return;
        }

        setName(trackData.name || '');
        setLocation(trackData.location || '');
        setCostInfo(trackData.cost_info || '');
        setDescription(trackData.description || '');
        setCoverImage(trackData.cover_image || '');
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
        console.error("Error al cargar pista para edición:", error);
        setErrorMsg('Error al cargar la información de la pista.');
      } finally {
        setIsLoading(false);
      }
    }

    checkPermissionsAndLoad();
  }, [id, navigate]);

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
        cover_image: coverImage || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop',
        trazado: trazado || null
      });

      alert('¡Circuito actualizado exitosamente!');
      navigate(`/tracks/${id}`);
    } catch (error) {
      console.error("Error al actualizar la pista:", error);
      setErrorMsg(error.message || 'Error al actualizar el circuito.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer compact className="min-h-[50vh] items-center justify-center fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Cargando pista...</p>
        </div>
      </PageContainer>
    );
  }

  if (errorMsg) {
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

  const fieldClass = 'flex flex-col gap-2';

  return (
    <PageContainer className="fade-in">
      <ContentSection>
        <KineticButton
          variant="text"
          color="secondary"
          onClick={() => navigate(`/tracks/${id}`)}
          startIcon={<ArrowLeft size={20} />}
        >
          Cancelar
        </KineticButton>
      </ContentSection>

      <GlassCard variant="low" className="w-full max-w-2xl mx-auto">
        <ContentSection>
          <h1 className="text-3xl font-headline font-bold text-on-surface uppercase tracking-tight">Editar Circuito</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FormSection maxWidth="full">
              <div className={fieldClass}>
                <label className="text-on-surface-variant font-label uppercase text-xs">Nombre del Circuito</label>
                <Input
                  type="text"
                  placeholder="Ej: Circuito Xtreme Karts"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={fieldClass}>
                  <label className="text-on-surface-variant font-label uppercase text-xs">Ubicación / Ciudad</label>
                  <Input
                    type="text"
                    placeholder="Ej: Bogotá"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className={fieldClass}>
                  <label className="text-on-surface-variant font-label uppercase text-xs">Costo por Heat (Aprox)</label>
                  <Input
                    type="text"
                    placeholder="Ej: $50.000"
                    value={costInfo}
                    onChange={e => setCostInfo(e.target.value)}
                  />
                </div>
              </div>

              <div className={fieldClass}>
                <label className="text-on-surface-variant font-label uppercase text-xs">Horarios de Atención</label>
                <Input
                  type="text"
                  placeholder="Ej: Mar-Dom: 10am - 10pm"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                />
              </div>

              <div className={fieldClass}>
                <label className="text-on-surface-variant font-label uppercase text-xs">URL de Imagen de Portada (Opcional)</label>
                <Input
                  type="url"
                  placeholder="Ej: https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                />
              </div>

              <div className={fieldClass}>
                <label className="text-on-surface-variant font-label uppercase text-xs">URL de Imagen del Trazado (Opcional)</label>
                <Input
                  type="url"
                  placeholder="Ej: https://images.unsplash.com/... (Imagen del trazado del circuito)"
                  value={trazado}
                  onChange={e => setTrazado(e.target.value)}
                />
              </div>

              <div className={fieldClass}>
                <label className="text-on-surface-variant font-label uppercase text-xs">Descripción y Detalles</label>
                <Textarea
                  rows={4}
                  placeholder="Detalles sobre el trazado, asfalto, exigencia..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </FormSection>

            <KineticButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Guardar Cambios'}
            </KineticButton>
          </form>
        </ContentSection>
      </GlassCard>
    </PageContainer>
  );
}
