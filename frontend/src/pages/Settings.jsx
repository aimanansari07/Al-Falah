import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Type, Info, Share2, MessageSquare, RotateCcw, AlertTriangle } from 'lucide-react';
import { Share } from '@capacitor/share';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${on ? 'bg-primary' : 'bg-[#D1D5DB]'}`}>
      <motion.span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
        animate={{ left: on ? '26px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    </button>
  );
}

function Section({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-1 px-1">
      <Icon size={15} className="text-accent" />
      <span className="text-[12px] font-bold text-accent uppercase tracking-widest">{title}</span>
    </div>
  );
}

function Row({ label, desc, right }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b border-[#F5F3EE] last:border-0">
      <div className="flex-1 pr-3 min-w-0">
        <p className="font-semibold text-[15px] text-[#1A1A1A]">{label}</p>
        {desc && <p className="text-[13px] text-[#9CA3AF] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function Settings() {
  const { settings, set, reset } = useApp();
  const { masjid } = useData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!feedback.trim()) return;
    const num = (masjid?.whatsapp || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Feedback for Jama Masjid App:\n\n${feedback}`);
    window.open(`https://wa.me/91${num}?text=${msg}`, '_system');
    setSent(true); setFeedback('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Confirm Reset modal */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div className="absolute inset-0 z-50 flex items-end p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmReset(false)} />
            <motion.div className="relative bg-white rounded-3xl p-5 w-full shadow-2xl"
              initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
              <div className="flex items-center gap-2.5 mb-3">
                <AlertTriangle size={22} className="text-[#C0392B]" />
                <p className="font-bold text-[18px] text-[#C0392B]">Reset All Settings?</p>
              </div>
              <p className="text-[15px] text-[#6B7280] mb-5">This will restore all settings to their defaults. This cannot be undone.</p>
              <div className="flex gap-2.5">
                <button onClick={() => setConfirmReset(false)} className="flex-1 py-3.5 rounded-2xl border-2 border-[#EEEBE4] font-bold text-[15px] text-[#4A5568]">Cancel</button>
                <button onClick={() => { reset(); setConfirmReset(false); }} className="flex-1 py-3.5 rounded-2xl bg-[#C0392B] text-white font-bold text-[15px]">Reset</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-primary px-5 pt-4 pb-4 shrink-0">
        <p className="text-white font-bold text-[20px]">Settings</p>
        <p className="text-white/60 text-[13px] mt-0.5">Personalise your experience</p>
      </div>

      <div className="page-content">
        <div className="px-4 pb-24">

          <Section icon={Bell} title="Audio & Notifications" />
          <div className="bg-white rounded-2xl border border-[#EEEBE4]">
            <Row label="Azan Auto-Play" desc="Internet required" right={<Toggle on={settings.azanAutoPlay} onToggle={() => set('azanAutoPlay', !settings.azanAutoPlay)} />} />
            <Row label="Live Azan Notification" right={<Toggle on={settings.liveAzanNotif} onToggle={() => set('liveAzanNotif', !settings.liveAzanNotif)} />} />
            <Row label="Announcement Alerts" right={<Toggle on={settings.announcementNotif} onToggle={() => set('announcementNotif', !settings.announcementNotif)} />} />
            <Row label="Prayer Reminder" right={<Toggle on={settings.prayerReminder} onToggle={() => set('prayerReminder', !settings.prayerReminder)} />} />
            {settings.prayerReminder && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3 bg-primary/5">
                <p className="text-[13px] text-[#6B7280] mb-2 pt-1">Remind me before:</p>
                <div className="flex gap-2">
                  {['5','10','15','30'].map(m => (
                    <button key={m} onClick={() => set('reminderMins', m)}
                      className={`flex-1 py-2 rounded-xl font-bold text-[14px] ${settings.reminderMins === m ? 'bg-primary text-white' : 'bg-white border border-[#EEEBE4] text-[#6B7280]'}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            <Row label="Makruh Waqt Alert" desc="Popup during forbidden prayer times" right={<Toggle on={settings.makruhAlert} onToggle={() => set('makruhAlert', !settings.makruhAlert)} />} />
          </div>

          <Section icon={Type} title="Display" />
          <div className="bg-white rounded-2xl border border-[#EEEBE4]">
            <Row label="Text Size" right={
              <div className="flex gap-1.5">
                {[{v:'sm',l:'A',cls:'text-[12px]'},{v:'md',l:'A',cls:'text-[16px]'},{v:'lg',l:'A',cls:'text-[20px]'}].map(({v,l,cls}) => (
                  <button key={v} onClick={() => set('textSize', v)}
                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center ${cls} ${settings.textSize === v ? 'bg-primary text-white' : 'bg-[#F5F3EE] text-[#6B7280]'}`}>
                    {l}
                  </button>
                ))}
              </div>
            } />
          </div>

          <Section icon={Info} title="Support" />
          <div className="bg-white rounded-2xl border border-[#EEEBE4]">
            <Row label="App Version" right={<span className="text-[13px] font-bold bg-[#F5F3EE] text-[#6B7280] px-3 py-1 rounded-full">v1.0.0</span>} />
            <button
              onClick={async () => {
                try {
                  await Share.share({
                    title: 'Jama Masjid Ahle Hadith App',
                    text: 'Prayer times & Live Azan for Jama Masjid Ahle Hadith',
                    url: 'https://jama-masjid.vercel.app',
                    dialogTitle: 'Share Jama Masjid App',
                  });
                } catch {
                  // Fallback for browsers that don't support Share API
                  navigator.share?.({ title: 'Jama Masjid Ahle Hadith App', url: window.location.origin });
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F3EE]">
              <Share2 size={16} className="text-primary" />
              <span className="font-semibold text-[15px] text-[#1A1A1A]">Share App</span>
            </button>
            <button onClick={() => window.open(`tel:+91${(masjid?.phone || '').replace(/\D/g, '')}`, '_system')}
              className="w-full flex items-center gap-3 px-4 py-3.5">
              <MessageSquare size={16} className="text-primary" />
              <span className="font-semibold text-[15px] text-[#1A1A1A]">Contact Masjid</span>
            </button>
          </div>

          {/* Feedback */}
          <Section icon={MessageSquare} title="Feedback" />
          <div className="bg-white rounded-2xl border border-[#EEEBE4] p-4">
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Share a suggestion or report an issue..."
              className="w-full h-20 resize-none border-2 border-[#EEEBE4] rounded-xl px-3.5 py-2.5 text-[14px] font-medium focus:outline-none focus:border-primary mb-3" />
            {sent && <p className="text-primary text-[13px] font-semibold mb-2">✅ Thank you for your feedback!</p>}
            <button onClick={send} className="w-full bg-primary text-white font-bold text-[15px] py-3.5 rounded-2xl">Send Feedback</button>
          </div>

          {/* Reset */}
          <div className="pt-4">
            <button onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-[#C0392B] font-bold text-[15px] py-4 rounded-2xl bg-red-50">
              <RotateCcw size={17} /> Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
