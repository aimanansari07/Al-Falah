import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { fmt12 } from '../utils/prayerUtils';

const COLS   = ['fajr','dhuhr','asr','maghrib','isha'];
const LABELS = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];

// Dynamic today detection
const todayShort = new Date().toLocaleDateString('en-GB', { weekday: 'short' }).slice(0,3);

export default function WeeklySchedule() {
  const { weekly: WEEKLY } = useData();
  const [selected, setSelected] = useState(0);

  // Sync selected to today whenever weekly data loads/changes
  useEffect(() => {
    const idx = WEEKLY.findIndex(r => r.day === todayShort);
    setSelected(idx >= 0 ? idx : 0);
  }, [WEEKLY]);

  const row = WEEKLY[selected];

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-primary px-5 pt-4 pb-4 shrink-0">
        <p className="text-white font-bold text-[22px]">Weekly Schedule</p>
        <p className="text-white/60 text-[13px] mt-0.5">Tap a day to view prayer times</p>
      </div>

      <div className="page-content">
        <div className="px-4 pt-4 pb-24 space-y-4">

          {/* ── DAY SELECTOR ── */}
          <div className="flex gap-2 no-scrollbar overflow-x-auto pb-1">
            {WEEKLY.map((r, i) => {
              const isToday = r.day === todayShort;
              const isSel   = i === selected;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(i)}
                  className={`shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl min-w-[56px] transition-all
                    ${isSel
                      ? 'bg-primary text-white shadow-md'
                      : isToday
                        ? 'bg-primary/10 text-primary border-2 border-primary/30'
                        : 'bg-white border border-[#EEEBE4] text-[#1A1A1A]'
                    }`}
                >
                  <span className={`text-[11px] font-bold uppercase ${isSel ? 'text-white/60' : isToday ? 'text-primary/70' : 'text-[#9CA3AF]'}`}>
                    {r.day}
                  </span>
                  <span className={`text-[20px] font-black leading-tight mt-0.5 ${isSel ? 'text-white' : isToday ? 'text-primary' : 'text-[#1A1A1A]'}`}>
                    {r.date}
                  </span>
                  <span className={`text-[10px] font-semibold ${isSel ? 'text-accent' : isToday ? 'text-primary/60' : 'text-[#9CA3AF]'}`}>
                    {r.month}
                  </span>
                  {isToday && !isSel && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* ── SELECTED DAY DETAIL CARD ── */}
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-[#EEEBE4] overflow-hidden shadow-sm"
          >
            {/* Card header */}
            <div className={`flex items-center justify-between px-5 py-4 ${row.day === todayShort ? 'bg-primary' : 'bg-[#F7F5F0]'}`}>
              <div>
                <p className={`font-black text-[22px] ${row.day === todayShort ? 'text-white' : 'text-[#1A1A1A]'}`}>
                  {row.day}
                </p>
                <p className={`text-[14px] font-medium ${row.day === todayShort ? 'text-white/60' : 'text-[#6B7280]'}`}>
                  {row.date} {row.month}
                </p>
              </div>
              {row.day === todayShort && (
                <span className="text-[12px] bg-accent text-white font-black px-3 py-1.5 rounded-full">Today</span>
              )}
              {/* Prev / Next nav */}
              <div className="flex gap-1.5 ml-auto">
                <button
                  onClick={() => setSelected(s => Math.max(0, s - 1))}
                  disabled={selected === 0}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                    ${row.day === todayShort ? 'bg-white/20 text-white disabled:opacity-30' : 'bg-white border border-[#EEEBE4] text-[#6B7280] disabled:opacity-30'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelected(s => Math.min(WEEKLY.length - 1, s + 1))}
                  disabled={selected === WEEKLY.length - 1}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                    ${row.day === todayShort ? 'bg-white/20 text-white disabled:opacity-30' : 'bg-white border border-[#EEEBE4] text-[#6B7280] disabled:opacity-30'}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Prayer rows */}
            <div className="divide-y divide-[#F5F3EE]">
              {COLS.map((col, ci) => {
                const [azan, jamat] = row[col];
                return (
                  <motion.div
                    key={col}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ci * 0.05 }}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <p className="font-semibold text-[16px] text-[#1A1A1A]">{LABELS[ci]}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[11px] text-[#9CA3AF] font-semibold mb-0.5">Azan</p>
                        <p className="font-bold text-[17px] digit text-[#1A1A1A]">{fmt12(azan)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-[#9CA3AF] font-semibold mb-0.5">Jamat</p>
                        <p className="font-bold text-[17px] digit text-primary">{fmt12(jamat)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── FULL WEEK COMPACT TABLE ── */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] overflow-hidden">
            <p className="px-4 py-3 font-bold text-[14px] text-[#1A1A1A] border-b border-[#F5F3EE]">Full Week Overview</p>
            {/* Header row */}
            <div className="grid bg-[#F7F5F0]"
              style={{ gridTemplateColumns: '44px repeat(5,1fr)' }}>
              <div className="p-2" />
              {LABELS.map(l => (
                <div key={l} className="p-2 text-center border-l border-[#EEEBE4]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{l.slice(0,3)}</p>
                </div>
              ))}
            </div>
            {WEEKLY.map((r, i) => {
              const isTd = r.day === todayShort;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full grid border-b border-[#F5F3EE] last:border-0 transition-colors
                    ${isTd ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                  style={{ gridTemplateColumns: '44px repeat(5,1fr)' }}
                >
                  <div className={`flex flex-col items-center justify-center p-2 ${isTd ? 'bg-primary' : ''}`}>
                    <span className={`text-[10px] font-bold ${isTd ? 'text-white/60' : 'text-[#9CA3AF]'}`}>{r.day}</span>
                    <span className={`text-[14px] font-black ${isTd ? 'text-white' : 'text-[#4A5568]'}`}>{r.date}</span>
                  </div>
                  {COLS.map((col, ci) => {
                    const [az, jm] = r[col];
                    return (
                      <div key={ci} className="text-center p-2 border-l border-[#F5F3EE]">
                        <p className={`text-[12px] font-bold digit ${isTd ? 'text-[#1A1A1A]' : 'text-[#4A5568]'}`}>{fmt12(az)}</p>
                        <p className={`text-[11px] font-semibold digit mt-0.5 ${isTd ? 'text-primary' : 'text-[#9CA3AF]'}`}>{fmt12(jm)}</p>
                      </div>
                    );
                  })}
                </button>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] p-3.5 flex items-center gap-5 flex-wrap">
            {[
              { color: 'bg-[#1A1A1A]', text: 'Azan (top)' },
              { color: 'bg-primary',    text: 'Jamat (bottom)' },
              { color: 'bg-primary/20 border border-primary', text: 'Today' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[12px] text-[#9CA3AF]">{item.text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
