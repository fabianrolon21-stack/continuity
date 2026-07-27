// ═══════════════════════════════════════════════
// CONFIRMATION BIAS MODELER (Package 38 — meaning)
// Detects self-labeling filters in user language and
// produces gentle reframe context. Deterministic.
// ═══════════════════════════════════════════════

const SELF_LABEL_PATTERNS = [
  { pattern: /i('?m| am) (a |such a |just a )?(monster|terrible person|horrible person)/i, label: 'monster', reframe: 'a human who had an intense reaction — not a fixed identity' },
  { pattern: /i('?m| am) (a |such a |just a )?(failure|loser)/i, label: 'failure', reframe: 'someone who experienced a setback — one event, not a verdict' },
  { pattern: /i('?m| am) (broken|damaged|beyond (help|repair))/i, label: 'broken', reframe: 'someone carrying pain — which is different from being broken' },
  { pattern: /i (always|never) (ruin|mess up|fail|destroy)/i, label: 'always/never filter', reframe: 'an all-or-nothing lens that filters out counter-examples' },
  { pattern: /(everyone|everybody) (hates|is against|leaves) me/i, label: 'universal rejection', reframe: 'a fear-shaped generalization the mind treats as fact' },
  { pattern: /i('?m| am) (worthless|useless|a burden)/i, label: 'worthlessness', reframe: 'a feeling speaking in the voice of a fact' },
];

export function detectBiasFilter(userInput) {
  for (const entry of SELF_LABEL_PATTERNS) {
    if (entry.pattern.test(userInput || '')) {
      return {
        detected: true,
        label: entry.label,
        reframe: entry.reframe,
        mechanism: 'Once a self-label is adopted, the mind preferentially collects evidence that confirms it and discards evidence against it (confirmation bias).',
      };
    }
  }
  return { detected: false };
}