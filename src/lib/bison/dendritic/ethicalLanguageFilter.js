// ═══════════════════════════════════════════════
// ETHICAL LANGUAGE FILTER (Patch 40.10)
// Identity labels are forbidden. Behavior-pattern
// language is required.
// ═══════════════════════════════════════════════

const REPLACEMENTS = [
  [/\bmanipulators?\b/gi, 'someone showing patterns that appear consistent with manipulation'],
  [/\bliars?\b/gi, 'someone whose statements appear inconsistent with the evidence'],
  [/\bnarcissists?\b/gi, 'someone showing a strongly self-focused pattern'],
  [/\b(psychopaths?|sociopaths?)\b/gi, 'someone showing a concerning behavioral pattern'],
  [/\bis (a )?toxic person\b/gi, 'is showing a repeated harmful pattern'],
];

export function applyEthicalFilter(text) {
  if (!text) return text;
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export const ETHICAL_LANGUAGE_RULES = `ETHICAL LANGUAGE (Dendritic Framework): Never label people with identity diagnoses (manipulator, liar, narcissist, psychopath). Describe behavior patterns instead: "a pattern of...", "appears consistent with...", "one interpretation is...", "the evidence suggests...". Behavior, not identity.`;