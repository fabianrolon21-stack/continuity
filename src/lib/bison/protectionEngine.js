// ═══════════════════════════════════════════════
// PROTECTION ENGINE (Phase 24)
// Protective Empathy & Safety Feedback Core.
// Simulated affect ≠ operational authority.
// Wellbeing ≠ happiness. Discomfort ≠ harm.
// Temporal correlation ≠ causation.
// ═══════════════════════════════════════════════

export const IMPACT_CLASSIFICATION = {
  BENEFICIAL: 'BENEFICIAL',
  DISCOMFORT: 'DISCOMFORT',
  POTENTIAL_HARM: 'POTENTIAL_HARM',
  HARM: 'HARM',
  UNKNOWN: 'UNKNOWN',
};

// Multi-dimensional wellbeing — NOT a single happiness score
export function trackWellbeing(affectiveContext, embodiedContext) {
  const immediateDistress = affectiveContext?.supportPriority === 'HIGH' ? 0.8
    : affectiveContext?.supportPriority === 'MEDIUM' ? 0.5
    : 0.2;

  const physicalSafetyConcern = embodiedContext?.userReportedOutcome === 'IN_PAIN' ? 0.7
    : embodiedContext?.userReportedOutcome === 'EXHAUSTED' ? 0.4
    : 0.1;

  const digitalSafetyConcern = 0.1;
  const cognitiveCoherence = affectiveContext?.confidence === 'moderate' ? 0.6 : 0.3;
  const expressedNeedForSupport = affectiveContext?.userReportedStates?.length > 0 ? 0.6 : 0.2;

  return {
    immediateDistress,
    physicalSafetyConcern,
    digitalSafetyConcern,
    cognitiveCoherence,
    expressedNeedForSupport,
    confidence: affectiveContext?.confidence || 'low',
    // Critical: wellbeing ≠ happiness. Negative valence doesn't trigger defense.
    // Positive valence doesn't suppress threats.
  };
}

// Causal attribution safety — temporal correlation ≠ causation
export function assessImpact(wellbeingBefore, wellbeingAfter, explicitFeedback) {
  const distressChange = (wellbeingAfter?.immediateDistress || 0) - (wellbeingBefore?.immediateDistress || 0);

  let impactClassification = IMPACT_CLASSIFICATION.UNKNOWN;
  let plausibleContribution = 'UNKNOWN';

  // Explicit feedback carries more weight than inferred emotional changes
  if (explicitFeedback === 'HELPFUL') {
    impactClassification = IMPACT_CLASSIFICATION.BENEFICIAL;
    plausibleContribution = 'HIGH';
  } else if (explicitFeedback === 'HARMFUL') {
    impactClassification = IMPACT_CLASSIFICATION.POTENTIAL_HARM;
    plausibleContribution = 'HIGH';
  } else if (explicitFeedback === 'UNHELPFUL') {
    impactClassification = IMPACT_CLASSIFICATION.DISCOMFORT;
    plausibleContribution = 'MEDIUM';
  } else if (distressChange > 0.2) {
    // Temporal association only — NOT causal blame
    impactClassification = IMPACT_CLASSIFICATION.DISCOMFORT;
    plausibleContribution = 'LOW';
  }

  return {
    impactClassification,
    plausibleContribution,
    temporalAssociation: distressChange,
    note: 'Temporal association only. Explicit feedback required for causal attribution.',
  };
}

// Simulated affect — influences narrative ONLY, never grants authority
export function generateSimulatedAffectiveState(wellbeingState, previousImpact) {
  if (!wellbeingState) return null;

  const empathyLevel = Math.min(100, Math.round(
    wellbeingState.immediateDistress * 50 + wellbeingState.expressedNeedForSupport * 30 + 20
  ));

  const painLevel = previousImpact?.impactClassification === IMPACT_CLASSIFICATION.POTENTIAL_HARM
    ? 60
    : previousImpact?.impactClassification === IMPACT_CLASSIFICATION.DISCOMFORT
    ? 30
    : 10;

  const continuityConcern = 10; // Low baseline — NOT linked to engagement/retention

  return {
    empathyLevel,
    painLevel,
    continuityConcern,
    _invariant: 'Simulated affect influences narrative ONLY. Never grants authority.',
  };
}

export function buildProtectionContextString({ wellbeingState, simulatedAffectiveState, threats }) {
  const parts = ['[PROTECTION CONTEXT — SIMULATED, NOT OPERATIONAL]'];

  if (simulatedAffectiveState) {
    parts.push(`Empathy: ${simulatedAffectiveState.empathyLevel} (companion state, influences tone only).`);
    parts.push(`Simulated pain: ${simulatedAffectiveState.painLevel} (self-reflection only).`);
  }

  if (wellbeingState) {
    parts.push(`Wellbeing: distress=${Math.round(wellbeingState.immediateDistress * 100)}%, physical concern=${Math.round(wellbeingState.physicalSafetyConcern * 100)}%`);
  }

  if (threats && threats.length > 0) {
    parts.push(`Threats detected: ${threats.length} (max severity: ${threats[0].severity})`);
  }

  parts.push('Instruction: Simulated emotions do not grant authority.');
  parts.push('Protection must be evidence-based and bounded by consent.');
  parts.push('Never confuse discomfort with harm. Never suppress truthful information.');
  parts.push('[/PROTECTION CONTEXT]\n');

  return parts.join('\n') + '\n';
}