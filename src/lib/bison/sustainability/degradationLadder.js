// ═══════════════════════════════════════════════
// SRTRS §13, §14 — GRACEFUL DEGRADATION LADDER
// Bison stays alive at every level. Degradation reduces frequency and
// fidelity, never presence — and every step is reversible.
// ═══════════════════════════════════════════════

import { PERFORMANCE_MODES } from '@/lib/world/performanceModes';

export const LEVELS = [
  {
    level: 1, id: 'NORMAL', label: 'Normal',
    simulationTickMs: 1000, microBehaviors: true, performanceMode: null,
    optionalNetwork: true, optionalExternal: true,
    describe: 'Full experience. Simulation at 1 Hz decisions, animation at the user\'s chosen performance mode.',
  },
  {
    level: 2, id: 'REDUCED_SIMULATION', label: 'Reduced simulation',
    simulationTickMs: 2000, microBehaviors: true, performanceMode: null,
    optionalNetwork: true, optionalExternal: true,
    describe: 'Autonomous decision frequency halved. Bison behaves identically, just deliberates less often.',
  },
  {
    level: 3, id: 'REDUCED_ANIMATION', label: 'Reduced animation',
    simulationTickMs: 3000, microBehaviors: true, performanceMode: PERFORMANCE_MODES.BALANCED,
    optionalNetwork: true, optionalExternal: true,
    describe: 'Animation quality and particle density reduced.',
  },
  {
    level: 4, id: 'PAUSE_NONESSENTIAL', label: 'Nonessential paused',
    simulationTickMs: 4000, microBehaviors: false, performanceMode: PERFORMANCE_MODES.BATTERY_SAVER,
    optionalNetwork: true, optionalExternal: true,
    describe: 'Micro-behaviors and background effects paused. Care actions still land immediately.',
  },
  {
    level: 5, id: 'REDUCED_NETWORK', label: 'Network reduced',
    simulationTickMs: 6000, microBehaviors: false, performanceMode: PERFORMANCE_MODES.BATTERY_SAVER,
    optionalNetwork: false, optionalExternal: true,
    describe: 'Optional network activity deferred. Nothing the user explicitly asks for is blocked.',
  },
  {
    level: 6, id: 'MINIMAL', label: 'Minimal',
    simulationTickMs: 10000, microBehaviors: false, performanceMode: PERFORMANCE_MODES.MINIMAL,
    optionalNetwork: false, optionalExternal: false,
    describe: 'Essential local state only. Optional external services paused. Bison still lives and still resumes from elapsed time.',
  },
];

export const getLevel = (n) => LEVELS.find(l => l.level === n) || LEVELS[0];

/**
 * Map measured strain to a ladder level. Strain comes only from signals this
 * runtime can actually read, so a device that exposes nothing stays at NORMAL
 * rather than being degraded on a guess.
 */
export function levelForStrain(strainScore, signalCount) {
  if (!signalCount) return 1;
  if (strainScore >= 85) return 6;
  if (strainScore >= 70) return 5;
  if (strainScore >= 55) return 4;
  if (strainScore >= 40) return 3;
  if (strainScore >= 25) return 2;
  return 1;
}