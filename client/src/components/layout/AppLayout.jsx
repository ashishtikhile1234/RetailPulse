import Sidebar from './Sidebar';

export default function AppLayout({ children, title, subtitle }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="app-topbar">
          <div>
            {title && <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{subtitle}</p>}
          </div>
        </div>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
