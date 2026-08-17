// ═══════════════════════════════════════════════
// PACKAGE 60 §2.1 — BINARY WEIGHTING ENGINE
// Generates exactly two weighted options from a reliability report.
// Probabilities are decision weights, never advice.
// ═══════════════════════════════════════════════

const REVERSIBILITY_MODIFIER = { high: 10, medium: 0, low: -10, irreversible: -20 };

export function generateBinaryDecision(reliabilityReport, optionALabel, optionBLabel) {
  const baseWeight = reliabilityReport.reliability;
  const modifier = REVERSIBILITY_MODIFIER[reliabilityReport.reversibility] ?? 0;
  const weightA = Math.max(5, Math.min(95, baseWeight + modifier));
  const weightB = 100 - weightA;

  const asOption = (label, probability) => ({
    label,
    probability: Math.round(probability * 10) / 10,
    reliabilityScore: reliabilityReport.reliability,
    reversibility: reliabilityReport.reversibility,
  });

  return {
    optionA: asOption(optionALabel, weightA),
    optionB: asOption(optionBLabel, weightB),
    timestamp: Date.now(),
  };
}

export function recordUserChoice(decision, selected, userIntent) {
  return {
    ...decision,
    selectedOption: selected,
    recordedIntent: userIntent,
    selectedAction: selected === 'A' ? decision.optionA.label : decision.optionB.label,
    discardedAction: selected === 'A' ? decision.optionB.label : decision.optionA.label,
  };
}