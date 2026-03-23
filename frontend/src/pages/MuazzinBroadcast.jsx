import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, WifiOff } from 'lucide-react';
import { api } from '../api';
import { startBroadcast, stopBroadcast, isBroadcasting } from '../lib/agora';

export default function MuazzinBroadcast() {
  const { token } = useParams();
  const [status,       setStatus]       = useState('loading'); // loading | valid | invalid
  const [channelName,  setChannelName]  = useState('');
  const [isLive,       setIsLive]       = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [error,        setError]        = useState('');
  const pollRef = useRef(null);

  // Verify token on mount — if DB says live but we're not broadcasting, auto-reset
  useEffect(() => {
    api.verifyMuazzinToken(token)
      .then(async data => {
        setChannelName(data.channelName);
        if (data.isLive && !isBroadcasting()) {
          // Stale live state — reset it
          await api.muazzinToggleLive(token, false).catch(() => {});
          setIsLive(false);
        } else {
          setIsLive(data.isLive);
        }
        setStatus('valid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  // Poll DB every 5s to stay in sync
  useEffect(() => {
    if (status !== 'valid') return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.verifyMuazzinToken(token);
        setIsLive(data.isLive);
        setChannelName(data.channelName);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [status, token]);

  // Clean up Agora on unmount
  useEffect(() => {
    return () => { if (isBroadcasting()) stopBroadcast(); };
  }, []);

  const toggle = async () => {
    setError('');
    setToggling(true);
    try {
      if (isLive) {
        await stopBroadcast();
        setBroadcasting(false);
        await api.muazzinToggleLive(token, false);
        setIsLive(false);
      } else {
        await startBroadcast(channelName);
        setBroadcasting(true);
        await api.muazzinToggleLive(token, true);
        setIsLive(true);
      }
    } catch (e) {
      setError(e.message || 'Failed. Check mic permission and try again.');
      if (!isLive && isBroadcasting()) { await stopBroadcast(); setBroadcasting(false); }
    } finally {
      setToggling(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
        <WifiOff size={48} className="text-red-400 mb-4" />
        <p className="font-bold text-[20px] text-[#1A1A1A] mb-2">Link Expired</p>
        <p className="text-[14px] text-[#9CA3AF]">This muazzin link is no longer valid.<br />Ask the admin to generate a new one.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
          <span className="text-[30px]">🕌</span>
        </div>
        <p className="font-bold text-[20px] text-primary">Jama Masjid Ahle Hadith</p>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5 font-bold uppercase tracking-widest">Muazzin Panel</p>
      </div>

      {/* Status badge */}
      <div className={`px-4 py-1.5 rounded-full mb-8 font-bold text-[13px] ${isLive ? 'bg-red-100 text-[#C0392B]' : 'bg-[#F0FDF4] text-[#1A5C38]'}`}>
        {isLive ? '🔴 LIVE — Azan is broadcasting' : '⚫ Offline — tap to go live'}
      </div>

      {/* Mic waveform when live */}
      {isLive && broadcasting && (
        <div className="flex items-end gap-1 h-10 mb-8">
          {[4,7,5,9,4,7,5].map((h, i) => (
            <motion.div key={i} className="w-1.5 bg-[#C0392B] rounded-full origin-bottom"
              style={{ height: h * 3 }}
              animate={{ scaleY: [h / 9, 1, h / 9] }}
              transition={{ duration: 0.4 + i * 0.08, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-[#C0392B] text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Main button */}
      <button onClick={toggle} disabled={toggling}
        className={`w-40 h-40 rounded-full font-bold text-white text-[16px] flex flex-col items-center justify-center gap-2 shadow-2xl disabled:opacity-60 transition-colors
          ${isLive ? 'bg-[#4A5568]' : 'bg-[#C0392B]'}`}>
        {toggling
          ? <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          : isLive
            ? <><MicOff size={36} /><span>Stop Azan</span></>
            : <><Mic size={36} /><span>Start Azan</span></>
        }
      </button>

      <p className="mt-8 text-[12px] text-[#9CA3AF] text-center max-w-xs">
        Tap the button to start or stop the live Azan broadcast.<br />
        All app users will hear you live.
      </p>
    </div>
  );
}
