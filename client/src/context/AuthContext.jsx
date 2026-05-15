import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api/binusgo.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.me();
        setUser(user);
      } catch { /* not logged in */ }
      finally { setLoading(false); }
    })();
  }, []);

  async function login(email, password) {
    const r = await api.login({ email, password });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }

  async function register(payload) {
    const r = await api.register(payload);
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }

  async function logout() {
    try { await api.logout(); } catch {}
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
