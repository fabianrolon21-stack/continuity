// ═══════════════════════════════════════════════
// PERFORMANCE MODE MANAGER (Phase 31 — Living World)
// Controls animation complexity, particle counts, and
// visual effects density across 4 tiers.
// ═══════════════════════════════════════════════

export const PERFORMANCE_MODES = {
  HIGH: 'high',
  BALANCED: 'balanced',
  BATTERY_SAVER: 'battery_saver',
  MINIMAL: 'minimal',
};

const MODE_CONFIGS = {
  [PERFORMANCE_MODES.HIGH]: {
    label: 'High',
    description: 'Full animations, weather, particles, shadows',
    particleMultiplier: 1.0,
    enableShadows: true,
    enableParallax: true,
    enableBlur: true,
    enableParticles: true,
    animationFPS: 60,
    maxParticles: 80,
    transitionDuration: '2s',
  },
  [PERFORMANCE_MODES.BALANCED]: {
    label: 'Balanced',
    description: 'Simplified lighting, moderate particles',
    particleMultiplier: 0.5,
    enableShadows: false,
    enableParallax: true,
    enableBlur: true,
    enableParticles: true,
    animationFPS: 30,
    maxParticles: 40,
    transitionDuration: '1s',
  },
  [PERFORMANCE_MODES.BATTERY_SAVER]: {
    label: 'Battery Saver',
    description: 'Fewer animations, reduced particles',
    particleMultiplier: 0.2,
    enableShadows: false,
    enableParallax: false,
    enableBlur: false,
    enableParticles: true,
    animationFPS: 15,
    maxParticles: 15,
    transitionDuration: '0.5s',
  },
  [PERFORMANCE_MODES.MINIMAL]: {
    label: 'Minimal',
    description: 'Static background, no animations',
    particleMultiplier: 0,
    enableShadows: false,
    enableParallax: false,
    enableBlur: false,
    enableParticles: false,
    animationFPS: 0,
    maxParticles: 0,
    transitionDuration: '0s',
  },
};

export function getPerformanceConfig(mode = PERFORMANCE_MODES.BALANCED) {
  return MODE_CONFIGS[mode] || MODE_CONFIGS[PERFORMANCE_MODES.BALANCED];
}

export function getAllPerformanceModes() {
  return Object.entries(MODE_CONFIGS).map(([key, config]) => ({
    key,
    ...config,
  }));
}

// Auto-detect a reasonable default based on device and battery
export function autoDetectPerformanceMode() {
  if (typeof navigator === 'undefined') return PERFORMANCE_MODES.BALANCED;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (prefersReducedMotion) return PERFORMANCE_MODES.MINIMAL;

  if (isMobile) return PERFORMANCE_MODES.BALANCED;
  return PERFORMANCE_MODES.HIGH;
}

// Async version — checks battery API (where available) before deciding
export async function autoDetectPerformanceModeAsync() {
  if (typeof navigator === 'undefined') return PERFORMANCE_MODES.BALANCED;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (prefersReducedMotion) return PERFORMANCE_MODES.MINIMAL;

  // Battery API (where available)
  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      if (battery.level < 0.15 && !battery.charging) return PERFORMANCE_MODES.BATTERY_SAVER;
    } catch (e) {}
  }

  if (isMobile) return PERFORMANCE_MODES.BALANCED;
  return PERFORMANCE_MODES.HIGH;
}