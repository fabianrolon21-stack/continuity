// ═══════════════════════════════════════════════
// CLARIFICATION LOOP (Patch 40.7)
// When data completeness is low, gather information
// before concluding.
// ═══════════════════════════════════════════════

export function generateClarifyingQuestions(ledger, variables) {
  const questions = [];

  if (ledger.completeness < 0.5) {
    questions.push('How long has this pattern been happening — is this the first time, or repeated?');
  }
  if (ledger.inferred.length > ledger.observed.length) {
    questions.push('What did you directly see or hear, as opposed to what you suspect?');
  }
  if (ledger.observed.length > 0) {
    questions.push('What happened right after — did anything change?');
  }
  if (variables.some(v => v.tag === 'Unknown') || questions.length === 0) {
    questions.push('Has this person acted differently in similar situations before?');
  }

  return questions.slice(0, 3);
}