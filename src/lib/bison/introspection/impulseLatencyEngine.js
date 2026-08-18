// ═══════════════════════════════════════════════
// PACKAGE 61 §4 — IMPULSE LATENCY ENGINE
// latency = emotionalIntensity × consequenceMagnitude × irreversibilityMultiplier
// Ordinary expression is never blocked — "I'm excited" needs no intervention.
// ═══════════════════════════════════════════════

const IRREVERSIBILITY_MULTIPLIER = { high: 1, medium: 2, low: 4, irreversible: 8 };

const CONSEQUENCE_HINTS = [
  { pattern: /(quit|resign|break ?up|divorce|delete (my|the) account|end (it|the relationship))/i, magnitude: 0.9 },
  { pattern: /(\$\d|money|buy|spend|loan|bet|invest)/i, magnitude: 0.7 },
  { pattern: /(send|post|text|message|call|confront|tell (him|her|them))/i, magnitude: 0.5 },
];

export function estimateConsequenceMagnitude(text) {
  for (const { pattern, magnitude } of CONSEQUENCE_HINTS) if (pattern.test(text)) return magnitude;
  return 0.35;
}

export function computeImpulseLatency({ emotionalIntensity, consequenceMagnitude, reversibility, hasImpulse }) {
  if (!hasImpulse || emotionalIntensity < 0.55) {
    return { recommendedDelaySeconds: 0, reason: 'No emotionally charged consequential action detected — no pause needed.', reversibility, emotionalIntensity, consequenceMagnitude };
  }
  const multiplier = IRREVERSIBILITY_MULTIPLIER[reversibility] ?? 2;
  const seconds = Math.min(86400, Math.round(emotionalIntensity * consequenceMagnitude * multiplier * 3600));
  return {
    recommendedDelaySeconds: seconds,
    reason: `High emotional intensity combined with a ${reversibility === 'high' ? 'reversible but charged' : reversibility} action — the impulse deserves to outlive a pause before it becomes an act.`,
    reversibility, emotionalIntensity, consequenceMagnitude,
  };
}

export function formatDelay(seconds) {
  if (seconds <= 0) return 'none';
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  return 'a day';
}