import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-text-primary text-xl font-semibold">Discipline Tracker</h1>
          <p className="text-text-muted text-sm mt-1">Track your habits. See the truth.</p>
        </div>
        <div className="card p-6 space-y-4">
          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-text-muted text-xs block mb-1.5">Email</label>
              <input type="email" className="w-full" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1.5">Password</label>
              <input type="password" className="w-full" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-text-muted text-xs text-center">
            No account? <Link to="/register" className="text-accent-blue hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
