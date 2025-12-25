import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated, loading, error } = useAuth();
  const [email, setEmail] = useState('admin@pulsetter.local');
  const [password, setPassword] = useState('changeme123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Pulsetter Dashboard</h1>
        <p className="muted">Sign in to manage campaigns, clients, and leads.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
