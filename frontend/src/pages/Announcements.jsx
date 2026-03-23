import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { useData } from '../context/DataContext';

const TAGS = ['All', 'Ramadan', "Jumu'ah", 'Education', 'Notice', 'Zakat', 'Facilities'];

const TAG_STYLES = {
  "Jumu'ah":   'bg-primary/10 text-primary',
  Ramadan:     'bg-amber-100 text-amber-700',
  Education:   'bg-blue-100 text-blue-700',
  Notice:      'bg-red-100 text-[#C0392B]',
  Zakat:       'bg-purple-100 text-purple-700',
  Facilities:  'bg-green-100 text-primary',
};

export default function Announcements() {
  const { announcements: ANNOUNCEMENTS } = useData();
  const [filter, setFilter] = useState('All');
  const [open,   setOpen]   = useState(null);

  const items = filter === 'All' ? ANNOUNCEMENTS : ANNOUNCEMENTS.filter(a => a.tag === filter);
  const urgentCount = ANNOUNCEMENTS.filter(a => a.urgent).length;

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="bg-primary px-5 pt-4 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <p className="text-white font-bold text-[22px]">Announcements</p>
          {urgentCount > 0 && (
            <span className="bg-[#C0392B] text-white text-[11px] font-black px-2 py-0.5 rounded-full">
              {urgentCount} urgent
            </span>
          )}
        </div>
        <p className="text-white/60 text-[13px] mt-0.5">{ANNOUNCEMENTS.length} total announcements</p>
      </div>

      {/* FILTER CHIPS */}
      <div className="bg-white border-b border-[#EEEBE4] shrink-0 shadow-sm">
        <div className="flex gap-2 no-scrollbar overflow-x-auto px-4 py-2.5">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-bold text-[13px] whitespace-nowrap transition-all
                ${filter === t ? 'bg-primary text-white' : 'bg-[#F5F3EE] text-[#6B7280] active:bg-gray-200'}`}
            >
              {t}
              {t !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({ANNOUNCEMENTS.filter(a => a.tag === t).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        <div className="p-4 pb-24 space-y-2.5">

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-[52px] mb-3">📭</span>
              <p className="font-bold text-[17px] text-[#4A5568]">No announcements here</p>
              <p className="text-[14px] text-[#9CA3AF] mt-1">Try a different category</p>
            </div>
          )}

          {items.map((ann, i) => {
            const isOpen = open === ann.id;
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm
                  ${ann.urgent ? 'border-red-200' : 'border-[#EEEBE4]'}`}
              >
                {/* Urgent banner */}
                {ann.urgent && (
                  <div className="bg-[#C0392B] px-4 py-1.5 flex items-center gap-2">
                    <Bell size={12} className="text-white" />
                    <span className="text-white text-[11px] font-black uppercase tracking-wider">Urgent Announcement</span>
                  </div>
                )}

                {/* Card body */}
                <button
                  onClick={() => setOpen(isOpen ? null : ann.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${TAG_STYLES[ann.tag] || 'bg-gray-100 text-[#6B7280]'}`}>
                          {ann.tag}
                        </span>
                        <span className="text-[12px] text-[#9CA3AF]">{ann.date}</span>
                      </div>
                      {/* Title */}
                      <p className={`font-bold text-[16px] leading-snug ${ann.urgent ? 'text-[#C0392B]' : 'text-[#1A1A1A]'}`}>
                        {ann.title}
                      </p>
                      {/* Body — preview or full */}
                      <p className={`text-[14px] text-[#6B7280] mt-1.5 leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                        {ann.body}
                      </p>
                      {!isOpen && (
                        <p className="text-primary text-[13px] font-semibold mt-2">Read more</p>
                      )}
                    </div>
                    <div className="shrink-0 mt-1 text-[#9CA3AF]">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}

          {items.length > 0 && (
            <p className="text-center text-[13px] text-[#C0C0C0] pt-2">
              {items.length} announcement{items.length !== 1 ? 's' : ''} shown
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
