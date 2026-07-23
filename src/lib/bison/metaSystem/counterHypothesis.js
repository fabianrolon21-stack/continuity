// Step 6 — Counter-Hypothesis
// Every analysis must generate at least one alternative explanation.
// List evidence supporting each.

export function generateCounterHypotheses(analysis, patternCandidates = []) {
  const { micro, stability } = analysis;
  const hypotheses = [];

  // Primary hypothesis — derived from top pattern
  if (patternCandidates?.length > 0 && patternCandidates[0].confidence > 0.1) {
    const topPattern = patternCandidates[0].pattern;
    hypotheses.push({
      label: 'Primary',
      explanation: `The situation may reflect a "${topPattern.name}" pattern — ${topPattern.description}`,
      evidence: [`Pattern match confidence: ${Math.round(patternCandidates[0].confidence * 100)}%`],
      confidence: patternCandidates[0].confidence,
    });
  }

  // Alternative 1 — stability-based
  if (stability?.instabilitySources?.length > 0) {
    hypotheses.push({
      label: 'Alternative A',
      explanation: 'The situation may be driven by active destabilizers rather than a deep pattern.',
      evidence: stability.instabilitySources.slice(0, 2),
      confidence: 0.4,
    });
  }

  // Alternative 2 — resource/constraint-based
  if (micro?.constraints?.length > 0 || micro?.resources?.length === 0) {
    hypotheses.push({
      label: 'Alternative B',
      explanation: 'The situation may be a practical resource or constraint problem rather than a systemic one.',
      evidence: micro?.constraints?.map(c => c.text).slice(0, 2) || ['No resources identified.'],
      confidence: 0.35,
    });
  }

  // Alternative 3 — unknown-driven
  if (micro?.unknowns?.length > 0 || (micro?.sourceCount ?? 0) < 2) {
    hypotheses.push({
      label: 'Alternative C',
      explanation: 'There may be insufficient information to identify the true driver. The apparent pattern may be an artifact of missing data.',
      evidence: micro?.unknowns?.map(u => u.text).slice(0, 2) || ['Limited memory context available.'],
      confidence: 0.3,
    });
  }

  // Ensure at least one alternative
  if (hypotheses.length < 2) {
    hypotheses.push({
      label: 'Alternative',
      explanation: 'A different framing may apply. The available evidence does not uniquely support any single interpretation.',
      evidence: ['Limited data available for hypothesis generation.'],
      confidence: 0.2,
    });
  }

  return hypotheses;
}