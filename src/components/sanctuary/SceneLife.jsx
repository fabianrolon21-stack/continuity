import { motion } from 'framer-motion';

// Ambient life layer — the world continues whether or not you touch it.
// Daytime + clear: butterflies and a bee. Night: fireflies. Breeze: falling leaves.
// Birds cross the sky occasionally. All lightweight divs, no re-renders.

function Butterfly({ delay, y }) {
  return (
    <motion.div
      className="absolute text-sm pointer-events-none select-none"
      style={{ top: y }}
      initial={{ left: '-5%' }}
      animate={{ left: '105%', y: [0, -14, 6, -10, 0] }}
      transition={{ left: { duration: 26, repeat: Infinity, delay, ease: 'linear' }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      🦋
    </motion.div>
  );
}

function Bee({ delay }) {
  return (
    <motion.div
      className="absolute text-[10px] pointer-events-none select-none"
      style={{ top: '58%' }}
      initial={{ left: '110%' }}
      animate={{ left: '-8%', y: [0, -8, 4, -6, 0] }}
      transition={{ left: { duration: 18, repeat: Infinity, delay, ease: 'linear' }, y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
    >
      🐝
    </motion.div>
  );
}

function Firefly({ x, y, delay }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{ left: x, top: y, background: 'hsl(60 90% 70%)', boxShadow: '0 0 8px hsl(60 90% 70% / 0.9)' }}
      animate={{ opacity: [0, 1, 0.2, 1, 0], x: [0, 14, -10, 8, 0], y: [0, -10, 6, -12, 0] }}
      transition={{ duration: 7 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

function Leaf({ x, delay }) {
  return (
    <motion.div
      className="absolute text-[11px] pointer-events-none select-none"
      style={{ left: x, top: '-6%' }}
      animate={{ top: '85%', x: [0, 24, -12, 30], rotate: [0, 140, 40, 220] }}
      transition={{ duration: 11, repeat: Infinity, delay, ease: 'easeIn' }}
    >
      🍃
    </motion.div>
  );
}

function Bird({ delay, top }) {
  return (
    <motion.div
      className="absolute text-xs pointer-events-none select-none"
      style={{ top }}
      initial={{ left: '-6%' }}
      animate={{ left: '106%', y: [0, -6, 3, -4, 0] }}
      transition={{ left: { duration: 14, repeat: Infinity, repeatDelay: 22, delay, ease: 'linear' }, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      🐦
    </motion.div>
  );
}

export default function SceneLife({ weather = 'clear', isNight = false }) {
  const calm = !['rain', 'storm', 'snow'].includes(weather);
  const breezy = weather === 'wind' || weather === 'cloudy';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {isNight && calm && (
        <>
          <Firefly x="18%" y="55%" delay={0} />
          <Firefly x="62%" y="48%" delay={1.4} />
          <Firefly x="80%" y="60%" delay={2.8} />
          <Firefly x="35%" y="64%" delay={4.1} />
        </>
      )}

      {!isNight && calm && (
        <>
          <Butterfly delay={0} y="42%" />
          <Butterfly delay={12} y="55%" />
          <Bee delay={5} />
          <Bird delay={3} top="14%" />
          <Bird delay={19} top="20%" />
        </>
      )}

      {!isNight && breezy && (
        <>
          <Leaf x="22%" delay={0} />
          <Leaf x="58%" delay={3.5} />
          <Leaf x="78%" delay={7} />
        </>
      )}
    </div>
  );
}