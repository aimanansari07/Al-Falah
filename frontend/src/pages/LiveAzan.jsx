import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radio, Play, Square, Volume2, VolumeX, Users, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { toMins, fmt12 } from '../utils/prayerUtils';
import { joinAsAudience, leaveAsAudience, setAudienceMuted } from '../lib/agora';

export default function LiveAzan() {
  const { isPlaying, setIsPlaying, settings } = useApp();
  const { liveAzan, prayers } = useData();
  const liveAzanOn = liveAzan?.isLive;
  const channelName = liveAzan?.channelName || 'azan-live';

  const [muted,       setMuted]       = useState(false);
  const [listeners,   setListeners]   = useState(0);
  const [error,       setError]       = useState('');
  const [joining,     setJoining]     = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [curMins,     setCurMins]     = useState(() => new Date().getHours() * 60 + new Date().getMinutes());

  // Tracks whether we've already initiated an auto-join for the current live session
  const autoJoinDoneRef = useRef(false);

  // Build schedule from live prayers data
  const SCHEDULE = prayers ? [
    { label: 'Fajr Azan',    time: prayers.fajr?.azan },
    { label: 'Fajr Jamat',   time: prayers.fajr?.jamat },
    { label: 'Dhuhr Jamat',  time: prayers.dhuhr?.jamat },
    { label: 'Asr Jamat',    time: prayers.asr?.jamat },
    { label: 'Maghrib Azan', time: prayers.maghrib?.azan },
    { label: 'Isha Jamat',   time: prayers.isha?.jamat },
  ].filter(s => s.time).map(s => ({ ...s, done: toMins(s.time) < curMins })) : [];

  // Next expected broadcast: first upcoming jamat/azan not yet done
  const nextExpected = SCHEDULE.find(s => !s.done) || SCHEDULE[0];

  useEffect(() => {
    const id = setInterval(() => setCurMins(new Date().getHours() * 60 + new Date().getMinutes()), 60000);
    return () => clearInterval(id);
  }, []);


  // Auto-leave when stream goes offline; reset auto-join flag for next session
  useEffect(() => {
    if (!liveAzanOn) {
      autoJoinDoneRef.current = false;
      if (isPlaying) {
        leaveAsAudience().catch(() => {});
        setIsPlaying(false);
        setNeedsUnmute(false);
      }
    }
  }, [liveAzanOn]); // eslint-disable-line

  // Auto-join when: (a) page mounts while already live, (b) stream goes live while on page
  useEffect(() => {
    if (!liveAzanOn || isPlaying || autoJoinDoneRef.current) return;
    const shouldAutoPlay = settings.azanAutoPlay || window.__azanAutoplayIntent;
    if (!shouldAutoPlay) return;

    autoJoinDoneRef.current = true;
    window.__azanAutoplayIntent = null;
    setJoining(true);
    setNeedsUnmute(false);
    window.__agoraAutoplayFailed = () => setNeedsUnmute(true);
    joinAsAudience(channelName, handleUserCount)
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.error('Agora auto-join failed:', e);
        setError('Could not auto-connect. Tap "Tap to Listen" to retry.');
        window.__agoraAutoplayFailed = null;
        autoJoinDoneRef.current = false; // allow manual retry
      })
      .finally(() => setJoining(false));
  }, [liveAzanOn, settings.azanAutoPlay]); // eslint-disable-line

  // Cleanup on unmount — disconnect Agora and reset global play state
  useEffect(() => {
    return () => {
      leaveAsAudience().catch(() => {});
      window.__agoraAutoplayFailed = null;
      setIsPlaying(false);
    };
  }, []); // eslint-disable-line

  const handleUserCount = (count) => setListeners(count);

  const togglePlay = async () => {
    if (!liveAzanOn) return;
    setError('');

    if (isPlaying) {
      // Stop listening
      await leaveAsAudience();
      setIsPlaying(false);
      setListeners(0);
      setNeedsUnmute(false);
      window.__agoraAutoplayFailed = null;
    } else {
      // Start listening
      setJoining(true);
      setNeedsUnmute(false);
      // Register Agora's autoplay-failed callback BEFORE joining.
      // If the browser blocks autoplay, this fires and we show an unmute button.
      window.__agoraAutoplayFailed = () => setNeedsUnmute(true);
      try {
        await joinAsAudience(channelName, handleUserCount);
        setIsPlaying(true);
      } catch (e) {
        console.error('Agora join failed:', e);
        setError('Could not connect to live stream. Please try again.');
        window.__agoraAutoplayFailed = null;
      } finally {
        setJoining(false);
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setAudienceMuted(newMuted);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary px-5 pt-4 pb-4 shrink-0">
        <p className="text-white font-bold text-[20px]">Live Azan</p>
        <p className="text-white/60 text-[13px] mt-0.5">Listen to live congregation</p>
      </div>

      <div className="page-content">
        <div className="p-4 space-y-3 pb-24">

          {/* STATUS CARD */}
          <div className={`rounded-3xl overflow-hidden border-2 ${liveAzanOn ? 'border-[#C0392B]' : 'border-[#EEEBE4]'}`}>
            <div className={`px-4 py-3 flex items-center justify-between ${liveAzanOn ? 'bg-[#C0392B]' : 'bg-[#F5F3EE]'}`}>
              <div className="flex items-center gap-2">
                {liveAzanOn && <span className="w-2 h-2 rounded-full bg-white pulse-red" />}
                <span className={`font-bold text-[14px] uppercase tracking-widest ${liveAzanOn ? 'text-white' : 'text-[#9CA3AF]'}`}>
                  {liveAzanOn ? 'Live' : 'Offline'}
                </span>
              </div>
              {liveAzanOn && isPlaying && (
                <div className="flex items-center gap-1.5 text-white/80">
                  <Users size={14} />
                  <span className="text-[13px] font-semibold">{listeners} listening</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 flex flex-col items-center">
              {!liveAzanOn ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-[#F5F3EE] flex items-center justify-center mb-4">
                    <Radio size={36} className="text-[#D1D5DB]" />
                  </div>
                  <p className="font-bold text-[19px] text-[#1A1A1A] mb-1">No Live Stream</p>
                  <p className="text-[14px] text-[#6B7280] text-center leading-relaxed">
                    Live Azan will appear here when the Masjid is broadcasting. You'll receive a notification when it starts.
                  </p>
                  {nextExpected && (
                    <div className="mt-4 bg-[#F7F5F0] rounded-xl px-4 py-2.5 w-full text-center">
                      <p className="text-[13px] text-[#6B7280]">Next expected: <span className="text-primary font-bold">{nextExpected.label} {fmt12(nextExpected.time)}</span></p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full border-2 border-[#C0392B] flex items-center justify-center mb-4 relative">
                    <motion.div className="absolute inset-0 rounded-full border border-[#C0392B]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                    <Radio size={32} className="text-[#C0392B]" />
                  </div>
                  <p className="font-bold text-[22px] text-[#C0392B] mb-1">Azan is Live!</p>
                  <p className="text-[22px] text-primary font-bold mb-3" style={{ fontFamily: 'Amiri, serif' }}>اللهُ أَكْبَرُ</p>
                  {isPlaying && (
                    <div className="flex items-end gap-1 h-8 mb-4">
                      {[4,7,5,9,6,8,4,7,5,6].map((h, i) => (
                        <motion.div key={i} className="w-1.5 bg-[#C0392B] rounded-full origin-bottom"
                          animate={{ scaleY: [h/9, 1, h/9] }}
                          transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, ease: 'easeInOut' }} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="w-full mb-3 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2 text-[13px] text-[#C0392B] text-center">
                  {error}
                </div>
              )}

              {/* Shown when browser blocks autoplay — direct click calls play() */}
              {needsUnmute && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { window.__agoraPlayAll?.(); setNeedsUnmute(false); }}
                  className="w-full py-3.5 rounded-2xl font-bold text-[16px] bg-[#C0392B] text-white flex items-center justify-center gap-2 mb-2 mt-3"
                >
                  <Volume2 size={20} /> Tap to Hear Audio
                </motion.button>
              )}

              <motion.button
                onClick={togglePlay}
                whileTap={{ scale: 0.96 }}
                disabled={!liveAzanOn || joining}
                className={`w-full py-4 rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2.5 mt-3 transition-colors
                  ${isPlaying ? 'bg-[#C0392B] text-white' : liveAzanOn ? 'bg-primary text-white' : 'bg-[#F5F3EE] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                {joining
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : isPlaying
                    ? <><Square size={20} fill="white" /> Stop</>
                    : <><Play size={20} fill={liveAzanOn ? 'white' : '#9CA3AF'} /> {liveAzanOn ? 'Tap to Listen' : 'Unavailable'}</>
                }
              </motion.button>

              {isPlaying && (
                <button onClick={toggleMute} className="mt-3 flex items-center gap-1.5 text-[14px] text-[#6B7280]">
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />} {muted ? 'Unmute' : 'Mute'}
                </button>
              )}
            </div>
          </div>

          {/* TODAY'S SCHEDULE */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="font-bold text-[15px] text-[#1A1A1A]">Today's Azan Schedule</p>
              <span className="text-[11px] text-[#9CA3AF] font-semibold">{SCHEDULE.filter(s => s.done).length}/{SCHEDULE.length} done</span>
            </div>

            {SCHEDULE.map((s, i) => {
              const isNext = !s.done && SCHEDULE.slice(0, i).every(x => x.done);
              return (
                <div key={i} className={`flex items-center justify-between px-4 py-3 border-b border-[#F5F3EE] last:border-0
                  ${isNext ? 'bg-primary/5' : s.done ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    {s.done
                      ? <CheckCircle2 size={16} className="text-primary shrink-0" />
                      : <Circle size={16} className={`shrink-0 ${isNext ? 'text-primary' : 'text-[#D1D5DB]'}`} />
                    }
                    <span className={`text-[14px] font-medium ${isNext ? 'text-primary font-bold' : 'text-[#1A1A1A]'}`}>{s.label}</span>
                    {isNext && <span className="text-[10px] bg-primary text-white font-black px-1.5 py-0.5 rounded-full">NEXT</span>}
                  </div>
                  <span className={`font-bold text-[15px] digit ${s.done ? 'text-[#9CA3AF]' : isNext ? 'text-primary' : 'text-[#4A5568]'}`}>{fmt12(s.time)}</span>
                </div>
              );
            })}
          </div>

          {/* INFO BANNER */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex gap-3">
            <Radio size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[14px] text-primary">About Live Azan</p>
              <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
                Ahlehadeesmominpura broadcasts live Azan and Jamat via this stream. Enable notifications to be alerted when we go live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
