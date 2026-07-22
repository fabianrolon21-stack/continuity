// ═══════════════════════════════════════════════
// LIVING WORLD (Phase 31 — Living World)
// The animated background layer that replaces the old
// static BackgroundLayer. Renders: sky gradient, sun/moon,
// weather particles, lighting overlay, seasonal color shifts.
// This sits behind ALL pages — the app is always alive.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { computeWorldState } from '@/lib/world/worldStateEngine';
import { getPerformanceConfig } from '@/lib/world/performanceModes';
import WorldParticles from './WorldParticles';

const WORLD_CHECK_INTERVAL = 60000; // 1 minute

export default function LivingWorld({ performanceMode = 'balanced', userBirthday = null }) {
  const [worldState, setWorldState] = useState(() => computeWorldState({ userBirthday }));
  const perf = getPerformanceConfig(performanceMode);

  useEffect(() => {
    setWorldState(computeWorldState({ userBirthday }));
    const interval = setInterval(() => {
      setWorldState(computeWorldState({ userBirthday }));
    }, WORLD_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [userBirthday]);

  const { sky, lighting, particles, holiday, season } = worldState;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Layer 1: Sky gradient — 3-stop based on time */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 55%, ${sky.bottom} 100%)`,
          transition: `background ${perf.transitionDuration} ease-in-out`,
        }}
      />

      {/* Layer 2: Sun / Moon glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: sky.sunPosition.x,
          top: sky.sunPosition.y,
          width: sky.isNight ? '50px' : '120px',
          height: sky.isNight ? '50px' : '120px',
          background: sky.isNight
            ? `radial-gradient(circle, hsl(48 67% 85%) 0%, hsl(48 50% 70%) 60%, transparent 100%)`
            : `radial-gradient(circle, ${sky.sunColor} 0%, ${sky.sunColor}44 40%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          boxShadow: sky.isNight ? '0 0 30px hsl(48 50% 70% / 0.3)' : `0 0 80px ${sky.sunColor}33`,
          transition: `all ${perf.transitionDuration} ease-in-out`,
          opacity: perf.particleMultiplier > 0 ? 1 : 0.5,
        }}
      />

      {/* Layer 3: Weather + seasonal particles */}
      <WorldParticles particleTypes={particles} performanceMode={performanceMode} />

      {/* Layer 4: Lighting overlay — darkens at night, warms at golden hour */}
      <div
        className="absolute inset-0"
        style={{
          background: lighting.isGolden
            ? 'linear-gradient(180deg, hsl(30 80% 50% / 0.08) 0%, transparent 50%, hsl(20 70% 40% / 0.06) 100%)'
            : lighting.isNight
            ? 'linear-gradient(180deg, hsl(250 50% 5% / 0.3) 0%, hsl(250 40% 3% / 0.4) 100%)'
            : 'transparent',
          transition: `background ${perf.transitionDuration} ease-in-out`,
        }}
      />

      {/* Layer 5: Holiday accent glow */}
      {holiday && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${holiday.accent}11 0%, transparent 60%)`,
            transition: 'background 2s ease-in-out',
          }}
        />
      )}

      {/* Layer 6: Seasonal vegetation hint at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '15%',
          background: `linear-gradient(180deg, transparent 0%, ${season.vegetationTint}22 100%)`,
          transition: `background ${perf.transitionDuration} ease-in-out`,
        }}
      />

      {/* Layer 7: Vignette for depth */}
      {perf.enableBlur && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, hsl(250 30% 3% / 0.5) 100%)',
          }}
        />
      )}
    </div>
  );
}