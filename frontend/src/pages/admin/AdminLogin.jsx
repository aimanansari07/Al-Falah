import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, AlertCircle, User, Timer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [pw,       setPw]       = useState('');
  const [show,     setShow]     = useState(false);
  const [error,    setError]    = useState('');
  const [locked,   setLocked]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login } = useApp();
  const navigate  = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLocked(false); setLoading(true);
    const result = await login(username, pw);
    if (result.ok) {
      if (!result.isSetupComplete) {
        navigate('/admin/setup');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
      setLocked(!!result.locked);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D6D0C4] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl p-6">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-[72px] h-[72px] rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-[34px]">🕌</span>
          </div>
          <p className="font-bold text-[22px] text-primary">Jama Masjid Ahle Hadith</p>
          <p className="text-accent text-[18px] font-bold" style={{ fontFamily: 'Amiri, serif' }}>جامع مسجد اہل حدیث</p>
          <p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest mt-1">Admin Panel</p>
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mt-4" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="admin" autoComplete="username"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                placeholder="Enter password" autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 border ${
                locked
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
              }`}>
              {locked
                ? <Timer size={15} className="text-amber-600 shrink-0 mt-0.5" />
                : <AlertCircle size={15} className="text-[#C0392B] shrink-0 mt-0.5" />
              }
              <p className={`text-[13px] ${locked ? 'text-amber-700' : 'text-[#C0392B]'}`}>{error}</p>
            </motion.div>
          )}

          <button type="submit" disabled={loading || !username || !pw || locked}
            className="w-full bg-primary text-white font-bold text-[16px] py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><LogIn size={18} /> Login</>
            }
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-4 text-center">
          <Link to="/admin/forgot-password"
            className="text-[13px] text-primary font-semibold hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-3 text-center">
          <a href="/" className="text-[13px] text-[#9CA3AF] hover:text-primary underline">← Back to App</a>
        </div>
      </motion.div>
    </div>
  );
}
