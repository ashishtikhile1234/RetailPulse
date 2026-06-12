import { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, MapPin, Star } from 'lucide-react';

// Interactive star rating widget
const StarPicker = ({ value, onChange, readonly = false }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={`star${n <= value ? ' filled' : ' empty'}${readonly ? ' readonly' : ''}`}
        onClick={() => !readonly && onChange(n)} title={readonly ? '' : `Rate ${n} star${n>1?'s':''}`}>
        {n <= value ? '★' : '☆'}
      </span>
    ))}
  </div>
);

function StoreCard({ store, onRated }) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [pendingValue, setPendingValue] = useState(store.userRating?.value || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasRated = !!store.userRating;

  const handleSubmit = async () => {
    if (!pendingValue) { toast.error('Please select a star rating first.'); return; }
    setSubmitting(true);
    try {
      if (hasRated) {
        await api.put(`/ratings/${store.userRating.id}`, { value: pendingValue });
        toast.success('Rating updated!');
      } else {
        await api.post('/ratings', { store_id: store.id, value: pendingValue });
        toast.success('Rating submitted! ⭐');
      }
      setIsEditing(false);
      onRated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="store-card">
      <div className="store-card-header">
        <h3 className="store-name">{store.name}</h3>
        {store.totalRatings > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
            {store.totalRatings} review{store.totalRatings !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="store-address">
        <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
        {store.address}
      </p>

      {/* Overall rating */}
      <div className="store-rating-row">
        <StarPicker value={Math.round(store.avgRating || 0)} readonly />
        <span className="store-avg-value">{store.avgRating ? store.avgRating.toFixed(1) : '—'}</span>
        <span className="store-avg-label">overall</span>
      </div>

      {/* User's own rating */}
      <div className="store-user-rating">
        <span className="store-user-rating-label">
          {hasRated ? '👤 Your rating:' : '👤 Not rated yet'}
        </span>

        {hasRated && !isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarPicker value={store.userRating.value} readonly />
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(true); setPendingValue(store.userRating.value); }}>
              Edit
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StarPicker value={pendingValue} onChange={setPendingValue} />
            <button className="btn btn-primary btn-sm" disabled={submitting || !pendingValue}
              onClick={handleSubmit}>
              {submitting ? '…' : hasRated ? 'Update' : 'Submit'}
            </button>
            {isEditing && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditing(false); setPendingValue(store.userRating?.value || 0); }}>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserStoreListPage() {
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const limit = 12;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sortBy, sortOrder, page, limit });
      const res = await api.get(`/stores?${params}`);
      setStores(res.data.data.stores);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 350); return () => clearTimeout(t); }, [search]);

  return (
    <AppLayout title="Browse Stores" subtitle="Discover and rate stores near you">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">{total} store{total !== 1 ? 's' : ''} available</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-select" style={{ width: 160 }}
            value={`${sortBy}_${sortOrder}`}
            onChange={e => { const [sb, so] = e.target.value.split('_'); setSortBy(sb); setSortOrder(so); setPage(1); }}>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="search-input-wrapper" style={{ maxWidth: 420, marginBottom: 24 }}>
        <Search size={16} />
        <input className="form-input search-input" placeholder="Search by store name or address…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 240 }}><div className="spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-title">No stores found</div>
          <p className="empty-state-desc">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="stores-grid">
            {stores.map(s => <StoreCard key={s.id} store={s} onRated={fetchStores} />)}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 28 }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
