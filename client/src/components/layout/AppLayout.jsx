import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main">
        <div className="app-topbar">
          {/* Hamburger — mobile only */}
          <button
            className="btn btn-ghost btn-icon hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div>
            {title    && <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{subtitle}</p>}
          </div>
        </div>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
