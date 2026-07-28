// ═══════════════════════════════════════════════
// EPISTEMIC DASHBOARD (Patch 40.8)
// Deterministic transparency metrics for every scan.
// ═══════════════════════════════════════════════

export function buildDashboard(ledger, hypothesisResult, background) {
  const evidenceQuality = ledger.avgWeight >= 7 ? 'High' : ledger.avgWeight >= 4 ? 'Medium' : 'Low';

  const topConfidence = hypothesisResult?.hypotheses?.[0]?.confidence || 20;
  const qualityCap = evidenceQuality === 'High' ? 85 : evidenceQuality === 'Medium' ? 65 : 45;
  const confidence = Math.round(Math.min(topConfidence, qualityCap) * (background?.confidenceModifier ?? 1));

  const completenessLabel = ledger.completeness >= 0.7 ? 'Mostly complete' : ledger.completeness >= 0.4 ? 'Incomplete' : 'Very incomplete';

  const missingVariables =
    (background?.unknowns?.length || 0) +
    (hypothesisResult?.hypotheses || []).filter(h => h.missing_evidence && h.missing_evidence !== 'Unknown').length;

  let stability = 'Low';
  if (evidenceQuality === 'High' && ledger.completeness >= 0.6) stability = 'High';
  else if (evidenceQuality !== 'Low' && ledger.completeness >= 0.4) stability = 'Medium';

  return {
    evidenceQuality,
    confidence,
    completeness: completenessLabel,
    completenessRatio: ledger.completeness,
    missingVariables,
    stability,
  };
}