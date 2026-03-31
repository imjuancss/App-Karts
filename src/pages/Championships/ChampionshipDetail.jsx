import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, MessageSquare } from 'lucide-react';
import { MOCK_CHAMPS_DATA } from './ChampionshipsList';
import './Championships.css';

const MOCK_LEADERBOARD = [
  { pos: 1, user: "Juan Camilo (@juancakart)", points: 120, bestTime: "44.52s" },
  { pos: 2, user: "Racer X (@racer_x)", points: 95, bestTime: "44.89s" },
  { pos: 3, user: "KartKing (@kking99)", points: 80, bestTime: "45.12s" }
];

export default function ChampionshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ranking');

  const champ = MOCK_CHAMPS_DATA.find(c => c.id === parseInt(id)) || MOCK_CHAMPS_DATA[0];

  return (
    <div className="champ-detail-container fade-in">
      <button className="back-btn" onClick={() => navigate('/championships')}>
        <ArrowLeft size={20}/> Volver a campeonatos
      </button>

      <div className="champ-header glass-panel">
        <div className="champ-title-row">
          <h1>{champ.name}</h1>
          <button className="primary-btn">Inscribirme</button>
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
          <button className={`tab-btn ${activeTab === 'fechas' ? 'active' : ''}`} onClick={() => setActiveTab('fechas')}><Calendar size={18}/> Calendario</button>
          <button className={`tab-btn ${activeTab === 'comentarios' ? 'active' : ''}`} onClick={() => setActiveTab('comentarios')}><MessageSquare size={18}/> Muro</button>
        </div>
        
        <div className="layout-content">
          {activeTab === 'ranking' && (
            <div className="fade-in">
              <div className="ranking-actions" style={{marginBottom:'1rem', display:'flex', justifyContent:'flex-end'}}>
                 <button className="secondary-btn">Registrar Tiempo</button>
              </div>
              <div className="leaderboard-table">
                <div className="table-header">
                  <div className="col-pos">Pos</div>
                  <div className="col-pilot">Piloto</div>
                  <div className="col-time">Mejor Tiempo</div>
                  <div className="col-pts">Puntos</div>
                </div>
                {MOCK_LEADERBOARD.map(p => (
                  <div key={p.pos} className={`table-row ${p.pos === 1 ? 'first-place' : ''}`}>
                    <div className="col-pos">{p.pos}</div>
                    <div className="col-pilot">{p.user}</div>
                    <div className="col-time">{p.bestTime}</div>
                    <div className="col-pts">{p.points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'fechas' && (
            <div className="fade-in dates-list">
              <div className="date-card">
                <h4>Fecha 1: Clasificación</h4>
                <p>15 de Abril, 2026 - 10:00 AM</p>
              </div>
              <div className="date-card">
                <h4>Fecha 2: Carrera Principal</h4>
                <p>22 de Abril, 2026 - 11:00 AM</p>
              </div>
            </div>
          )}

          {activeTab === 'comentarios' && (
            <div className="fade-in">
               <div className="comment-box">
                 <textarea placeholder="Discute con los demás pilotos..." rows="3"></textarea>
                 <button className="primary-btn" style={{marginTop: '1rem'}}>Publicar</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
