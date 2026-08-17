import { motion } from 'framer-motion';

// §16 — an actual graphical Bison (SVG vector shapes), never an emoji.
// States: idle | thinking | observing | discovering | uncertain | walking_away
export default function BisonMapMarker({ x = 160, y = 110, state = 'idle', targetX, targetY }) {
  const moving = ['thinking', 'discovering'].includes(state) && targetX != null;
  const px = state === 'walking_away' ? 360 : moving ? (x + targetX) / 2 : x;
  const py = state === 'walking_away' ? y : moving ? (y + targetY) / 2 : y;
  const sway = state === 'uncertain' ? [-4, 4, -4] : state === 'observing' ? [0, -2, 0] : 0;

  return (
    <motion.g
      animate={{ x: px, y: py, rotate: sway, opacity: state === 'walking_away' ? 0 : 1 }}
      transition={{ duration: state === 'walking_away' ? 3.5 : 2, ease: 'easeInOut', rotate: { duration: 2.4, repeat: state === 'uncertain' ? Infinity : 0, ease: 'easeInOut' } }}
    >
      <motion.g animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        {/* body */}
        <ellipse cx="0" cy="0" rx="11" ry="7.5" fill="hsl(21 40% 34%)" />
        {/* hump */}
        <ellipse cx="-3" cy="-5" rx="7" ry="4.5" fill="hsl(21 38% 28%)" />
        {/* head */}
        <circle cx="9" cy="-1" r="4.5" fill="hsl(21 35% 24%)" />
        {/* horns */}
        <path d="M 6 -4.5 Q 4.5 -8 7 -8.5" stroke="hsl(40 30% 80%)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 12 -4.5 Q 13.5 -8 11 -8.5" stroke="hsl(40 30% 80%)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* eye — blinks */}
        <motion.circle cx="10" cy="-2" r="0.9" fill="hsl(40 20% 92%)" animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} />
        {/* legs */}
        <rect x="-8" y="5.5" width="2" height="5" rx="1" fill="hsl(21 35% 24%)" />
        <rect x="-2" y="5.5" width="2" height="5" rx="1" fill="hsl(21 35% 24%)" />
        <rect x="4" y="5.5" width="2" height="5" rx="1" fill="hsl(21 35% 24%)" />
      </motion.g>
      {state === 'thinking' && (
        <motion.circle cx="14" cy="-12" r="2" fill="hsl(42 63% 55% / 0.6)" animate={{ opacity: [0.3, 1, 0.3], y: [-1, -4, -1] }} transition={{ duration: 2, repeat: Infinity }} />
      )}
    </motion.g>
  );
}