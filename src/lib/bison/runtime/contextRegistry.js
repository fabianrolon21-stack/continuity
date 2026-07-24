// ═══════════════════════════════════════════════
// CONTEXT REGISTRY (Package 45)
// Metadata for every context module: priority,
// estimated tokens, estimated queries, dependencies,
// and cacheability. The Planner uses this to make
// loading decisions.
// ═══════════════════════════════════════════════

export const PRIORITIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  OPTIONAL: 'OPTIONAL',
};

export const CONTEXT_MODULES = {
  // ── CRITICAL (always loaded) ──
  constitutional:        { priority: PRIORITIES.CRITICAL, estimatedTokens: 300, estimatedQueries: 0, dependencies: [], cacheable: false },
  runtime:                { priority: PRIORITIES.CRITICAL, estimatedTokens: 400, estimatedQueries: 1, dependencies: [], cacheable: false },
  protection:             { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, estimatedQueries: 0, dependencies: ['affective'], cacheable: false },
  world:                  { priority: PRIORITIES.CRITICAL, estimatedTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false },
  temporal:               { priority: PRIORITIES.CRITICAL, estimatedTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false },
  affective:              { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false },
  immune:                 { priority: PRIORITIES.CRITICAL, estimatedTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false },

  // ── HIGH (usually loaded) ──
  selfModel:              { priority: PRIORITIES.HIGH, estimatedTokens: 250, estimatedQueries: 0, dependencies: [], cacheable: false },
  bandwidth:              { priority: PRIORITIES.HIGH, estimatedTokens: 200, estimatedQueries: 0, dependencies: ['affective'], cacheable: false },
  masking:                { priority: PRIORITIES.HIGH, estimatedTokens: 250, estimatedQueries: 1, dependencies: [], cacheable: false },
  empathyLoop:            { priority: PRIORITIES.HIGH, estimatedTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false },
  provenance:             { priority: PRIORITIES.HIGH, estimatedTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false },
  nonEvidentiaryFirewall: { priority: PRIORITIES.HIGH, estimatedTokens: 100, estimatedQueries: 0, dependencies: [], cacheable: false },

  // ── NORMAL ──
  humanState:             { priority: PRIORITIES.NORMAL, estimatedTokens: 400, estimatedQueries: 1, dependencies: ['affective'], cacheable: true, cacheTTL: 30000 },
  humor:                  { priority: PRIORITIES.NORMAL, estimatedTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false },

  // ── LOW ──
  identity:               { priority: PRIORITIES.LOW, estimatedTokens: 300, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000 },
  consciousness:          { priority: PRIORITIES.LOW, estimatedTokens: 200, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000 },
  adaptation:             { priority: PRIORITIES.LOW, estimatedTokens: 200, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000 },
  fairness:               { priority: PRIORITIES.LOW, estimatedTokens: 150, estimatedQueries: 0, dependencies: ['adaptation'], cacheable: false },
  cognitive:              { priority: PRIORITIES.LOW, estimatedTokens: 500, estimatedQueries: 7, dependencies: [], cacheable: true, cacheTTL: 30000 },
  curatedKnowledge:       { priority: PRIORITIES.LOW, estimatedTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false },
  neuroKnowledge:         { priority: PRIORITIES.LOW, estimatedTokens: 200, estimatedQueries: 0, dependencies: [], cacheable: false },
  ecological:             { priority: PRIORITIES.LOW, estimatedTokens: 300, estimatedQueries: 0, dependencies: [], cacheable: false },
  evolution:              { priority: PRIORITIES.LOW, estimatedTokens: 250, estimatedQueries: 4, dependencies: [], cacheable: true, cacheTTL: 30000 },
  continuity:             { priority: PRIORITIES.LOW, estimatedTokens: 250, estimatedQueries: 3, dependencies: [], cacheable: true, cacheTTL: 30000 },
  valueModel:             { priority: PRIORITIES.LOW, estimatedTokens: 250, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000 },
  reflection:             { priority: PRIORITIES.LOW, estimatedTokens: 300, estimatedQueries: 1, dependencies: [], cacheable: true, cacheTTL: 30000 },
  stressPropagation:      { priority: PRIORITIES.LOW, estimatedTokens: 150, estimatedQueries: 0, dependencies: ['humanState'], cacheable: false },
  communicationAdaptation:{ priority: PRIORITIES.LOW, estimatedTokens: 200, estimatedQueries: 0, dependencies: ['humanState'], cacheable: false },
  decisionEcology:        { priority: PRIORITIES.LOW, estimatedTokens: 150, estimatedQueries: 0, dependencies: [], cacheable: false },
  socialNav:              { priority: PRIORITIES.LOW, estimatedTokens: 400, estimatedQueries: 1, dependencies: [], cacheable: false },

  // ── OPTIONAL (explicit request only) ──
  metaInsight:            { priority: PRIORITIES.OPTIONAL, estimatedTokens: 500, estimatedQueries: 3, dependencies: ['reflection', 'identity', 'cognitive'], cacheable: false },
  buildingStory:          { priority: PRIORITIES.OPTIONAL, estimatedTokens: 600, estimatedQueries: 0, dependencies: [], cacheable: false },
  selfAnalysis:           { priority: PRIORITIES.OPTIONAL, estimatedTokens: 400, estimatedQueries: 2, dependencies: [], cacheable: false },
  oracle:                 { priority: PRIORITIES.OPTIONAL, estimatedTokens: 400, estimatedQueries: 1, dependencies: [], cacheable: false },
  insight:                { priority: PRIORITIES.OPTIONAL, estimatedTokens: 300, estimatedQueries: 3, dependencies: [], cacheable: false },
};