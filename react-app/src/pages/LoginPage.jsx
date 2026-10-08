import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'member@smartsplit.com', password: 'password123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="brand-mark large">P</div>
        <h1>PAYMATE</h1>
        <p>Robotics-assisted household utility control</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>

        <div className="demo-credentials">
          <strong>Demo credentials</strong>
          <div>member@smartsplit.com / password123</div>
          <div>admin@smartsplit.com / password123</div>
          <div>platform@smartsplit.com / password123</div>
        </div>

        <p className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};
