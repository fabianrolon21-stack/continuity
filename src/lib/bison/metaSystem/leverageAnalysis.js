// Step 7 — Leverage Analysis
// Identify changes with disproportionate benefit.
// Prefer small interventions over large disruptions.
// Estimate: effort, expected benefit, risk, confidence.

export function identifyLeveragePoints(microModel, stabilityAnalysis, scaleAnalysis) {
  const leveragePoints = [];

  // Leverage 1 — address a constraint
  if (microModel?.constraints?.length > 0) {
    leveragePoints.push({
      target: microModel.constraints[0].text,
      intervention: `Address the constraint: "${microModel.constraints[0].text}"`,
      effort: 'MODERATE',
      expectedBenefit: 'MEDIUM',
      risk: 'LOW',
      confidence: 0.5,
      rationale: 'Constraints directly limit forward movement.',
    });
  }

  // Leverage 2 — leverage a resource
  if (microModel?.resources?.length > 0) {
    leveragePoints.push({
      target: microModel.resources[0].text,
      intervention: `Deploy available resource: "${microModel.resources[0].text}"`,
      effort: 'LOW',
      expectedBenefit: 'MEDIUM',
      risk: 'LOW',
      confidence: 0.6,
      rationale: 'Existing resources are low-effort to mobilize.',
    });
  }

  // Leverage 3 — recovery path from stability analysis
  if (stabilityAnalysis?.recoveryPaths?.length > 0) {
    leveragePoints.push({
      target: 'recovery',
      intervention: stabilityAnalysis.recoveryPaths[0],
      effort: 'LOW',
      expectedBenefit: 'MEDIUM',
      risk: 'LOW',
      confidence: 0.45,
      rationale: 'Recovery paths identified from stability analysis.',
    });
  }

  // Leverage 4 — small habit change
  if (microModel?.goals?.length > 0) {
    leveragePoints.push({
      target: 'daily routine',
      intervention: `Identify one small daily action that supports: "${microModel.goals[0].text}"`,
      effort: 'LOW',
      expectedBenefit: 'LOW',
      risk: 'VERY_LOW',
      confidence: 0.4,
      rationale: 'Small, consistent actions compound over time.',
    });
  }

  // Sort by confidence × benefit, prefer low effort
  leveragePoints.sort((a, b) => {
    const effortRank = { VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3 };
    const aScore = b.confidence - a.confidence;
    if (Math.abs(aScore) > 0.15) return aScore;
    return (effortRank[a.effort] || 2) - (effortRank[b.effort] || 2);
  });

  return leveragePoints.slice(0, 4);
}