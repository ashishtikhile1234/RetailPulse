import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react';

const ROLES = ['', 'admin', 'user', 'store_owner'];

const RoleBadge = ({ role }) => <span className={`badge badge-${role}`}>{role.replace('_', ' ')}</span>;

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <ChevronsUpDown size={14} style={{ color: 'var(--text-3)' }} />;
  return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, role, sortBy, sortOrder, page, limit });
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [search, role, sortBy, sortOrder, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => { const t = setTimeout(() => setPage(1), 300); return () => clearTimeout(t); }, [search]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const cols = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'role', label: 'Role' },
  ];

  return (
    <AppLayout title="Users" subtitle="Manage all platform users">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Users</h1>
          <p className="page-subtitle">{total} user{total !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/admin/users/new" className="btn btn-primary"><Plus size={16} /> Add User</Link>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input className="form-input search-input" placeholder="Search by name, email, address…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">Normal User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {cols.map(c => (
                  <th key={c.key} className="sortable" onClick={() => handleSort(c.key)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.label} <SortIcon field={c.key} sortBy={sortBy} sortOrder={sortOrder} />
                    </span>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-title">No users found</div><p className="empty-state-desc">Try adjusting your search or filter.</p></div></td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <Link to={`/admin/users/${u.id}`} className="btn btn-secondary btn-sm"><Eye size={14} /> View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ padding: '0 8px', fontSize: '0.85rem' }}>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
