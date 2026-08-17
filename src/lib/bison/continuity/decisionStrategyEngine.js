// ═══════════════════════════════════════════════
// PACKAGE 60 v1.5 §12–13 — DECISION STRATEGY ENGINE
// Strategies ANALYZE, COMPARE, EXPLAIN — they never select the
// user's final decision. Every result carries userDecisionRequired.
// Utility AI is driven by the user's own priorities.
// ═══════════════════════════════════════════════

const RANKS = { high: 3, medium: 2, low: 1, irreversible: 0 };
const rank = option => RANKS[option.reversibility] ?? 2;

export const DEFAULT_PRIORITIES = [
  { id: 'safety', label: 'Safety', weight: 70 },
  { id: 'flexibility', label: 'Flexibility', weight: 60 },
  { id: 'speed', label: 'Speed', weight: 40 },
  { id: 'cost', label: 'Cost', weight: 50 },
];

export const UTILITY_DISCLAIMER = 'This score reflects the priorities you supplied. It is not an objective measurement of what you should do.';

function utilityScore(option, priorities) {
  const weight = id => (priorities.find(priority => priority.id === id)?.weight ?? 50) / 100;
  return Math.round(
    rank(option) * 25 * (weight('safety') + weight('flexibility')) +
    option.decisionWeight * 0.4 * weight('speed') +
    (100 - option.uncertainties.length * 15) * 0.3 * weight('cost'),
  );
}

export function analyzeStrategies(decision, priorities = DEFAULT_PRIORITIES) {
  const options = [decision.optionA, decision.optionB, ...decision.alternatives];
  const labels = options.map(option => option.label);
  const mostReversible = [...options].sort((a, b) => rank(b) - rank(a))[0];
  const scored = options.map(option => ({ option, score: utilityScore(option, priorities) })).sort((a, b) => b.score - a.score);
  const fewestUnknowns = [...options].sort((a, b) => a.uncertainties.length - b.uncertainties.length)[0];

  return [
    { actionId: `bt_${Date.now()}`, strategy: 'behavior_tree', rationale: `“${mostReversible.label}” has fewer dependencies and the highest reversibility.`, confidence: 0.85, analyzedOptions: labels, recommendedForExploration: [mostReversible.label], userDecisionRequired: true },
    { actionId: `ut_${Date.now()}`, strategy: 'utility_ai', rationale: `“${scored[0].option.label}” better matches the priorities you provided (${scored.map(({ option, score }) => `${option.label}: ${score}`).join(' · ')}). ${UTILITY_DISCLAIMER}`, confidence: 0.9, analyzedOptions: labels, recommendedForExploration: [scored[0].option.label], userDecisionRequired: true },
    { actionId: `goap_${Date.now()}`, strategy: 'goap', rationale: `“${fewestUnknowns.label}” reaches the stated goal using fewer irreversible steps and fewer unknowns.`, confidence: 0.8, analyzedOptions: labels, recommendedForExploration: [fewestUnknowns.label], userDecisionRequired: true },
  ];
}