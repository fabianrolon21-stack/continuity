// ═══════════════════════════════════════════════
// TOOL REGISTRY (Phase 15)
// Deterministic registry of available tools.
// A tool in the LLM prompt does NOT make it available —
// the registry is the source of truth.
// Unknown tools fail closed.
//
// Initially empty — no tools registered until secure
// execution adapters exist. All tool requests return UNAVAILABLE.
// ═══════════════════════════════════════════════

export const TOOL_RISK_CLASS = {
  READ_ONLY: 'READ_ONLY',
  LOCAL_COMPUTE: 'LOCAL_COMPUTE',
  WRITE: 'WRITE',
  EXTERNAL_ACTION: 'EXTERNAL_ACTION',
  PHYSICAL_ACTION: 'PHYSICAL_ACTION',
  SENSITIVE: 'SENSITIVE',
};

export const CONSENT_POLICY = {
  NONE: 'NONE',
  SESSION: 'SESSION',
  PER_ACTION: 'PER_ACTION',
  ALWAYS_CONFIRM: 'ALWAYS_CONFIRM',
};

// Tool registry — no tools registered initially.
// Tools are added here when their execution adapters are implemented and authorized.
export const TOOL_REGISTRY = {};