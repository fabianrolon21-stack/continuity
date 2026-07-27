// ═══════════════════════════════════════════════
// OUTCOME CALIBRATION ENGINE (Package 51)
// Closed-loop learning: measures whether accepted
// interventions actually improved their target
// metrics, then feeds effectiveness scores back
// into the intervention engine to prioritize what
// works for THIS user.
//
// Deterministic — compares check-in averages before
// vs. after each accepted intervention.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// Metrics where higher values = better wellbeing
const HIGHER_IS_BETTER = new Set([
  'mood', 'energy', 'sleep_quality', 'nutrition_quality', 'focus_level',
  'hydration_glasses', 'exercise_duration_min', 'social_interactions_count',
  'steps', 'sleep_hours',
]);

// Metrics where lower values = better wellbeing
const LOWER_IS_BETTER = new Set(['stress_level']);

function isHigherBetter(metric) {
  return HIGHER_IS_BETTER.has(metric);
}

function avg(values) {
  const valid = values.filter(v => v != null && !isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

// ── Per-intervention outcome measurement ──

export function measureInterventionOutcome(intervention, checkIns) {
  if (intervention.status !== 'accepted') return null;

  const acceptedDate = new Date(intervention.updated_date || intervention.created_date);
  if (isNaN(acceptedDate.getTime())) return { measurable: false };

  const sorted = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
  const before = sorted.filter(c => new Date(c.date) < acceptedDate).slice(0, 7);
  const after = sorted.filter(c => new Date(c.date) >= acceptedDate).slice(0, 7);

  if (before.length < 2 || after.length < 2) return { measurable: false, reason: 'insufficient_data' };

  const metrics = intervention.target_metrics || [];
  if (metrics.length === 0) return { measurable: false, reason: 'no_target_metrics' };

  let totalImprovement = 0;
  let metricCount = 0;
  const details = [];

  for (const metric of metrics) {
    const beforeVals = before.map(c => c[metric]).filter(v => v != null);
    const afterVals = after.map(c => c[metric]).filter(v => v != null);

    if (beforeVals.length < 2 || afterVals.length < 2) continue;

    const beforeAvg = avg(beforeVals);
    const afterAvg = avg(afterVals);

    const rawDelta = afterAvg - beforeAvg;
    const improvement = isHigherBetter(metric) ? rawDelta : -rawDelta;

    totalImprovement += improvement;
    metricCount++;
    details.push({ metric, beforeAvg, afterAvg, improvement, direction: improvement > 0.3 ? 'improved' : improvement < -0.3 ? 'worsened' : 'stable' });
  }

  if (metricCount === 0) return { measurable: false, reason: 'no_target_data' };

  const avgImprovement = totalImprovement / metricCount;
  const direction = avgImprovement > 0.5 ? 'improved' : avgImprovement < -0.5 ? 'worsened' : 'stable';

  // Score: 50 baseline + improvement scaled, clamped 0–100
  const score = Math.max(0, Math.min(100, Math.round(50 + avgImprovement * 10)));

  return { measurable: true, direction, avgImprovement, score, details, beforeCount: before.length, afterCount: after.length };
}

// ── Aggregate effectiveness per intervention type ──

export function computeEffectivenessScores(interventions, checkIns) {
  const scores = {};

  for (const iv of interventions) {
    if (iv.status !== 'accepted') continue;
    const outcome = measureInterventionOutcome(iv, checkIns);
    if (!outcome?.measurable) continue;

    if (!scores[iv.intervention_id]) {
      scores[iv.intervention_id] = { total: 0, count: 0, improvements: [] };
    }
    scores[iv.intervention_id].total += outcome.score;
    scores[iv.intervention_id].count += 1;
    scores[iv.intervention_id].improvements.push(outcome.avgImprovement);
  }

  const result = {};
  for (const [id, data] of Object.entries(scores)) {
    const avgImprovement = data.improvements.reduce((a, b) => a + b, 0) / data.count;
    result[id] = {
      effectivenessScore: Math.round(data.total / data.count),
      sampleCount: data.count,
      avgImprovement,
      verdict: avgImprovement > 0.5 ? 'effective' : avgImprovement < -0.5 ? 'ineffective' : 'neutral',
    };
  }
  return result;
}

// ── Context string for pipeline ──

export function buildCalibrationContextString(scores) {
  if (!scores || Object.keys(scores).length === 0) return null;
  const parts = ['[INTERVENTION EFFECTIVENESS — calibrated from your outcomes]'];
  parts.push('Measured by comparing your check-in averages before vs. after you accepted each intervention:');
  parts.push('');
  for (const [id, data] of Object.entries(scores)) {
    const label = id.replace(/_/g, ' ');
    parts.push(`  • ${label}: ${data.effectivenessScore}/100 (${data.verdict}, ${data.sampleCount} sample${data.sampleCount > 1 ? 's' : ''}, avg change: ${data.avgImprovement >= 0 ? '+' : ''}${data.avgImprovement.toFixed(1)})`);
  }
  parts.push('');
  parts.push('Prioritize interventions that scored well for THIS user. Never present effectiveness as a guarantee — it is an observed pattern, not a prediction.');
  parts.push('[/INTERVENTION EFFECTIVENESS]\n');
  return parts.join('\n');
}

// ── Lazy loader ──

export async function loadCalibrationContext() {
  try {
    const [checkIns, interventions] = await Promise.all([
      base44.entities.CheckIn.list('-date', 60),
      base44.entities.WellbeingIntervention.list('-created_date', 50),
    ]);
    return computeEffectivenessScores(interventions || [], checkIns || []);
  } catch (e) {
    return null;
  }
}