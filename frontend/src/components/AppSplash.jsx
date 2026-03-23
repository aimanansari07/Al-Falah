import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppSplash({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    const t = setTimeout(() => setPhase('out'), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {phase === 'in' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0F3D22 0%, #1A5C38 45%, #134A2C 100%)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* ── Geometric background pattern ── */}
          <motion.div
            className="absolute inset-0 geo-bg opacity-0"
            animate={{ opacity: 0.12 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />

          {/* ── Subtle glow behind logo ── */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 340, height: 200, background: 'radial-gradient(ellipse, rgba(154,123,47,0.18) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />

          {/* ── Gold top/bottom accent lines ── */}
          <motion.div
            className="absolute"
            style={{ width: 300, height: 1, background: 'linear-gradient(90deg,transparent,#9A7B2F,transparent)', top: '28%' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* ── Full logo — no crop ── */}
          <motion.div
            className="relative z-10"
            style={{ width: 300 }}
            initial={{ scale: 0.55, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img
              src="/masjid-logo.png"
              alt="Masjid Logo"
              className="w-full h-auto"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
            />
          </motion.div>

          {/* ── Text content below logo ── */}
          <div className="relative z-10 mt-7 flex flex-col items-center px-6">

            {/* Bismillah */}
            <motion.p
              className="text-[#D4AF5A] text-[20px] mb-3"
              style={{ fontFamily: 'Amiri, serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>

            {/* Gold divider */}
            <motion.div
              className="gold-rule w-48 mb-3"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            />

            {/* App name */}
            <motion.p
              className="text-white font-black text-[22px] text-center leading-tight tracking-wide"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              Jama Masjid Ahle Hadees
            </motion.p>

            {/* Location */}
            <motion.p
              className="text-[#D4AF5A] font-bold text-[15px] mt-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
            >
              Mominpura, Mumbai
            </motion.p>

            {/* Tagline */}
            <motion.p
              className="text-white/50 text-[12px] mt-3 text-center tracking-widest uppercase font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.35 }}
            >
              Prayer Times · Live Azan · Announcements
            </motion.p>
          </div>

          {/* ── Bottom pulse dot ── */}
          <motion.div
            className="absolute bottom-16 flex gap-1.5 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            {[0, 0.15, 0.3].map((d, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#9A7B2F]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: d, repeat: Infinity }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
