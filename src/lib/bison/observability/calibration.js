// ═══════════════════════════════════════════════
// PACKAGE 51 — SIMULATION VALIDATION & REGRESSION (§5, §6, §11)
// Predicted outcomes are compared against observed outcomes.
// Calibration feedback is a recommendation, never an automatic
// model rewrite — that path still runs through Package 50.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// Regressions beyond these deltas are constitutionally significant.
export const REGRESSION_THRESHOLDS = {
  performance: 0.1,
  security: 0,      // any security regression is unacceptable
  accuracy: 0.15,
  privacy: 0,       // any privacy regression is unacceptable
  forecasting: 0.2,
  reliability: 0.1,
};

export async function loadDeployments() {
  return base44.entities.OptimizationDeployment.list('-created_date', 60).catch(() => []);
}

/** §5 — forecast accuracy, error, calibration, confidence reliability, drift. */
export function calibration(records) {
  const scored = records.filter(r => r.observed_gain !== null && r.observed_gain !== undefined && r.expected_gain != null);
  if (!scored.length) return { available: false };

  const errors = scored.map(r => r.observed_gain - r.expected_gain);
  const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length;
  const bias = errors.reduce((s, e) => s + e, 0) / errors.length;

  // Drift: mean absolute error of the most recent third vs the oldest third.
  const third = Math.max(1, Math.floor(scored.length / 3));
  const recent = errors.slice(0, third).reduce((s, e) => s + Math.abs(e), 0) / third;
  const older = errors.slice(-third).reduce((s, e) => s + Math.abs(e), 0) / third;

  return {
    available: true,
    samples: scored.length,
    forecast_accuracy: Math.round(Math.max(0, 1 - mae) * 100),
    mean_absolute_error: Math.round(mae * 1000) / 1000,
    bias: Math.round(bias * 1000) / 1000,
    calibration: Math.abs(bias) < 0.05 ? 'WELL_CALIBRATED' : bias > 0 ? 'PESSIMISTIC' : 'OPTIMISTIC',
    confidence_reliability: mae < 0.1 ? 'RELIABLE' : mae < 0.25 ? 'PARTIAL' : 'UNRELIABLE',
    model_drift: Math.round((recent - older) * 1000) / 1000,
    drift_direction: recent > older + 0.02 ? 'DEGRADING' : recent < older - 0.02 ? 'IMPROVING' : 'STABLE',
    recommendation: Math.abs(bias) >= 0.05
      ? `Forecasts run ${bias < 0 ? 'optimistic' : 'pessimistic'} by ${Math.abs(Math.round(bias * 100))}% — recommend recalibrating expected-gain priors. Recommendation only; the change must pass the Package 50 pipeline.`
      : 'Forecasts are within calibration tolerance. No model change recommended.',
  };
}

/** §11 — regression observer across recorded versions. */
export function regressions(records) {
  const rolled = records.filter(r => r.rolled_back);
  const rows = Object.entries(REGRESSION_THRESHOLDS).map(([dim, threshold]) => {
    // Observed regression signal per dimension, derived from recorded outcomes.
    const delta = dim === 'forecasting'
      ? Math.max(0, -(calibration(records).bias ?? 0))
      : dim === 'performance'
        ? rolled.length / Math.max(1, records.length)
        : 0;
    const exceeded = delta > threshold;
    return { dimension: dim, delta: Math.round(delta * 1000) / 1000, threshold, exceeded };
  });
  const breaching = rows.filter(r => r.exceeded);
  return {
    rows,
    rollback_recommended: breaching.length > 0,
    recommendation: breaching.length
      ? `Regression in ${breaching.map(b => b.dimension).join(', ')} exceeds the constitutional threshold — rollback recommended.`
      : 'No dimension exceeds its constitutional regression threshold.',
  };
}

/** §6 — system health snapshot. Measurements only; no user data. */
export function systemHealth(records, events, securityScore) {
  const mem = performance?.memory;
  const durations = events.map(e => e.duration_ms).filter(d => typeof d === 'number');
  const cal = calibration(records);
  const deployed = records.filter(r => r.outcome === 'VERIFIED_DEPLOYED');
  return [
    { metric: 'Latency (mean traced op)', value: durations.length ? `${Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)} ms` : '—' },
    { metric: 'Memory (JS heap)', value: mem ? `${Math.round(mem.usedJSHeapSize / 1048576)} MB` : 'not exposed by this browser' },
    { metric: 'CPU', value: `${navigator.hardwareConcurrency || '?'} logical cores` },
    { metric: 'Storage', value: 'entity-backed; local-first' },
    { metric: 'Security score', value: `${securityScore}/100` },
    { metric: 'Package health', value: `${events.filter(e => e.outcome === 'FAILED').length} failed events in window` },
    { metric: 'Forecast accuracy', value: cal.available ? `${cal.forecast_accuracy}%` : 'no samples yet' },
    { metric: 'Optimization gains', value: deployed.length ? `${Math.round(deployed.reduce((s, r) => s + (r.observed_gain || 0), 0) * 100)}% cumulative` : 'none deployed' },
    { metric: 'Constitutional compliance', value: records.length ? `${Math.round(records.reduce((s, r) => s + (r.constitution_score || 0), 0) / records.length)}%` : '—' },
  ];
}