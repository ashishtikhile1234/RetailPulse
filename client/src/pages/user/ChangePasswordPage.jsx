import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
const PASSWORD_MSG = 'Password must be 8–16 chars, include 1 uppercase & 1 special character.';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword) e.newPassword = 'New password is required.';
    else if (!PASSWORD_REGEX.test(form.newPassword)) e.newPassword = PASSWORD_MSG;
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setServerError(''); setLoading(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully! 🔐');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to update password.');
    } finally { setLoading(false); }
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const toggle = f => () => setShow(p => ({ ...p, [f]: !p[f] }));

  const PasswordInput = ({ field, label, placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input className={`form-input${errors[field] ? ' error' : ''}`}
          type={show[field] ? 'text' : 'password'} placeholder={placeholder}
          value={form[field]} onChange={set(field)} style={{ paddingRight: 42 }} />
        <button type="button" onClick={toggle(field)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
          {show[field] ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
      {errors[field] && <p className="form-error">{errors[field]}</p>}
    </div>
  );

  return (
    <AppLayout title="Change Password" subtitle="Update your account password">
      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700 }}>Change Password</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Keep your account secure</p>
          </div>
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <PasswordInput field="currentPassword" label="Current Password" placeholder="Enter current password" />
          <PasswordInput field="newPassword" label="New Password" placeholder="Enter new password" />
          {!errors.newPassword && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: -10, marginBottom: 12 }}>{PASSWORD_MSG}</p>
          )}
          <PasswordInput field="confirmPassword" label="Confirm New Password" placeholder="Repeat new password" />

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
