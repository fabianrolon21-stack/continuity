import { motion } from 'framer-motion';

// Ambient particles over the whole scene — rain, snow,
// leaves, fireflies. Subtle, low-count, never distracting.

export default function SceneParticles({ weather, isNight }) {
  const particles = [];

  if (weather === 'rain' || weather === 'storm') {
    for (let i = 0; i < 14; i++) {
      particles.push(
        <motion.div
          key={`rain${i}`}
          className="absolute w-px"
          style={{ left: `${(i * 7.3) % 100}%`, height: 16, background: 'hsl(200 50% 70% / 0.25)' }}
          animate={{ y: ['-5%', '105%'] }}
          transition={{ duration: 0.8 + (i % 4) * 0.2, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
        />
      );
    }
  }

  if (weather === 'snow') {
    for (let i = 0; i < 12; i++) {
      particles.push(
        <motion.div
          key={`snow${i}`}
          className="absolute rounded-full bg-white/50"
          style={{ width: 3 + (i % 2), height: 3 + (i % 2), left: `${(i * 8.7) % 100}%` }}
          animate={{ y: ['-5%', '105%'], x: [0, i % 2 ? 20 : -20] }}
          transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
        />
      );
    }
  }

  if (weather === 'wind') {
    for (let i = 0; i < 8; i++) {
      particles.push(
        <motion.div
          key={`leaf${i}`}
          className="absolute rounded-full"
          style={{ width: 5, height: 3, background: 'hsl(30 55% 45% / 0.5)', top: `${20 + (i * 11) % 60}%` }}
          animate={{ x: ['-5%', '105%'], y: [0, 15, -10, 20], rotate: [0, 360] }}
          transition={{ duration: 5 + (i % 3), repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
        />
      );
    }
  }

  if (isNight && !['rain', 'storm', 'snow'].includes(weather)) {
    for (let i = 0; i < 6; i++) {
      particles.push(
        <motion.div
          key={`fly${i}`}
          className="absolute rounded-full"
          style={{ width: 3, height: 3, background: 'hsl(48 80% 70%)', boxShadow: '0 0 6px hsl(48 80% 70%)', left: `${15 + i * 14}%`, top: `${40 + (i * 13) % 40}%` }}
          animate={{ opacity: [0, 0.8, 0], x: [0, i % 2 ? 15 : -15], y: [0, -12] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2 }}
        />
      );
    }
  }

  if (particles.length === 0) return null;
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{particles}</div>;
}