import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import KineticCard from '../../components/ui/KineticCard';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
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
      // Intentamos estructurar el horario como JSON si tiene un formato clave/valor
      // De lo contrario, lo guardamos como un objeto con una clave "horario"
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

  return (
    <div className="create-track-container fade-in">
      <Stack direction="row" mb={3}>
        <KineticButton 
          variant="text" 
          color="secondary" 
          onClick={() => navigate('/tracks')}
          startIcon={<ArrowLeft size={20}/>}
        >
          Volver
        </KineticButton>
      </Stack>

      <KineticCard sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" mb={4} sx={{ color: 'white' }}>Crear Nuevo Circuito</Typography>
        
        {errorMsg && (
          <div className="auth-error" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgb(239, 68, 68)', color: '#f87171', borderRadius: '8px' }}>
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="track-form">
          <div className="form-group mb-4">
            <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">Nombre del Circuito</label>
            <Input 
              type="text" 
              placeholder="Ej: Circuito Xtreme Karts" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">Ubicación / Ciudad</label>
              <Input 
                type="text" 
                placeholder="Ej: Bogotá" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">Costo por Heat (Aprox)</label>
              <Input 
                type="text" 
                placeholder="Ej: $50.000" 
                value={costInfo} 
                onChange={e => setCostInfo(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">Horarios de Atención</label>
            <Input 
              type="text" 
              placeholder="Ej: Mar-Dom: 10am - 10pm" 
              value={schedule} 
              onChange={e => setSchedule(e.target.value)} 
            />
          </div>

          <div className="form-group mb-4">
            <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">URL de Imagen de Portada (Opcional)</label>
            <Input 
              type="url" 
              placeholder="Ej: https://images.unsplash.com/..." 
              value={coverImage} 
              onChange={e => setCoverImage(e.target.value)} 
            />
          </div>

          <div className="form-group mb-6">
            <label className="block mb-2 text-on-surface-variant font-label uppercase text-xs">Descripción y Detalles</label>
            <Textarea 
              rows="4" 
              placeholder="Detalles sobre el trazado, asfalto, exigencia..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          <KineticButton type="submit" variant="contained" color="primary" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Circuito'}
          </KineticButton>
        </form>
      </KineticCard>
    </div>
  );
}
