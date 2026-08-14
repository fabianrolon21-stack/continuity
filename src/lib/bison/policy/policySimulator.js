// ═══════════════════════════════════════════════
// PACKAGE 49 — SYSTEM DYNAMICS SIMULATOR (§5, §6, §10, §12)
// Interacting subsystems stepped over time — not fixed
// deterministic lookups. Every forecast reports expected
// value, confidence interval, confidence rating, supporting
// evidence, and sensitivity. Projections are never certainty.
// ═══════════════════════════════════════════════

import { getFramework } from './frameworks';
import { evidenceFor } from './evidenceBase';

// Subsystems (§12): each starts at a neutral 50 and evolves under
// framework pressures, user assumptions, and cross-couplings.
const SUBSYSTEMS = ['public_health', 'healthcare', 'enforcement', 'economy', 'organized_crime', 'education', 'treatment', 'government', 'international'];

function step(state, pressures, a) {
  const n = { ...state };
  const norm = (v) => (v - 50) / 50; // assumption 0-100 → -1..1

  // Direct pressures + assumptions
  n.enforcement += pressures.enforcement * 1.2 + norm(a.enforcement_intensity) * 1.5;
  n.treatment += pressures.treatment * 1.2 + norm(a.treatment_capacity) * 1.5 + norm(a.funding_level) * 0.8;
  n.education += pressures.public_education * 1.0 + norm(a.public_education) * 1.5;
  n.healthcare += norm(a.healthcare_access) * 1.5 + norm(a.funding_level) * 0.5;
  n.international += norm(a.international_cooperation) * 1.5;
  n.government += pressures.revenue * 1.0 + norm(a.taxation) * pressures.market_regulation * 0.8;

  // Cross-couplings — each subsystem influences the others over time (§12)
  n.public_health += (state.treatment - 50) * 0.04 + (state.healthcare - 50) * 0.03 + (state.education - 50) * 0.02 - Math.max(0, state.organized_crime - 50) * 0.03;
  n.organized_crime += pressures.organized_crime * 1.2
    - pressures.market_regulation * norm(a.participation_rate) * 1.0
    - (state.international - 50) * 0.03
    + Math.max(0, (state.enforcement - 50)) * 0.01; // displacement, weakly (disputed evidence)
  n.economy += (state.government - 50) * 0.02 - Math.max(0, state.organized_crime - 50) * 0.02;
  n.government += (state.economy - 50) * 0.02 - (state.enforcement - 50) * 0.015; // enforcement is costly

  // Regulation quality gates legal-market benefits
  const regQuality = (norm(a.regulatory_compliance) + norm(a.inspection_quality)) / 2;
  n.public_health += pressures.market_regulation * (0.5 + regQuality) * 0.8;

  for (const k of SUBSYSTEMS) n[k] = Math.max(0, Math.min(100, n[k]));
  return n;
}

function runDynamics(frameworkId, assumptions, ticks = 40) {
  const pressures = getFramework(frameworkId).pressures;
  let state = SUBSYSTEMS.reduce((acc, k) => ({ ...acc, [k]: 50 }), {});
  for (let t = 0; t < ticks; t++) state = step(state, pressures, assumptions);
  return state;
}

// Output metrics (§6) derived from the final subsystem state,
// expressed as % change relative to the neutral baseline (50).
export const METRICS = [
  { id: 'overdose_change', label: 'Estimated Overdose Change', derive: s => -(s.public_health - 50) * 0.9, unit: '%', lowerIsBetter: true },
  { id: 'addiction_rate', label: 'Estimated Addiction Rate', derive: s => -(s.treatment - 50) * 0.5 - (s.education - 50) * 0.3, unit: '%', lowerIsBetter: true },
  { id: 'emergency_visits', label: 'Estimated Emergency Visits', derive: s => -(s.public_health - 50) * 0.6 - (s.healthcare - 50) * 0.3, unit: '%', lowerIsBetter: true },
  { id: 'healthcare_costs', label: 'Healthcare Costs', derive: s => -(s.treatment - 50) * 0.4 - (s.public_health - 50) * 0.4, unit: '%', lowerIsBetter: true },
  { id: 'government_revenue', label: 'Government Revenue', derive: s => (s.government - 50) * 0.9, unit: '%', lowerIsBetter: false },
  { id: 'enforcement_costs', label: 'Enforcement Costs', derive: s => (s.enforcement - 50) * 0.9, unit: '%', lowerIsBetter: true },
  { id: 'organized_crime', label: 'Organized Crime Influence', derive: s => (s.organized_crime - 50) * 0.9, unit: '%', lowerIsBetter: true },
  { id: 'crime_indicators', label: 'Crime Indicators', derive: s => (s.organized_crime - 50) * 0.5 - (s.economy - 50) * 0.3, unit: '%', lowerIsBetter: true },
  { id: 'youth_exposure', label: 'Youth Exposure', derive: s => -(s.education - 50) * 0.6 + Math.max(0, s.economy - 55) * 0.2, unit: '%', lowerIsBetter: true },
  { id: 'social_equity', label: 'Social Equity', derive: s => -(s.enforcement - 50) * 0.5 + (s.healthcare - 50) * 0.3, unit: 'index', lowerIsBetter: false },
  { id: 'public_trust', label: 'Public Trust', derive: s => (s.public_health - 50) * 0.3 + (s.government - 50) * 0.2 + (s.education - 50) * 0.2, unit: 'index', lowerIsBetter: false },
];

// Confidence narrows with evidence quality and widens the further
// assumptions sit from documented defaults (§5).
function uncertainty(metricId, assumptions) {
  const ev = evidenceFor(metricId);
  const quality = ev.length ? ev.filter(e => e.quality === 'A').length / ev.length : 0;
  const extremity = Object.values(assumptions).reduce((s, v) => s + Math.abs(v - 50), 0) / (Object.keys(assumptions).length * 50);
  const width = 8 + (1 - quality) * 10 + extremity * 12;
  const rating = ev.length === 0 ? 'LOW' : quality >= 0.5 && extremity < 0.4 ? 'MEDIUM' : quality >= 0.3 ? 'LOW-MEDIUM' : 'LOW';
  return { width, rating, disputed: ev.some(e => e.disputed) };
}

// Sensitivity analysis (§10): perturb each assumption and measure
// how much each metric actually moves — genuine, not narrated.
function sensitivity(frameworkId, assumptions, metric) {
  const baseline = metric.derive(runDynamics(frameworkId, assumptions));
  const impacts = [];
  for (const key of Object.keys(assumptions)) {
    const up = metric.derive(runDynamics(frameworkId, { ...assumptions, [key]: Math.min(100, assumptions[key] + 15) }));
    impacts.push({ assumption: key, impact: Math.abs(up - baseline), direction: up > baseline ? 'raises' : 'lowers' });
  }
  return impacts.sort((x, y) => y.impact - x.impact).slice(0, 3);
}

/**
 * Run a full policy simulation. Output is ALWAYS labeled a simulation.
 */
export function simulatePolicy(frameworkId, assumptions) {
  const state = runDynamics(frameworkId, assumptions);
  const results = METRICS.map(m => {
    const expected = m.derive(state);
    const u = uncertainty(m.id, assumptions);
    return {
      id: m.id,
      label: m.label,
      unit: m.unit,
      lowerIsBetter: m.lowerIsBetter,
      expected: Math.round(expected * 10) / 10,
      interval: [Math.round((expected - u.width) * 10) / 10, Math.round((expected + u.width) * 10) / 10],
      confidence: u.rating,
      disputedEvidence: u.disputed,
      evidence: evidenceFor(m.id).map(e => e.id),
      drivers: sensitivity(frameworkId, assumptions, m),
    };
  });
  return {
    simulation_type: 'POLICY SIMULATION — not a prediction, not advice, not advocacy',
    framework: frameworkId,
    assumptions: { ...assumptions },
    subsystems: state,
    results,
    limitations: [
      'A simplified system-dynamics model, not a validated epidemiological forecast.',
      'Evidence base is small and partly generalized from analogous substances.',
      'Real-world outcomes depend heavily on implementation quality and local context.',
      'All values are relative changes against a neutral baseline, not absolute counts.',
    ],
    generated_at: new Date().toISOString(),
  };
}