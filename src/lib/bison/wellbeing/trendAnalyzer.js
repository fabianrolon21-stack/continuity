// ═══════════════════════════════════════════════
// TREND ANALYZER (Package 48.1)
// Deterministic, mathematical trend detection over
// CheckIn data. No LLM — every value is computed from
// actual recorded data using linear regression.
// ═══════════════════════════════════════════════

const METRICS = ['mood', 'energy', 'sleep_quality', 'stress_level', 'focus_level', 'nutrition_quality'];

// Simple linear regression: returns slope, intercept, r²
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const xs = points.map((_, i) => i);
  const ys = points.map(p => p.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  // R²
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * xs[i] + intercept;
    ssTot += (ys[i] - yMean) ** 2;
    ssRes += (ys[i] - predicted) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

function describeTrend(slope, r2, sampleCount) {
  const confidence = sampleCount < 5 ? 'LOW' : sampleCount < 10 ? 'MEDIUM' : 'HIGH';
  const strength = Math.min(1, Math.abs(slope) * 5); // normalize slope to 0-1
  const reliability = r2 * (sampleCount >= 5 ? 1 : 0.5);

  let direction;
  if (Math.abs(slope) < 0.1 || reliability < 0.15) direction = 'stable';
  else if (slope > 0) direction = 'improving';
  else direction = 'declining';

  return { direction, confidence, strength: Math.round(strength * 100) / 100, reliability: Math.round(reliability * 100) / 100 };
}

// Analyze all metrics across recent check-ins.
// Returns { metric: { direction, slope, r2, average, sampleCount, ... } }
export function analyzeTrends(checkIns) {
  const sorted = [...(checkIns || [])]
    .filter(c => c.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const results = {};
  for (const metric of METRICS) {
    const points = sorted
      .map(c => ({ value: c[metric], date: c.date }))
      .filter(p => typeof p.value === 'number' && !isNaN(p.value));

    if (points.length === 0) {
      results[metric] = { direction: 'no_data', sampleCount: 0 };
      continue;
    }

    const regression = linearRegression(points);
    const average = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    const variance = points.reduce((sum, p) => sum + (p.value - average) ** 2, 0) / points.length;
    const trend = describeTrend(regression.slope, regression.r2, points.length);

    // For stress_level, "improving" means going DOWN (lower stress is better)
    let adjustedDirection = trend.direction;
    if (metric === 'stress_level' && trend.direction !== 'stable' && trend.direction !== 'no_data') {
      adjustedDirection = trend.direction === 'improving' ? 'declining' : 'improving';
    }

    results[metric] = {
      ...trend,
      direction: adjustedDirection,
      slope: Math.round(regression.slope * 1000) / 1000,
      r2: Math.round(regression.r2 * 100) / 100,
      average: Math.round(average * 10) / 10,
      variance: Math.round(variance * 100) / 100,
      sampleCount: points.length,
      latest: points[points.length - 1].value,
      // For stress, the raw slope direction matters — store it separately
      rawDirection: trend.direction,
    };
  }
  return results;
}

// Build a compact context string for the pipeline.
export function buildTrendContextString(trendAnalysis) {
  if (!trendAnalysis) return null;
  const parts = ['[WELLBEING TREND ANALYSIS]'];
  parts.push('These trends are computed from recorded check-in data using linear regression. They are OBSERVATIONS about the user\'s own data, not diagnoses. Reference them naturally only when relevant.');

  const significant = Object.entries(trendAnalysis)
    .filter(([_, v]) => v.direction !== 'no_data' && v.direction !== 'stable' && v.reliability > 0.2);

  if (significant.length === 0) {
    parts.push('No significant trends detected in recent wellbeing data.');
  } else {
    for (const [metric, v] of significant) {
      const label = metric.replace(/_/g, ' ');
      const change = v.rawDirection === 'improving' ? 'trending upward' : 'trending downward';
      parts.push(`  ${label}: ${v.average}/10 avg, ${change} (slope=${v.slope}, r²=${v.r2}, n=${v.sampleCount}). Latest: ${v.latest}/10.`);
    }
  }

  parts.push('[/WELLBEING TREND ANALYSIS]\n');
  return parts.join('\n');
}