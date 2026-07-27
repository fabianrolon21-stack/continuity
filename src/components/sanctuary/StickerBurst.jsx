import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BURST_EMOJIS } from '@/lib/sanctuary/careScenes';

// Full-screen satisfying sticker burst after a quick action.
export default function StickerBurst({ action, onDone }) {
  useEffect(() => {
    if (!action) return;
    const t = setTimeout(() => onDone?.(), 1400);
    return () => clearTimeout(t);
  }, [action, onDone]);

  if (!action) return null;
  const emojis = BURST_EMOJIS[action] || BURST_EMOJIS.play;

  return (
    <AnimatePresence>
      <motion.div
        key={action}
        className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(16)].map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const dist = 140 + (i % 4) * 60;
          return (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 60,
                scale: [0, 1.4, 1, 0.6],
                opacity: [1, 1, 0.8, 0],
                rotate: (i % 2 ? 1 : -1) * 180,
              }}
              transition={{ duration: 1.3, ease: 'easeOut', delay: (i % 4) * 0.05 }}
            >
              {emojis[i % emojis.length]}
            </motion.span>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}