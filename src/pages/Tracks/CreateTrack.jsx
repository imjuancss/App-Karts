import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Tracks.css';

export default function CreateTrack() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate creation
    navigate('/tracks');
  };

  return (
    <div className="create-track-container fade-in">
      <button className="back-btn" onClick={() => navigate('/tracks')}>
        <ArrowLeft size={20}/> Volver
      </button>

      <div className="form-wrapper glass-panel">
        <h1 style={{marginBottom: '2rem'}}>Crear Nuevo Circuito</h1>
        
        <form onSubmit={handleSubmit} className="track-form">
          <div className="form-group">
            <label>Nombre del Circuito</label>
            <input type="text" placeholder="Ej: Circuito Xtreme Karts" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ubicación / Ciudad</label>
              <input type="text" placeholder="Ej: Bogotá" required />
            </div>
            <div className="form-group">
              <label>Costo por Heat (Aprox)</label>
              <input type="text" placeholder="Ej: $50.000" />
            </div>
          </div>

          <div className="form-group">
            <label>Horarios de Atención</label>
            <input type="text" placeholder="Ej: Mar-Dom: 10am - 10pm" />
          </div>

          <div className="form-group">
            <label>Descripción y Detalles</label>
            <textarea rows="4" placeholder="Detalles sobre el trazado, asfalto, exigencia..." />
          </div>

          <button type="submit" className="primary-btn" style={{marginTop: '1rem'}}>
            Registrar Circuito
          </button>
        </form>
      </div>
    </div>
  );
}
