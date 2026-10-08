import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="brand-mark large">P</div>
        <h1>Create account</h1>
        <p>Join the PAYMATE household network</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Full name
            <input name="name" autoComplete="name" maxLength={100} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input name="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <small>Your account starts as a household member. You can create a household after signing in.</small>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
