import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
const PASSWORD_MSG = 'Password must be 8–16 chars, include 1 uppercase & 1 special character.';

export default function AddUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required.';
    else if (form.name.length < 20) e.name = 'Name must be at least 20 characters.';
    else if (form.name.length > 60) e.name = 'Name must not exceed 60 characters.';
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.address && form.address.length > 400) e.address = 'Address must not exceed 400 characters.';
    if (!form.password) e.password = 'Password is required.';
    else if (!PASSWORD_REGEX.test(form.password)) e.password = PASSWORD_MSG;
    if (!form.role) e.role = 'Role is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setServerError(''); setLoading(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create user.');
    } finally { setLoading(false); }
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <AppLayout title="Add User" subtitle="Create a new user account">
      <div className="page-header">
        <Link to="/admin/users" className="btn btn-secondary btn-sm"><ArrowLeft size={15} /> Back to Users</Link>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 20 }}>New User Details</h2>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{color:'var(--text-3)',fontWeight:400}}>(20–60 chars)</span></label>
            <input className={`form-input${errors.name?' error':''}`} type="text"
              placeholder="e.g. John Alexander Smith" value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className={`form-input${errors.email?' error':''}`} type="email"
              placeholder="user@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{color:'var(--text-3)',fontWeight:400}}>(max 400 chars)</span></label>
            <input className={`form-input${errors.address?' error':''}`} type="text"
              placeholder="123 Main St, City" value={form.address} onChange={set('address')} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className={`form-input${errors.password?' error':''}`}
                type={showPass ? 'text' : 'password'} placeholder="Strong password"
                value={form.password} onChange={set('password')} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
            {!errors.password && <p style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:4}}>{PASSWORD_MSG}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={set('role')}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create User'}
            </button>
            <Link to="/admin/users" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
