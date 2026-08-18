// ═══════════════════════════════════════════════
// BISON UNIFIED RUNTIME — KERNEL TYPES & CONSTANTS
// No package owns Bison. The kernel owns the runtime;
// every other package is a capability.
// ═══════════════════════════════════════════════

export const BISON_EVENTS = {
  USER_INPUT: 'user.input',
  CONTEXT_UPDATED: 'context.updated',
  EMOTION_DETECTED: 'emotion.detected',
  INTENT_DETECTED: 'intent.detected',
  EGO_THREAT_DETECTED: 'ego.threat.detected',
  TOXIC_PATTERN_DETECTED: 'toxic.pattern.detected',
  FINANCIAL_REQUEST: 'financial.request',
  RESOURCE_PRESSURE: 'resource.pressure',
  DECISION_CREATED: 'decision.created',
  DECISION_SELECTED: 'decision.selected',
  ALTERNATIVE_CREATED: 'alternative.created',
  MAP_EXPANDED: 'map.expanded',
  COUNTERFACTUAL_CREATED: 'counterfactual.created',
  ACTION_EXECUTED: 'action.executed',
  OUTCOME_OBSERVED: 'outcome.observed',
  REFLECTION_CREATED: 'reflection.created',
  CALIBRATION_UPDATED: 'calibration.updated',
  MEMORY_WRITTEN: 'memory.written',
  LEGAL_ACTION_BLOCKED: 'legal.action.blocked',
  CONSENT_GRANTED: 'consent.granted',
  SECURITY_ALERT: 'security.alert',
  PRIVACY_FIREWALL_HIT: 'privacy.firewall.hit',
  UI_UPDATED: 'ui.updated',
  PACKAGE_ERROR: 'package.error',
  MODE_CHANGED: 'runtime.mode.changed',
};

export const RUNTIME_MODES = ['FULL', 'REDUCED', 'QUIET', 'SAFE'];

// Topological load order (§3).
export const LOAD_ORDER = ['memory', 'epistemic', 'emotion', 'introspection', 'legal', 'security', 'privacy', 'social', 'decision', 'continuity', 'resources', 'sustainability', 'trauma', 'metaSystem', 'oracle', 'ui'];

// If one of these fails, the kernel enters SAFE mode; others are simply disabled.
export const CORE_PACKAGES = ['memory', 'epistemic', 'emotion'];

export const BISON_FINAL_RULE = `BISON IS NOT A SINGLE ALGORITHM. BISON IS A SYSTEM OF INTERACTING MODELS.
Emotion provides signals. Memory provides history. Epistemics provide uncertainty. Introspection provides behavioural reflection. Continuity provides alternatives. Counterfactuals preserve lost paths. Strategy engines provide competing analyses. Resources provide physical constraints. Financial systems provide economic constraints. Legal systems provide jurisdictional boundaries. Security systems provide threat protection. Privacy systems provide data sovereignty. The map visualises knowledge. The UI visualises state. The user remains the final authority over personal decisions. Outcomes teach the system how inaccurate its previous assumptions were.

NO PACKAGE OWNS BISON. The kernel owns the runtime. Every other package is a capability.`;