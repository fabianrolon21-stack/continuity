// ═══════════════════════════════════════════════
// WORLD PARTICLES (Phase 31 — Living World)
// Renders weather/seasonal particles: rain, snow, stars,
// fireflies, butterflies, falling leaves, mist, blossoms.
// ═══════════════════════════════════════════════

import { useMemo } from 'react';
import { getPerformanceConfig } from '@/lib/world/performanceModes';

const PARTICLE_RENDERERS = {
  rain: renderRain,
  snow: renderSnow,
  stars: renderStars,
  fireflies: renderFireflies,
  butterflies: renderButterflies,
  falling_leaves: renderLeaves,
  leaves: renderLeaves,
  mist: renderMist,
  blossoms: renderBlossoms,
  snowflakes: renderSnow,
  dew: renderDew,
  dust: renderDust,
  golden_dust: renderGoldenDust,
  fireworks: renderFireworks,
  hearts: renderHearts,
  pumpkins: renderPumpkins,
  lights: renderHolidayLights,
};

export default function WorldParticles({ particleTypes = [], performanceMode = 'balanced' }) {
  const perf = getPerformanceConfig(performanceMode);

  const particles = useMemo(() => {
    if (!perf.enableParticles || particleTypes.length === 0) return null;

    return particleTypes.map(type => {
      const renderer = PARTICLE_RENDERERS[type];
      if (!renderer) return null;
      return renderer(perf);
    }).filter(Boolean);
  }, [particleTypes.join(','), performanceMode]);

  if (!particles || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles}
    </div>
  );
}

// ── Rain ──
function renderRain(perf) {
  const count = Math.floor(40 * perf.particleMultiplier);
  const drops = Array.from({ length: count }, (_, i) => i);
  return (
    <div key="rain">
      {drops.map(i => (
        <div
          key={i}
          className="absolute w-px bg-sky-accent/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-10 + Math.random() * 20}%`,
            height: `${15 + Math.random() * 25}px`,
            animation: `rainFall ${0.5 + Math.random() * 0.5}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style>{`@keyframes rainFall { to { transform: translateY(110vh); } }`}</style>
    </div>
  );
}

// ── Snow ──
function renderSnow(perf) {
  const count = Math.floor(30 * perf.particleMultiplier);
  return (
    <div key="snow">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-5 + Math.random() * 10}%`,
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
            animation: `snowFall ${5 + Math.random() * 8}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.4 + Math.random() * 0.4,
          }}
        />
      ))}
      <style>{`@keyframes snowFall { to { transform: translateY(110vh) translateX(${(Math.random() - 0.5) * 50}px); } }`}</style>
    </div>
  );
}

// ── Stars ──
function renderStars(perf) {
  const count = Math.floor(50 * perf.particleMultiplier);
  return (
    <div key="stars">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            width: `${1 + Math.random() * 2.5}px`,
            height: `${1 + Math.random() * 2.5}px`,
            opacity: 0.3 + Math.random() * 0.5,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      {/* Moon */}
      <div
        className="absolute rounded-full"
        style={{
          right: '20%',
          top: '12%',
          width: '50px',
          height: '50px',
          background: 'radial-gradient(circle, hsl(48 67% 85%) 0%, hsl(48 50% 70%) 60%, transparent 100%)',
          boxShadow: '0 0 40px hsl(48 50% 70% / 0.3)',
        }}
      />
      <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );
}

// ── Fireflies ──
function renderFireflies(perf) {
  const count = Math.floor(15 * perf.particleMultiplier);
  return (
    <div key="fireflies">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${30 + Math.random() * 60}%`,
            width: '4px',
            height: '4px',
            background: 'hsl(60 90% 65%)',
            boxShadow: '0 0 8px hsl(60 90% 65%)',
            animation: `fireflyFloat ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
      <style>{`@keyframes fireflyFloat { 0%, 100% { transform: translate(0, 0); opacity: 0.3; } 25% { transform: translate(20px, -15px); opacity: 1; } 50% { transform: translate(-10px, -25px); opacity: 0.6; } 75% { transform: translate(15px, -10px); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Butterflies ──
function renderButterflies(perf) {
  const count = Math.floor(5 * perf.particleMultiplier);
  const colors = ['hsl(280 70% 70%)', 'hsl(45 80% 60%)', 'hsl(350 70% 65%)', 'hsl(180 60% 60%)'];
  return (
    <div key="butterflies">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${30 + Math.random() * 50}%`,
            fontSize: '14px',
            animation: `butterflyFly ${8 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          <span style={{ color: colors[i % colors.length], opacity: 0.7 }}>🦋</span>
        </div>
      ))}
      <style>{`@keyframes butterflyFly { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(30px, -20px); } 50% { transform: translate(60px, 10px); } 75% { transform: translate(20px, -30px); } }`}</style>
    </div>
  );
}

// ── Falling leaves ──
function renderLeaves(perf) {
  const count = Math.floor(12 * perf.particleMultiplier);
  const leaves = ['🍂', '🍁'];
  return (
    <div key="leaves">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-5 + Math.random() * 10}%`,
            fontSize: '12px',
            animation: `leafFall ${6 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {leaves[i % leaves.length]}
        </div>
      ))}
      <style>{`@keyframes leafFall { to { transform: translateY(110vh) rotate(360deg) translateX(${(Math.random() - 0.5) * 80}px); } }`}</style>
    </div>
  );
}

// ── Mist / Fog ──
function renderMist(perf) {
  const count = Math.floor(5 * perf.particleMultiplier);
  return (
    <div key="mist">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${40 + Math.random() * 50}%`,
            width: `${150 + Math.random() * 200}px`,
            height: `${80 + Math.random() * 60}px`,
            background: 'radial-gradient(ellipse, hsl(0 0% 70% / 0.12) 0%, transparent 70%)',
            animation: `mistDrift ${10 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`@keyframes mistDrift { 0%, 100% { transform: translateX(0); opacity: 0.5; } 50% { transform: translateX(40px); opacity: 0.8; } }`}</style>
    </div>
  );
}

// ── Blossoms ──
function renderBlossoms(perf) {
  const count = Math.floor(10 * perf.particleMultiplier);
  return (
    <div key="blossoms">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-5 + Math.random() * 10}%`,
            fontSize: '10px',
            animation: `blossomFall ${8 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        >
          <span style={{ color: 'hsl(330 60% 75%)', opacity: 0.6 }}>🌸</span>
        </div>
      ))}
      <style>{`@keyframes blossomFall { to { transform: translateY(110vh) translateX(${(Math.random() - 0.5) * 60}px); } }`}</style>
    </div>
  );
}

// ── Dew ──
function renderDew(perf) {
  const count = Math.floor(20 * perf.particleMultiplier);
  return (
    <div key="dew">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${70 + Math.random() * 25}%`,
            width: '3px',
            height: '3px',
            background: 'hsl(200 50% 80% / 0.4)',
          }}
        />
      ))}
    </div>
  );
}

// ── Dust (morning light) ──
function renderDust(perf) {
  const count = Math.floor(15 * perf.particleMultiplier);
  return (
    <div key="dust">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            background: 'hsl(45 80% 70% / 0.3)',
            animation: `dustFloat ${8 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`@keyframes dustFloat { 0%, 100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-20px); opacity: 0.5; } }`}</style>
    </div>
  );
}

function renderGoldenDust(perf) {
  const count = Math.floor(20 * perf.particleMultiplier);
  return (
    <div key="golden_dust">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '3px',
            height: '3px',
            background: 'hsl(35 85% 60% / 0.4)',
            boxShadow: '0 0 4px hsl(35 85% 60% / 0.3)',
            animation: `dustFloat ${6 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`@keyframes dustFloat { 0%, 100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-20px); opacity: 0.6; } }`}</style>
    </div>
  );
}

function renderFireworks(perf) {
  const count = Math.floor(3 * perf.particleMultiplier);
  return (
    <div key="fireworks">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${15 + Math.random() * 30}%`,
            fontSize: '20px',
            animation: `fireworkBurst ${3 + Math.random() * 3}s ease-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        >🎆</div>
      ))}
      <style>{`@keyframes fireworkBurst { 0% { transform: scale(0); opacity: 0; } 30% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.8); opacity: 0; } }`}</style>
    </div>
  );
}

function renderHearts(perf) {
  const count = Math.floor(8 * perf.particleMultiplier);
  return (
    <div key="hearts">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 30}%`,
            fontSize: '12px',
            animation: `heartFloat ${5 + Math.random() * 4}s ease-in infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >💕</div>
      ))}
      <style>{`@keyframes heartFloat { to { transform: translateY(-100vh); opacity: 0; } }`}</style>
    </div>
  );
}

function renderPumpkins(perf) {
  return (
    <div key="pumpkins" className="absolute bottom-0 left-0 right-0 flex justify-around items-end pb-4 opacity-70">
      <span style={{ fontSize: '28px' }}>🎃</span>
      <span style={{ fontSize: '20px' }}>🎃</span>
      <span style={{ fontSize: '24px' }}>🎃</span>
    </div>
  );
}

function renderHolidayLights(perf) {
  const count = Math.floor(20 * perf.particleMultiplier);
  const colors = ['hsl(0 70% 60%)', 'hsl(120 60% 50%)', 'hsl(48 80% 55%)', 'hsl(280 60% 60%)'];
  return (
    <div key="lights">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${5 + Math.random() * 30}%`,
            width: '4px',
            height: '4px',
            background: colors[i % colors.length],
            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
            animation: `lightTwinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style>{`@keyframes lightTwinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}