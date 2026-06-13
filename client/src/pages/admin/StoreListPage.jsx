import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <ChevronsUpDown size={14} style={{ color: 'var(--text-3)' }} />;
  return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

const StarDisplay = ({ value }) => (
  <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>
    {'★'.repeat(Math.round(value || 0))}{'☆'.repeat(5 - Math.round(value || 0))}
    <span style={{ color: 'var(--text-2)', fontWeight: 400, marginLeft: 6, fontSize: '0.8rem' }}>
      {value ? value.toFixed(1) : 'N/A'}
    </span>
  </span>
);

export default function StoreListPage() {
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sortBy, sortOrder, page, limit });
      const res = await api.get(`/admin/stores?${params}`);
      setStores(res.data.data.stores);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  return (
    <AppLayout title="Stores" subtitle="All registered stores">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Stores</h1>
          <p className="page-subtitle">{total} store{total !== 1 ? 's' : ''} registered</p>
        </div>
        <Link to="/admin/stores/new" className="btn btn-primary"><Plus size={16} /> Add Store</Link>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input className="form-input search-input" placeholder="Search by name, email, address…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {['name','email','address'].map(col => (
                  <th key={col} className="sortable" onClick={() => handleSort(col)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      <SortIcon field={col} sortBy={sortBy} sortOrder={sortOrder} />
                    </span>
                  </th>
                ))}
                <th className="sortable" onClick={() => handleSort('avgRating')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Rating <SortIcon field="avgRating" sortBy={sortBy} sortOrder={sortOrder} />
                  </span>
                </th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">🏪</div><div className="empty-state-title">No stores found</div></div></td></tr>
              ) : stores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                  <td><StarDisplay value={s.avgRating} /></td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{s.owner?.name || <span style={{ color: 'var(--text-3)' }}>Unassigned</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-pagination">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Rows per page:</span>
            <select className="form-select" style={{ width: 72, padding: '4px 8px', fontSize: '0.8rem' }}
              value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ marginLeft: 8 }}>Showing {Math.min((page-1)*limit+1,total)}–{Math.min(page*limit,total)} of {total}</span>
          </div>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button>
            <span style={{padding:'0 8px',fontSize:'0.85rem'}}>Page {page} of {Math.max(1,Math.ceil(total/limit))}</span>
            <button className="btn btn-secondary btn-sm" disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
