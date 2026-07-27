// ═══════════════════════════════════════════════
// CONTEXT REGISTRY (Package 45 + Part III)
// Metadata for every context module. Each declares:
//   priority, estimatedTokens, minimumTokens,
//   estimatedQueries, dependencies, cacheable, optional
// The Planner uses this for budget allocation and
// dependency resolution.
// ═══════════════════════════════════════════════

export const PRIORITIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  OPTIONAL: 'OPTIONAL',
};

export const VERIFY_STATUS = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  STALE: 'STALE',
  EMPTY: 'EMPTY',
};

export function defaultVerify(value) {
  if (value == null) return VERIFY_STATUS.EMPTY;
  if (typeof value === 'string' && value.trim().length === 0) return VERIFY_STATUS.EMPTY;
  if (Array.isArray(value) && value.length === 0) return VERIFY_STATUS.EMPTY;
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return VERIFY_STATUS.EMPTY;
  return VERIFY_STATUS.VALID;
}

export const CONTEXT_MODULES = {
  // ── CRITICAL (always loaded) ──
  constitutional:        { priority: PRIORITIES.CRITICAL, estimatedTokens: 300, minimumTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  runtime:                { priority: PRIORITIES.CRITICAL, estimatedTokens: 400, minimumTokens: 300, estimatedQueries: 1, dependencies: [], cacheable: false, optional: false },
  protection:             { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 0, dependencies: ['affective'], cacheable: false, optional: false },
  world:                  { priority: PRIORITIES.CRITICAL, estimatedTokens: 150, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  temporal:               { priority: PRIORITIES.CRITICAL, estimatedTokens: 150, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  affective:              { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, minimumTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  immune:                 { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },

  // ── HIGH (usually loaded) ──
  selfModel:              { priority: PRIORITIES.HIGH, estimatedTokens: 250, minimumTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  bandwidth:              { priority: PRIORITIES.HIGH, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 0, dependencies: ['affective'], cacheable: false, optional: false },
  masking:                { priority: PRIORITIES.HIGH, estimatedTokens: 250, minimumTokens: 150, estimatedQueries: 1, dependencies: [], cacheable: false, optional: false },
  empathyLoop:            { priority: PRIORITIES.HIGH, estimatedTokens: 150, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  provenance:             { priority: PRIORITIES.HIGH, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  nonEvidentiaryFirewall: { priority: PRIORITIES.HIGH, estimatedTokens: 100, minimumTokens: 50, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },

  // ── NORMAL ──
  humanState:             { priority: PRIORITIES.NORMAL, estimatedTokens: 400, minimumTokens: 200, estimatedQueries: 1, dependencies: ['affective'], cacheable: true, cacheTTL: 30000, optional: false },
  humor:                  { priority: PRIORITIES.NORMAL, estimatedTokens: 150, minimumTokens: 50, estimatedQueries: 0, dependencies: [], cacheable: false, optional: true },

  // ── LOW ──
  identity:               { priority: PRIORITIES.LOW, estimatedTokens: 300, minimumTokens: 200, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  consciousness:          { priority: PRIORITIES.LOW, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  adaptation:             { priority: PRIORITIES.LOW, estimatedTokens: 200, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  fairness:               { priority: PRIORITIES.LOW, estimatedTokens: 150, minimumTokens: 50, estimatedQueries: 0, dependencies: ['adaptation'], cacheable: false, optional: true },
  cognitive:              { priority: PRIORITIES.LOW, estimatedTokens: 500, minimumTokens: 300, estimatedQueries: 7, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  curatedKnowledge:       { priority: PRIORITIES.LOW, estimatedTokens: 200, minimumTokens: 50, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  neuroKnowledge:         { priority: PRIORITIES.LOW, estimatedTokens: 200, minimumTokens: 50, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  ecological:             { priority: PRIORITIES.LOW, estimatedTokens: 300, minimumTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false, optional: false },
  evolution:              { priority: PRIORITIES.LOW, estimatedTokens: 250, minimumTokens: 100, estimatedQueries: 4, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  continuity:             { priority: PRIORITIES.LOW, estimatedTokens: 250, minimumTokens: 100, estimatedQueries: 3, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  valueModel:             { priority: PRIORITIES.LOW, estimatedTokens: 250, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  reflection:             { priority: PRIORITIES.LOW, estimatedTokens: 300, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000, optional: false },
  stressPropagation:      { priority: PRIORITIES.LOW, estimatedTokens: 150, minimumTokens: 50, estimatedQueries: 0, dependencies: ['humanState'], cacheable: false, optional: true },
  communicationAdaptation:{ priority: PRIORITIES.LOW, estimatedTokens: 200, minimumTokens: 50, estimatedQueries: 0, dependencies: ['humanState'], cacheable: false, optional: true },
  decisionEcology:        { priority: PRIORITIES.LOW, estimatedTokens: 150, minimumTokens: 50, estimatedQueries: 0, dependencies: [], cacheable: false, optional: true },
  socialNav:              { priority: PRIORITIES.LOW, estimatedTokens: 400, minimumTokens: 200, estimatedQueries: 1, dependencies: [], cacheable: false, optional: false },
  wellbeingForecast:      { priority: PRIORITIES.LOW, estimatedTokens: 300, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 60000, optional: true },
  correlationPatterns:    { priority: PRIORITIES.LOW, estimatedTokens: 350, minimumTokens: 100, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 60000, optional: true },

  // ── OPTIONAL (explicit request only) ──
  metaInsight:            { priority: PRIORITIES.OPTIONAL, estimatedTokens: 500, minimumTokens: 200, estimatedQueries: 3, dependencies: ['reflection', 'identity', 'cognitive'], cacheable: false, optional: true },
  buildingStory:          { priority: PRIORITIES.OPTIONAL, estimatedTokens: 600, minimumTokens: 300, estimatedQueries: 0, dependencies: [], cacheable: false, optional: true },
  selfAnalysis:           { priority: PRIORITIES.OPTIONAL, estimatedTokens: 400, minimumTokens: 200, estimatedQueries: 2, dependencies: [], cacheable: false, optional: true },
  oracle:                 { priority: PRIORITIES.OPTIONAL, estimatedTokens: 400, minimumTokens: 200, estimatedQueries: 1, dependencies: [], cacheable: false, optional: true },
  insight:                { priority: PRIORITIES.OPTIONAL, estimatedTokens: 300, minimumTokens: 100, estimatedQueries: 3, dependencies: [], cacheable: false, optional: true },
};