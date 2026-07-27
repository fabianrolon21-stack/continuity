// ═══════════════════════════════════════════════
// CORRELATION ENGINE (Package 49)
// Discovers pairwise statistical correlations between
// wellbeing metrics using Pearson correlation.
// Supports lagged analysis (yesterday's X → today's Y).
// Deterministic — no LLM. All values computed from data.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const METRICS = [
  'mood', 'energy', 'sleep_hours', 'sleep_quality', 'stress_level',
  'exercise_duration_min', 'social_interactions_count', 'nutrition_quality',
  'hydration_glasses', 'focus_level', 'steps',
];

export const METRIC_LABELS = {
  mood: 'Mood',
  energy: 'Energy',
  sleep_hours: 'Sleep Hours',
  sleep_quality: 'Sleep Quality',
  stress_level: 'Stress',
  exercise_duration_min: 'Exercise',
  social_interactions_count: 'Social Interactions',
  nutrition_quality: 'Nutrition',
  hydration_glasses: 'Hydration',
  focus_level: 'Focus',
  steps: 'Steps',
};

const MIN_PAIRS = 3;
const MIN_ABS_R = 0.3;

// ── Pearson correlation coefficient ──

function pearson(xs, ys) {
  const n = xs.length;
  if (n < MIN_PAIRS) return null;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  if (den === 0) return null;
  return num / den;
}

function strengthLabel(r) {
  const abs = Math.abs(r);
  if (abs >= 0.6) return 'STRONG';
  if (abs >= 0.3) return 'MODERATE';
  return 'WEAK';
}

// ── Lagged pairing: pair metricA at t-lag with metricB at t ──

function buildLaggedPairs(sorted, metricA, metricB, lag) {
  const pairs = [];
  for (let i = lag; i < sorted.length; i++) {
    const aVal = sorted[i - lag]?.[metricA];
    const bVal = sorted[i]?.[metricB];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      pairs.push([aVal, bVal]);
    }
  }
  return pairs;
}

function tryCorrelation(sorted, metricA, metricB, lag) {
  const pairs = buildLaggedPairs(sorted, metricA, metricB, lag);
  if (pairs.length < MIN_PAIRS) return null;
  const xs = pairs.map(p => p[0]);
  const ys = pairs.map(p => p[1]);
  const r = pearson(xs, ys);
  if (r == null || Math.abs(r) < MIN_ABS_R) return null;
  return {
    metricA,
    metricB,
    labelA: METRIC_LABELS[metricA] || metricA,
    labelB: METRIC_LABELS[metricB] || metricB,
    correlation: Math.round(r * 100) / 100,
    strength: strengthLabel(r),
    direction: r > 0 ? 'positive' : 'negative',
    lag,
    sampleSize: pairs.length,
  };
}

// ── Main: compute all significant correlations ──

export function computeCorrelations(checkIns) {
  const data = (checkIns || []).filter(c => c.date);
  if (data.length < 4) {
    return { sufficient: false, reason: `Need at least 4 check-ins for pattern analysis (have ${data.length}).`, correlations: [] };
  }

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const correlations = [];

  // Same-day correlations (Pearson is symmetric — compute each unordered pair once)
  for (let i = 0; i < METRICS.length; i++) {
    for (let j = i + 1; j < METRICS.length; j++) {
      const result = tryCorrelation(sorted, METRICS[i], METRICS[j], 0);
      if (result) correlations.push(result);
    }
  }

  // Lag-1 correlations (ordered: yesterday's A → today's B — direction matters)
  for (const metricA of METRICS) {
    for (const metricB of METRICS) {
      if (metricA === metricB) continue;
      const result = tryCorrelation(sorted, metricA, metricB, 1);
      if (result) correlations.push(result);
    }
  }

  // Rank by absolute correlation strength
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return {
    sufficient: true,
    correlations: correlations.slice(0, 8),
    totalChecked: data.length,
  };
}

// ── Human-readable interpretation ──

export function describeCorrelation(c) {
  const lagPhrase = c.lag === 1
    ? `the day after higher ${c.labelA.toLowerCase()}`
    : `when your ${c.labelA.toLowerCase()} is higher`;
  const effectPhrase = c.direction === 'positive'
    ? `tends to be higher`
    : `tends to be lower`;
  return `Your ${c.labelB.toLowerCase()} ${effectPhrase} ${lagPhrase}.`;
}

// ── Pipeline context string ──

export function buildCorrelationContextString(result) {
  if (!result?.sufficient || result.correlations.length === 0) return null;
  const parts = ['[WELLBEING PATTERN CORRELATIONS]'];
  parts.push(`Statistical correlations from ${result.totalChecked} check-ins (Pearson r). These are OBSERVATIONS about patterns, NOT causal claims.`);
  parts.push('');
  for (const c of result.correlations.slice(0, 5)) {
    const lag = c.lag === 1 ? ' [lag-1: previous day → current day]' : '';
    parts.push(`  ${c.labelA} ↔ ${c.labelB}${lag}: r=${c.correlation} (${c.strength}, ${c.direction}). n=${c.sampleSize}.`);
  }
  parts.push('');
  parts.push('Correlation ≠ causation. Present as observed patterns; invite reflection. Never assert causality.');
  parts.push('[/WELLBEING PATTERN CORRELATIONS]\n');
  return parts.join('\n');
}

// ── Lazy loader for the pipeline ──

export async function loadCorrelations() {
  try {
    const checkIns = await base44.entities.CheckIn.list('-date', 30);
    return computeCorrelations(checkIns);
  } catch (e) {
    return null;
  }
}