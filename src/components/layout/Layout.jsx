import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Map, User, Menu, X, Flag, Home, Radio } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import './Layout.css';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/championships", icon: Trophy, label: "Campeonatos" },
    { to: "/tracks", icon: Map, label: "Pistas" },
    { to: "/live", icon: Radio, label: "En Vivo" },
    { to: "/profile", icon: User, label: "Perfil" }
  ];


  return (
    <div className="layout-container">
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 lg:w-72 flex-col p-6 bg-background border-r border-border z-50">
        {/* Header / Logo */}
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 kinetic-gradient rounded-sm flex items-center justify-center transform -skew-x-12">
            <Flag size={24} color="white" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight italic">
            Kart<span className="text-primary">Social</span>
          </h1>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navLinks.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => 
                isActive 
                  ? "bg-card text-foreground font-bold rounded-lg px-4 py-4 flex items-center gap-4 active-glow border-l-4 border-primary transition-all duration-300"
                  : "group text-muted-foreground hover:text-foreground px-4 py-4 flex items-center gap-4 transition-all duration-300 rounded-lg hover:bg-white/5"
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon size={24} className={isActive ? "text-primary" : "group-hover:text-primary transition-colors"} />
                    <span className={`font-heading tracking-wide ${isActive ? 'uppercase text-sm' : 'font-medium'}`}>
                      {item.label}
                    </span>
                    {item.label === 'En Vivo' && (
                      <span className="ml-auto flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                    )}
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>

        {/* Performance Stats (Sidebar Footer) */}
        <div className="mt-auto pt-8 border-t border-border/50">
          <div className="glass-panel p-4 rounded-lg">
            <p className="text-[10px] font-bold text-[#beee00] uppercase tracking-[0.2em] mb-2">Fastest Lap</p>
            <div className="flex items-end gap-2">
              <span className="font-heading text-2xl font-bold leading-none">00:48.254</span>
              <span className="text-[#beee00] text-[10px] font-bold pb-1">+0.002s</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Topbar */}
      <header className="mobile-header glass-panel">
        <div className="logo">
          <Flag size={24} color="var(--accent)" />
          <h2>KartSocial</h2>
        </div>
        <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: 'white' }}>
          <Menu size={24} />
        </IconButton>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-nav glass-panel" onClick={e => e.stopPropagation()}>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', position: 'absolute', top: 16, right: 16 }}>
              <X size={24} />
            </IconButton>
            <div className="mb-12 flex items-center gap-3 px-2">
              <div className="w-10 h-10 kinetic-gradient rounded-sm flex items-center justify-center transform -skew-x-12">
                <Flag size={24} color="white" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight italic">
                Kart<span className="text-primary">Social</span>
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-card text-foreground font-bold rounded-lg px-4 py-4 flex items-center gap-4 active-glow border-l-4 border-primary transition-all duration-300"
                      : "group text-muted-foreground hover:text-foreground px-4 py-4 flex items-center gap-4 transition-all duration-300 rounded-lg hover:bg-white/5"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {({ isActive }) => {
                    const Icon = item.icon;
                    return (
                      <>
                        <Icon size={24} className={isActive ? "text-primary" : "group-hover:text-primary transition-colors"} />
                        <span className={`font-heading tracking-wide ${isActive ? 'uppercase text-sm' : 'font-medium'}`}>
                          {item.label}
                        </span>
                        {item.label === 'En Vivo' && (
                          <span className="ml-auto flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
