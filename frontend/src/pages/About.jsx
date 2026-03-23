import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Mail, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

const SERVICES = [
  { icon: '🕌', title: 'Daily Salah', sub: '5 prayers with Jamat' },
  { icon: '📖', title: 'Islamic School', sub: 'Mon–Fri, ages 5–16' },
  { icon: '💒', title: 'Nikah Services', sub: 'Marriage registration' },
  { icon: '🤲', title: 'Funeral Services', sub: 'Janazah & Ghusl' },
  { icon: '📚', title: "Qur'an Classes", sub: 'Adults & children' },
  { icon: '🌙', title: 'Ramadan Programs', sub: "Taraweeh & I'tikaf" },
];

const HOURS = [
  { day: 'Mon – Thu', time: '05:00 – 22:30' },
  { day: 'Friday', time: '05:00 – 23:00' },
  { day: 'Saturday', time: '05:00 – 22:00' },
  { day: 'Sunday', time: '06:00 – 21:30' },
];

export default function About() {
  const { masjid: MASJID } = useData();
  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-primary px-5 pt-4 pb-6 shrink-0 text-center relative overflow-hidden">
        <div className="geo-bg absolute inset-0 opacity-40" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-accent flex items-center justify-center mx-auto mb-3">
            <span className="text-[38px]">🕌</span>
          </div>
          <p className="text-white font-bold text-[22px] leading-tight">{MASJID.name}</p>
          <p className="text-accent text-[20px] font-bold mt-0.5" style={{ fontFamily: 'Amiri, serif' }}>{MASJID.arabic}</p>
          <p className="text-white/50 text-[12px] mt-1">Est. 1985 · Mumbai, India</p>
        </div>
      </div>

      <div className="page-content">
        <div className="p-4 space-y-3 pb-24">

          {/* ABOUT */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#EEEBE4] p-4">
            <p className="text-[15px] text-[#4A5568] leading-relaxed">{MASJID.about}</p>
          </motion.div>

          {/* ADDRESS */}
          <div className="bg-white rounded-2xl border border-[#EEEBE4] p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-[14px] text-[#9CA3AF] mb-0.5">Address</p>
              <p className="font-medium text-[15px] text-[#1A1A1A] leading-snug">{MASJID.address}</p>
            </div>
          </div>

          {/* CONTACT BUTTONS */}
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => window.open(`tel:+91${MASJID.phone}`, '_system')}
              className="flex items-center justify-center gap-2 bg-primary text-white font-bold text-[15px] py-4 rounded-2xl">
              <Phone size={18} /> Call
            </button>
            <button onClick={() => window.open(`https://wa.me/91${MASJID.whatsapp}`, '_system')}
              className="flex items-center justify-center gap-2 text-white font-bold text-[15px] py-4 rounded-2xl"
              style={{ backgroundColor: '#25D366' }}>
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button onClick={() => {
                if (MASJID.mapsUrl) window.open(MASJID.mapsUrl, '_system');
              }}
              className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold text-[15px] py-4 rounded-2xl col-span-2">
              <MapPin size={18} /> Open in Google Maps
            </button>
            <button onClick={() => window.open(`mailto:${MASJID.email}`)}
              className="flex items-center justify-center gap-2 bg-[#F5F3EE] text-[#4A5568] font-medium text-[14px] py-3.5 rounded-2xl col-span-2">
              <Mail size={16} /> {MASJID.email}
            </button>
          </div>

          {/* OPENING HOURS */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#EEEBE4] overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#F5F3EE]">
              <Clock size={16} className="text-primary" />
              <p className="font-bold text-[15px] text-[#1A1A1A]">Opening Hours</p>
            </div>
            {HOURS.map((h, i) => {
              const today = new Date().getDay();
              const isTodayRow = (i === 0 && today >= 1 && today <= 4) || (i === 1 && today === 5) || (i === 2 && today === 6) || (i === 3 && today === 0);
              return (
                <div key={i} className={`flex items-center justify-between px-4 py-3 border-b border-[#F5F3EE] last:border-0 ${isTodayRow ? 'bg-primary/5' : ''}`}>
                  <span className={`text-[14px] font-medium ${isTodayRow ? 'text-primary font-bold' : 'text-[#4A5568]'}`}>
                    {h.day} {isTodayRow && <span className="text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 font-black ml-1">Today</span>}
                  </span>
                  <span className={`font-bold text-[14px] digit ${isTodayRow ? 'text-primary' : 'text-[#1A1A1A]'}`}>{h.time}</span>
                </div>
              );
            })}
          </motion.div>

          {/* SERVICES */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#EEEBE4] p-4">
            <p className="font-bold text-[16px] text-[#1A1A1A] mb-3">Our Services</p>
            <div className="grid grid-cols-2 gap-2.5">
              {SERVICES.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }} className="bg-[#F7F5F0] rounded-xl p-3">
                  <span className="text-[22px] block mb-1">{s.icon}</span>
                  <p className="font-bold text-[14px] text-[#1A1A1A]">{s.title}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{s.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
