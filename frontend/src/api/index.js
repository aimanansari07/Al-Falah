const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function req(path, options = {}) {
  const res  = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get = (path)              => req(path);
const put = (path, body, token) => req(path, { method: 'PUT',    headers: jsonHeaders(token), body: JSON.stringify(body) });
const post= (path, body, token) => req(path, { method: 'POST',   headers: jsonHeaders(token), body: JSON.stringify(body) });
const del = (path, token)       => req(path, { method: 'DELETE', headers: authHeaders(token) });

function jsonHeaders(token) {
  return { 'Content-Type': 'application/json', ...authHeaders(token) };
}
function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ── Public reads ──
  getPrayers:       () => get('/api/prayers'),
  getJumma:         () => get('/api/prayers/jumma'),
  getMakruh:        () => get('/api/makruh'),
  getWeekly:        () => get('/api/weekly'),
  getRamadan:       () => get('/api/ramadan'),
  getEid:           () => get('/api/eid'),
  getAnnouncements: () => get('/api/announcements'),
  getMasjid:        () => get('/api/masjid'),
  getTicker:        () => get('/api/ticker'),
  getLiveAzan:      () => get('/api/live-azan'),

  // ── Auth ──
  login:           (username, password)         => post('/api/auth/login', { username, password }),
  setup:           (email, newPassword)         => post('/api/auth/setup', { email, newPassword }),
  changePassword:  (currentPassword, newPassword, token) => req('/api/auth/change-password', { method: 'PUT', headers: jsonHeaders(token), body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword:  (email)                      => post('/api/auth/forgot-password', { email }),
  verifyOtp:       (email, otp)                 => post('/api/auth/verify-otp', { email, otp }),
  resetPassword:   (resetToken, newPassword)    => post('/api/auth/reset-password', { resetToken, newPassword }),

  // ── Admin mutations ──
  updatePrayers:      (data, token)       => put('/api/prayers', data, token),
  updateJumma:        (data, token)       => put('/api/prayers/jumma', data, token),
  updateMakruh:       (data, token)       => put('/api/makruh', data, token),
  updateWeekly:       (data, token)       => put('/api/weekly', data, token),
  updateRamadan:      (data, token)       => put('/api/ramadan', data, token),
  updateEid:          (type, data, token) => put(`/api/eid/${type}`, data, token),
  createAnnouncement: (data, token)       => post('/api/announcements', data, token),
  deleteAnnouncement: (id,   token)       => del(`/api/announcements/${id}`, token),
  updateMasjid:       (data, token)       => put('/api/masjid', data, token),
  updateTicker:       (data, token)       => put('/api/ticker', data, token),
  updateLiveAzan:        (data, token)  => put('/api/live-azan', data, token),
  getMuazzinToken:       (token)        => req('/api/live-azan/muazzin-token', { headers: authHeaders(token) }),
  generateMuazzinToken:  (token)        => post('/api/live-azan/muazzin-token', {}, token),
  verifyMuazzinToken:    (muazzinToken) => get(`/api/live-azan/muazzin/${muazzinToken}/verify`),
  muazzinToggleLive:     (muazzinToken, isLive) => put(`/api/live-azan/muazzin/${muazzinToken}`, { isLive }),
  saveFcmToken:          (token)        => post('/api/fcm/token', { token }),
};
