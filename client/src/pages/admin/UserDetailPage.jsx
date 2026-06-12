import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import { ArrowLeft, Star } from 'lucide-react';

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{value || <span style={{ color: 'var(--text-3)' }}>—</span>}</div>
  </div>
);

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(r => setUser(r.data.data))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout title="User Detail">
      <div className="page-header">
        <Link to="/admin/users" className="btn btn-secondary btn-sm"><ArrowLeft size={15} /> Back to Users</Link>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>
                {user.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</div>
                <span className={`badge badge-${user.role}`}>{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Field label="Email" value={user.email} />
            <Field label="Address" value={user.address} />
            <Field label="Member Since" value={new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
          </div>

          {user.role === 'store_owner' && user.store && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🏪 Owned Store</h3>
              <Field label="Store Name" value={user.store.name} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '12px 16px', background: 'var(--secondary-light)', borderRadius: 8 }}>
                <Star size={20} fill="var(--secondary)" stroke="var(--secondary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1 }}>
                    {user.store.avgRating ?? 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                    Average Rating ({user.store.totalRatings} review{user.store.totalRatings !== 1 ? 's' : ''})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
