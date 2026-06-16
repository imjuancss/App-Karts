import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';
import { createTrack } from '../../services/api';

export default function CreateTrack() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [costInfo, setCostInfo] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        cover_image: coverImage || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop'
      });

      navigate('/tracks');
    } catch (error) {
      console.error("Error al crear la pista:", error);
      setErrorMsg(error.message || 'Error al registrar el circuito.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'flex flex-col gap-2';

  return (
    <PageContainer className="fade-in">
      <ContentSection>
        <KineticButton
          variant="text"
          color="secondary"
          onClick={() => navigate('/tracks')}
          startIcon={<ArrowLeft size={20} />}
        >
          Volver
        </KineticButton>
      </ContentSection>

      <GlassCard variant="low" className="w-full max-w-2xl mx-auto">
        <ContentSection>
          <h1 className="text-3xl font-headline font-bold text-on-surface uppercase tracking-tight">Crear Nuevo Circuito</h1>

          {errorMsg && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-sm">
              <p className="text-error font-label text-sm uppercase tracking-wider">{errorMsg}</p>
            </div>
          )}

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
                <label className="text-on-surface-variant font-label uppercase text-xs">Descripción y Detalles</label>
                <Textarea
                  rows={4}
                  placeholder="Detalles sobre el trazado, asfalto, exigencia..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </FormSection>

            <KineticButton type="submit" variant="contained" color="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Circuito'}
            </KineticButton>
          </form>
        </ContentSection>
      </GlassCard>
    </PageContainer>
  );
}
