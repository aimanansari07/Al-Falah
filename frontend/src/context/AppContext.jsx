import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { DEFAULT_SETTINGS } from '../data/mockData';

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('af_settings') || '{}') }; }
    catch { return DEFAULT_SETTINGS; }
  });
  const [token,          setToken]          = useState(() => localStorage.getItem('af_token') || '');
  const [isAdmin,        setIsAdmin]        = useState(() => !!localStorage.getItem('af_token'));
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [showMenuSheet,  setShowMenuSheet]  = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('af_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply text-size scale to root CSS variable
  useEffect(() => {
    const scales = { sm: '0.9', md: '1', lg: '1.12' };
    document.documentElement.style.setProperty(
      '--font-scale', scales[settings.textSize] || '1'
    );
  }, [settings.textSize]);

  const set   = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const reset = () => { setSettings(DEFAULT_SETTINGS); localStorage.removeItem('af_settings'); };

  const _saveSession = (token) => {
    setToken(token);
    setIsAdmin(true);
    localStorage.setItem('af_token', token);
  };

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res.token) {
        _saveSession(res.token);
        return { ok: true, isSetupComplete: !!res.isSetupComplete };
      }
      return { ok: false, error: res.error || 'Login failed' };
    } catch (err) {
      return { ok: false, error: err.message || 'Cannot connect to server' };
    }
  };

  const setup = async (email, newPassword) => {
    try {
      const res = await api.setup(email, newPassword);
      if (res.token) {
        _saveSession(res.token);
        return { ok: true };
      }
      return { ok: false, error: res.error || 'Setup failed' };
    } catch (err) {
      return { ok: false, error: err.message || 'Cannot connect to server' };
    }
  };

  const logout = () => {
    setToken('');
    setIsAdmin(false);
    localStorage.removeItem('af_token');
  };

  return (
    <Ctx.Provider value={{
      settings, set, reset,
      token, isAdmin, login, logout, setup,
      isPlaying, setIsPlaying,
      showMenuSheet, setShowMenuSheet,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
