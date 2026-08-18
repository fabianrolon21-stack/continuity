// ═══════════════════════════════════════════════
// PACKAGE 61 §5 — AMARA MIRROR 2.0: BEHAVIORAL PATTERN MATRIX
// Evaluates behavior, never identity. Bison names the pattern in
// the stated intent — it never says "you are toxic."
// ═══════════════════════════════════════════════

const PATTERNS = [
  { id: 'punitive_withdrawal', category: 'PUNISHMENT', indicators: ['so she worries', 'so he worries', 'so they worry', 'make them worry', 'make them miss me', 'until they apologize'], severity: 0.75, reversibility: 0.8, reflection: 'The stated purpose appears to include producing worry in another person. That changes the action from ordinary withdrawal to potentially punitive withdrawal.' },
  { id: 'control_attempt', category: 'CONTROL', indicators: ['make them stay', 'not allow', 'forbid', 'they have to ask me', 'stop them from'], severity: 0.8, reversibility: 0.6, reflection: 'The stated intent appears to include limiting another person’s independent choices. Their autonomy is a variable this action cannot actually control.' },
  { id: 'possessive_monitoring', category: 'POSSESSIVENESS', indicators: ['check their phone', 'check her phone', 'check his phone', 'track where', 'go through their messages'], severity: 0.85, reversibility: 0.4, reflection: 'The described action involves monitoring another person without their knowledge. Trust lost through discovery of monitoring is often hard to rebuild.' },
  { id: 'retaliation', category: 'REVENGE', indicators: ['get back at', 'payback', 'make them feel what i felt', 'even the score'], severity: 0.8, reversibility: 0.5, reflection: 'The stated purpose appears to be producing hurt in return for hurt. This tends to extend the cycle rather than close it.' },
  { id: 'engineered_reaction', category: 'MANIPULATION', indicators: ['post so they see', 'make them jealous', 'pretend i', 'act like i don’t care so', "act like i don't care so"], severity: 0.7, reversibility: 0.7, reflection: 'The action is designed to produce a specific reaction in someone rather than to express something true. That dependency is worth seeing before acting.' },
  { id: 'pressure', category: 'PRESSURE', indicators: ['keep asking until', 'won’t take no', "won't take no", 'wear them down'], severity: 0.75, reversibility: 0.6, reflection: 'The stated approach relies on pressure rather than consent. Agreement produced by pressure carries different information than freely given agreement.' },
  { id: 'deception', category: 'DECEPTION', indicators: ['lie to', 'hide it from', 'make up a story', 'pretend it was'], severity: 0.8, reversibility: 0.3, reflection: 'The plan includes concealing or misrepresenting information. Discovered deception usually costs more than what it protected.' },
  { id: 'boundary_respect', category: 'BOUNDARY_RESPECT', indicators: ['give them space', 'respect their decision', 'let them choose', 'ask directly'], severity: 0, reversibility: 1, reflection: 'The stated approach respects the other person’s boundary and autonomy.' },
];

/** INTENT → PATTERN MATCHING → REFLECTION. Returns matched patterns with the honest, non-labeling reflection. */
export function evaluateBehavioralPatterns(rawText) {
  const text = rawText.toLowerCase();
  return PATTERNS
    .map(pattern => ({ pattern, hit: pattern.indicators.find(indicator => text.includes(indicator)) }))
    .filter(({ hit }) => hit)
    .map(({ pattern, hit }) => ({ id: pattern.id, category: pattern.category, matchedIndicator: hit, severity: pattern.severity, reversibility: pattern.reversibility, reflection: pattern.reflection }));
}