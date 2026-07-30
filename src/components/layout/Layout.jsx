import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getUserLapTimes } from '../../services/api';
import { formatMsToTime, formatGap } from '../../lib/formatters';
import './Layout.css';

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
        className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-all duration-300 group"
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
        className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-all duration-300 group"
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
      className="glass-panel p-4 rounded-lg block hover:bg-white/5 transition-all duration-300"
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
  const [sessionUser, setSessionUser] = useState(null);
  const [userFastestMs, setUserFastestMs] = useState(null);
  const [leaderMs, setLeaderMs] = useState(null);
  const [isLoadingLap, setIsLoadingLap] = useState(true);

  const navLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/championships", icon: "trophy", label: "Campos." },
    { to: "/tracks", icon: "map", label: "Pistas" },
    { to: "/live", icon: "sensors", label: "En Vivo" },
    { to: "/profile", icon: "person", label: "Perfil" }
  ];

  if (import.meta.env.DEV) {
    navLinks.push({ to: "/design-system", icon: "palette", label: "DS" });
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
      {/* Sidebar Desktop — Premium */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col gap-12 p-6 z-50 bg-gradient-to-b from-[#0e0e0e] via-[#0a0a0a] to-[#080808] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        {/* Speed-line on right border */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-tertiary/10 to-transparent"></div>

        {/* Header / Logo — Premium Glow */}
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF3100] via-[#ff5436] to-[#e12a00] rounded-sm flex items-center justify-center transform -skew-x-12 shadow-[0_0_20px_rgba(255,49,0,0.3)] group-hover:shadow-[0_0_30px_rgba(255,49,0,0.5)] transition-shadow duration-300">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight italic">
            Kart<span className="text-primary-dim">Social</span>
          </h1>
        </div>
        
        {/* Navigation Items — Premium */}
        <div className="flex flex-col gap-2">
          {navLinks.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => 
                isActive 
                  ? "relative bg-gradient-to-r from-surface-container-highest to-surface-container-high text-on-surface font-bold rounded-lg px-4 py-4 flex items-center gap-4 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "group text-on-surface-variant hover:text-on-surface px-4 py-4 flex items-center gap-4 transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-transparent"
              }
            >
              {({ isActive }) => (
                <>
                  {/* Speed-line accent for active */}
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm bg-gradient-to-b from-[#FF3100] to-[#CAFD00]"></div>
                  )}
                  <span 
                    className={`material-symbols-outlined text-2xl ${isActive ? 'text-primary-dim' : 'group-hover:text-primary-dim transition-colors'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    data-icon={item.icon}
                  >
                    {item.icon}
                  </span>
                  <span className={`font-headline tracking-wide ${isActive ? 'uppercase text-sm font-bold' : 'font-medium'}`}>
                    {item.label === 'Campos.' ? 'Campeonatos' : item.label === 'DS' ? 'Design System' : item.label}
                  </span>
                  {item.label === 'En Vivo' && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Performance Stats (Sidebar Footer) — Premium border */}
        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-white/[0.04]">
          <SidebarLapPanel
            isLoading={isLoadingLap}
            sessionUser={sessionUser}
            userFastestMs={userFastestMs}
            leaderMs={leaderMs}
          />
        </div>
      </nav>

      {/* Mobile Topbar */}
      <header className="mobile-header glass-panel bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="logo flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF3100] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          <h2 className="text-white font-bold italic">KartSocial</h2>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <div className="flex items-center justify-around h-16 px-2 w-full">
          {navLinks.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => 
                isActive 
                  ? "flex flex-col items-center justify-center gap-1 w-full h-full text-primary-dim transition-all duration-300 relative"
                  : "flex flex-col items-center justify-center gap-1 w-full h-full text-on-surface-variant hover:text-on-surface transition-all duration-300 relative"
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-[#FF3100] to-[#CAFD00] rounded-b-sm shadow-[0_0_12px_rgba(255,49,0,0.8)]"></div>
                  )}
                  <div className="relative flex items-center justify-center h-7 mt-1">
                    <span 
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    {item.label === 'En Vivo' && (
                      <span className="absolute top-0 -right-2 flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
                    )}
                  </div>
                  <span className={`text-[10px] font-headline tracking-wide uppercase ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content flex-1 min-h-screen pt-[72px] pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0 relative z-10">
        {/* Visual Background Element: Premium orbs */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-dim blur-[120px] mix-blend-screen" style={{ animation: 'glow-pulse 8s ease-in-out infinite' }}></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed/20 blur-[100px] mix-blend-screen"></div>
        </div>
        {children}
      </main>
    </div>
  );
}
