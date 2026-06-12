import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Loader2, Calendar, Award } from 'lucide-react';
import { getTracks, createChampionship } from '../../services/api';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
export default function CreateChampionship() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTrackId = searchParams.get('trackId') || '';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizeLabel, setPrizeLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState('');
  
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
      if (rounds.length < 3) {
        throw new Error('Debes seleccionar al menos 3 pistas (fechas) para crear el torneo.');
      }

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
    return (
      <div className="create-track-container fade-in" style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--accent)' }} />
        <Typography color="text.secondary">Cargando formulario...</Typography>
      </div>
    );
  }

  return (
    <div className="create-track-container fade-in max-w-5xl mx-auto">
      <Stack direction="row" mb={3}>
        <KineticButton 
          variant="text" 
          color="secondary" 
          onClick={() => navigate('/championships')}
          startIcon={<ArrowLeft size={20}/>}
        >
          Volver
        </KineticButton>
      </Stack>

      <KineticCard sx={{ maxWidth: 750, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" mb={4} sx={{ color: 'white' }}>Crear Nuevo Torneo</Typography>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded text-red-400">
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <KineticInput
              label="Nombre del Torneo"
              placeholder="Ej: Gran Copa Bogotá Karting"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fullWidth
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Fecha General de Inicio"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Fecha General de Fin"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Premio Especial (Opcional)"
                  placeholder="Ej: Trofeo + Casco Sparco"
                  value={prizeLabel}
                  onChange={e => setPrizeLabel(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Award size={18} color="rgba(255,255,255,0.5)" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KineticInput
                  label="Costo de Inscripción (COP) (Opcional)"
                  type="number"
                  placeholder="Ej: 25000"
                  value={entryFee}
                  onChange={e => setEntryFee(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <KineticInput
              label="Descripción y Reglas"
              placeholder="Escribe detalles del campeonato, premios extra, categorías..."
              multiline
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
            />

            <div className="mt-8 border-t border-white/10 pt-6">
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Calendario de Rondas (Mínimo 3 pistas)</Typography>
                <KineticButton variant="outlined" color="secondary" size="small" onClick={handleAddRound} startIcon={<Plus size={16}/>}>
                  Añadir Ronda
                </KineticButton>
              </Stack>
              <Stack spacing={3}>
                {rounds.map((round, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-lg border border-white/10">
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                        <Typography sx={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                          #{idx + 1}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <KineticInput
                          select
                          label="Pista / Circuito"
                          value={round.track_id}
                          onChange={e => handleRoundChange(idx, 'track_id', e.target.value)}
                          required
                          fullWidth
                        >
                          <MenuItem value="" disabled>Selecciona una pista...</MenuItem>
                          {allTracks.map(t => (
                            <MenuItem key={t.id} value={t.id}>{t.name} ({t.location})</MenuItem>
                          ))}
                        </KineticInput>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <KineticInput
                          label="Fecha de la Ronda"
                          type="date"
                          value={round.date}
                          onChange={e => handleRoundChange(idx, 'date', e.target.value)}
                          required
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>

                      <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
                        {rounds.length > 3 ? (
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveRound(idx)}
                            sx={{ 
                              bgcolor: 'rgba(239, 68, 68, 0.1)', 
                              borderRadius: 1, 
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } 
                            }}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        ) : (
                          // Empty placeholder to maintain grid spacing on desktop
                          <div style={{ width: 40 }} />
                        )}
                      </Grid>
                    </Grid>
                  </div>
                ))}
              </Stack>
            </div>

            <KineticButton 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 4, py: 1.5, fontSize: '1.05rem' }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Crear Campeonato'}
            </KineticButton>
          </Stack>
        </form>
      </KineticCard>
    </div>
  );
}
