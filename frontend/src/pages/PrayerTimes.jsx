import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import MakruhAlert from '../components/MakruhAlert';
import { PRAYER_ORDER } from '../data/mockData';
import { useData } from '../context/DataContext';
import { toMins, getActivePrayer, getHijri, isMakruhNow, fmt12 } from '../utils/prayerUtils';

export default function PrayerTimes() {
  const { prayers: PRAYERS, makruh: MAKRUH, jumma: JUMMA, ramadanMode, ramadan } = useData();
  const [currentMins, setCurrentMins] = useState(() => {
    const d = new Date(); return d.getHours() * 60 + d.getMinutes();
  });
  const [active,       setActive]      = useState(() => getActivePrayer(new Date().getHours() * 60 + new Date().getMinutes()));
  const [makruhOpen,   setMakruhOpen]  = useState(false);
  const [alertData,    setAlertData]   = useState(null);

  // Auto-trigger makruh alert if currently in makruh time
  useEffect(() => {
    const check = () => {
      const m = new Date().getHours() * 60 + new Date().getMinutes();
      setCurrentMins(m);
      setActive(getActivePrayer(m, PRAYERS));
      const mk = isMakruhNow(m);
      if (mk && !alertData) setAlertData(mk);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [PRAYERS]); // re-run when prayer data updates

  const now    = new Date();
  const hijri  = getHijri();
  const isFri  = now.getDay() === 5;

  return (
    <div className="flex flex-col h-full">
      <MakruhAlert data={alertData} onDismiss={() => setAlertData(null)} />

      {/* HEADER */}
      <div className="bg-primary px-5 pt-4 pb-4 shrink-0">
        <p className="text-white font-bold text-[22px]">Prayer Times</p>
        <p className="text-white/60 text-[13px] mt-0.5">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          &nbsp;·&nbsp;
          <span className="text-accent font-semibold">{hijri.day} {hijri.month} {hijri.year}</span>
        </p>
      </div>

      <div className="page-content">
        <div className="p-4 pb-24 space-y-3">

          {/* ── MAIN PRAYER TABLE ── */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#EEEBE4] shadow-sm">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_56px_56px_60px] gap-x-1 px-4 py-2.5 bg-[#F7F5F0] border-b border-[#EEEBE4]">
              {['Prayer', 'Azan', 'Jamat', 'Qaza End'].map((h, i) => (
                <p key={i} className={`text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider ${i > 0 ? 'text-center' : ''}`}>{h}</p>
              ))}
            </div>

            {PRAYER_ORDER.map((key, idx) => {
              const p        = PRAYERS[key];
              const pMin     = toMins(p.azan);
              const isActive = active === key && key !== 'sunrise';
              const isPast   = currentMins > pMin && !isActive;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`grid grid-cols-[1fr_56px_56px_60px] gap-x-1 items-center border-b border-[#F5F3EE] last:border-0
                    ${isActive ? 'bg-primary' : ''}`}
                >
                  {/* Prayer name */}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-[20px] leading-none shrink-0">{p.icon}</span>
                    <div>
                      <p className={`font-bold text-[15px] ${isActive ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {p.name}
                        {isActive && (
                          <span className="ml-1.5 text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                            NOW
                          </span>
                        )}
                      </p>
                      <p className={`text-[12px] ${isActive ? 'text-white/55' : 'text-[#9CA3AF]'}`} style={{ fontFamily: 'Amiri, serif' }}>
                        {p.arabic}
                      </p>
                    </div>
                  </div>
                  {/* Azan */}
                  <div className="text-center py-3.5">
                    <p className={`text-[15px] font-bold digit ${isActive ? 'text-white' : isPast ? 'text-[#C0C0C0]' : 'text-[#1A1A1A]'}`}>
                      {fmt12(p.azan)}
                    </p>
                  </div>
                  {/* Jamat */}
                  <div className="text-center py-3.5">
                    {p.jamat
                      ? <p className={`text-[15px] font-bold digit ${isActive ? 'text-accent' : 'text-primary'}`}>{fmt12(p.jamat)}</p>
                      : <span className="text-[#D1D5DB]">—</span>
                    }
                  </div>
                  {/* Qaza end */}
                  <div className="text-center py-3.5 pr-2">
                    {p.qazaEnd
                      ? <p className={`text-[12px] font-semibold digit ${isActive ? 'text-white/70' : 'text-accent'}`}>{fmt12(p.qazaEnd)}</p>
                      : <span className="text-[#D1D5DB] text-sm">—</span>
                    }
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── TARAWEEH (Ramadan Mode only) ── */}
          {ramadanMode && ramadan[0] && (() => {
            const TODAY_DAY = (() => {
              const start = new Date('2025-03-02');
              const diff  = Math.floor((new Date() - start) / 86400000) + 1;
              return diff >= 1 && diff <= 30 ? diff : 1;
            })();
            const todayRow = ramadan[TODAY_DAY - 1] || ramadan[0];
            return (
              <div className="bg-amber-50 rounded-2xl border border-[#E8D5A0] px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[22px]">🌙</span>
                  <div>
                    <p className="font-bold text-[15px] text-[#1A1A1A]">Taraweeh Jamat</p>
                    <p className="text-[12px] text-[#9CA3AF]">Ramadan — congregation prayer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[20px] text-accent digit">{fmt12(todayRow.taraweeh)}</p>
                  <p className="text-[12px] text-[#9CA3AF]">after Isha</p>
                </div>
              </div>
            );
          })()}

          {/* ── TAHAJJUD ── */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[22px]">⭐</span>
              <div>
                <p className="font-bold text-[15px] text-[#1A1A1A]">Tahajjud</p>
                <p className="text-[12px] text-[#9CA3AF]">Last third of the night</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[20px] text-primary digit">{fmt12(PRAYERS.tahajjud.azan)}</p>
              <p className="text-[12px] text-[#9CA3AF]">until Fajr</p>
            </div>
          </div>

          {/* ── JUMU'AH ── */}
          <div className={`rounded-2xl overflow-hidden border ${isFri ? 'border-primary' : 'border-[#EEEBE4]'}`}>
            <div className={`flex items-center justify-between px-4 py-3 ${isFri ? 'bg-primary' : 'bg-[#F7F5F0]'}`}>
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🕌</span>
                <p className={`font-bold text-[15px] ${isFri ? 'text-white' : 'text-[#1A1A1A]'}`}>Friday Jumu'ah</p>
              </div>
              {isFri && (
                <span className="text-[11px] bg-accent text-white font-black px-2.5 py-1 rounded-full">TODAY</span>
              )}
            </div>
            <div className="bg-white px-4 divide-y divide-[#F5F3EE]">
              {[['Azan (1st)', JUMMA.azan1], ['1st Jamat', JUMMA.jamat1], ['Azan (2nd)', JUMMA.azan2], ['2nd Jamat', JUMMA.jamat2]].map(([label, t]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-[14px] text-[#6B7280]">{label}</span>
                  <span className={`font-bold text-[17px] digit ${label.includes('Jamat') ? 'text-accent' : 'text-primary'}`}>{fmt12(t)}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 px-4 py-2.5">
              <p className="text-[13px] text-[#6B7280]">{JUMMA.note}</p>
            </div>
          </div>

          {/* ── MAKRUH WAQT (collapsible) ── */}
          <div className="rounded-2xl border border-red-200 overflow-hidden">
            <button
              onClick={() => setMakruhOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-red-50"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-[#C0392B]" />
                <p className="font-bold text-[15px] text-[#C0392B]">Makruh Waqt</p>
                <span className="text-[11px] bg-[#C0392B] text-white font-bold px-2 py-0.5 rounded-full">
                  Avoid Nafl
                </span>
              </div>
              {makruhOpen
                ? <ChevronUp size={18} className="text-[#C0392B]" />
                : <ChevronDown size={18} className="text-[#C0392B]" />
              }
            </button>

            <AnimatePresence>
              {makruhOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden bg-white"
                >
                  <div className="px-4 py-3 space-y-2.5">
                    {MAKRUH.map((m, i) => {
                      const mMin = toMins(m.start), mMax = toMins(m.end);
                      const isCurrent = currentMins >= mMin && currentMins <= mMax;
                      return (
                        <button
                          key={i}
                          onClick={() => setAlertData(m)}
                          className={`w-full rounded-xl p-3.5 flex items-center justify-between text-left transition-all
                            ${isCurrent ? 'bg-[#C0392B] text-white' : 'bg-red-50 border border-red-200'}`}
                        >
                          <div>
                            <p className={`font-bold text-[14px] ${isCurrent ? 'text-white' : 'text-[#C0392B]'}`}>
                              {m.name}
                              {isCurrent && (
                                <span className="ml-2 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-black">NOW</span>
                              )}
                            </p>
                            <p className={`text-[12px] mt-0.5 ${isCurrent ? 'text-white/70' : 'text-[#9CA3AF]'}`}>{m.note}</p>
                          </div>
                          <p className={`font-bold text-[13px] digit shrink-0 ml-3 ${isCurrent ? 'text-white' : 'text-[#C0392B]'}`}>
                            {fmt12(m.start)}–{fmt12(m.end)}
                          </p>
                        </button>
                      );
                    })}
                    <p className="text-[12px] text-[#9CA3AF] text-center pt-1 pb-0.5">
                      Tap any row to see full alert
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── QAZA TIME LEGEND ── */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] p-4 flex items-start gap-3">
            <Clock size={18} className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[14px] text-[#1A1A1A]">Qaza End Time</p>
              <p className="text-[13px] text-[#6B7280] mt-0.5 leading-relaxed">
                The "Qaza End" column shows the last time you can perform that prayer as Qaza before it expires. Based on standard Hanafi calculation.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
