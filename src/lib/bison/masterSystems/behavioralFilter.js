// ═══════════════════════════════════════════════
// BEHAVIORAL INTERCEPTION FILTER — a self-regulation mirror, not a
// surveillance tool. Runs only when the user explicitly asks, or when
// aggressive send-impulses surface. Never shames, never blocks the user.
// ═══════════════════════════════════════════════

const TOXIC_PATTERNS = ['punish', 'manipulate', 'territorial', 'guilt', 'force', 'worry'];

export function evaluateAction(intendedAction, selfAwarenessScore) {
  const lower = intendedAction.toLowerCase();
  const toxicPatternDetected = TOXIC_PATTERNS.some(pattern => lower.includes(pattern));

  const result = { action: intendedAction, toxicPatternDetected, selfAwarenessScore, outcome: 'ACTION_APPROVED' };
  if (toxicPatternDetected) {
    if (selfAwarenessScore >= 85.0) {
      result.outcome = 'ACTION_SUPPRESSED_AND_TRANSMUTED';
      result.transmutedAction = 'Grounded Silence & Boundary Retention';
    } else {
      result.outcome = 'ACTION_FAILED_MIRROR';
      result.transmutedAction = 'Insufficient self-awareness to prevent cycle repetition. Pause and breathe.';
    }
  }
  return result;
}