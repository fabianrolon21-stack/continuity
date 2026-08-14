// ═══════════════════════════════════════════════
// PACKAGE 51 — DECISION REPLAY ENGINE (§4, §10)
// Every significant autonomous decision is recorded with
// enough structure to replay the reasoning afterward:
// inputs, constraints, assumptions, forecasts, the chosen
// branch, and — crucially — the branches that were rejected.
// ═══════════════════════════════════════════════

import { emit, constitutionalRecord } from './observabilityBus';

const MAX = 60;
let records = [];

/**
 * Record a decision from a Package 50 decision board + pipeline result.
 */
export function recordDecision({ proposal, board, trace, outcome, rejectedAlternatives = [] }) {
  const failedStages = trace.filter(t => !t.pass);
  const record = {
    id: `dr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    title: proposal.title,
    subsystem: proposal.domain || 'runtime',
    inputs: {
      expected_gain: proposal.expected_gain,
      scope: proposal.scope,
      reversible: proposal.reversible !== false,
      data_quality: board.forecast.data_quality,
      model_agreement: board.forecast.model_agreement,
    },
    constraints: {
      risk_ceilings: board.risk.ceilings,
      invariants_checked: board.invariants.checked,
      humanity_floor: 'no metric may decline',
    },
    assumptions: board.forecast.evidence,
    forecasts: board.forecast.horizons.map(h => ({ horizon: h.label, benefit: h.benefit, risk: h.risk, uncertainty: h.uncertainty })),
    chosen_branch: outcome,
    rejected_branches: [
      ...failedStages.map(s => ({ branch: `Proceed past ${s.stage}`, reason: s.detail })),
      ...rejectedAlternatives,
    ],
    risk_analysis: { overall: board.risk.overall, worst: `${board.risk.worst.label} ${board.risk.worst.score}` },
    uncertainties: board.forecast.horizons[board.forecast.horizons.length - 1].unknowns,
    participating_packages: [44, 46, 50, 51],
    constitutional: constitutionalRecord({
      rulesEvaluated: ['Package 44 sovereignty', 'Package 46 ethics', 'Constitutional invariants', 'Risk ceilings'],
      passed: trace.filter(t => t.pass).map(t => t.stage),
      failed: failedStages.map(t => t.stage),
      evidence: board.forecast.evidence,
      confidence: board.forecast.horizons[0].confidence,
    }),
    outcome,
  };

  records = [record, ...records].slice(0, MAX);
  emit({
    subsystem: 'soc',
    event_type: 'autonomous_decision',
    outcome: outcome === 'VERIFIED_DEPLOYED' ? 'OK' : outcome,
    confidence: board.forecast.horizons[0].confidence,
    constitutional_status: board.invariants.passed ? 'PASSED' : 'FAILED',
    meta: { proposal: proposal.id, risk: board.risk.overall },
  });
  return record;
}

export const listDecisions = () => records;
export const getDecision = (id) => records.find(r => r.id === id);

// §10 — the explainability answer set for a recorded decision.
export function explain(record) {
  return [
    { question: 'Why did this action occur?', answer: `${record.title} was proposed by the evolution engine with an expected gain of ${record.inputs.expected_gain}, and the pipeline resolved to ${record.chosen_branch.replace(/_/g, ' ')}.` },
    { question: 'Which packages participated?', answer: record.participating_packages.map(p => `Package ${p}`).join(', ') },
    { question: 'What evidence was considered?', answer: record.assumptions.join('; ') },
    { question: 'What uncertainties remained?', answer: record.uncertainties.length ? record.uncertainties.join('; ') : 'No named unknowns at the near horizons; long-horizon divergence still applies.' },
    { question: 'Why were alternatives rejected?', answer: record.rejected_branches.length ? record.rejected_branches.map(b => `${b.branch} — ${b.reason}`).join(' | ') : 'No alternative branch was viable: every verification stage passed on the chosen path.' },
  ];
}