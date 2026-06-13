import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
          <div className="form-group">
            <label>Nombre del Circuito</label>
            <input 
              type="text" 
              placeholder="Ej: Circuito Xtreme Karts" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ubicación / Ciudad</label>
              <input 
                type="text" 
                placeholder="Ej: Bogotá" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Costo por Heat (Aprox)</label>
              <input 
                type="text" 
                placeholder="Ej: $50.000" 
                value={costInfo} 
                onChange={e => setCostInfo(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Horarios de Atención</label>
            <input 
              type="text" 
              placeholder="Ej: Mar-Dom: 10am - 10pm" 
              value={schedule} 
              onChange={e => setSchedule(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>URL de Imagen de Portada (Opcional)</label>
            <input 
              type="url" 
              placeholder="Ej: https://images.unsplash.com/..." 
              value={coverImage} 
              onChange={e => setCoverImage(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Descripción y Detalles</label>
            <textarea 
              rows="4" 
              placeholder="Detalles sobre el trazado, asfalto, exigencia..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          <button type="submit" className="primary-btn" style={{marginTop: '1rem'}} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="spinner" size={20} /> : 'Registrar Circuito'}
          </button>
        </form>
      </KineticCard>
    </div>
  );
}
