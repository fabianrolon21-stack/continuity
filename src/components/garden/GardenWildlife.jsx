import { motion } from 'framer-motion';

// Ambient wildlife for the Garden — butterflies, bees,
// birds, fireflies. Loops with long delays so visits
// feel occasional and alive, never mechanical.

export default function GardenWildlife({ isNight, hasFlowers }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Butterfly — drifts across every ~18s */}
      {!isNight && (
        <motion.span
          className="absolute text-base"
          style={{ top: '35%' }}
          animate={{ x: ['-8%', '108%'], y: [0, -20, 10, -15, 5, -10] }}
          transition={{ duration: 14, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
        >
          🦋
        </motion.span>
      )}

      {/* Bee — visits flowers */}
      {!isNight && hasFlowers && (
        <motion.span
          className="absolute text-xs"
          style={{ bottom: '25%' }}
          animate={{ x: ['110%', '60%', '62%', '58%', '30%', '-10%'], y: [0, 10, 8, 12, 5, -5] }}
          transition={{ duration: 11, repeat: Infinity, repeatDelay: 12, ease: 'easeInOut' }}
        >
          🐝
        </motion.span>
      )}

      {/* Bird — lands, waits, flies away */}
      {!isNight && (
        <motion.span
          className="absolute text-sm"
          style={{ left: '70%' }}
          animate={{
            y: ['-15%', '55%', '55%', '55%', '-15%'],
            x: [0, -10, -10, -10, 30],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 10, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 20, ease: 'easeInOut' }}
        >
          🐦
        </motion.span>
      )}

      {/* Fireflies at night */}
      {isNight && [...Array(5)].map((_, i) => (
        <motion.div
          key={`ff${i}`}
          className="absolute rounded-full"
          style={{
            width: 3, height: 3,
            background: 'hsl(48 80% 70%)',
            boxShadow: '0 0 8px hsl(48 80% 70%)',
            left: `${15 + i * 17}%`,
            bottom: `${20 + (i * 13) % 35}%`,
          }}
          animate={{ opacity: [0, 0.9, 0], x: [0, i % 2 ? 18 : -18], y: [0, -14] }}
          transition={{ duration: 3.5 + i, repeat: Infinity, delay: i * 1.1 }}
        />
      ))}

      {/* Tiny crawling insect */}
      <motion.div
        className="absolute rounded-full bg-white/20"
        style={{ width: 3, height: 2, bottom: '8%' }}
        animate={{ x: ['5%', '40%', '38%', '75%'] }}
        transition={{ duration: 25, repeat: Infinity, repeatDelay: 8, ease: 'linear' }}
      />
    </div>
  );
}