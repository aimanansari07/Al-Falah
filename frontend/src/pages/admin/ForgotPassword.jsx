import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Hash, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Timer } from 'lucide-react';
import { api } from '../../api';

// ── Step indicators ──
function Steps({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] transition-all ${
            step > n  ? 'bg-primary text-white' :
            step === n ? 'bg-primary text-white ring-4 ring-primary/20' :
                         'bg-[#EEEBE4] text-[#9CA3AF]'
          }`}>
            {step > n ? <CheckCircle2 size={16} /> : n}
          </div>
          {n < 3 && <div className={`w-8 h-0.5 rounded ${step > n ? 'bg-primary' : 'bg-[#EEEBE4]'}`} />}
        </div>
      ))}
    </div>
  );
}

// ── OTP digit inputs ──
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    const next = arr.join('');
    onChange(next.padEnd(6, ''));
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text.padEnd(6, ''));
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-13 text-center text-[22px] font-bold border-2 rounded-xl focus:outline-none focus:border-primary bg-[#FAFAF8] transition-colors"
          style={{ height: 52, borderColor: value[i] ? '#1A5C38' : '#EEEBE4' }}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const [step,       setStep]       = useState(1); // 1=email 2=otp 3=newpass
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [locked,     setLocked]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [devOtp,     setDevOtp]     = useState(''); // dev mode only
  const navigate = useNavigate();

  // Auto-fill OTP in dev mode
  useEffect(() => {
    if (devOtp) setOtp(devOtp);
  }, [devOtp]);

  const go = async (e) => {
    e.preventDefault();
    setError(''); setLocked(false); setLoading(true);

    try {
      if (step === 1) {
        const res = await api.forgotPassword(email);
        if (res.devOtp) setDevOtp(res.devOtp); // dev only
        setStep(2);
      } else if (step === 2) {
        const res = await api.verifyOtp(email, otp);
        setResetToken(res.resetToken);
        setStep(3);
      } else {
        if (newPw !== confirmPw) { setError('Passwords do not match'); setLoading(false); return; }
        if (newPw.length < 8)   { setError('Password must be at least 8 characters'); setLoading(false); return; }
        await api.resetPassword(resetToken, newPw);
        navigate('/admin/login', { state: { message: 'Password reset successfully. Please log in.' } });
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('locked') || err.message.includes('Locked') || err.message.includes('Too many')) {
        setLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Enter Email', 'Enter OTP', 'New Password'];

  return (
    <div className="min-h-screen bg-[#D6D0C4] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl p-6">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="w-[60px] h-[60px] rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-[28px]">🔐</span>
          </div>
          <p className="font-bold text-[20px] text-primary">Reset Password</p>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">{stepLabels[step - 1]}</p>
        </div>

        <Steps step={step} />

        <AnimatePresence mode="wait">
          <motion.form key={step} onSubmit={go}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4">

            {/* Step 1: Email */}
            {step === 1 && (
              <div>
                <label className="block text-[14px] font-semibold text-[#4A5568] mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@alfalah.com" autoFocus
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-[#EEEBE4] text-[15px] font-medium focus:outline-none focus:border-primary bg-[#FAFAF8]"
                  />
                </div>
                <p className="text-[12px] text-[#9CA3AF] mt-2">
                  Enter the email registered during setup. You'll receive a 6-digit OTP.
                </p>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <div>
                <p className="text-[14px] text-[#4A5568] text-center mb-4">
                  OTP sent to <span className="font-bold text-primary">{email}</span>
                </p>
                <OtpInput value={otp} onChange={setOtp} />
                <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
                  Valid for 10 minutes · 3 attempts max
                </p>
                {devOtp && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Dev Mode — Email not configured</p>
                    <p className="text-[18px] font-black text-amber-700 tracking-[6px] mt-0.5">{devOtp}</p>
                  </div>
                )}
                <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="w-full text-center text-[13px] text-primary font-semibold mt-3">
                  Resend OTP
                </button>
              </div>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <>
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
              </>
            )}

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 border ${
                  locked ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                }`}>
                {locked
                  ? <Timer size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="text-[#C0392B] shrink-0 mt-0.5" />
                }
                <p className={`text-[13px] ${locked ? 'text-amber-700' : 'text-[#C0392B]'}`}>{error}</p>
              </motion.div>
            )}

            <button type="submit"
              disabled={loading || locked ||
                (step === 1 && !email) ||
                (step === 2 && otp.replace(/\D/g,'').length < 6) ||
                (step === 3 && (!newPw || !confirmPw))
              }
              className="w-full bg-primary text-white font-bold text-[16px] py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : step === 3 ? 'Reset Password' : 'Continue →'
              }
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-4 text-center">
          <Link to="/admin/login" className="flex items-center justify-center gap-1 text-[13px] text-[#9CA3AF] hover:text-primary">
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
