// ═══════════════════════════════════════════════
// SCENE INSECT
// A tiny bug that wanders the room. The Bison
// notices it and follows it during FOLLOW_INSECT.
// Pure ambience — nothing should ever be frozen.
// ═══════════════════════════════════════════════

import { motion } from 'framer-motion';

export default function SceneInsect({ active = false, isNight = false }) {
  return (
    <motion.div
      className="absolute text-[11px] select-none pointer-events-none"
      style={{ bottom: 96, left: '38%', opacity: isNight ? 0.9 : 0.6 }}
      animate={{
        x: active ? [0, 60, -30, 45, 0] : [0, 40, -20, 30, 0],
        y: active ? [0, -22, -8, -26, 0] : [0, -14, -4, -18, 0],
        rotate: [0, 12, -10, 8, 0],
      }}
      transition={{ duration: active ? 9 : 16, repeat: Infinity, ease: 'easeInOut' }}
    >
      {isNight ? '✨' : '🦋'}
    </motion.div>
  );
}