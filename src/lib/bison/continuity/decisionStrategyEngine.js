// ═══════════════════════════════════════════════
// PACKAGE 60 §2.8 — DECISION STRATEGY ENGINE
// Behavior tree / utility AI / GOAP evaluations of a binary
// decision. Explainable rationales; never a directive.
// ═══════════════════════════════════════════════

const RANKS = { high: 3, medium: 2, low: 1, irreversible: 0 };
const rank = option => RANKS[option.reversibility] ?? 2;
const utilityScore = option => option.probability * 0.5 + rank(option) * 10;

export function evaluateStrategy(decision, strategy) {
  const { optionA, optionB } = decision;
  if (strategy === 'behavior_tree') {
    const chosen = rank(optionA) >= rank(optionB) ? 'A' : 'B';
    return { actionId: `bt_${Date.now()}`, strategy, leans: chosen, rationale: 'Behavior tree favors the most reversible, lower-risk branch.', confidence: 0.85 };
  }
  if (strategy === 'utility_ai') {
    const chosen = utilityScore(optionA) >= utilityScore(optionB) ? 'A' : 'B';
    return { actionId: `ut_${Date.now()}`, strategy, leans: chosen, rationale: 'Utility AI computed the highest expected value from weight and reversibility.', confidence: 0.9 };
  }
  const chosen = optionA.reversibility === 'high' && optionB.reversibility !== 'high' ? 'A' : 'B';
  return { actionId: `goap_${Date.now()}`, strategy: 'goap', leans: chosen, rationale: 'GOAP planned the path that minimises irreversible consequences.', confidence: 0.8 };
}