// ═══════════════════════════════════════════════
// EVIDENCE LEDGER (Patches 40.5 + 40.11)
// Separates OBSERVED / INFERRED / UNKNOWN and
// weights every piece of evidence by source quality.
// ═══════════════════════════════════════════════

export const REALITY_WEIGHTS = {
  direct_observation: 10,
  transcript: 9,
  email: 8,
  user_memory: 7,
  third_party: 5,
  assumption: 2,
  speculation: 0,
};

const INFERRED_PATTERNS = /\b(i think|i guess|i assume|probably|maybe|seems like|seems to|must be|clearly|obviously|on purpose|trying to|avoiding|doesn't care|ignoring me)\b/i;
const THIRD_PARTY_PATTERNS = /\b(i heard from|someone told me|they say|word is|apparently)\b/i;
const OBSERVED_PATTERNS = /\b(said|told me|saw|watched|sent|wrote|texted|emailed|did|went|happened|showed up|didn't show|was late|arrived)\b/i;
const QUOTE_PATTERN = /["“”'].+["“”']/;

function classifyClaim(sentence) {
  if (THIRD_PARTY_PATTERNS.test(sentence)) {
    return { status: 'OBSERVED', sourceType: 'third_party' };
  }
  if (INFERRED_PATTERNS.test(sentence)) {
    return { status: 'INFERRED', sourceType: 'assumption' };
  }
  if (QUOTE_PATTERN.test(sentence)) {
    return { status: 'OBSERVED', sourceType: 'transcript' };
  }
  if (OBSERVED_PATTERNS.test(sentence)) {
    return { status: 'OBSERVED', sourceType: 'direct_observation' };
  }
  return { status: 'UNKNOWN', sourceType: 'speculation' };
}

export function buildEvidenceLedger(input) {
  const sentences = (input || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 8);

  const claims = sentences.map(sentence => {
    const { status, sourceType } = classifyClaim(sentence);
    return { text: sentence, status, sourceType, weight: REALITY_WEIGHTS[sourceType] ?? 0 };
  });

  const observed = claims.filter(c => c.status === 'OBSERVED');
  const inferred = claims.filter(c => c.status === 'INFERRED');
  const unknown = claims.filter(c => c.status === 'UNKNOWN');
  const totalWeight = claims.reduce((s, c) => s + c.weight, 0);
  const avgWeight = claims.length > 0 ? totalWeight / claims.length : 0;
  const completeness = claims.length > 0 ? observed.length / claims.length : 0;

  return {
    claims,
    observed,
    inferred,
    unknown,
    avgWeight: Math.round(avgWeight * 10) / 10,
    completeness: Math.round(completeness * 100) / 100,
    claimCount: claims.length,
  };
}