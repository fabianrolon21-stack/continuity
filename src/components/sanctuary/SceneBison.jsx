import { motion } from 'framer-motion';
import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';

// The Bison — always the visual center of the Sanctuary.
// Stylized SVG with breathing, plus per-behavior motion.

const BEHAVIOR_MOTION = {
  [BEHAVIORS.IDLE]: { x: 0, y: 0, rotate: 0 },
  [BEHAVIORS.LOOK_AROUND]: { x: 0, rotate: [0, -3, 3, -2, 0], transition: { duration: 6, repeat: Infinity } },
  [BEHAVIORS.STRETCH]: { scaleX: [1, 1.08, 1], scaleY: [1, 0.94, 1], transition: { duration: 3, repeat: Infinity, repeatDelay: 2 } },
  [BEHAVIORS.WALK]: { x: [-40, 40, -40], transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.PLAY]: { x: [0, 60, 55, 60, 0], y: [0, 0, -10, 0, 0], transition: { duration: 5, repeat: Infinity } },
  [BEHAVIORS.WATCH_WINDOW]: { y: -6, rotate: -2 },
  [BEHAVIORS.EAT]: { rotate: [0, 8, 8, 0], transition: { duration: 4, repeat: Infinity } },
  [BEHAVIORS.DRINK]: { rotate: [0, 10, 10, 0], transition: { duration: 5, repeat: Infinity } },
  [BEHAVIORS.SLEEP]: { rotate: 0, y: 14 },
  [BEHAVIORS.SIT]: { y: 8 },
  [BEHAVIORS.LOOK_AT_USER]: { rotate: 0, scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity } },
};

export default function SceneBison({ behavior = BEHAVIORS.IDLE, accent = 'hsl(42 63% 55%)' }) {
  const isAsleep = behavior === BEHAVIORS.SLEEP;
  const motionProps = BEHAVIOR_MOTION[behavior] || BEHAVIOR_MOTION[BEHAVIORS.IDLE];

  return (
    <motion.div className="relative flex flex-col items-center" animate={motionProps}>
      {isAsleep && (
        <motion.div
          className="absolute -top-8 right-0 text-lg font-heading select-none"
          style={{ color: accent }}
          animate={{ opacity: [0, 1, 0], y: [0, -14], x: [0, 8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          z z
        </motion.div>
      )}

      {/* Breathing wrapper */}
      <motion.svg
        width="150" height="110" viewBox="0 0 150 110"
        animate={{ scale: isAsleep ? [1, 1.015, 1] : [1, 1.03, 1] }}
        transition={{ duration: isAsleep ? 5 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center bottom', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))' }}
      >
        {/* Body */}
        <ellipse cx="80" cy={isAsleep ? 78 : 68} rx="48" ry={isAsleep ? 26 : 34} fill="hsl(25 30% 26%)" />
        {/* Hump */}
        <ellipse cx="62" cy={isAsleep ? 62 : 46} rx="30" ry={isAsleep ? 18 : 24} fill="hsl(25 32% 30%)" />
        {/* Head */}
        <ellipse cx="34" cy={isAsleep ? 78 : 66} rx="20" ry="18" fill="hsl(25 28% 22%)" />
        {/* Wool cap */}
        <ellipse cx="34" cy={isAsleep ? 68 : 56} rx="17" ry="10" fill="hsl(25 34% 32%)" />
        {/* Horns */}
        <path d="M 18 58 Q 10 52 12 44" stroke="hsl(40 30% 70%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 50 58 Q 58 52 56 44" stroke="hsl(40 30% 70%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        {isAsleep ? (
          <>
            <path d="M 26 76 Q 29 79 32 76" stroke="hsl(40 20% 85%)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 38 76 Q 41 79 44 76" stroke="hsl(40 20% 85%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="28" cy="64" r="2.5" fill="hsl(40 20% 90%)" />
            <circle cx="41" cy="64" r="2.5" fill="hsl(40 20% 90%)" />
          </>
        )}
        {/* Snout */}
        <ellipse cx="34" cy={isAsleep ? 88 : 78} rx="10" ry="6" fill="hsl(25 25% 18%)" />
        {/* Legs */}
        {!isAsleep && (
          <>
            <rect x="52" y="94" width="8" height="14" rx="4" fill="hsl(25 25% 20%)" />
            <rect x="72" y="94" width="8" height="14" rx="4" fill="hsl(25 25% 20%)" />
            <rect x="96" y="94" width="8" height="14" rx="4" fill="hsl(25 25% 20%)" />
            <rect x="112" y="92" width="8" height="14" rx="4" fill="hsl(25 25% 20%)" />
          </>
        )}
        {/* Tail */}
        <motion.path
          d="M 126 60 Q 138 54 136 44"
          stroke="hsl(25 28% 24%)" strokeWidth="5" fill="none" strokeLinecap="round"
          animate={{ rotate: isAsleep ? 0 : [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ transformOrigin: '126px 60px' }}
        />
      </motion.svg>
    </motion.div>
  );
}