import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function MakruhAlert({ data, onDismiss }) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/35" onClick={onDismiss} />
          <motion.div
            className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="bg-[#C0392B] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={20} className="text-white" />
                <span className="text-white font-bold text-[16px]">Makruh Waqt</span>
              </div>
              <button onClick={onDismiss} className="text-white/70">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="font-bold text-[20px] text-[#C0392B]">{data.name}</p>
              <p className="font-arabic text-[18px] text-[#C0392B]/70 mt-0.5" style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                {data.arabic}
              </p>
              <p className="text-[15px] text-[#6B7280] mt-3 leading-relaxed">{data.note}</p>
              <div className="mt-4 bg-red-50 rounded-2xl p-3.5 flex justify-between items-center">
                <span className="text-[14px] font-semibold text-[#C0392B]">Period</span>
                <span className="text-[18px] font-bold text-[#C0392B] digit">{data.start} – {data.end}</span>
              </div>
              <button onClick={onDismiss} className="mt-4 w-full bg-[#C0392B] text-white font-bold text-[16px] py-3.5 rounded-2xl">
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
