// ═══════════════════════════════════════════════
// SYSTEM 1 — LIVED EXPERIENCE vs LEGAL DATA
// Legal and institutional systems process what can be proven, not what is
// felt. This maps a narrative into three layers — lived, provable, gap —
// and never claims the gap is just or unjust. It only shows it.
// Deterministic, local.
// ═══════════════════════════════════════════════

const EVIDENCE = /(\b\d{1,4}\b|document(ed|s)?|receipt|record|email|text(ed|s)?|message|screenshot|voicemail|witness(es)?|camera|footage|policy|contract|dated|signed|written|in writing|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b)/i;
const STAKES = /(court|legal|lawsuit|police|agency|hearing|garnish|custody|evict|fired|terminated|report|claim|benefits|immigration|judge|order)/i;

export function translateLivedExperience(narrative) {
  const text = String(narrative || '').trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const provableParts = sentences.filter(s => EVIDENCE.test(s));
  const gapParts = sentences.filter(s => !EVIDENCE.test(s));
  const gapRatio = sentences.length ? gapParts.length / sentences.length : 0;
  const highStakes = STAKES.test(text);
  const riskFromGap = highStakes && gapRatio > 0.5 ? 'HIGH' : gapRatio > 0.6 ? 'MEDIUM' : 'LOW';

  return {
    lived: text,
    provable: provableParts.join(' ').trim()
      || 'Nothing in this account currently reduces to a document, date, witness, or record.',
    gap: gapParts.join(' ').trim()
      || 'Little here is unprovable — most of what you describe has a trace.',
    riskFromGap,
  };
}

export function buildLivedContext(t) {
  if (!t) return null;
  return `[LIVED / PROVABLE / GAP — three separate layers, show all three plainly]
What happened (their words): ${t.lived.slice(0, 300)}
What could be entered into a record: ${t.provable}
The gap (real but unprovable): ${t.gap}
Risk created by the gap: ${t.riskFromGap}. Never dismiss the gap, never claim it will be heard when it will not, and never say whether that is just or unjust — only show where the system will hear them and where it will not. Then help them choose where to spend energy: proof, protection, or changing the system.`;
}