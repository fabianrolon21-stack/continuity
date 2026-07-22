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
export const TOOL_REGISTRY = {
  // Package 30 — External Oracle Consult
  // Registered for transparency/permission visibility. Triggered via
  // oracleIntegrator (state-detected), NOT via the action engine.
  // consentPolicy ALWAYS_CONFIRM — user must enable capability in Settings.
  ExternalOracleConsult: {
    riskClass: TOOL_RISK_CLASS.EXTERNAL_ACTION,
    consentPolicy: CONSENT_POLICY.ALWAYS_CONFIRM,
    minimumComputeMode: 'FULL',
    description: 'Consult an external LLM as an untrusted oracle. Output is epistemically verified before use.',
    argumentSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 2000 },
        model: { type: 'string' },
      },
      required: ['query'],
    },
    // No executionAdapter — this tool is triggered by the oracle integrator,
    // not by the action engine's [ACTION_REQUEST] flow.
  },
};