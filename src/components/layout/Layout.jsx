import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getUserLapTimes } from '../../services/api';
import './Layout.css';

const formatMsToTime = (ms) => {
  if (!ms) return "00:00.000";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const formatGap = (leaderMs, currentMs) => {
  if (leaderMs === currentMs) return 'Líder';
  const diff = currentMs - leaderMs;
  const seconds = Math.floor(diff / 1000);
  const milliseconds = diff % 1000;
  return `+${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
};

function SidebarLapPanel({ isLoading, sessionUser, userFastestMs, leaderMs }) {
  if (isLoading) {
    return (
      <div className="glass-panel p-4 rounded-lg animate-pulse">
        <div className="h-3 w-24 bg-surface-container-highest rounded mb-2" />
        <div className="h-8 w-32 bg-surface-container-highest rounded" />
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <Link
        to="/login"
        className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-colors group"
      >
        <p className="text-[10px] font-bold text-tertiary-fixed uppercase tracking-[0.2em] mb-2">
          Tu mejor vuelta
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-headline text-sm font-bold uppercase text-white group-hover:text-primary-dim transition-colors">
            Iniciar sesión
          </span>
          <span className="material-symbols-outlined text-primary-dim text-lg">login</span>
        </div>
      </Link>
    );
  }

  if (!userFastestMs) {
    return (
      <Link
        to="/profile?subir-tiempo=1"
        className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-colors group"
      >
        <p className="text-[10px] font-bold text-tertiary-fixed uppercase tracking-[0.2em] mb-2">
          Tu mejor vuelta
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-headline text-sm font-bold uppercase text-white group-hover:text-primary-dim transition-colors">
            Subir mi tiempo
          </span>
          <span className="material-symbols-outlined text-primary-dim text-lg group-hover:translate-x-0.5 transition-transform">
            add_circle
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/profile?tab=tiempos"
      className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-colors"
    >
      <p className="text-[10px] font-bold text-tertiary-fixed uppercase tracking-[0.2em] mb-2">
        Tu mejor vuelta
      </p>
      <div className="flex items-end gap-2">
        <span className="font-display text-2xl font-bold leading-none text-white">
          {formatMsToTime(userFastestMs)}
        </span>
        {leaderMs != null && (
          <span className="text-tertiary-fixed text-[10px] font-bold pb-1">
            {formatGap(leaderMs, userFastestMs)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [userFastestMs, setUserFastestMs] = useState(null);
  const [leaderMs, setLeaderMs] = useState(null);
  const [isLoadingLap, setIsLoadingLap] = useState(true);

  const navLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/championships", icon: "trophy", label: "Campeonatos" },
    { to: "/tracks", icon: "map", label: "Pistas" },
    { to: "/live", icon: "sensors", label: "En Vivo" },
    { to: "/profile", icon: "person", label: "Perfil" }
  ];

  if (import.meta.env.DEV) {
    navLinks.push({ to: "/design-system", icon: "palette", label: "Design System" });
  }

  useEffect(() => {
    const fetchSidebarLap = async () => {
      setIsLoadingLap(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setSessionUser(user);

        if (!user) {
          setUserFastestMs(null);
          setLeaderMs(null);
          return;
        }

        const times = await getUserLapTimes(user.id);
        if (times && times.length > 0) {
          const bestMs = Math.min(...times.map((t) => t.lap_time_ms));
          setUserFastestMs(bestMs);

          const { data, error } = await supabase
            .from('lap_times')
            .select('lap_time_ms')
            .order('lap_time_ms', { ascending: true })
            .limit(1);

          if (!error && data?.length > 0) {
            setLeaderMs(data[0].lap_time_ms);
          } else {
            setLeaderMs(null);
          }
        } else {
          setUserFastestMs(null);
          setLeaderMs(null);
        }
      } catch (e) {
        console.error('Error fetching sidebar lap data:', e);
        setUserFastestMs(null);
        setLeaderMs(null);
      } finally {
        setIsLoadingLap(false);
      }
    };

    fetchSidebarLap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSidebarLap();
    });

    window.addEventListener('lap-times-updated', fetchSidebarLap);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('lap-times-updated', fetchSidebarLap);
    };
  }, []);

  return (
    <div className="layout-container">
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col gap-12 p-6 bg-background border-r border-outline-variant/10 z-50">
        {/* Header / Logo */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 kinetic-gradient rounded-sm flex items-center justify-center transform -skew-x-12">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight italic">
            Kart<span className="text-primary-dim">Social</span>
          </h1>
        </div>
        
        {/* Navigation Items */}
        <div className="flex flex-col gap-3">
          {navLinks.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => 
                isActive 
                  ? "bg-surface-container-highest text-on-surface font-bold rounded-lg px-4 py-4 flex items-center gap-4 active-glow border-l-4 border-primary-dim transition-all duration-300"
                  : "group text-on-surface-variant hover:text-on-surface px-4 py-4 flex items-center gap-4 transition-all duration-300 rounded-lg hover:bg-surface-variant/30"
              }
            >
              {({ isActive }) => (
                <>
                  <span 
                    className={`material-symbols-outlined text-2xl ${isActive ? 'text-primary-dim' : 'group-hover:text-primary-dim transition-colors'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    data-icon={item.icon}
                  >
                    {item.icon}
                  </span>
                  <span className={`font-headline tracking-wide ${isActive ? 'uppercase text-sm font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {item.label === 'En Vivo' && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Performance Stats (Sidebar Footer) */}
        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-outline-variant/10">
          <SidebarLapPanel
            isLoading={isLoadingLap}
            sessionUser={sessionUser}
            userFastestMs={userFastestMs}
            leaderMs={leaderMs}
          />
        </div>
      </nav>

      {/* Mobile Topbar */}
      <header className="mobile-header glass-panel bg-background/80 border-b border-outline-variant/10">
        <div className="logo flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF3100] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          <h2 className="text-white font-bold italic">KartSocial</h2>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="text-on-surface flex items-center justify-center p-2 rounded hover:bg-surface-variant/30 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="flex flex-col gap-12 w-72 h-full p-6 relative bg-background/95 border-l border-outline-variant/10 glass-panel" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="absolute top-4 right-4 text-on-surface flex items-center justify-center p-2 rounded hover:bg-surface-variant/30 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 kinetic-gradient rounded-sm flex items-center justify-center transform -skew-x-12">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
              </div>
              <h1 className="font-headline text-2xl font-bold tracking-tight italic text-white">
                Kart<span className="text-primary-dim">Social</span>
              </h1>
            </div>
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-surface-container-highest text-on-surface font-bold rounded-lg px-4 py-4 flex items-center gap-4 active-glow border-l-4 border-primary-dim transition-all duration-300"
                      : "group text-on-surface-variant hover:text-on-surface px-4 py-4 flex items-center gap-4 transition-all duration-300 rounded-lg hover:bg-surface-variant/30"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <span 
                        className={`material-symbols-outlined text-2xl ${isActive ? 'text-primary-dim' : 'group-hover:text-primary-dim transition-colors'}`}
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        data-icon={item.icon}
                      >
                        {item.icon}
                      </span>
                      <span className={`font-headline tracking-wide ${isActive ? 'uppercase text-sm font-bold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                      {item.label === 'En Vivo' && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <SidebarLapPanel
                isLoading={isLoadingLap}
                sessionUser={sessionUser}
                userFastestMs={userFastestMs}
                leaderMs={leaderMs}
              />
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content flex-1 min-h-screen pt-[72px] md:pt-0 relative z-10">
        {/* Visual Background Element: Kinetic Mesh Overlay */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-dim blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed/20 blur-[100px] mix-blend-screen"></div>
        </div>
        {children}
      </main>
    </div>
  );
}
