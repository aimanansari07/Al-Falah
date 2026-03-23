import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { fmt12 } from '../utils/prayerUtils';

const ALL_TABS = [
  { id: 'jumma',     emoji: '🕌', label: "Jumu'ah"  },
  { id: 'tahajjud',  emoji: '⭐', label: 'Tahajjud' },
  { id: 'ramadan',   emoji: '🌙', label: 'Ramadan'  },
  { id: 'eid',       emoji: '🎉', label: 'Eid'      },
];

const TODAY_DAY = (() => {
  const start = new Date('2025-03-02');
  const diff  = Math.floor((new Date() - start) / 86400000) + 1;
  return diff >= 1 && diff <= 30 ? diff : 16;
})();

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F5F3EE] last:border-0">
      <span className="text-[14px] text-[#6B7280]">{label}</span>
      <span className={`font-bold text-[17px] digit ${accent ? 'text-accent' : 'text-primary'}`}>{value}</span>
    </div>
  );
}

export default function SpecialPrayers() {
  const { jumma: JUMMA, ramadan: RAMADAN, eid: EID, ramadanMode } = useData();
  const TABS = ALL_TABS.filter(t => t.id !== 'ramadan' || ramadanMode);
  const [tab, setTab] = useState('jumma');

  return (
    <div className="flex flex-col h-full">

      {/* HEADER + TABS */}
      <div className="bg-primary shrink-0">
        <div className="px-5 pt-4 pb-3">
          <p className="text-white font-bold text-[22px]">Special Prayers</p>
          <p className="text-white/60 text-[13px] mt-0.5">Jumu'ah · Tahajjud · Ramadan · Eid</p>
        </div>
        <div className="flex no-scrollbar overflow-x-auto px-4 gap-1 pb-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-t-2xl text-[14px] font-bold whitespace-nowrap transition-all
                ${tab === t.id ? 'bg-[#FAFAF8] text-primary' : 'text-white/60 hover:text-white/90'}`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        <div className="p-4 pb-24 space-y-3">
          <AnimatePresence mode="wait">

            {/* ── JUMU'AH ── */}
            {tab === 'jumma' && (
              <motion.div key="jumma"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="bg-white rounded-3xl border border-[#EEEBE4] overflow-hidden shadow-sm">
                  <div className="bg-primary px-5 py-4">
                    <p className="text-white font-bold text-[20px]">Friday Jumu'ah</p>
                    <p className="text-white/60 text-[14px]" style={{ fontFamily: 'Amiri, serif' }}>صلاة الجمعة</p>
                  </div>
                  <div className="px-5 divide-y divide-[#F5F3EE]">
                    <InfoRow label="Gates Open"   value={fmt12('12:00')}          />
                    <InfoRow label="Azan (1st)"   value={fmt12(JUMMA.azan1)}   />
                    <InfoRow label="1st Jamat"    value={fmt12(JUMMA.jamat1)}  accent />
                    <InfoRow label="Azan (2nd)"   value={fmt12(JUMMA.azan2)}   />
                    <InfoRow label="2nd Jamat"    value={fmt12(JUMMA.jamat2)}  accent />
                  </div>
                  <div className="mx-4 mb-4 mt-3 bg-primary/5 rounded-xl p-3 flex gap-2">
                    <Info size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">{JUMMA.note}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EEEBE4] p-5">
                  <p className="font-bold text-[15px] text-accent mb-3">Sunnah of Jumu'ah</p>
                  {[
                    'Perform Ghusl (bath) before Jumu\'ah',
                    'Wear clean clothes — white is preferred',
                    'Apply attar (natural perfume)',
                    'Read Surah Al-Kahf',
                    'Send abundant Durood on the Prophet ﷺ',
                    'Arrive early and walk calmly to the Masjid',
                    'Make Du\'a between the two Khutbas',
                  ].map((s, i) => (
                    <div key={i} className="flex gap-2.5 py-2 border-b border-[#F5F3EE] last:border-0 items-start">
                      <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[14px] text-[#4A5568] leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── TAHAJJUD ── */}
            {tab === 'tahajjud' && (
              <motion.div key="tahajjud"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="rounded-3xl overflow-hidden"
                  style={{ background: 'linear-gradient(150deg,#1A5C38 0%,#0F3D26 100%)' }}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[38px]">⭐</span>
                      <div>
                        <p className="text-white font-bold text-[24px]">Tahajjud</p>
                        <p className="text-white/55 text-[15px]" style={{ fontFamily: 'Amiri, serif' }}>صلاة التهجد</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Best start',  val: '03:30', sub: 'Last third of night' },
                        { label: 'Ends before', val: '05:18', sub: 'Fajr Azan'           },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/10 rounded-2xl p-3.5 text-center">
                          <p className="text-white/55 text-[12px] font-semibold">{item.label}</p>
                          <p className="text-white font-black text-[26px] digit leading-tight mt-0.5">{fmt12(item.val)}</p>
                          <p className="text-white/40 text-[11px] mt-0.5">{item.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EEEBE4] p-4">
                  <div className="bg-primary/5 rounded-xl p-4 mb-4 text-center">
                    <p className="text-primary font-bold text-[19px] leading-relaxed"
                      style={{ fontFamily: 'Amiri, serif' }}>
                      وَمِنَ ٱلَّيۡلِ فَتَهَجَّدۡ بِهِۦ نَافِلَةٗ لَّكَ
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-2 italic">
                      "And from part of the night, pray Tahajjud as additional worship." — Al-Isra' 17:79
                    </p>
                  </div>
                  <p className="font-bold text-[15px] text-[#1A1A1A] mb-2.5">How to perform Tahajjud</p>
                  {[
                    'Pray minimum 2 rakaats (recommended: 8 rakaats + Witr)',
                    'Begin after waking from sleep — at least after midnight',
                    'Make each rakaat long with extended recitation',
                    'End with 3 (or 1) rakaat Witr before Fajr',
                    'Pour your heart out in Du\'a — this is the best time for it',
                  ].map((s, i) => (
                    <div key={i} className="flex gap-2.5 py-2 border-b border-[#F5F3EE] last:border-0 items-start">
                      <ChevronRight size={14} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-[14px] text-[#4A5568] leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── RAMADAN ── */}
            {tab === 'ramadan' && (
              <motion.div key="ramadan"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                {/* Summary header */}
                <div className="rounded-2xl overflow-hidden mb-3"
                  style={{ background: 'linear-gradient(135deg,#9A7B2F,#B8963A)' }}>
                  <div className="p-4">
                    <p className="text-white font-bold text-[18px]">Ramadan 1446 Timetable</p>
                    <p className="text-white/70 text-[13px]">Full 30-day Sehri & Iftar schedule</p>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { l: 'Today', v: `Day ${TODAY_DAY}` },
                        { l: 'Sehri', v: fmt12(RAMADAN[TODAY_DAY - 1].sehri) },
                        { l: 'Iftar',  v: fmt12(RAMADAN[TODAY_DAY - 1].iftar) },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/20 rounded-xl p-2 text-center">
                          <p className="text-white/60 text-[11px] font-semibold">{item.l}</p>
                          <p className="text-white font-black text-[15px] digit">{item.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-[#EEEBE4] overflow-hidden">
                  {/* Header */}
                  <div className="grid bg-[#F7F5F0] border-b border-[#EEEBE4]"
                    style={{ gridTemplateColumns: '32px 1fr 60px 60px 56px' }}>
                    {['#','Date','Sehri','Iftar','Tarw.'].map((h, i) => (
                      <p key={i} className="text-[11px] font-bold text-[#9CA3AF] uppercase text-center p-2">{h}</p>
                    ))}
                  </div>
                  {RAMADAN.map((r, i) => {
                    const isToday = r.day === TODAY_DAY;
                    return (
                      <div
                        key={i}
                        className={`grid items-center border-b border-[#F5F3EE] last:border-0
                          ${isToday ? 'bg-primary' : i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}
                        style={{ gridTemplateColumns: '32px 1fr 60px 60px 56px' }}
                      >
                        <p className={`text-center font-black text-[12px] digit p-2 ${isToday ? 'text-accent' : 'text-[#9CA3AF]'}`}>
                          {r.day}
                        </p>
                        <p className={`text-[13px] font-semibold p-2 ${isToday ? 'text-white' : 'text-[#4A5568]'}`}>
                          {r.date}
                          {isToday && <span className="ml-1.5 text-[10px] bg-accent text-white rounded-full px-1.5 py-0.5 font-black">Today</span>}
                        </p>
                        <p className={`text-center text-[13px] font-bold digit p-2 ${isToday ? 'text-white' : 'text-[#1A1A1A]'}`}>{fmt12(r.sehri)}</p>
                        <p className={`text-center text-[13px] font-bold digit p-2 ${isToday ? 'text-accent' : 'text-accent'}`}>{fmt12(r.iftar)}</p>
                        <p className={`text-center text-[12px] font-semibold digit p-2 ${isToday ? 'text-white/65' : 'text-[#9CA3AF]'}`}>{fmt12(r.taraweeh)}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── EID ── */}
            {tab === 'eid' && (
              <motion.div key="eid"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[
                  { data: EID.fitr, grad: 'from-[#9A7B2F] to-[#B8963A]', emoji: '🌙', textCls: 'text-amber-900' },
                  { data: EID.adha, grad: 'from-[#1A5C38] to-[#236B44]', emoji: '🐑', textCls: 'text-green-900'  },
                ].map(({ data, grad, emoji }) => (
                  <div key={data.name} className="bg-white rounded-3xl border border-[#EEEBE4] overflow-hidden shadow-sm">
                    <div className={`bg-gradient-to-r ${grad} p-5 flex items-center gap-3`}>
                      <span className="text-[36px]">{emoji}</span>
                      <div>
                        <p className="text-white font-bold text-[20px]">{data.name}</p>
                        <p className="text-white/65 text-[16px]" style={{ fontFamily: 'Amiri, serif' }}>{data.arabic}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <p className="text-[12px] text-[#9CA3AF] font-semibold">Expected Date</p>
                        <p className="font-bold text-[16px] text-[#1A1A1A] mt-0.5">{data.date}</p>
                      </div>

                      <p className="font-bold text-[14px] text-[#6B7280] uppercase tracking-wider">Jamat Times</p>
                      <div className="space-y-2">
                        {data.jamats.map((t, i) => (
                          <div key={i} className={`flex justify-between items-center p-3.5 rounded-xl ${i === 0 ? 'bg-primary' : 'bg-[#F7F5F0]'}`}>
                            <span className={`text-[15px] font-semibold ${i === 0 ? 'text-white' : 'text-[#4A5568]'}`}>
                              {['First','Second','Third'][i]} Jamat
                            </span>
                            <span className={`font-black text-[20px] digit ${i === 0 ? 'text-accent' : 'text-primary'}`}>{fmt12(t)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 items-start">
                        <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-[13px] text-[#6B7280]">{data.venue}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info size={14} className="text-accent shrink-0 mt-0.5" />
                        <p className="text-[13px] text-[#6B7280] leading-relaxed">{data.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
