// ═══════════════════════════════════════════════
// PACKAGE 50 — EVOLUTION ENGINE (§9) + LEARNING SEPARATION (§8)
// Bison continuously searches for improvements. Each discovery
// becomes a Proposal — never a direct change. The learning
// engine here NEVER touches production state.
// ═══════════════════════════════════════════════

export const SEARCH_DOMAINS = [
  'algorithms', 'scheduling', 'caching', 'indexing',
  'memory_layouts', 'compression', 'reasoning_strategies',
  'forecasting', 'verification',
];

// Candidate improvements the learning engine can discover. Each declares
// its effects and risks honestly so the pipeline can judge it.
const CANDIDATES = [
  {
    id: 'ev_cache_context', domain: 'caching', title: 'Tier the context cache by access recency',
    rationale: 'Profiler shows repeated re-reads of the same context slices within a session.',
    expected_gain: 0.28, scope: 'local', reversible: true,
    effects: { performance: 0.3, efficiency: 0.2, maintainability: 0.05 },
    risks: { performance: 0.1, maintenance: 0.15, operational: 0.1 },
    data_quality: 0.75, model_agreement: 0.8,
    evidence: ['Runtime profiler cache-miss counters'],
  },
  {
    id: 'ev_sched_priority', domain: 'scheduling', title: 'Defer low-priority modules during user interaction',
    rationale: 'Background modules contend with interactive work during input.',
    expected_gain: 0.22, scope: 'local', reversible: true,
    effects: { performance: 0.25, reliability: 0.1 },
    risks: { performance: 0.1, operational: 0.15 },
    data_quality: 0.7, model_agreement: 0.75,
    evidence: ['Execution scheduler latency traces'],
  },
  {
    id: 'ev_memory_compress', domain: 'compression', title: 'Compress archived memory summaries more aggressively',
    rationale: 'Archived summaries are read rarely but stored verbosely.',
    expected_gain: 0.18, scope: 'local', reversible: true,
    effects: { efficiency: 0.25, documentation: 0.0 },
    risks: { maintenance: 0.15, operational: 0.1, safety: 0.05 },
    data_quality: 0.6, model_agreement: 0.6,
    evidence: ['Storage growth measurements'],
  },
  {
    id: 'ev_verify_invariants', domain: 'verification', title: 'Add exhaustive invariant checks to the proposal path',
    rationale: 'Verification coverage is the cheapest place to add safety.',
    expected_gain: 0.15, scope: 'local', reversible: true,
    effects: { testing: 0.4, security: 0.2, explainability: 0.2, auditability: 0.1 },
    risks: { performance: 0.1, maintenance: 0.1 },
    data_quality: 0.8, model_agreement: 0.85,
    evidence: ['Invariant coverage audit'],
  },
  {
    id: 'ev_forecast_calib', domain: 'forecasting', title: 'Calibrate forecasts against observed deployment outcomes',
    rationale: 'Past deployment records provide ground truth for forecast error.',
    expected_gain: 0.2, scope: 'local', reversible: true,
    effects: { forecasting: 0.35, explainability: 0.15 },
    risks: { operational: 0.1, maintenance: 0.1 },
    data_quality: 0.65, model_agreement: 0.7,
    evidence: ['Deployment history vs forecast deltas'],
  },
  {
    id: 'ev_regression_case', domain: 'indexing', title: 'Precompute an entity index for archive queries',
    rationale: 'Archive listing re-scans on every open.',
    expected_gain: 0.3, scope: 'local', reversible: true,
    regression_seed: 0.8, // this one under-delivers → exercises automatic rollback
    effects: { performance: 0.3, efficiency: 0.1 },
    risks: { performance: 0.2, maintenance: 0.2, operational: 0.15 },
    data_quality: 0.5, model_agreement: 0.5,
    evidence: ['Archive page render timings'],
  },
];

/** The learning engine — produces proposals only, changes nothing. */
export function searchForImprovements() {
  return CANDIDATES.map(c => ({ ...c, discovered_at: new Date().toISOString(), status: 'PROPOSAL' }));
}

export const learningEngineGuarantee = 'The learning engine reads measurements and emits proposals. It holds no write path to production state.';