import { useNavigate } from 'react-router-dom';
import KineticButton from '../../components/ui/KineticButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-6 fade-in px-4">
      <div className="w-20 h-20 bg-surface-container-highest rounded-sm flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-dim text-5xl">explore_off</span>
      </div>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-6xl font-headline font-bold text-on-surface">404</h1>
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Pista no encontrada</p>
      </div>
      <p className="text-on-surface-variant text-center max-w-sm">
        Esta ruta no existe o fue movida. Vuelve al inicio para encontrar el camino.
      </p>
      <KineticButton variant="contained" color="primary" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined text-lg">home</span>
        Volver al Inicio
      </KineticButton>
    </div>
  );
}
