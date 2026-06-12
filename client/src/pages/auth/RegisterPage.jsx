import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
const PASSWORD_MSG = 'Password must be 8–16 chars, include 1 uppercase & 1 special character.';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
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
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.address && form.address.length > 400) e.address = 'Address must not exceed 400 characters.';
    if (!form.password) e.password = 'Password is required.';
    else if (!PASSWORD_REGEX.test(form.password)) e.password = PASSWORD_MSG;
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setServerError(''); setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success('Account created! Welcome to RetailPulse 🎉');
      navigate('/stores');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">RP</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>RetailPulse</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join RetailPulse and start rating stores</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{color:'var(--text-3)',fontWeight:400}}>(20–60 chars)</span></label>
            <input className={`form-input${errors.name ? ' error' : ''}`} type="text"
              placeholder="e.g. John Alexander Smith" value={form.name} onChange={set('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className={`form-input${errors.email ? ' error' : ''}`} type="email"
              placeholder="you@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Address <span style={{color:'var(--text-3)',fontWeight:400}}>(optional)</span></label>
            <input className={`form-input${errors.address ? ' error' : ''}`} type="text"
              placeholder="123 Main St, City, State" value={form.address} onChange={set('address')} />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className={`form-input${errors.password ? ' error' : ''}`}
                type={showPass ? 'text' : 'password'} placeholder="Create a strong password"
                value={form.password} onChange={set('password')}
                style={{ paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
            {!errors.password && <p style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:4}}>{PASSWORD_MSG}</p>}
          </div>
          <button className="btn btn-primary btn-full mt-3" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
