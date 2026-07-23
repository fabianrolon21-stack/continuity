// Base 44.2 — Energy Budget
// Tracks recoverable resources: sleep, nutrition, exercise, stress, workload, recovery.
// Computes an energy budget score and trend (improving/stable/declining).
// Local-first. Never diagnoses.

export const ENERGY_TREND = {
  IMPROVING: 'IMPROVING',
  STABLE: 'STABLE',
  DECLINING: 'DECLINING',
  UNKNOWN: 'UNKNOWN',
};

const RESOURCE_WEIGHTS = {
  sleep: 0.30,
  nutrition: 0.15,
  exercise: 0.15,
  stress: 0.20,
  workload: 0.10,
  recovery: 0.10,
};

function normalize10(value) {
  if (value == null || isNaN(value)) return null;
  return Math.max(0, Math.min(100, (value / 10) * 100));
}

function normalizeSleep(hours) {
  if (hours == null || isNaN(hours)) return null;
  if (hours >= 7.5 && hours <= 9) return 100;
  if (hours >= 6.5) return 80;
  if (hours >= 5.5) return 60;
  if (hours >= 4) return 35;
  if (hours > 0) return 15;
  return 0;
}

function computeTrend(checkIns) {
  if (!checkIns || checkIns.length < 2) return ENERGY_TREND.UNKNOWN;
  const mid = Math.floor(checkIns.length / 2);
  const recent = checkIns.slice(0, mid);
  const older = checkIns.slice(mid);
  const avgEnergy = (arr) => {
    const vals = arr.filter(c => c.energy != null).map(c => c.energy);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const recentAvg = avgEnergy(recent);
  const olderAvg = avgEnergy(older);
  if (recentAvg == null || olderAvg == null) return ENERGY_TREND.UNKNOWN;
  const diff = recentAvg - olderAvg;
  if (diff > 0.8) return ENERGY_TREND.IMPROVING;
  if (diff < -0.8) return ENERGY_TREND.DECLINING;
  return ENERGY_TREND.STABLE;
}

export function computeEnergyBudget(checkIns = []) {
  if (!checkIns || checkIns.length === 0) {
    return { available: null, components: {}, trend: ENERGY_TREND.UNKNOWN };
  }
  const latest = checkIns[0];
  const resources = {
    sleep: normalizeSleep(latest.sleep_hours),
    nutrition: normalize10(latest.nutrition_quality),
    exercise: latest.exercise_duration_min > 0 ? Math.min(100, (latest.exercise_duration_min / 30) * 100) : 0,
    stress: normalize10(latest.stress_level != null ? 10 - latest.stress_level : null),
    workload: null,
    recovery: null,
  };
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, value] of Object.entries(resources)) {
    if (value != null) {
      weightedSum += value * RESOURCE_WEIGHTS[key];
      totalWeight += RESOURCE_WEIGHTS[key];
    }
  }
  const available = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  return { available, components: resources, trend: computeTrend(checkIns) };
}

export function buildEnergyBudgetContextString(budget) {
  if (!budget || budget.available == null) return '';
  const parts = ['[HUMAN ENERGY BUDGET]'];
  parts.push(`Available energy: ${budget.available}/100`);
  parts.push(`Trend: ${budget.trend}`);
  const c = budget.components || {};
  const comps = [];
  if (c.sleep != null) comps.push(`sleep ${Math.round(c.sleep)}`);
  if (c.nutrition != null) comps.push(`nutrition ${Math.round(c.nutrition)}`);
  if (c.exercise != null) comps.push(`exercise ${Math.round(c.exercise)}`);
  if (c.stress != null) comps.push(`stress resilience ${Math.round(c.stress)}`);
  if (comps.length > 0) parts.push(`Components: ${comps.join(', ')}`);
  parts.push('Guidance: Gauge whether the user has capacity for difficult decisions right now.');
  parts.push('[/HUMAN ENERGY BUDGET]\n');
  return parts.join('\n') + '\n';
}