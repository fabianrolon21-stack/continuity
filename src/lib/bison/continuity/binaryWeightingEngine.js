// ═══════════════════════════════════════════════
// PACKAGE 60 v1.5 §2–3 — BINARY WEIGHTING ENGINE
// decisionWeight is a COMPARATIVE WEIGHT only — never a probability.
// Non-selected branches become 'revisitable', never destroyed.
// ═══════════════════════════════════════════════

function asOption(idPrefix, label, decisionWeight, report) {
  return {
    id: `${idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    label,
    decisionWeight: Math.max(0, Math.min(100, Math.round(decisionWeight))),
    reliabilityScore: report.reliability,
    reversibility: report.reversibility,
    supportingFactors: [...(report.supportingFactors || [])],
    uncertainties: [...(report.uncertainties || [])],
    status: 'active',
  };
}

export function generateBinaryDecision(report, optionALabel, optionBLabel) {
  const base = Math.max(0, Math.min(100, report.reliability));
  return {
    id: `decision_${Date.now()}`,
    optionA: asOption('option_a', optionALabel, base, report),
    optionB: asOption('option_b', optionBLabel, 100 - base, report),
    alternatives: [],
    timestamp: Date.now(),
  };
}

export function generateAlternatives(decision, report) {
  if (decision.alternatives.length) return decision;
  return {
    ...decision,
    alternatives: [
      asOption('alt', 'Defer and gather more information', Math.min(90, (report.unknowns || 1) * 18 + 30), report),
      asOption('alt', 'Blend elements of both paths', 50, report),
    ],
  };
}

const allOptions = decision => [decision.optionA, decision.optionB, ...decision.alternatives];

export function recordUserChoice(decision, selectedId, userIntent) {
  const selected = allOptions(decision).find(option => option.id === selectedId);
  if (!selected) throw new Error(`Unknown decision option: ${selectedId}`);
  const mark = option => ({ ...option, status: option.id === selectedId ? 'selected' : 'revisitable' });
  return {
    ...decision,
    optionA: mark(decision.optionA),
    optionB: mark(decision.optionB),
    alternatives: decision.alternatives.map(mark),
    selectedOption: selected.id,
    selectedAction: selected.label,
    userIntent,
  };
}

export const getOptions = allOptions;