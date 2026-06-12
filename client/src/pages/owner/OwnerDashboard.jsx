import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const StarDisplay = ({ value }) => (
  <span style={{ color: 'var(--secondary)' }}>
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    <span style={{ color: 'var(--text-2)', marginLeft: 6, fontSize: '0.82rem', fontWeight: 400 }}> {value}/5</span>
  </span>
);

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <ChevronsUpDown size={14} style={{ color: 'var(--text-3)' }} />;
  return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(r => setData(r.data.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const sortedRaters = data?.raters ? [...data.raters].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'value') { aVal = a.value; bVal = b.value; }
    else if (sortBy === 'name') { aVal = a.user.name; bVal = b.user.name; }
    else if (sortBy === 'email') { aVal = a.user.email; bVal = b.user.email; }
    else { aVal = new Date(a.submittedAt); bVal = new Date(b.submittedAt); }
    if (typeof aVal === 'string') return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  }) : [];

  return (
    <AppLayout title="My Store Dashboard" subtitle="Track your store's ratings and reviews">
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <>
          {/* Store info + avg rating cards */}
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 26 }}>⭐</div>
              <div>
                <div className="stat-value">{data.avgRating ?? '—'}</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe', fontSize: 26 }}>📝</div>
              <div>
                <div className="stat-value">{data.totalRatings}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7', fontSize: 26 }}>🏪</div>
              <div>
                <div className="stat-value" style={{ fontSize: '1rem', fontWeight: 700 }}>{data.store.name}</div>
                <div className="stat-label" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.store.address}</div>
              </div>
            </div>
          </div>

          {/* Visual rating bar */}
          {data.avgRating && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Overall Rating</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{data.avgRating}</span>
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ fontSize: 28, color: n <= Math.round(data.avgRating) ? 'var(--secondary)' : 'var(--border-strong)' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Based on {data.totalRatings} review{data.totalRatings !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Raters table */}
          <div className="table-wrapper">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700 }}>Customer Reviews</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: 2 }}>
                Users who have rated your store
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {[
                      { key: 'name', label: 'Customer Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'value', label: 'Rating' },
                      { key: 'submittedAt', label: 'Date Submitted' },
                    ].map(col => (
                      <th key={col.key} className="sortable" onClick={() => handleSort(col.key)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {col.label} <SortIcon field={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRaters.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon">⭐</div>
                          <div className="empty-state-title">No ratings yet</div>
                          <p className="empty-state-desc">Your store hasn't received any ratings yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : sortedRaters.map(r => (
                    <tr key={r.ratingId}>
                      <td style={{ fontWeight: 500 }}>{r.user.name}</td>
                      <td style={{ color: 'var(--text-2)' }}>{r.user.email}</td>
                      <td><StarDisplay value={r.value} /></td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>
                        {new Date(r.submittedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
