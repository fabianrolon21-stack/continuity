// ═══════════════════════════════════════════════
// BACKGROUND CONTEXT ENGINE (Patch 40.4)
// Grounds every recommendation in the user's actual
// state: energy, sleep, stress, cognitive load.
// Prevents unrealistic advice.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export async function buildBackground({ somaticLoad, cognitiveLoad } = {}) {
  const factors = [];
  const unknowns = ['Financial pressure', 'Physical condition today'];
  let confidenceModifier = 1.0;

  try {
    const checkIns = await base44.entities.CheckIn.list('-date', 3);
    if (checkIns?.length > 0) {
      const avg = (key) => {
        const vals = checkIns.map(c => c[key]).filter(v => typeof v === 'number');
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      };
      const energy = avg('energy');
      const sleep = avg('sleep_hours');
      const stress = avg('stress_level');
      if (energy !== null) {
        factors.push(`Recent energy: ${energy.toFixed(1)}/10`);
        if (energy < 4) confidenceModifier -= 0.15;
      }
      if (sleep !== null) {
        factors.push(`Recent sleep: ${sleep.toFixed(1)}h/night`);
        if (sleep < 6) confidenceModifier -= 0.1;
      }
      if (stress !== null) {
        factors.push(`Recent stress: ${stress.toFixed(1)}/10`);
        if (stress > 7) confidenceModifier -= 0.15;
      }
    } else {
      unknowns.push('Recent check-in data');
    }
  } catch (e) {
    unknowns.push('Recent check-in data');
  }

  if (somaticLoad?.stressLevel != null) {
    factors.push(`Conversational stress load: ${somaticLoad.stressLevel}/100`);
    if (somaticLoad.stressLevel > 70) confidenceModifier -= 0.1;
  }
  if (cognitiveLoad?.currentBandwidth != null) {
    factors.push(`Cognitive bandwidth: ${cognitiveLoad.currentBandwidth}/100`);
    if (cognitiveLoad.currentBandwidth < 40) confidenceModifier -= 0.1;
  }

  return {
    factors,
    unknowns,
    confidenceModifier: Math.max(0.5, Math.round(confidenceModifier * 100) / 100),
  };
}