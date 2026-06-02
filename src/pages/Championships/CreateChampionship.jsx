import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Loader2, Calendar, Award } from 'lucide-react';
import { getTracks, createChampionship } from '../../services/api';
import './Championships.css';

export default function CreateChampionship() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTrackId = searchParams.get('trackId') || '';

  // Estados del Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizeLabel, setPrizeLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState('');
  
  // Listado de Pistas y Rondas
  const [allTracks, setAllTracks] = useState([]);
  const [rounds, setRounds] = useState([
    { track_id: '', date: '' },
    { track_id: '', date: '' },
    { track_id: '', date: '' }
  ]);
  
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadTracks() {
      setIsLoadingTracks(true);
      const tracks = await getTracks();
      setAllTracks(tracks || []);
      
      // Si hay un track preseleccionado, usarlo en la primera ronda
      const initialTrackId = preselectedTrackId || (tracks && tracks[0]?.id) || '';
      
      setRounds([
        { track_id: initialTrackId, date: '' },
        { track_id: (tracks && tracks[1]?.id) || '', date: '' },
        { track_id: (tracks && tracks[2]?.id) || '', date: '' }
      ]);
      setIsLoadingTracks(false);
    }
    loadTracks();
  }, [preselectedTrackId]);

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      { track_id: allTracks[0]?.id || '', date: '' }
    ]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 3) {
      setErrorMsg('Un campeonato debe tener como mínimo 3 fechas/pistas.');
      return;
    }
    const updated = rounds.filter((_, i) => i !== idx);
    setRounds(updated);
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = rounds.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // Validaciones
      if (rounds.length < 3) {
        throw new Error('Debes seleccionar al menos 3 pistas (fechas) para crear el torneo.');
      }

      // Validar que todas las rondas tengan pista y fecha seleccionadas
      for (let i = 0; i < rounds.length; i++) {
        if (!rounds[i].track_id) {
          throw new Error(`Por favor selecciona una pista para la Fecha ${i + 1}`);
        }
        if (!rounds[i].date) {
          throw new Error(`Por favor selecciona una fecha válida para la Fecha ${i + 1}`);
        }
      }

      await createChampionship({
        name,
        description,
        prize_label: prizeLabel,
        start_date: startDate || null,
        end_date: endDate || null,
        entry_fee: entryFee ? Number(entryFee) : 0
      }, rounds);

      alert('¡Campeonato creado exitosamente!');
      navigate('/championships');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al crear el campeonato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTracks) {
    return <div className="create-track-container fade-in"><p>Cargando pistas disponibles...</p></div>;
  }

  return (
    <div className="create-track-container fade-in" style={{ paddingBottom: '5rem' }}>
      <button className="back-btn" onClick={() => navigate('/championships')}>
        <ArrowLeft size={20}/> Volver
      </button>

      <div className="form-wrapper glass-panel" style={{ maxWidth: '750px', width: '100%', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Crear Nuevo Torneo</h1>
        
        {errorMsg && (
          <div className="auth-error" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgb(239, 68, 68)', color: '#f87171', borderRadius: '8px' }}>
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="track-form">
          {/* Nombre */}
          <div className="form-group">
            <label>Nombre del Torneo</label>
            <input 
              type="text" 
              placeholder="Ej: Gran Copa Bogotá Karting" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          {/* Fechas del Torneo */}
          <div className="form-row">
            <div className="form-group">
              <label>Fecha General de Inicio</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Fecha General de Fin</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          {/* Premio y Costo */}
          <div className="form-row">
            <div className="form-group">
              <label>Premio Especial (Opcional)</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Award size={18} style={{ position: 'absolute', left: '0.75rem', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="Ej: Trofeo + Casco Sparco" 
                  value={prizeLabel} 
                  onChange={e => setPrizeLabel(e.target.value)} 
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Costo de Inscripción (COP) (Opcional)</label>
              <input 
                type="number" 
                placeholder="Ej: 25000" 
                value={entryFee} 
                onChange={e => setEntryFee(e.target.value)} 
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción y Reglas</label>
            <textarea 
              rows="3" 
              placeholder="Escribe detalles del campeonato, premios extra, categorías..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          {/* Secc Rondas / Fechas (Mínimo 3) */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Calendario de Rondas (Mínimo 3 pistas)</h3>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={handleAddRound}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <Plus size={16}/> Añadir Ronda
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rounds.map((round, idx) => (
                <div 
                  key={idx} 
                  className="round-row-edit" 
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ minWidth: '40px', fontWeight: 'bold', paddingBottom: '0.75rem', color: 'var(--accent)' }}>
                    #{idx + 1}
                  </div>

                  <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                    <label>Pista / Circuito</label>
                    <select 
                      value={round.track_id} 
                      onChange={e => handleRoundChange(idx, 'track_id', e.target.value)} 
                      required
                      style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#121212', color: 'white' }}
                    >
                      <option value="" disabled>Selecciona una pista...</option>
                      {allTracks.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1.5, marginBottom: 0 }}>
                    <label>Fecha de la Ronda</label>
                    <input 
                      type="date" 
                      value={round.date} 
                      onChange={e => handleRoundChange(idx, 'date', e.target.value)} 
                      required 
                    />
                  </div>

                  {rounds.length > 3 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRound(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <Trash2 size={18}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            style={{ marginTop: '2rem', width: '100%', height: '3.2rem', fontSize: '1.05rem' }} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="spinner" size={20} /> : 'Crear Campeonato'}
          </button>
        </form>
      </div>
    </div>
  );
}
