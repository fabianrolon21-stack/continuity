// Base 44.3 — Confidence Model
// Replace single confidence values. Track separately:
// Evidence Confidence, Pattern Confidence, Forecast Confidence, Recommendation Confidence.
// This prevents overconfidence.

export function computeMultiTrackConfidence(steps) {
  // Evidence Confidence — how much data do we have?
  const dataPoints = (steps.micro?.elementCount || 0) + (steps.micro?.sourceCount || 0);
  const evidenceScore = Math.min(100, dataPoints * 8);
  const evidenceConfidence = {
    score: evidenceScore,
    level: evidenceScore >= 70 ? 'HIGH' : evidenceScore >= 40 ? 'MEDIUM' : 'LOW',
    note: `Based on ${dataPoints} available data points.`,
  };

  // Pattern Confidence — how well does the top pattern match?
  const topPatternScore = steps.patterns?.[0]?.confidence || 0;
  const patternConfidence = {
    score: Math.round(topPatternScore * 100),
    level: topPatternScore >= 0.6 ? 'HIGH' : topPatternScore >= 0.3 ? 'MEDIUM' : 'LOW',
    note: steps.patterns?.[0]
      ? `Top pattern: ${steps.patterns[0].pattern.name} (${Math.round(topPatternScore * 100)}%)`
      : 'No pattern matched.',
  };

  // Forecast Confidence — how predictable is the outcome?
  const instabilityCount = steps.stability?.instabilitySources?.length || 0;
  const unknownCount = steps.uncertainty?.unknown?.length || 0;
  const missingCount = steps.uncertainty?.missing?.length || 0;
  const forecastScore = Math.max(10, 100 - (instabilityCount * 15) - (unknownCount * 15) - (missingCount * 10));
  const forecastConfidence = {
    score: forecastScore,
    level: forecastScore >= 70 ? 'HIGH' : forecastScore >= 40 ? 'MEDIUM' : 'LOW',
    note: `Reduced by ${instabilityCount} instability sources, ${unknownCount} unknowns, ${missingCount} missing items.`,
  };

  // Recommendation Confidence — how confident are we in the leverage/experiment suggestions?
  const topLeverageConfidence = steps.leverage?.[0]?.confidence || 0;
  const counterHypothesisCount = steps.counterHypotheses?.length || 0;
  const recommendationScore = Math.round(topLeverageConfidence * 70 + Math.min(30, counterHypothesisCount * 10));
  const recommendationConfidence = {
    score: Math.min(100, recommendationScore),
    level: recommendationScore >= 60 ? 'HIGH' : recommendationScore >= 35 ? 'MEDIUM' : 'LOW',
    note: `Based on ${steps.leverage?.length || 0} leverage points and ${counterHypothesisCount} hypotheses.`,
  };

  return {
    evidence: evidenceConfidence,
    pattern: patternConfidence,
    forecast: forecastConfidence,
    recommendation: recommendationConfidence,
    overall: {
      score: Math.round((evidenceScore + topPatternScore * 100 + forecastScore + recommendationScore) / 4),
      note: 'Track these separately. Do not collapse into a single number.',
    },
  };
}