import { createContext, useContext, useMemo, useState } from 'react';
import usePersistedState from '../hooks/usePersistedState';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = usePersistedState('auth_token', '');
  const [user, setUser] = usePersistedState('auth_user', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    // If already authenticated as this user, keep existing token unless explicitly logging out first
    if (token && user?.email === email) {
      return true;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      setUser({ role: data.role, client_id: data.client_id, email });
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      setToken('');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      loading,
      error,
    }),
    [token, user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
