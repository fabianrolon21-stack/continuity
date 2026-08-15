import { motion } from 'framer-motion';
import { resolveBisonAnimation } from '@/lib/bison/character/BisonAssetRegistry';

const MOTION = {
  idle: {}, look_around: { rotate: [0, -3, 3, -2, 0] }, stretch: { scaleX: [1, 1.07, 1], scaleY: [1, 0.95, 1] },
  walk: { x: [-42, 42, -42] }, play: { x: [0, 45, 35, 0], y: [0, -9, 0, 0] }, eat: { rotate: [0, 7, 7, 0] },
  drink: { rotate: [0, 9, 9, 0] }, sleep: { y: 15 }, sit: { y: 8 }, look_at_user: { scale: [1, 1.025, 1] },
  yawn: { scaleY: [1, 1.1, 0.96, 1] }, scratch: { rotate: [0, -6, 4, -5, 0] }, watch_birds: { rotate: [-5, -10, -5] },
  follow_insect: { x: [0, 20, -16, 0], rotate: [0, 5, -4, 0] }, inspect_toy: { x: [0, 48, 48, 0], rotate: [0, 8, 8, 0] },
  think: { rotate: [0, 3, 0] }, dance: { y: [0, -8, 0], rotate: [-4, 4, -4] }, doze: { y: [8, 11, 8] }, play_alone: { x: [0, -25, 18, 0], y: [0, -10, 0, 0] },
  sniff: { rotate: [0, 11, 0] }, celebrate: { y: [0, -15, 0], rotate: [0, -5, 5, 0] }, wag: { y: [0, -4, 0] }, refuse: { rotate: [0, -8, 7, -5, 0] },
};

const HAPPY = ['play', 'play_alone', 'wag', 'celebrate', 'dance'];

export default function BisonRenderer({ behavior = 'idle', micro, emotion = 'calm', reducedMotion = false }) {
  const active = resolveBisonAnimation(behavior);
  const motion = MOTION[active] || MOTION.idle;
  const asleep = active === 'sleep';
  const happy = HAPPY.includes(active) || emotion === 'happy' || emotion === 'affectionate';
  const eyes = asleep ? 'M 25 77 Q 29 80 33 77 M 38 77 Q 42 80 46 77' : 'M 28 64 L 28 64 M 41 64 L 41 64';
  const microMotion = micro === 'look_left' ? { x: -3, rotate: -4 } : micro === 'look_right' ? { x: 3, rotate: 4 } : micro === 'weight_shift' ? { y: 2, rotate: -1 } : {};

  return (
    <motion.div aria-label={`Bison is ${active.replace(/_/g, ' ')}`} role="img" className="relative flex items-center justify-center"
      animate={reducedMotion ? {} : motion} transition={{ duration: active === 'walk' ? 10 : 3.2, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' }}>
      <motion.svg width="168" height="124" viewBox="0 0 150 110" className="drop-shadow-xl"
        animate={reducedMotion ? {} : { scale: asleep ? [1, 1.015, 1] : [1, 1.025, 1] }} transition={{ duration: asleep ? 5 : 3.6, repeat: Infinity, ease: 'easeInOut' }}>
        <title>Animated bison character</title>
        <motion.g animate={reducedMotion ? {} : microMotion} transition={{ duration: 1.1, ease: 'easeInOut' }}>
          <ellipse cx="80" cy={asleep ? 78 : 68} rx="48" ry={asleep ? 26 : 34} fill="hsl(25 30% 26%)" />
          <ellipse cx="62" cy={asleep ? 62 : 46} rx="30" ry={asleep ? 18 : 24} fill="hsl(25 32% 30%)" />
          <motion.path d="M 126 60 Q 138 54 136 44" stroke="hsl(25 28% 24%)" strokeWidth="5" fill="none" strokeLinecap="round"
            animate={reducedMotion ? {} : { rotate: happy ? [0, 18, -8, 18, 0] : [0, 6, 0] }} transition={{ duration: happy ? 0.7 : 2.5, repeat: Infinity }} style={{ transformOrigin: '126px 60px' }} />
          {!asleep && [52, 72, 96, 112].map((x, index) => <motion.rect key={x} x={x} y={index === 3 ? 92 : 94} width="8" height="14" rx="4" fill="hsl(25 25% 20%)"
            animate={active === 'walk' && !reducedMotion ? { y: index % 2 ? [94, 90, 94] : [94, 98, 94] } : {}} transition={{ duration: 0.65, repeat: Infinity }} />)}
          <motion.g animate={reducedMotion ? {} : { rotate: active === 'look_around' || active === 'watch_birds' ? [0, -7, 5, 0] : 0 }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: '34px 70px' }}>
            <ellipse cx="34" cy={asleep ? 78 : 66} rx="20" ry="18" fill="hsl(25 28% 22%)" />
            <ellipse cx="34" cy={asleep ? 68 : 56} rx="17" ry="10" fill="hsl(25 34% 32%)" />
            <path d="M 18 58 Q 10 52 12 44 M 50 58 Q 58 52 56 44" stroke="hsl(40 30% 70%)" strokeWidth="4" fill="none" strokeLinecap="round" />
            {!asleep && <><motion.ellipse cx="20" cy="54" rx="5" ry="3.5" fill="hsl(25 30% 26%)" animate={{ rotate: [0, 0, -18, 0] }} transition={{ duration: 5.5, repeat: Infinity }} /><motion.ellipse cx="48" cy="54" rx="5" ry="3.5" fill="hsl(25 30% 26%)" animate={{ rotate: [0, 0, 16, 0] }} transition={{ duration: 7, repeat: Infinity }} /></>}
            {asleep ? <path d={eyes} stroke="hsl(40 20% 85%)" strokeWidth="2" fill="none" strokeLinecap="round" /> : <><motion.circle cx="28" cy="64" r="2.5" fill="hsl(40 20% 90%)" animate={reducedMotion ? {} : { scaleY: [1, 1, 0.08, 1] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .45, .48, 1] }} /><motion.circle cx="41" cy="64" r="2.5" fill="hsl(40 20% 90%)" animate={reducedMotion ? {} : { scaleY: [1, 1, 0.08, 1] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, .45, .48, 1] }} /></>}
            <ellipse cx="34" cy={asleep ? 88 : 78} rx="10" ry="6" fill="hsl(25 25% 18%)" />
          </motion.g>
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}