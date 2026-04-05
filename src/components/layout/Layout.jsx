import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Map, User, Menu, X, Flag } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", icon: Trophy, label: "Home" },
    // { to: "/championships", icon: Trophy, label: "Campeonatos" },
    { to: "/tracks", icon: Map, label: "Pistas" },
    { to: "/profile", icon: User, label: "Perfil" }
  ];

  return (
    <div className="layout-container">
      {/* Sidebar Desktop */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <Flag size={28} color="var(--accent)" />
          <h2>KartSocial</h2>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <header className="mobile-header glass-panel">
        <div className="logo">
          <Flag size={24} color="var(--accent)" />
          <h2>KartSocial</h2>
        </div>
        <button className="mobile-trigger" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-nav glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
            <div className="mobile-logo">
              <Flag size={28} color="var(--accent)" />
              <h2>KartSocial</h2>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
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
