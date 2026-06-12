import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createTrack } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


export default function CreateTrack() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [costInfo, setCostInfo] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [trazado, setTrazado] = useState('');
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
      } catch (err) {}

      await createTrack({
        name,
        location,
        cost_info: costInfo,
        schedule: scheduleObj,
        description,
        cover_image: coverImage || 'https://images.unsplash.com/photo-1547844390-50dffdb01956?w=600&h=400&fit=crop',
        trazado: trazado || null
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
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded text-red-400">
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <KineticInput
              label="Nombre del Circuito"
              placeholder="Ej: Circuito Xtreme Karts"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fullWidth
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Ubicación / Ciudad"
                  placeholder="Ej: Bogotá"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Costo por Heat (Aprox)"
                  placeholder="Ej: $50.000"
                  value={costInfo}
                  onChange={e => setCostInfo(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <KineticInput
              label="Horarios de Atención"
              placeholder="Ej: Mar-Dom: 10am - 10pm"
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              fullWidth
            />

            <KineticInput
              label="URL de Imagen de Portada (Opcional)"
              placeholder="Ej: https://images.unsplash.com/..."
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              fullWidth
            />

            <KineticInput
              label="URL de Imagen del Trazado (Opcional)"
              placeholder="Ej: https://images.unsplash.com/... (Mapa del circuito)"
              type="url"
              value={trazado}
              onChange={e => setTrazado(e.target.value)}
              fullWidth
            />

            <KineticInput
              label="Descripción y Detalles"
              placeholder="Detalles sobre el trazado, asfalto, exigencia..."
              multiline
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
            />

            <KineticButton 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Registrar Circuito'}
            </KineticButton>
          </Stack>
        </form>
      </KineticCard>
    </div>
  );
}
