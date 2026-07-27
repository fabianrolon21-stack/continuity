import { motion, AnimatePresence } from 'framer-motion';

// Anime-style emote sticker that pops above the Bison.
export default function EmoteSticker({ emote }) {
  return (
    <AnimatePresence>
      {emote && (
        <motion.div
          key={emote + Math.random()}
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 select-none pointer-events-none"
          initial={{ scale: 0, y: 10, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -12, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
        >
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-xl shadow-lg border border-white/10">
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {emote}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}