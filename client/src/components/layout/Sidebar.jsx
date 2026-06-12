import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Store, Star, Bell, LogOut, KeyRound, BarChart3 } from 'lucide-react';

const adminLinks = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/users',     icon: <Users size={18} />,           label: 'Users' },
  { to: '/admin/stores',    icon: <Store size={18} />,           label: 'Stores' },
];
const userLinks = [
  { to: '/stores',          icon: <Store size={18} />,           label: 'Browse Stores' },
  { to: '/account/password',icon: <KeyRound size={18} />,        label: 'Change Password' },
];
const ownerLinks = [
  { to: '/owner/dashboard', icon: <BarChart3 size={18} />,       label: 'My Store Dashboard' },
  { to: '/account/password',icon: <KeyRound size={18} />,        label: 'Change Password' },
];

const linksByRole = { admin: adminLinks, user: userLinks, store_owner: ownerLinks };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[user?.role] || [];
  const initials = user?.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">RP</div>
        <span className="sidebar-logo-text">RetailPulse</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="sidebar-link btn-ghost w-full mt-2" onClick={handleLogout} style={{color:'var(--danger)'}}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
