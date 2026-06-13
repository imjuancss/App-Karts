import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getTrackById, updateTrack, getProfile } from '../../services/api';
import { supabase } from '../../lib/supabase';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


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
      } catch (err) {}

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
      <div className="create-track-container fade-in" style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--accent)' }} />
        <Typography color="text.secondary">Cargando pista...</Typography>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="create-track-container fade-in text-center">
        <KineticCard sx={{ maxWidth: 500, mx: 'auto', p: 4 }}>
          <Typography color="error" mb={2}>Pista no encontrada o no tienes permisos para editarla.</Typography>
          <KineticButton variant="contained" onClick={() => navigate('/tracks')}>Volver a pistas</KineticButton>
        </KineticCard>
      </div>
    );
  }

  return (
    <div className="create-track-container fade-in">
      <Stack direction="row" mb={3}>
        <KineticButton 
          variant="text" 
          color="secondary" 
          onClick={() => navigate(`/tracks/${id}`)}
          startIcon={<ArrowLeft size={20}/>}
        >
          Cancelar
        </KineticButton>
      </Stack>

      <KineticCard sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" mb={4} sx={{ color: 'white' }}>Editar Circuito</Typography>

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
              placeholder="Ej: https://images.unsplash.com/... (Imagen del trazado del circuito)"
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
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Guardar Cambios'}
            </KineticButton>
          </Stack>
        </form>
      </KineticCard>
    </div>
  );
}
