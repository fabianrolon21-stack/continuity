// ═══════════════════════════════════════════════
// INTERVENTION ENGINE (Package 50)
// Turns forecasts + correlations into actionable,
// personalized micro-interventions matched to the
// user's own data patterns.
//
// Deterministic — interventions are template-matched
// to observed data, not LLM-generated.
// Outcomes are tracked to calibrate future suggestions.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { generateForecast } from './forecastEngine';
import { computeCorrelations } from './correlationEngine';
import { computeEffectivenessScores, buildCalibrationContextString } from './outcomeCalibrationEngine';

// ── Intervention templates ──

const INTERVENTION_TEMPLATES = [
  {
    id: 'light_exposure',
    title: 'Morning Light Exposure',
    description: 'Get 10–15 minutes of natural light within an hour of waking. Light is the strongest signal for your circadian rhythm.',
    targetMetrics: ['mood', 'sleep_quality', 'energy'],
    effort: 'low',
    evidence: 'Light therapy is a first-line intervention for mood and circadian regulation.',
  },
  {
    id: 'wind_down_routine',
    title: 'Screen-Free Wind-Down',
    description: 'Set aside 30 minutes before bed without screens. Read, stretch, or write — your sleep data suggests this could help.',
    targetMetrics: ['sleep_quality', 'sleep_hours'],
    effort: 'medium',
    evidence: 'Blue light suppression and pre-sleep routines improve sleep onset and quality.',
  },
  {
    id: 'movement_snack',
    title: '5-Minute Movement',
    description: 'A brief walk or stretching session. Your data shows exercise correlates with better mood.',
    targetMetrics: ['mood', 'stress_level', 'energy'],
    effort: 'low',
    evidence: 'Even brief aerobic activity acutely improves mood and reduces stress.',
  },
  {
    id: 'breathing_protocol',
    title: 'Box Breathing (4-4-4-4)',
    description: 'Four counts in, hold four, out four, hold four. Two minutes. Useful when stress is elevated.',
    targetMetrics: ['stress_level'],
    effort: 'low',
    evidence: 'Slow breathing activates the parasympathetic response, reducing cortisol.',
  },
  {
    id: 'social_connection',
    title: 'Reach Out',
    description: 'Send a message to someone you care about. Your data shows social interaction patterns relate to your energy.',
    targetMetrics: ['energy', 'mood'],
    effort: 'low',
    evidence: 'Social connection is a strong predictor of subjective wellbeing.',
  },
  {
    id: 'hydration_check',
    title: 'Hydration Reset',
    description: 'Drink a full glass of water now. Your hydration tracking shows room for improvement.',
    targetMetrics: ['hydration_glasses', 'energy'],
    effort: 'low',
    evidence: 'Even mild dehydration affects cognitive performance and energy.',
  },
  {
    id: 'risk_window_prep',
    title: 'Prepare for a Risk Day',
    description: 'Your data shows a pattern of lower wellbeing on certain days. Plan something small and nourishing for then.',
    targetMetrics: ['mood', 'stress_level'],
    effort: 'medium',
    evidence: 'Anticipatory coping reduces the impact of recurring difficult periods.',
  },
  {
    id: 'focus_reset',
    title: 'Focus Reset',
    description: 'Try a 25-minute focused block with no distractions, then a 5-minute break. Your focus data suggests this could help.',
    targetMetrics: ['focus_level'],
    effort: 'medium',
    evidence: 'Time-boxed focus sessions (Pomodoro) reduce cognitive fatigue and improve sustained attention.',
  },
];

function buildSuggestion(template, triggerReason) {
  return {
    intervention_id: template.id,
    title: template.title,
    description: template.description,
    trigger_reason: triggerReason,
    target_metrics: template.targetMetrics,
    estimated_effort: template.effort,
    evidence_basis: template.evidence,
  };
}

function getTemplate(id) {
  return INTERVENTION_TEMPLATES.find(t => t.id === id);
}

// ── Main: generate interventions from data ──

export function generateInterventions(forecast, correlations, checkIns, rejectedIds = [], effectivenessScores = {}) {
  const suggestions = [];

  // 1. Trajectory-based interventions
  if (forecast?.sufficient) {
    if (forecast.trajectory === 'declining') {
      const decliningMetrics = Object.entries(forecast.projections)
        .filter(([_, v]) => v.projected !== null && v.change < 0)
        .map(([k]) => k);

      if (decliningMetrics.includes('mood') || decliningMetrics.includes('energy')) {
        suggestions.push(buildSuggestion(
          getTemplate('light_exposure'),
          `Your ${decliningMetrics.join(', ')} trend is declining over recent check-ins.`,
        ));
      }
      if (decliningMetrics.includes('focus_level')) {
        suggestions.push(buildSuggestion(
          getTemplate('focus_reset'),
          `Your focus level trend is declining.`,
        ));
      }
      if (decliningMetrics.includes('sleep_quality')) {
        suggestions.push(buildSuggestion(
          getTemplate('wind_down_routine'),
          `Your sleep quality trend is declining.`,
        ));
      }
    }

    // 2. Risk window preparation
    if (forecast.upcomingRisk?.length > 0) {
      suggestions.push(buildSuggestion(
        getTemplate('risk_window_prep'),
        `Risk window approaching: ${forecast.upcomingRisk.map(w => w.day).join(', ')}.`,
      ));
    }
  }

  // 3. Correlation-based interventions
  if (correlations?.sufficient) {
    for (const c of correlations.correlations) {
      if (c.metricA === 'exercise_duration_min' && c.direction === 'positive' && c.strength !== 'WEAK') {
        suggestions.push(buildSuggestion(
          getTemplate('movement_snack'),
          `Your data shows exercise correlates with ${c.labelB.toLowerCase()} (r=${c.correlation}).`,
        ));
      }
      if (c.metricA === 'social_interactions_count' && c.direction === 'positive' && c.strength !== 'WEAK') {
        suggestions.push(buildSuggestion(
          getTemplate('social_connection'),
          `Your data shows social interaction correlates with ${c.labelB.toLowerCase()} (r=${c.correlation}).`,
        ));
      }
    }
  }

  // 4. Current-state interventions (from latest check-in)
  if (checkIns?.length > 0) {
    const latest = checkIns[0];
    if (latest.stress_level >= 7) {
      suggestions.push(buildSuggestion(
        getTemplate('breathing_protocol'),
        `Your latest stress level is ${latest.stress_level}/10.`,
      ));
    }
    if (latest.hydration_glasses != null && latest.hydration_glasses < 4) {
      suggestions.push(buildSuggestion(
        getTemplate('hydration_check'),
        `You've logged ${latest.hydration_glasses} glasses of water recently.`,
      ));
    }
    if (latest.sleep_quality != null && latest.sleep_quality <= 4) {
      suggestions.push(buildSuggestion(
        getTemplate('wind_down_routine'),
        `Your last sleep quality was ${latest.sleep_quality}/10.`,
      ));
    }
  }

  // Deduplicate by intervention_id, then filter rejected
  const seen = new Set();
  const deduped = [];
  for (const s of suggestions) {
    if (seen.has(s.intervention_id)) continue;
    if (rejectedIds.includes(s.intervention_id)) continue;
    seen.add(s.intervention_id);
    deduped.push(s);
  }

  // Sort by effectiveness score — interventions that worked for this user come first
  deduped.sort((a, b) => {
    const sa = effectivenessScores[a.intervention_id]?.effectivenessScore ?? 50;
    const sb = effectivenessScores[b.intervention_id]?.effectivenessScore ?? 50;
    return sb - sa;
  });

  return {
    sufficient: deduped.length > 0,
    interventions: deduped.slice(0, 4),
    dataPoints: checkIns?.length || 0,
    effectivenessScores,
  };
}

// ── Pipeline context string ──

export function buildInterventionContextString(result) {
  if (!result?.sufficient || result.interventions.length === 0) return null;
  const parts = ['[WELLBEING INTERVENTIONS]'];
  parts.push(`Personalized micro-interventions matched to the user's own data patterns (${result.dataPoints} check-ins analyzed):`);
  parts.push('');
  for (const iv of result.interventions) {
    parts.push(`  • ${iv.title} [effort: ${iv.estimated_effort}] — ${iv.trigger_reason}`);
    parts.push(`    Targets: ${iv.target_metrics.join(', ')}.`);
  }
  parts.push('');
  parts.push('These are evidence-based suggestions, not prescriptions. Offer them naturally when relevant. The user decides. Never insist.');
  parts.push('[/WELLBEING INTERVENTIONS]\n');

  // Append calibration data if available
  if (result.effectivenessScores && Object.keys(result.effectivenessScores).length > 0) {
    parts.push(buildCalibrationContextString(result.effectivenessScores));
  }

  return parts.join('\n');
}

// ── Lazy loader for the pipeline ──

export async function loadInterventionContext() {
  try {
    const [checkIns, existing] = await Promise.all([
      base44.entities.CheckIn.list('-date', 60),
      base44.entities.WellbeingIntervention.list('-created_date', 50),
    ]);

    const rejectedIds = (existing || [])
      .filter(i => i.status === 'rejected')
      .map(i => i.intervention_id);

    const effectivenessScores = computeEffectivenessScores(existing || [], checkIns || []);
    const forecast = generateForecast(checkIns);
    const correlations = computeCorrelations(checkIns);
    return generateInterventions(forecast, correlations, checkIns, rejectedIds, effectivenessScores);
  } catch (e) {
    return null;
  }
}