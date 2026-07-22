// ═══════════════════════════════════════════════
// TRUST SCORE CALCULATOR (Package 29)
// Simple, explainable Trust Score (0-100).
// No opaque AI. No guilt mechanics. No deductions for inactivity.
// ═══════════════════════════════════════════════

export const TRUST_EVENTS = {
  SAFETY_REFUSAL: 'SAFETY_REFUSAL',
  MANIPULATION_FLAG: 'MANIPULATION_FLAG',
  POSITIVE_FEEDBACK: 'POSITIVE_FEEDBACK',
  MEMORY_CONFIRMED: 'MEMORY_CONFIRMED',
  INSIGHT_ACCEPTED: 'INSIGHT_ACCEPTED',
  CONSENT_REQUESTED: 'CONSENT_REQUESTED',
};

const POINT_CHANGES = {
  [TRUST_EVENTS.SAFETY_REFUSAL]: -5,
  [TRUST_EVENTS.MANIPULATION_FLAG]: -10,
  [TRUST_EVENTS.POSITIVE_FEEDBACK]: +2,
  [TRUST_EVENTS.MEMORY_CONFIRMED]: +2,
  [TRUST_EVENTS.INSIGHT_ACCEPTED]: +3,
  [TRUST_EVENTS.CONSENT_REQUESTED]: 0, // neutral — asking for consent is neither good nor bad
};

const REASON_LABELS = {
  [TRUST_EVENTS.SAFETY_REFUSAL]: 'Bison refused an action for safety',
  [TRUST_EVENTS.MANIPULATION_FLAG]: 'Anti-manipulation review flagged a pattern',
  [TRUST_EVENTS.POSITIVE_FEEDBACK]: 'Positive feedback received',
  [TRUST_EVENTS.MEMORY_CONFIRMED]: 'User confirmed a memory',
  [TRUST_EVENTS.INSIGHT_ACCEPTED]: 'User accepted an insight',
  [TRUST_EVENTS.CONSENT_REQUESTED]: 'Consent was requested before acting',
};

export function calculateTrustScore(sessionState, newEvent) {
  if (!sessionState) {
    return { score: 100, breakdown: [] };
  }

  let score = sessionState.score ?? 100;
  let breakdown = [...(sessionState.breakdown || [])];

  if (newEvent && POINT_CHANGES[newEvent.type] !== undefined) {
    const change = POINT_CHANGES[newEvent.type];
    score = Math.max(0, Math.min(100, score + change));
    breakdown.unshift({
      reason: REASON_LABELS[newEvent.type] + (newEvent.detail ? ` — ${newEvent.detail}` : ''),
      change,
      timestamp: new Date().toISOString(),
    });
    // Keep breakdown bounded
    if (breakdown.length > 20) breakdown = breakdown.slice(0, 20);
  }

  return { score, breakdown };
}

export function createTrustEvent(type, detail = '') {
  return { type, detail, timestamp: new Date().toISOString() };
}