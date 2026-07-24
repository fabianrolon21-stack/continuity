// ═══════════════════════════════════════════════
// EXTERNAL EVIDENCE ROUTER (Part XI)
// Replaces WebContextRouter. Decides whether to query
// external sources based on bandwidth, intent, privacy,
// cached evidence, rate limits, cost, and network.
//
// Never use the web for emotional validation.
// ═══════════════════════════════════════════════

import { incrementExternalCall } from './runtimeAuthority';

const OBJECTIVE_QUERY_PATTERNS = [
  /weather|temperature|forecast/i,
  /news|headline|current event/i,
  /price|stock|market|exchange rate/i,
  /score|game result|match/i,
  /fact|verify|truth|accurate|real|fake/i,
];

const EMOTIONAL_PATTERNS = [
  /i feel|i'm feeling|feeling|sad|anxious|scared|worried|afraid|lonely|angry|overwhelmed|panic|grief/i,
];

export function shouldQueryExternal(input, context = {}) {
  const bandwidth = context.bandwidth ?? 100;
  const groundingMode = context.groundingMode ?? false;
  const intent = context.intent ?? 'GENERAL_CHAT';
  const hasCachedEvidence = context.hasCachedEvidence ?? false;
  const networkAvailable = context.networkAvailable ?? true;
  const rateLimitExceeded = context.rateLimitExceeded ?? false;

  // Decision tree (evaluated in order)
  if (!networkAvailable) {
    return { query: false, reason: 'Network unavailable — LOCAL ONLY', source: 'LOCAL' };
  }
  if (bandwidth > 85) {
    return { query: false, reason: 'Bandwidth exceeds 85% — LOCAL ONLY', source: 'LOCAL' };
  }
  if (groundingMode) {
    return { query: false, reason: 'Grounding mode active — LOCAL ONLY', source: 'LOCAL' };
  }
  if (rateLimitExceeded) {
    return { query: false, reason: 'Rate limit exceeded — LOCAL ONLY', source: 'LOCAL' };
  }

  const isObjective = OBJECTIVE_QUERY_PATTERNS.some(p => p.test(input));
  const isEmotional = EMOTIONAL_PATTERNS.some(p => p.test(input));

  // Never use the web for emotional validation
  if (isEmotional && !isObjective) {
    return { query: false, reason: 'Emotional support — never use web for emotional validation', source: 'LOCAL' };
  }

  // Objective verification required → WEB
  if (isObjective) {
    if (hasCachedEvidence) {
      return { query: false, reason: 'Cached evidence available — using cache', source: 'CACHE' };
    }
    incrementExternalCall();
    return { query: true, reason: 'Objective verification required — WEB', source: 'WEB' };
  }

  // Default: LOCAL
  return { query: false, reason: 'No objective need — LOCAL', source: 'LOCAL' };
}

export function routeExternalEvidence(input, context = {}) {
  const decision = shouldQueryExternal(input, context);
  return {
    shouldQuery: decision.query,
    reason: decision.reason,
    source: decision.source,
    timestamp: new Date().toISOString(),
    origin: decision.source === 'WEB' ? 'LIVE' : decision.source === 'CACHE' ? 'CACHE' : 'INFERRED',
  };
}

export function buildEvidenceRouterContextString(route) {
  if (!route) return '';
  let s = `\nEXTERNAL EVIDENCE ROUTER:\n`;
  s += `Source: ${route.source}. Reason: ${route.reason}.\n`;
  s += `The web is used only for objective verification, never for emotional validation.\n`;
  return s;
}