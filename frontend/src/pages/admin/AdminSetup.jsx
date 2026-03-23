import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Rule({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-[12px] ${met ? 'text-primary' : 'text-[#9CA3AF]'}`}>
      <CheckCircle2 size={12} className={met ? 'text-primary' : 'text-[#D1D5DB]'} />
      {text}
    </div>
  );
}

export default function AdminSetup() {
  const [email,     setEmail]     = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const { setup } = useApp();
  const navigate  = useNavigate();

  const pwRules = {
    length:  newPw.length >= 8,
    match:   newPw.length > 0 && newPw === confirmPw,
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pwRules.length) { setError('Password must be at least 8 characters'); return; }
    if (!pwRules.match)  { setError('Passwords do not match'); return; }

    setLoading(true);
    const result = await setup(email, newPw);
    if (result.ok) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Setup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D6D0C4] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl p-6">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-[64px] h-[64px] rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-3">
            <span className="text-[28px]">⚠️</span>
          </div>
          <p className="font-bold text-[20px] text-[#1A1A1A]">Setup Required</p>
          <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
            Please set your admin details before continuing. This email will be used for password recovery.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-5">
          <p className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">First Time Login</p>
          <p className="text-[13px] text-amber-600">You are using default credentials. Set a secure password to continue.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">Admin Email (for recovery)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@alfalah.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showPw ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters"
                className="w-full pl-10 pr-11 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showPw ? 'text' : 'password'} value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
              />
            </div>
          </div>

          {/* Password rules */}
          {newPw && (
            <div className="space-y-1 px-1">
              <Rule met={pwRules.length} text="At least 8 characters" />
              <Rule met={pwRules.match}  text="Passwords match" />
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={15} className="text-[#C0392B] shrink-0" />
              <p className="text-[13px] text-[#C0392B]">{error}</p>
            </motion.div>
          )}

          <button type="submit" disabled={loading || !email || !newPw || !confirmPw}
            className="w-full bg-primary text-white font-bold text-[16px] py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : '✅ Complete Setup'
            }
          </button>
        </form>
      </motion.div>
    </div>
  );
}
