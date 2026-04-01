import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, MessageSquare } from 'lucide-react';
import { MOCK_CHAMPS_DATA } from './ChampionshipsList';
import './Championships.css';

const MOCK_LEADERBOARD = [
  { pos: 1, user: "Juan Camilo (@juancakart)", points: 120, bestTime: "00:44.520", gap: "-" },
  { pos: 2, user: "Racer X (@racer_x)", points: 95, bestTime: "00:44.890", gap: "+0.370" },
  { pos: 3, user: "KartKing (@kking99)", points: 80, bestTime: "00:45.120", gap: "+0.600" }
];

export default function ChampionshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ranking');
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const champ = MOCK_CHAMPS_DATA.find(c => c.id === parseInt(id)) || MOCK_CHAMPS_DATA[0];

  const handleCheckout = () => {
    console.log("Preparando integración con Wompi...");
  };

  return (
    <div className="champ-detail-container fade-in">
      <button className="back-btn" onClick={() => navigate('/championships')}>
        <ArrowLeft size={20}/> Volver a campeonatos
      </button>

      <div className="champ-header glass-panel">
        <div className="champ-title-row">
          <h1>{champ.name}</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button className="primary-btn" onClick={handleCheckout}>Inscribirme - $25.000 COP</button>
            <span className="text-xs" style={{ color: '#9ca3af', maxWidth: '300px', textAlign: 'right' }}>
              Este pago corresponde al Race Pass para la bolsa de premios. NO incluye el costo de alquiler del kart en la pista
            </span>
          </div>
        </div>
        <div className="champ-meta-row">
          <span><MapPin size={18}/> {champ.track}</span>
          <span><Calendar size={18}/> {champ.date}</span>
          <span><Users size={18}/> {champ.participants} Inscritos</span>
        </div>
      </div>

      <div className="champ-layout glass-panel">
        <div className="layout-tabs">
          <button className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}><Trophy size={18}/> Ranking y Tiempos</button>
          <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}><Calendar size={18}/> Reglas y Premios</button>
        </div>
        
        <div className="layout-content">
          {activeTab === 'ranking' && (
            <div className="fade-in">
              <div className="ranking-actions" style={{marginBottom:'1rem', display:'flex', justifyContent:'flex-end'}}>
                 <button className="secondary-btn" onClick={() => setIsTimeModalOpen(true)}>Registrar Tiempo</button>
              </div>
              <div className="leaderboard-table">
                <div className="table-header">
                  <div className="col-pos">Pos</div>
                  <div className="col-pilot">Piloto</div>
                  <div className="col-time">Mejor Tiempo</div>
                  <div className="col-gap">Diferencia</div>
                  <div className="col-pts">Puntos</div>
                </div>
                {MOCK_LEADERBOARD.map(p => (
                  <div key={p.pos} className={`table-row ${p.pos === 1 ? 'first-place' : ''}`}>
                    <div className="col-pos">{p.pos}</div>
                    <div className="col-pilot">{p.user}</div>
                    <div className="col-time" style={{ fontFamily: 'monospace' }}>{p.bestTime}</div>
                    <div className="col-gap" style={{ fontFamily: 'monospace', color: p.pos === 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>{p.gap}</div>
                    <div className="col-pts">{p.points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'rules' && (
            <div className="fade-in rules-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div className="date-card">
                <h4>Distribución del Pozo de Premios</h4>
                <p style={{fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem', lineHeight: '1.5'}}>
                  El pozo total recaudado mediante los Race Pass se dividirá de la siguiente manera:
                  <br/><br/>
                  • <strong>1er Lugar:</strong> 50%<br/>
                  • <strong>2do Lugar:</strong> 30%<br/>
                  • <strong>3er Lugar:</strong> 20%
                </p>
              </div>
              <div className="date-card">
                <h4>Reglas en Pista (Penalizaciones)</h4>
                <p style={{fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem', lineHeight: '1.5'}}>
                  - Bloqueos antideportivos o choques intencionales resultarán en la suma de +5.000s a tu mejor tiempo.<br/>
                  - Saltarse curvas anulará el tiempo de esa vuelta.<br/>
                  - No atender banderas obligará a descalificación inmediata de la sesión.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isTimeModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px', borderRadius: '12px', background: '#1e1e2f' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registrar Tiempo</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setTimeout(() => {
                setIsSubmitting(false);
                setIsTimeModalOpen(false);
                alert('Tiempo enviado. Los administradores revisarán tu evidencia en breve');
              }, 1000);
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Tu mejor tiempo (mm:ss.SSS)</label>
                <input type="text" placeholder="Ej: 00:44.520" required style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Subir foto del ticket impreso</label>
                <input type="file" accept="image/*" required style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsTimeModalOpen(false)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
