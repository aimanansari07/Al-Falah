import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Radio, Info, Settings, ShieldCheck, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';

const ITEMS = [
  { icon: Calendar,    label: 'Weekly Schedule',   sub: 'Prayer times for the week',        to: '/weekly'      },
  { icon: Radio,       label: 'Live Azan',          sub: 'Listen to live congregation',       to: '/live-azan'   },
  { icon: Info,        label: 'About Masjid',       sub: 'Contact & location info',           to: '/about'       },
  { icon: Settings,    label: 'Settings',           sub: 'Notifications, display & more',     to: '/settings'    },
  { icon: ShieldCheck, label: 'Admin Panel',        sub: 'Manage prayer times & content',     to: '/admin/login' },
];

export default function MenuSheet() {
  const { showMenuSheet, setShowMenuSheet } = useApp();
  const { masjid } = useData();
  const navigate = useNavigate();

  const go = (to) => { setShowMenuSheet(false); navigate(to); };

  return (
    <AnimatePresence>
      {showMenuSheet && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenuSheet(false)}
          />
          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl z-50 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div>
                <p className="text-[18px] font-bold text-[#1A1A1A]">More</p>
                <p className="text-[13px] text-[#6B7280]">{masjid.name}</p>
              </div>
              <button onClick={() => setShowMenuSheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-[#6B7280]" />
              </button>
            </div>
            {/* Divider */}
            <div className="h-px bg-[#EEEBE4] mx-5 mb-2" />
            {/* Items */}
            <div className="px-4 space-y-1">
              {ITEMS.map(({ icon: Icon, label, sub, to }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl hover:bg-[#F5F3EE] active:bg-[#F0EDE6] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-[#1A1A1A]">{label}</p>
                    <p className="text-[13px] text-[#6B7280] truncate">{sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-[#9CA3AF] shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
