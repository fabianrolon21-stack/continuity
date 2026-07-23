// ═══════════════════════════════════════════════
// WEATHER OVERLAY (Package 018 — Weather Engine)
// Animated weather particles: rain, snow, leaves,
// bubbles, stars, petals, clouds, lightning.
// Density adapts to performance tier.
// ═══════════════════════════════════════════════

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPerformanceConfig } from '@/lib/world/performanceModes';

const PARTICLE_COUNTS = { high: 60, balanced: 35, battery_saver: 12, minimal: 0 };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateParticles(type, count, color) {
  const rand = mulberry32(Date.now() % 100000);
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `p_${i}`,
      x: rand() * 100,
      y: rand() * 100,
      size: 3 + rand() * 6,
      delay: rand() * 5,
      duration: 3 + rand() * 5,
      drift: (rand() - 0.5) * 40,
      opacity: 0.3 + rand() * 0.4,
    });
  }
  return particles;
}

function RainDrop({ p }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left: `${p.x}%`, top: `${p.y}%`, width: 1.5, height: 12, background: 'hsl(210 30% 70% / 0.5)' }}
      animate={{ y: ['0vh', '100vh'] }}
      transition={{ duration: p.duration * 0.6, repeat: Infinity, delay: p.delay, ease: 'linear' }}
    />
  );
}

function Snowflake({ p }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{ left: `${p.x}%`, top: '-2%', width: p.size, height: p.size, opacity: p.opacity }}
      animate={{ y: ['0vh', '105vh'], x: [0, p.drift, 0], rotate: [0, 360] }}
      transition={{ duration: p.duration * 2, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    />
  );
}

function Leaf({ p, color }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${p.x}%`, top: '-3%', width: p.size, height: p.size }}
      animate={{ y: ['0vh', '105vh'], x: [0, p.drift, -p.drift, 0], rotate: [0, 180, 360] }}
      transition={{ duration: p.duration * 2.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 24 24" fill={color} opacity={p.opacity}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3c.5.12 1 .19 1.5.19C19 19.5 22 12 22 12s-3.3-4.5-5-4.5z" />
      </svg>
    </motion.div>
  );
}

function Bubble({ p, color }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{ left: `${p.x}%`, bottom: '-3%', width: p.size * 2, height: p.size * 2, borderColor: color, borderWidth: 1, opacity: p.opacity }}
      animate={{ y: ['0vh', '-105vh'], x: [0, p.drift * 0.5, 0] }}
      transition={{ duration: p.duration * 3, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    />
  );
}

function StarParticle({ p, color }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
      animate={{ opacity: [0, p.opacity, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 24 24" fill={color}>
        <path d="M12 2 L13.5 9 L21 10.5 L13.5 12 L12 19 L10.5 12 L3 10.5 L10.5 9 Z" />
      </svg>
    </motion.div>
  );
}

function Petal({ p, color }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${p.x}%`, top: '-3%', width: p.size, height: p.size }}
      animate={{ y: ['0vh', '105vh'], x: [0, p.drift, -p.drift, 0], rotate: [0, 180, 360] }}
      transition={{ duration: p.duration * 3, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 24 24" fill={color} opacity={p.opacity}>
        <ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(45 12 12)" />
      </svg>
    </motion.div>
  );
}

function CloudParticle({ p }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${p.x}%`, top: `${p.y}%`,
        width: p.size * 8, height: p.size * 4,
        background: 'hsl(0 0% 90% / 0.06)',
        filter: 'blur(8px)',
      }}
      animate={{ x: [0, 50, 0] }}
      transition={{ duration: p.duration * 5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
    />
  );
}

const PARTICLE_RENDERERS = {
  rain: RainDrop, snow: Snowflake, leaf: Leaf, bubble: Bubble,
  star: StarParticle, petal: Petal, cloud: CloudParticle,
};

export default function WeatherOverlay({
  particleType = null,
  particleColor = 'hsl(199 56% 64%)',
  weatherCondition = null,
  performanceMode = 'balanced',
  disableWeather = false,
  reduceMotion = false,
}) {
  const [lightning, setLightning] = useState(false);

  const type = particleType || mapWeatherToParticle(weatherCondition);
  const count = disableWeather || reduceMotion ? 0 : (PARTICLE_COUNTS[performanceMode] ?? 35);
  const particles = useMemo(
    () => type ? generateParticles(type, count, particleColor) : [],
    [type, count, particleColor]
  );

  // Lightning for storms
  useEffect(() => {
    if (weatherCondition !== 'storm' || disableWeather || reduceMotion) return;
    const interval = setInterval(() => {
      setLightning(true);
      setTimeout(() => setLightning(false), 150);
    }, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [weatherCondition, disableWeather, reduceMotion]);

  if (count === 0 || !type) return null;

  const Renderer = PARTICLE_RENDERERS[type] || StarParticle;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -6 }} aria-hidden="true">
      {particles.map((p) => (
        <Renderer key={p.id} p={p} color={particleColor} />
      ))}
      <AnimatePresence>
        {lightning && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function mapWeatherToParticle(condition) {
  if (!condition) return null;
  const map = {
    sunny: null, clear: null, cloudy: 'cloud',
    rain: 'rain', snow: 'snow', storm: 'rain',
    fog: 'cloud', wind: 'leaf',
  };
  return map[condition] || null;
}