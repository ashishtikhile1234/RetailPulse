import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function AddStorePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  // Fetch store_owner users for the owner dropdown
  useEffect(() => {
    api.get('/admin/users?role=store_owner&limit=100')
      .then(r => setOwners(r.data.data.users))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Store name is required.';
    else if (form.name.length < 20) e.name = 'Store name must be at least 20 characters.';
    else if (form.name.length > 60) e.name = 'Store name must not exceed 60 characters.';
    if (!form.email) e.email = 'Store email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.address) e.address = 'Address is required.';
    else if (form.address.length > 400) e.address = 'Address must not exceed 400 characters.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setServerError(''); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.owner_id) delete payload.owner_id;
      await api.post('/admin/stores', payload);
      toast.success('Store created successfully!');
      navigate('/admin/stores');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create store.');
    } finally { setLoading(false); }
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <AppLayout title="Add Store" subtitle="Register a new store on the platform">
      <div className="page-header">
        <Link to="/admin/stores" className="btn btn-secondary btn-sm"><ArrowLeft size={15}/> Back to Stores</Link>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 20 }}>New Store Details</h2>
        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Store Name <span style={{color:'var(--text-3)',fontWeight:400}}>(20–60 chars)</span></label>
            <input className={`form-input${errors.name?' error':''}`} type="text"
              placeholder="e.g. Fresh Mart Superstore Downtown" value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input className={`form-input${errors.email?' error':''}`} type="email"
              placeholder="store@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{color:'var(--text-3)',fontWeight:400}}>(max 400 chars)</span></label>
            <input className={`form-input${errors.address?' error':''}`} type="text"
              placeholder="Shop No. 5, Main Market, City" value={form.address} onChange={set('address')} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Owner <span style={{color:'var(--text-3)',fontWeight:400}}>(optional)</span></label>
            <select className="form-select" value={form.owner_id} onChange={set('owner_id')}>
              <option value="">— Select a store owner —</option>
              {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Store'}
            </button>
            <Link to="/admin/stores" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
