// ═══════════════════════════════════════════════
// REALITY EVIDENCE ENGINE (Part XII)
// Replaces GhostVerificationEngine. Verifies evidence
// against sources — does NOT diagnose anxiety.
//
// Returns EvidenceReport:
//   { claim, sources, agreementScore, confidence,
//     status, uncertainties }
//
// Status: SUPPORTED | NOT_SUPPORTED | INSUFFICIENT_EVIDENCE
//
// Never says "Digital Ghost" or "Discarding".
// Always: "Current evidence does not support this
// concern. Uncertainty remains."
// ═══════════════════════════════════════════════

export const EVIDENCE_STATUS = {
  SUPPORTED: 'SUPPORTED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE',
};

export const CONFIDENCE_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export function evaluateEvidence(claim, sources = []) {
  if (!claim) {
    return {
      claim: '',
      sources: [],
      agreementScore: 0,
      confidence: CONFIDENCE_LEVELS.LOW,
      status: EVIDENCE_STATUS.INSUFFICIENT_EVIDENCE,
      uncertainties: ['No claim provided.'],
      origin: 'INFERRED',
    };
  }

  if (sources.length === 0) {
    return {
      claim,
      sources: [],
      agreementScore: 0,
      confidence: CONFIDENCE_LEVELS.LOW,
      status: EVIDENCE_STATUS.INSUFFICIENT_EVIDENCE,
      uncertainties: ['No sources available to verify this claim.'],
      origin: 'INFERRED',
    };
  }

  let supporting = 0;
  let contradicting = 0;
  const uncertainties = [];

  for (const source of sources) {
    if (source.supports === true) supporting++;
    else if (source.supports === false) contradicting++;
    else uncertainties.push(source.uncertainty || 'Source does not clearly support or contradict.');
  }

  const total = sources.length;
  const agreementScore = Math.round((supporting / total) * 100);

  let status, confidence;
  if (supporting > contradicting && agreementScore >= 67) {
    status = EVIDENCE_STATUS.SUPPORTED;
    confidence = CONFIDENCE_LEVELS.HIGH;
  } else if (contradicting > supporting) {
    status = EVIDENCE_STATUS.NOT_SUPPORTED;
    confidence = CONFIDENCE_LEVELS.MEDIUM;
  } else {
    status = EVIDENCE_STATUS.INSUFFICIENT_EVIDENCE;
    confidence = CONFIDENCE_LEVELS.LOW;
  }

  if (uncertainties.length > 0 && status === EVIDENCE_STATUS.SUPPORTED) {
    confidence = CONFIDENCE_LEVELS.MEDIUM;
  }

  return {
    claim,
    sources: sources.map(s => s.name || 'unknown'),
    agreementScore,
    confidence,
    status,
    uncertainties,
    origin: 'DATABASE',
  };
}

export function formatEvidenceReport(report) {
  if (!report) return '';
  if (report.status === EVIDENCE_STATUS.INSUFFICIENT_EVIDENCE) {
    return 'Current evidence does not support this concern. Uncertainty remains.';
  }
  if (report.status === EVIDENCE_STATUS.NOT_SUPPORTED) {
    return 'Current evidence does not support this concern. Uncertainty remains.';
  }
  if (report.status === EVIDENCE_STATUS.SUPPORTED) {
    return `Evidence supports this (${report.agreementScore}% agreement, ${report.confidence} confidence).`;
  }
  return 'Current evidence does not support this concern. Uncertainty remains.';
}

export function buildEvidenceContextString(report) {
  if (!report) return '';
  let s = `\nREALITY EVIDENCE:\n`;
  s += `Claim: ${report.claim}\n`;
  s += `Status: ${report.status}. Confidence: ${report.confidence}. Agreement: ${report.agreementScore}%.\n`;
  if (report.uncertainties.length > 0) {
    s += `Uncertainties: ${report.uncertainties.join('; ')}\n`;
  }
  s += `If evidence is insufficient, say: "Current evidence does not support this concern. Uncertainty remains."\n`;
  return s;
}