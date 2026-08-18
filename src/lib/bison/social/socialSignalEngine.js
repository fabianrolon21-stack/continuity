// ═══════════════════════════════════════════════
// PACKAGE 61 §8, §12 — SOCIAL SIGNAL + LOOK LEFT / LOOK RIGHT
// Prevents one observation → one invented reality. Bison never
// claims to know another person's mind.
// ═══════════════════════════════════════════════

const OBSERVED_EVENTS = [
  {
    pattern: /(viewed|watched|saw) my (status|story)/i,
    event: 'They viewed your status.',
    interpretations: [
      { hypothesis: 'They intentionally wanted to see it.', epistemicStatus: 'INFERRED', evidenceFor: ['the view happened'], evidenceAgainst: ['statuses auto-advance'] },
      { hypothesis: 'They were already browsing statuses and yours appeared in sequence.', epistemicStatus: 'INFERRED', evidenceFor: ['statuses play consecutively'], evidenceAgainst: [] },
      { hypothesis: 'They saw the preview and became curious.', epistemicStatus: 'SPECULATIVE', evidenceFor: [], evidenceAgainst: [] },
      { hypothesis: 'They opened it accidentally.', epistemicStatus: 'SPECULATIVE', evidenceFor: [], evidenceAgainst: [] },
    ],
    unknown: 'Why they actually opened it.',
  },
  {
    pattern: /(left me on read|seen my message|didn'?t reply|no reply|hasn'?t (responded|replied|texted))/i,
    event: 'They saw or received your message and have not replied.',
    interpretations: [
      { hypothesis: 'They are busy or distracted.', epistemicStatus: 'INFERRED', evidenceFor: ['most non-replies are situational'], evidenceAgainst: [] },
      { hypothesis: 'They are unsure how to respond and are delaying.', epistemicStatus: 'SPECULATIVE', evidenceFor: [], evidenceAgainst: [] },
      { hypothesis: 'They are deliberately not responding.', epistemicStatus: 'SPECULATIVE', evidenceFor: [], evidenceAgainst: ['no direct evidence of intent'] },
    ],
    unknown: 'Their actual reason for not replying.',
  },
];

export function interpretSocialEvent(text) {
  const match = OBSERVED_EVENTS.find(({ pattern }) => pattern.test(text));
  if (!match) return null;
  return { event: match.event, observed: true, interpretations: match.interpretations, unknown: match.unknown };
}

// §12 — whenever the user fixates on one interpretation, look left and right.
const FIXATIONS = [
  { pattern: /(doesn'?t care|never cared)/i, core: '“They don’t care.”', left: 'They are busy or overloaded.', right: 'They care, but not in the form or intensity being hoped for.', neglected: 'Their actual internal state cannot be determined from this evidence.' },
  { pattern: /(hates me|is ignoring me|is done with me)/i, core: '“They are rejecting me.”', left: 'Their behavior is about their own situation, not about you.', right: 'Something specific happened that has not been talked about yet.', neglected: 'Whether this pattern is about you at all is unknown.' },
  { pattern: /(will leave|is leaving|is going to leave)/i, core: '“They are going to leave.”', left: 'One data point is being extended into a trajectory.', right: 'They may be renegotiating closeness, not ending it.', neglected: 'Future behavior cannot be read from present anxiety.' },
];

export function buildPeripheral(text) {
  const match = FIXATIONS.find(({ pattern }) => pattern.test(text));
  if (!match) return null;
  return { corePath: match.core, leftAlternative: match.left, rightAlternative: match.right, neglectedVariable: match.neglected };
}