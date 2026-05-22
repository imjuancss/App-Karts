import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile } from '../../services/api';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campeonatos');
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        setSessionUser(user);
        let p = await getProfile(user.id);
        
        // Si por alguna razón el trigger falló, intentamos crearlo manualmente o damos datos por defecto
        if (!p) {
          const { data } = await supabase.from('profiles').insert([{
            id: user.id,
            username: user.email.split('@')[0] + Math.floor(Math.random() * 1000),
            full_name: user.user_metadata?.full_name || 'Piloto Nuevo'
          }]).select().single();
          
          p = data || { id: user.id, full_name: user.user_metadata?.full_name || 'Piloto Nuevo', username: user.email.split('@')[0] };
        }
        setUserProfile(p);
      } else {
        setSessionUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    }
    
    // Escuchar cambios de sesión (ej. después de confirmar correo o iniciar sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
         setSessionUser(null);
         setUserProfile(null);
      }
    });

    loadUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) return <div className="profile-container fade-in"><p>Cargando perfil...</p></div>;

  if (!sessionUser || !userProfile) {
    return (
      <div className="profile-container fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Aún no has iniciado sesión</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Conéctate o vuelve a iniciar sesión con tu cuenta recién creada.</p>
        <button className="primary-btn" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/login')}>Iniciar Sesión / Registro</button>
      </div>
    );
  }

  return (
    <div className="profile-container fade-in">
      {/* Header */}
      <section className="profile-header glass-panel">
        <div className="profile-cover"></div>
        <div className="profile-info-wrapper">
          <img src={userProfile.avatar_url || 'https://i.pravatar.cc/150'} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <div className="profile-title">
              <h1>{userProfile.full_name || 'Piloto'}</h1>
              <span className="username">@{userProfile.username || 'usuario'}</span>
            </div>
            <p className="profile-bio">{userProfile.bio || 'Sin biografía.'}</p>
            <div className="profile-meta">
              <span><MapPin size={16}/> {userProfile.location || 'Ubicación desconocida'}</span>
              <span><Calendar size={16}/> Creado: {new Date(userProfile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="primary-btn">Editar Perfil</button>
            <button className="secondary-btn" onClick={async () => await supabase.auth.signOut()}>Cerrar Sesión</button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Carreras</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Podios</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Campeonatos</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'campeonatos' ? 'active' : ''}`}
          onClick={() => setActiveTab('campeonatos')}
        >
          <Trophy size={18}/> Mis Campeonatos
        </button>

        <button 
          className={`tab-btn ${activeTab === 'actividad' ? 'active' : ''}`}
          onClick={() => setActiveTab('actividad')}
        >
          <MessageSquare size={18}/> Actividad
        </button>
      </div>

      {/* Tab Content */}
      <section className="tab-content glass-panel">
        {activeTab === 'campeonatos' && (
          <div className="content-grid list-view fade-in">
             <p style={{color: 'var(--text-secondary)'}}>Aún no te has inscrito a ningún campeonato.</p>
          </div>
        )}

        {activeTab === 'actividad' && (
          <div className="activity-feed fade-in">
            <p style={{color: 'var(--text-secondary)'}}>No hay actividad reciente.</p>
          </div>
        )}
      </section>
    </div>
  );
}
