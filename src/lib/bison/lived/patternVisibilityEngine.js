// ═══════════════════════════════════════════════
// SYSTEM 2 — SURVEILLANCE AWARENESS / PATTERN VISIBILITY
// Observation is threshold-based: a single person is invisible, a pattern
// becomes visible. This estimates how visible a described pattern is likely
// to be — heuristic only, never certainty, never paranoid, never dismissive.
// ═══════════════════════════════════════════════

const REPEATED = /(again|repeatedly|multiple times|over and over|pattern|keeps? (happening|occurring)|third time|second time|every (time|day|week|month))/i;
const COLLECTIVE = /(\bwe\b|\bour\b|group|protest|demonstrat|organiz|petition|union|community|rally|march|sign|together|movement)/i;
const FORMAL = /(filed?|complaint|lawsuit|report(ed)?|claim|appeal|subpoena|agency|court|police report|records request|foia|application|hearing)/i;
const PUBLIC = /(posted|public|online|social media|shared|went viral|published|spoke (out|up)|interview|livestream)/i;

export function estimateVisibility(input) {
  const text = String(input || '');
  let score = 0;
  const reasons = [];
  if (REPEATED.test(text)) { score += 2; reasons.push('a repeated pattern'); }
  if (COLLECTIVE.test(text)) { score += 2; reasons.push('collective or organised activity'); }
  if (FORMAL.test(text)) { score += 2; reasons.push('a formal filing or official channel'); }
  if (PUBLIC.test(text)) { score += 1; reasons.push('a public or online statement'); }

  const level = score >= 5 ? 'ACTIVELY_MONITORED' : score >= 3 ? 'FLAGGED' : score >= 1 ? 'LOGGED' : 'INVISIBLE';
  const confidence = Math.min(0.85, 0.35 + score * 0.1);
  const reasoning = reasons.length
    ? `Signals present: ${reasons.join(', ')}.`
    : 'No repetition, collective, formal, or public signals detected.';

  return { level, reasoning, confidence };
}

export function buildVisibilityContext(v) {
  if (!v) return null;
  return `[VISIBILITY ESTIMATE — HEURISTIC, NOT A VERDICT]
Estimated level: ${v.level}. ${v.reasoning} Confidence: ${Math.round(v.confidence * 100)}%.
Present this as a plain-language estimate of how visible the described pattern is likely to be to institutional observers — threshold-based, not universal. Never paranoid, never dismissive, never certain. The purpose is realistic awareness, not fear.`;
}