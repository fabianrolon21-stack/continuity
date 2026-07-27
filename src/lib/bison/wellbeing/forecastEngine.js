// ═══════════════════════════════════════════════
// FORECAST ENGINE (Package 48.3)
// Data-driven forecasts using trend extrapolation.
// Deterministic — no LLM. Confidence is derived from
// data quantity and regression fit (r²), not guessed.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { analyzeTrends, buildTrendContextString } from './trendAnalyzer';
import { detectRiskWindows, buildRiskWindowContextString, getUpcomingRiskWindows } from './riskWindowDetector';

const MIN_DATA_POINTS = 3;
const FORECAST_HORIZON_DAYS = 3;

// Generate a data-driven forecast by extrapolating trends.
export function generateForecast(checkIns) {
  const data = (checkIns || []).filter(c => c.date);
  if (data.length < MIN_DATA_POINTS) {
    return { sufficient: false, reason: `Need at least ${MIN_DATA_POINTS} check-ins for forecasting (have ${data.length}).` };
  }

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const trends = analyzeTrends(sorted);
  const riskWindows = detectRiskWindows(sorted);

  // Project each metric forward using the regression slope
  const projections = {};
  for (const [metric, analysis] of Object.entries(trends)) {
    if (analysis.direction === 'no_data' || analysis.sampleCount < MIN_DATA_POINTS) {
      projections[metric] = { projected: null, confidence: 'LOW' };
      continue;
    }
    // Extrapolate: latest value + slope * horizon
    const projected = Math.max(1, Math.min(10, analysis.latest + analysis.slope * FORECAST_HORIZON_DAYS));
    const confidence = analysis.reliability > 0.4 ? 'HIGH' : analysis.reliability > 0.2 ? 'MEDIUM' : 'LOW';
    projections[metric] = {
      projected: Math.round(projected * 10) / 10,
      current: analysis.latest,
      change: Math.round((projected - analysis.latest) * 10) / 10,
      confidence,
      direction: analysis.direction,
    };
  }

  // Overall wellbeing trajectory
  const moodTrend = trends.mood;
  const energyTrend = trends.energy;
  const stressTrend = trends.stress_level;
  let trajectory = 'stable';
  if (moodTrend.direction === 'improving' || energyTrend.direction === 'improving') trajectory = 'improving';
  else if (moodTrend.direction === 'declining' || energyTrend.direction === 'declining') trajectory = 'declining';

  const upcomingRisk = getUpcomingRiskWindows(riskWindows);

  return {
    sufficient: true,
    projections,
    trajectory,
    riskWindows,
    upcomingRisk,
    dataPoints: data.length,
    trendContext: buildTrendContextString(trends),
    riskWindowContext: buildRiskWindowContextString(riskWindows),
  };
}

// High-level: load check-ins, generate forecast, return context string for pipeline.
// Lazy-loaded by the pipeline's context planner.
export async function loadWellbeingForecast() {
  try {
    const checkIns = await base44.entities.CheckIn.list('-date', 30);
    return generateForecast(checkIns);
  } catch (e) {
    return null;
  }
}

export function buildWellbeingForecastContextString(forecast) {
  if (!forecast || !forecast.sufficient) return null;
  const parts = ['[WELLBEING FORECAST]'];
  parts.push(`Trajectory: ${forecast.trajectory}. Based on ${forecast.dataPoints} recent check-ins using linear regression extrapolation.`);

  const sig = Object.entries(forecast.projections)
    .filter(([_, v]) => v.projected !== null && v.confidence !== 'LOW');
  if (sig.length > 0) {
    parts.push('Projections (3-day extrapolation):');
    for (const [metric, v] of sig) {
      const label = metric.replace(/_/g, ' ');
      parts.push(`  ${label}: ${v.current} → ${v.projected} (${v.change > 0 ? '+' : ''}${v.change}, ${v.confidence} confidence)`);
    }
  }

  if (forecast.upcomingRisk?.length > 0) {
    parts.push(`Risk windows approaching: ${forecast.upcomingRisk.map(w => w.day).join(', ')}.`);
  }

  parts.push('These are mathematical extrapolations, not certainties. Reference only when relevant. Never alarm the user.');
  parts.push('[/WELLBEING FORECAST]\n');
  return parts.join('\n');
}