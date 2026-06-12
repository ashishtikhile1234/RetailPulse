import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import { Users, Store, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, bg: '#ede9fe', color: '#7c3aed' },
    { icon: '🏪', label: 'Total Stores', value: stats.totalStores, bg: '#dbeafe', color: '#1d4ed8' },
    { icon: '⭐', label: 'Total Ratings', value: stats.totalRatings, bg: '#fef3c7', color: '#b45309' },
  ] : [];

  return (
    <AppLayout title="Dashboard" subtitle="Platform overview">
      <div className="stat-grid">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="stat-card" style={{ height: 96 }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))
        ) : cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
            </div>
            <div>
              <div className="stat-value">{c.value.toLocaleString()}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Quick Actions</h2>
        <p className="text-muted text-sm mb-4">Navigate to manage users and stores.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/admin/users/new" className="btn btn-primary"><Users size={16} /> Add User</a>
          <a href="/admin/stores/new" className="btn btn-secondary"><Store size={16} /> Add Store</a>
          <a href="/admin/users" className="btn btn-secondary">View All Users</a>
          <a href="/admin/stores" className="btn btn-secondary">View All Stores</a>
        </div>
      </div>
    </AppLayout>
  );
}
