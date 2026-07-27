// ═══════════════════════════════════════════════
// WELLBEING NARRATIVE ENGINE (Package 52)
// Synthesizes forecast, correlations, intervention
// outcomes, and risk windows into a coherent weekly
// narrative with a composite resilience score.
//
// Deterministic — assembles templated segments from
// actual data. Not LLM-generated.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { generateForecast } from './forecastEngine';
import { computeCorrelations } from './correlationEngine';
import { computeEffectivenessScores } from './outcomeCalibrationEngine';

const METRIC_LABELS = {
  mood: 'Mood',
  energy: 'Energy',
  sleep_hours: 'Sleep Hours',
  sleep_quality: 'Sleep Quality',
  stress_level: 'Stress Level',
  exercise_duration_min: 'Exercise',
  social_interactions_count: 'Social Interaction',
  nutrition_quality: 'Nutrition',
  hydration_glasses: 'Hydration',
  focus_level: 'Focus',
  steps: 'Steps',
};

function label(metric) {
  return METRIC_LABELS[metric] || metric.replace(/_/g, ' ');
}

function fmt(n, decimals = 1) {
  if (n == null || isNaN(n)) return 'N/A';
  return Number(n).toFixed(decimals);
}

// ── Resilience score — composite indicator ──

export function computeResilienceScore(forecast, correlations, effectivenessScores) {
  let score = 50;

  if (forecast?.sufficient) {
    if (forecast.trajectory === 'improving') score += 15;
    else if (forecast.trajectory === 'declining') score -= 15;

    const riskCount = forecast.upcomingRisk?.length || 0;
    if (riskCount === 0) score += 10;
    else if (riskCount > 1) score -= 10;
  }

  const effectiveCount = Object.values(effectivenessScores || {})
    .filter(s => s.verdict === 'effective').length;
  score += Math.min(effectiveCount * 5, 15);

  if (correlations?.sufficient) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function resilienceVerdict(score) {
  if (score >= 75) return { label: 'Thriving', color: 'hsl(120 40% 58%)' };
  if (score >= 55) return { label: 'Stable', color: 'hsl(42 63% 55%)' };
  if (score >= 35) return { label: 'Strained', color: 'hsl(21 73% 69%)' };
  return { label: 'Depleted', color: 'hsl(0 70% 50%)' };
}

// ── Suggested focus ──

function determineFocus(declining, correlations, effectivenessScores) {
  // Priority 1: declining metric with an effective intervention
  for (const d of declining) {
    const effective = Object.entries(effectivenessScores || {})
      .find(([id, s]) => s.verdict === 'effective');
    if (effective) {
      return `Your ${label(d.metric)} has been declining, and you have an intervention that's working — consider leaning into it.`;
    }
  }

  // Priority 2: declining metric
  if (declining.length > 0) {
    const top = declining.sort((a, b) => a.change - b.change)[0];
    return `Your ${label(top.metric)} has been trending down. Small, consistent adjustments here could have an outsized effect.`;
  }

  // Priority 3: strong correlation to leverage
  const strong = (correlations?.correlations || []).filter(c => c.strength !== 'WEAK');
  if (strong.length > 0) {
    const c = strong[0];
    return `Your data shows ${label(c.metricA).toLowerCase()} correlates with ${label(c.metricB).toLowerCase()}. This is a lever you can pull.`;
  }

  // Priority 4: maintenance
  return `Your wellbeing patterns are stable. Keep logging check-ins — the more data, the sharper the insights.`;
}

// ── Main: generate narrative ──

export function generateWellbeingNarrative(checkIns, forecast, correlations, interventions, effectivenessScores) {
  const sections = [];

  // Overview
  const trajectory = forecast?.sufficient ? forecast.trajectory : 'stable';
  const resilience = computeResilienceScore(forecast, correlations, effectivenessScores);
  const verdict = resilienceVerdict(resilience);

  sections.push({
    type: 'overview',
    trajectory,
    resilienceScore: resilience,
    resilienceLabel: verdict.label,
    resilienceColor: verdict.color,
    text: `Over your recent ${checkIns?.length || 0} check-ins, your overall trajectory is ${trajectory}. Resilience score: ${resilience}/100 (${verdict.label}).`,
  });

  // What improved
  const improving = Object.entries(forecast?.projections || {})
    .filter(([_, v]) => v.projected !== null && v.change > 0.5)
    .map(([k, v]) => ({ metric: k, change: v.change }));
  if (improving.length > 0) {
    const parts = improving.map(i => `${label(i.metric)} (+${fmt(i.change)})`).join(', ');
    sections.push({
      type: 'improving',
      metrics: improving,
      text: `Trending up: ${parts}.`,
    });
  }

  // What declined
  const declining = Object.entries(forecast?.projections || {})
    .filter(([_, v]) => v.projected !== null && v.change < -0.5)
    .map(([k, v]) => ({ metric: k, change: v.change }));
  if (declining.length > 0) {
    const parts = declining.map(d => `${label(d.metric)} (${fmt(d.change)})`).join(', ');
    sections.push({
      type: 'declining',
      metrics: declining,
      text: `Trending down: ${parts}.`,
    });
  }

  // Patterns found
  if (correlations?.sufficient) {
    const strong = correlations.correlations.filter(c => c.strength !== 'WEAK');
    if (strong.length > 0) {
      const parts = strong.slice(0, 3).map(c =>
        `${label(c.metricA).toLowerCase()} → ${label(c.metricB).toLowerCase()} (r=${fmt(c.correlation, 2)})`
      ).join('; ');
      sections.push({
        type: 'patterns',
        correlations: strong,
        text: `Significant patterns detected: ${parts}.`,
      });
    }
  }

  // What worked
  const effective = Object.entries(effectivenessScores || {})
    .filter(([_, s]) => s.verdict === 'effective')
    .map(([id, s]) => ({ id, ...s }));
  if (effective.length > 0) {
    const parts = effective.map(e => `${e.id.replace(/_/g, ' ')} (${e.effectivenessScore}/100)`).join(', ');
    sections.push({
      type: 'effective',
      interventions: effective,
      text: `Interventions working for you: ${parts}.`,
    });
  }

  // Watch for
  if (forecast?.upcomingRisk?.length > 0) {
    const days = forecast.upcomingRisk.map(w => w.day).join(', ');
    sections.push({
      type: 'risk',
      windows: forecast.upcomingRisk,
      text: `Risk windows approaching: ${days}. Consider planning something nourishing for those days.`,
    });
  }

  // Suggested focus
  sections.push({
    type: 'focus',
    text: determineFocus(declining, correlations, effectivenessScores),
  });

  return {
    sufficient: sections.length > 2,
    sections,
    trajectory,
    resilienceScore: resilience,
    resilienceLabel: verdict.label,
    resilienceColor: verdict.color,
    generatedAt: new Date().toISOString(),
    dataPoints: checkIns?.length || 0,
  };
}

// ── Pipeline context string ──

export function buildNarrativeContextString(result) {
  if (!result?.sufficient) return null;
  const parts = ['[WELLBEING NARRATIVE — weekly synthesis]'];
  for (const s of result.sections) {
    parts.push(`  ${s.text}`);
  }
  parts.push('');
  parts.push('This is a data-driven synthesis, not a prediction. Reference it naturally when relevant. Never present the resilience score as a medical or diagnostic metric.');
  parts.push('[/WELLBEING NARRATIVE]\n');
  return parts.join('\n');
}

// ── Lazy loader ──

export async function loadNarrativeContext() {
  try {
    const [checkIns, interventions] = await Promise.all([
      base44.entities.CheckIn.list('-date', 30),
      base44.entities.WellbeingIntervention.list('-created_date', 50),
    ]);
    const forecast = generateForecast(checkIns);
    const correlations = computeCorrelations(checkIns);
    const effectivenessScores = computeEffectivenessScores(interventions || [], checkIns || []);
    return generateWellbeingNarrative(checkIns, forecast, correlations, interventions, effectivenessScores);
  } catch (e) {
    return null;
  }
}