import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Radio } from 'lucide-react';
import MakruhAlert from '../components/MakruhAlert';
import { useApp } from '../context/AppContext';
import { PRAYER_ORDER } from '../data/mockData';
import { useData } from '../context/DataContext';
import { getNextPrayer, getActivePrayer, isMakruhNow, toMins, secsToDisplay, getHijri, fmt12 } from '../utils/prayerUtils';
import { leaveAsAudience } from '../lib/agora';

// Today's Ramadan row — calculated from current date for the demo
const TODAY_RAMADAN_DAY = (() => {
  const start = new Date('2025-03-02');
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000) + 1;
  return diff >= 1 && diff <= 30 ? diff : 16;
})();
const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ';
  if (h < 17) return 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ';
  return 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ';
})();

export default function Home() {
  const { settings, isPlaying, setIsPlaying } = useApp();
  const navigate = useNavigate();
  const { prayers: PRAYERS, announcements: ANNOUNCEMENTS, ramadan: RAMADAN, ticker: TICKER, makruh: MAKRUH, jumma: JUMMA, eid: EID, liveAzan, ramadanMode, masjid: MASJID } = useData();
  const ramadan = RAMADAN[TODAY_RAMADAN_DAY - 1] || RAMADAN[0];

  const [now, setNow] = useState(new Date());
  const [secs, setSecs] = useState(0);
  const [next, setNext] = useState(null);
  const [active, setActive] = useState('');
  const [makruh, setMakruh] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const tick = useCallback(() => {
    const d = new Date();
    setNow(d);
    const m = d.getHours() * 60 + d.getMinutes();
    const n = getNextPrayer(m, PRAYERS);
    setNext(n);
    setSecs(Math.max(0, n.minsLeft * 60 - d.getSeconds()));
    setActive(getActivePrayer(m, PRAYERS));
    if (settings.makruhAlert && !dismissed) {
      setMakruh(isMakruhNow(m) || null);
    }
  }, [settings.makruhAlert, dismissed, PRAYERS]);

  useEffect(() => { tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, [tick]);
  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 5000);
    return () => clearInterval(id);
  }, []);

  const hijri = getHijri();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const curMins = now.getHours() * 60 + now.getMinutes();
  const isFri = now.getDay() === 5;
  const activeEid = EID.fitr.isLive ? EID.fitr : EID.adha.isLive ? EID.adha : null;

  const showAzanBanner = !!liveAzan?.isLive;

  // Stream ended while user is on Home — disconnect any lingering Agora session
  useEffect(() => {
    if (!showAzanBanner && isPlaying) {
      leaveAsAudience().catch(() => {});
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAzanBanner]);

  return (
    <div className="flex flex-col h-full">
      <MakruhAlert
        data={makruh}
        onDismiss={() => { setMakruh(null); setDismissed(true); }}
      />

      {/* ── COMPACT HEADER ── */}
      <div className="bg-primary shrink-0 px-4 pt-4 pb-3">
        <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest">{GREETING}</p>
        <div className="flex items-center justify-between gap-3 mt-0.5">
          <p className="text-white font-bold text-[15px] leading-tight">{MASJID.name}</p>
          <p className="text-white font-bold text-[26px] leading-none digit shrink-0">{time}</p>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-accent text-[12px] font-medium">{hijri.day} {hijri.month} {hijri.year} AH</p>
          <p className="text-white/50 text-[12px] shrink-0">{date}</p>
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div className="bg-[#134529] shrink-0 flex items-center gap-2.5 px-3 py-1.5 overflow-hidden">
        <span className="text-accent shrink-0 text-[10px] font-black uppercase tracking-widest border border-accent/40 rounded px-1.5 py-0.5">
          News
        </span>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIdx}
              className="text-white/75 text-[12px] font-medium whitespace-nowrap"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {TICKER[tickerIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="page-content">
        <div className="px-4 pt-4 pb-24 space-y-4">

          {/* ── AZAN LIVE BANNER ── */}
          <AnimatePresence>
            {showAzanBanner && (
              <motion.button
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate('/live-azan')}
                className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg,#B52020 0%,#C0392B 60%,#962020 100%)' }}
              >
                <div className="relative px-4 py-3.5 flex items-center gap-3">
                  {/* Pulse rings */}
                  <div className="relative shrink-0">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Radio size={20} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-white pulse-red shrink-0" />
                      <span className="text-white font-black text-[11px] uppercase tracking-widest">Live Now</span>
                    </div>
                    <p className="text-white font-bold text-[17px] leading-tight">Live Azan is on</p>
                  </div>

                  {isPlaying ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        leaveAsAudience().catch(() => {});
                        setIsPlaying(false);
                      }}
                      className="shrink-0 flex items-center gap-1.5 bg-white/25 rounded-xl px-3 py-2 active:bg-white/40"
                    >
                      {/* mini waveform */}
                      <div className="flex items-end gap-0.5 h-4">
                        {[3, 5, 4, 6, 3].map((h, i) => (
                          <motion.div key={i} className="w-1 bg-white rounded-full origin-bottom"
                            style={{ height: `${h * 2.5}px` }}
                            animate={{ scaleY: [h / 6, 1, h / 6] }}
                            transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }} />
                        ))}
                      </div>
                      <span className="text-white font-bold text-[12px]">Stop</span>
                    </button>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                      <span className="text-white font-bold text-[13px]">Listen</span>
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── NEXT PRAYER HERO ── */}
          {next && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl overflow-hidden relative"
              style={{ background: 'linear-gradient(145deg,#1A5C38 0%,#236B44 55%,#1A4D30 100%)' }}
            >
              <div className="geo-bg absolute inset-0 opacity-50" />
              <div className="relative p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white/55 text-[11px] font-bold uppercase tracking-widest mb-1">Next Prayer</p>
                    <p className="text-white font-bold text-[34px] leading-none">{next.name}</p>
                    <p className="text-accent text-[22px] leading-tight font-bold mt-0.5" style={{ fontFamily: 'Amiri, serif' }}>
                      {next.arabic}
                    </p>
                  </div>
                  <div className="text-right bg-white/10 rounded-2xl px-3.5 py-3">
                    <p className="text-white/55 text-[10px] uppercase font-bold mb-0.5">Azan</p>
                    <p className="text-white font-bold text-[26px] leading-none digit">{fmt12(next.azan)}</p>
                    {next.jamat && (
                      <p className="text-accent text-[13px] font-bold mt-1">Jamat {fmt12(next.jamat)}</p>
                    )}
                  </div>
                </div>

                {/* Countdown */}
                <div className="bg-black/25 backdrop-blur-sm rounded-2xl px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white pulse-green shrink-0" />
                    <span className="text-white/65 text-[14px] font-semibold">Starts in</span>
                  </div>
                  <span className="text-white font-black text-[36px] leading-none digit tracking-tight">
                    {secsToDisplay(secs)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RAMADAN STRIP ── */}
          {ramadanMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25 }}
              className="bg-[#FDF5E0] border border-[#E8D5A0] rounded-2xl px-4 py-3.5 flex items-center gap-3"
            >
              <span className="text-[24px] shrink-0">🌙</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-accent uppercase tracking-widest mb-1">
                  Ramadan · Day {TODAY_RAMADAN_DAY}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: 'Sehri ends', val: ramadan.sehri },
                    { label: 'Iftar', val: ramadan.iftar, accent: true },
                    { label: 'Taraweeh', val: ramadan.taraweeh },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-[#E8D5A0] text-[16px] leading-none">·</span>}
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">{item.label}</p>
                        <p className={`text-[16px] font-bold digit leading-tight ${item.accent ? 'text-accent' : 'text-[#1A1A1A]'}`}>
                          {fmt12(item.val)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TODAY'S PRAYERS ── */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#EEEBE4] shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
              <p className="font-bold text-[16px] text-[#1A1A1A]">Today's Prayers</p>
              <Link to="/prayers" className="flex items-center gap-0.5 text-primary text-[13px] font-bold">
                Details <ChevronRight size={14} />
              </Link>
            </div>

            {/* Column header */}
            <div className="grid grid-cols-[1fr_52px_52px] gap-x-2 px-4 py-2 bg-[#F7F5F0]">
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Prayer</span>
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Azan</span>
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Jamat</span>
            </div>

            {PRAYER_ORDER.map((key, idx) => {

              const p = PRAYERS[key];
              const pMin = toMins(p.azan);
              const isActive = active === key && key !== 'sunrise';
              const isPast = curMins > pMin && !isActive;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`grid grid-cols-[1fr_52px_52px] gap-x-2 items-center px-4 py-2.5
                    border-b border-[#F5F3EE] last:border-0
                    ${isActive ? 'bg-primary mx-2 my-1 rounded-2xl border-0' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[19px] leading-none shrink-0">{p.icon}</span>
                    <div>
                      <p className={`font-semibold text-[15px] leading-tight ${isActive ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {p.name}
                        {isActive && (
                          <span className="ml-1.5 text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-full font-black uppercase align-middle">
                            NOW
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-[12px] leading-none mt-0.5 ${isActive ? 'text-white/55' : 'text-[#9CA3AF]'}`}
                        style={{ fontFamily: 'Amiri, serif' }}
                      >
                        {p.arabic}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-bold digit ${isActive ? 'text-white' : isPast ? 'text-[#C0C0C0]' : 'text-[#1A1A1A]'}`}>
                      {fmt12(p.azan)}
                    </p>
                  </div>
                  <div className="text-center">
                    {p.jamat
                      ? <p className={`text-[14px] font-bold digit ${isActive ? 'text-accent' : 'text-primary'}`}>{fmt12(p.jamat)}</p>
                      : <span className="text-[#D1D5DB]">—</span>
                    }
                  </div>
                </motion.div>
              );
            })}

            {/* Taraweeh row — only in Ramadan Mode */}
            {ramadanMode && (
              <div className="grid grid-cols-[1fr_52px_52px] gap-x-2 items-center px-4 py-2.5 bg-amber-50 border-t border-[#E8D5A0]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[19px] leading-none shrink-0">🌙</span>
                  <div>
                    <p className="font-semibold text-[15px] leading-tight text-[#1A1A1A]">Taraweeh</p>
                    <p className="text-[12px] text-[#9CA3AF]">Ramadan</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold digit text-[#1A1A1A]">—</p>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold digit text-accent">{fmt12(ramadan.taraweeh)}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── FRIDAY JUMU'AH CARD ── */}
          {isFri && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden border border-primary"
            >
              <div className="bg-primary flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">🕌</span>
                  <p className="font-bold text-[15px] text-white">Friday Jumu'ah</p>
                </div>
                <span className="text-[11px] bg-accent text-white font-black px-2.5 py-1 rounded-full">TODAY</span>
              </div>
              <div className="bg-white px-4 divide-y divide-[#F5F3EE]">
                {[
                  ['Azan (1st)', JUMMA.azan1],
                  ['1st Jamat', JUMMA.jamat1],
                  ['Azan (2nd)', JUMMA.azan2],
                  ['2nd Jamat', JUMMA.jamat2],
                ].map(([label, t]) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-[14px] text-[#6B7280]">{label}</span>
                    <span className={`font-bold text-[16px] digit ${label.includes('Jamat') ? 'text-accent' : 'text-primary'}`}>{fmt12(t)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 px-4 py-2">
                <p className="text-[12px] text-[#6B7280]">{JUMMA.note}</p>
              </div>
            </motion.div>
          )}

          {/* ── EID CARD (when isLive) ── */}
          {activeEid && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden border border-[#EEEBE4] shadow-sm"
            >
              <div
                className="p-4 flex items-center gap-3"
                style={{ background: activeEid.name === 'Eid-ul-Fitr' ? 'linear-gradient(135deg,#9A7B2F,#B8963A)' : 'linear-gradient(135deg,#1A5C38,#236B44)' }}
              >
                <span className="text-[30px]">{activeEid.name === 'Eid-ul-Fitr' ? '🌙' : '🐑'}</span>
                <div>
                  <p className="text-white font-bold text-[18px]">{activeEid.name}</p>
                  <p className="text-white/65 text-[14px]" style={{ fontFamily: 'Amiri, serif' }}>{activeEid.arabic}</p>
                </div>
              </div>
              <div className="bg-white px-4 py-3 space-y-2">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Jamat Times</p>
                <div className="grid grid-cols-3 gap-2">
                  {activeEid.jamats.map((t, i) => (
                    <div key={i} className={`rounded-xl p-2.5 text-center ${i === 0 ? 'bg-primary' : 'bg-[#F7F5F0]'}`}>
                      <p className={`text-[11px] font-semibold mb-0.5 ${i === 0 ? 'text-white/60' : 'text-[#9CA3AF]'}`}>
                        {['1st', '2nd', '3rd'][i]} Jamat
                      </p>
                      <p className={`font-black text-[16px] digit ${i === 0 ? 'text-accent' : 'text-primary'}`}>{fmt12(t)}</p>
                    </div>
                  ))}
                </div>
                {activeEid.venue && (
                  <div className="flex items-center gap-2 px-4 pb-1">
                    <span className="text-[14px]">📍</span>
                    <p className="text-[13px] font-semibold text-[#4A5568]">{activeEid.venue}</p>
                  </div>
                )}
                {activeEid.note && (
                  <p className="text-[12px] text-[#6B7280] bg-[#F7F5F0] rounded-xl mx-4 mb-3 px-3 py-2 leading-relaxed">
                    {activeEid.note}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── MAKRUH QUICK INFO ── */}
          {(() => {
            const mk = MAKRUH.find(m => {
              const s = toMins(m.start), e = toMins(m.end);
              return curMins >= s && curMins <= e;
            });
            return mk ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-[22px]">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-[#C0392B]">Makruh Waqt – Avoid Nafl Prayer</p>
                  <p className="text-[13px] text-[#C0392B]/70">{mk.name} · {fmt12(mk.start)} – {fmt12(mk.end)}</p>
                </div>
              </motion.div>
            ) : null;
          })()}

          {/* ── LATEST ANNOUNCEMENT ── */}
          {ANNOUNCEMENTS[0] && (
            <div className="mt-2">
              {/* Section header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">📢 Announcements</span>
                </div>
                <Link to="/announcements" className="text-[12px] font-bold text-primary flex items-center gap-0.5">
                  View all <ChevronRight size={12} />
                </Link>
              </div>

              <Link to="/announcements">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`rounded-2xl p-4 border transition-all active:scale-[0.99]
                    ${ANNOUNCEMENTS[0].urgent
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-[#EEEBE4]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ANNOUNCEMENTS[0].urgent && (
                        <span className="w-2 h-2 rounded-full bg-[#C0392B] pulse-red shrink-0" />
                      )}
                      <span className={`text-[11px] font-black uppercase tracking-widest ${ANNOUNCEMENTS[0].urgent ? 'text-[#C0392B]' : 'text-[#9CA3AF]'}`}>
                        {ANNOUNCEMENTS[0].urgent ? '🔴 Urgent' : ANNOUNCEMENTS[0].tag}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#9CA3AF]">{ANNOUNCEMENTS[0].date}</span>
                  </div>
                  <p className={`font-bold text-[15px] leading-snug ${ANNOUNCEMENTS[0].urgent ? 'text-[#C0392B]' : 'text-[#1A1A1A]'}`}>
                    {ANNOUNCEMENTS[0].title}
                  </p>
                  <p className="text-[13px] text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
                    {ANNOUNCEMENTS[0].body}
                  </p>
                </motion.div>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
