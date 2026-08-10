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
  // Pet-like idle motions
  [BEHAVIORS.YAWN]: { scaleY: [1, 1.1, 0.96, 1], rotate: [0, -4, 2, 0], transition: { duration: 3.5, repeat: Infinity, repeatDelay: 1.5 } },
  [BEHAVIORS.SCRATCH]: { rotate: [0, -6, 4, -5, 0], x: [0, -3, 3, 0], transition: { duration: 1.6, repeat: Infinity, repeatDelay: 1 } },
  [BEHAVIORS.WATCH_BIRDS]: { rotate: [-6, -10, -6], y: -8, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.FOLLOW_INSECT]: { x: [0, 22, -18, 14, 0], rotate: [0, 6, -6, 4, 0], transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.INSPECT_TOY]: { x: [0, 55, 55, 0], rotate: [0, 10, 10, 0], transition: { duration: 8, repeat: Infinity } },
  [BEHAVIORS.THINK]: { rotate: [0, 3, 0], y: [0, -2, 0], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.DANCE]: { y: [0, -8, 0], rotate: [-4, 4, -4], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.DOZE]: { y: [8, 11, 8], rotate: [0, 2, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
  [BEHAVIORS.PLAY_ALONE]: { x: [0, -30, 25, -15, 0], y: [0, -12, 0, -8, 0], transition: { duration: 6, repeat: Infinity } },
  // Care-scene motions — anticipation, action, reaction, recovery
  sniff: { rotate: [0, 12, 10, 12, 0], y: [0, 4, 4, 4, 0], transition: { duration: 2.4, repeat: Infinity } },
  celebrate: { y: [0, -16, 0, -10, 0], rotate: [0, -5, 5, 0], transition: { duration: 1.1, repeat: Infinity } },
  wag: { y: [0, -4, 0], rotate: [0, -2, 2, 0], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  refuse: { rotate: [0, -9, 8, -6, 5, 0], x: [0, -4, 4, -2, 0], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 0.5 } },
};

// Behaviors where the tail wags fast — joy shown through the body
const HAPPY_BEHAVIORS = ['eat', 'play', 'play_alone', 'wag', 'celebrate', 'dance', 'look_at_user'];

export default function SceneBison({ behavior = BEHAVIORS.IDLE, accent = 'hsl(42 63% 55%)' }) {
  const isAsleep = behavior === BEHAVIORS.SLEEP;
  const isDrowsy = behavior === BEHAVIORS.DOZE || behavior === BEHAVIORS.YAWN;
  const isHappy = HAPPY_BEHAVIORS.includes(behavior);
  const motionProps = BEHAVIOR_MOTION[behavior] || BEHAVIOR_MOTION[BEHAVIORS.IDLE];

  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={motionProps}
      transition={{ type: 'spring', stiffness: 70, damping: 15 }}
    >
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
        {/* Ears — occasional flicks, a small sign of listening */}
        {!isAsleep && (
          <>
            <motion.ellipse
              cx="20" cy={isDrowsy ? 62 : 54} rx="5" ry="3.5" fill="hsl(25 30% 26%)"
              animate={{ rotate: [0, 0, -18, 0, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.55, 0.62, 0.7, 1] }}
              style={{ transformOrigin: '22px 56px' }}
            />
            <motion.ellipse
              cx="48" cy={isDrowsy ? 62 : 54} rx="5" ry="3.5" fill="hsl(25 30% 26%)"
              animate={{ rotate: [0, 0, 16, 0, 0] }}
              transition={{ duration: 7, repeat: Infinity, times: [0, 0.3, 0.38, 0.46, 1] }}
              style={{ transformOrigin: '46px 56px' }}
            />
          </>
        )}
        {/* Eyes */}
        {isAsleep ? (
          <>
            <path d="M 26 76 Q 29 79 32 76" stroke="hsl(40 20% 85%)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 38 76 Q 41 79 44 76" stroke="hsl(40 20% 85%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : isDrowsy ? (
          <>
            {/* Heavy, half-closed lids */}
            <motion.path
              d="M 25 64 Q 28 67 31 64" stroke="hsl(40 20% 88%)" strokeWidth="2" fill="none" strokeLinecap="round"
              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.path
              d="M 38 64 Q 41 67 44 64" stroke="hsl(40 20% 88%)" strokeWidth="2" fill="none" strokeLinecap="round"
              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity }}
            />
          </>
        ) : (
          <>
            {/* Blinking eyes — irregular rhythm so it never feels mechanical */}
            <motion.circle
              cx="28" cy="64" r="2.5" fill="hsl(40 20% 90%)"
              animate={{ scaleY: [1, 1, 0.08, 1, 1, 0.08, 1] }}
              transition={{ duration: 6.5, repeat: Infinity, times: [0, 0.42, 0.45, 0.48, 0.9, 0.93, 1] }}
              style={{ transformOrigin: '28px 64px' }}
            />
            <motion.circle
              cx="41" cy="64" r="2.5" fill="hsl(40 20% 90%)"
              animate={{ scaleY: [1, 1, 0.08, 1, 1, 0.08, 1] }}
              transition={{ duration: 6.5, repeat: Infinity, times: [0, 0.42, 0.45, 0.48, 0.9, 0.93, 1] }}
              style={{ transformOrigin: '41px 64px' }}
            />
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
        {/* Tail — wag speed carries the emotion */}
        <motion.path
          d="M 126 60 Q 138 54 136 44"
          stroke="hsl(25 28% 24%)" strokeWidth="5" fill="none" strokeLinecap="round"
          animate={{ rotate: isAsleep ? 0 : isHappy ? [0, 18, -8, 18, 0] : [0, 6, 0] }}
          transition={{ duration: isHappy ? 0.7 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '126px 60px' }}
        />
      </motion.svg>
    </motion.div>
  );
}