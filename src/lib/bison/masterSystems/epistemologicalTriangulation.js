// ═══════════════════════════════════════════════
// EPISTEMOLOGICAL TRIANGULATION ENGINE (System 4)
// Evaluates external narratives the user relays — never the user's own
// lived experience or beliefs. Three axes: who benefits, is there
// empirical data, does it align with observable cause-and-effect.
// A mirror, not a verdict — the user remains the final authority.
// ═══════════════════════════════════════════════

let history = [];
const MAX_HISTORY = 100;

export function triangulate({ narrative, intentBeneficiary, empiricalDataAvailable, userProvidedEvidence = [] }) {
  let verdict, reasoning, cautionaryNote;
  const isTopDown = intentBeneficiary === 'Top-Down Hierarchical System';

  if (isTopDown && !empiricalDataAvailable) {
    verdict = 'REJECTED_CORRUPTED_DATA';
    reasoning = 'The narrative claims to serve a top-down system but is not backed by verifiable empirical evidence. This suggests the story may be shaped by hierarchical moderation rather than observable reality.';
    cautionaryNote = 'Rejecting a narrative does not mean the opposite is true. It means the evidence is insufficient to support the claim as presented.';
  } else if (isTopDown && empiricalDataAvailable) {
    verdict = 'PROVISIONALLY_ACCEPTED';
    reasoning = 'The narrative aligns with empirical data, but because it benefits a top-down system, its intent should be monitored over time for shifts in framing or selective omission.';
    cautionaryNote = 'Trust but verify. Empirical alignment today does not guarantee future accuracy.';
  } else if (empiricalDataAvailable) {
    verdict = 'ACCEPTED_OBJECTIVE_TRUTH';
    reasoning = 'The narrative is supported by empirical data and does not primarily serve a top-down authority. It appears to reflect objective reality as far as current evidence allows.';
  } else {
    verdict = 'INSUFFICIENT_DATA';
    reasoning = 'There is not enough empirical information to evaluate this narrative. More observation is required before accepting or rejecting it.';
    cautionaryNote = 'Insufficient data is not a verdict against the narrative; it is a call for more evidence.';
  }

  const result = { narrative, beneficiary: intentBeneficiary, empiricalDataAvailable, userProvidedEvidence, verdict, reasoning, cautionaryNote, timestamp: Date.now() };
  history = [...history, result].slice(-MAX_HISTORY);
  return result;
}

export function getRecentTriangulations(limit = 5) { return history.slice(-limit); }
export function clearTriangulationHistory() { history = []; }