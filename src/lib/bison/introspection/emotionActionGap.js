// ═══════════════════════════════════════════════
// PACKAGE 61 §3 — EMOTION → ACTION GAP
// Exposes the difference between "what I feel" and "what I am
// about to do." Never tells the user what to do.
// ═══════════════════════════════════════════════

const IMPULSE_PATTERN = /\bi(?:'m| am|’m)? ?(?:about to|going to|gonna|want to|will|plan to|should|'ll)\s+([^.!?\n]+)/i;

export function extractImpulse(text) {
  const match = text.match(IMPULSE_PATTERN);
  return match ? match[1].trim() : null;
}

const ALTERNATIVES = {
  JEALOUSY: 'Do nothing tonight and revisit the situation tomorrow.',
  ANGER: 'Write the message but do not send it; reread it after the pause.',
  SADNESS: 'Name what was lost before deciding what to do about it.',
  FEAR: 'List what is actually known versus what is being imagined.',
  LONELINESS: 'Reach toward connection that does not depend on one specific person responding.',
  FRUSTRATION: 'Step away from the blocked path and describe the block out loud.',
  ATTACHMENT: 'Notice the pull without acting on it for one day.',
  DEFAULT: 'Wait, and see whether the impulse survives the pause.',
};

export function buildEmotionActionGap({ emotion, intensity, impulse, reversibility, uncertainty }) {
  const delayRecommended = !!impulse && (intensity >= 0.6 || reversibility === 'irreversible' || reversibility === 'low');
  return {
    emotion: emotion || 'OTHER',
    immediateImpulse: impulse || undefined,
    consideredAction: impulse || undefined,
    alternativeAction: ALTERNATIVES[emotion] || ALTERNATIVES.DEFAULT,
    delayRecommended,
    reversibility,
    uncertainty,
  };
}