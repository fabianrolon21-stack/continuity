// ═══════════════════════════════════════════════
// PACKAGE 50 — MULTI-HORIZON FORECASTING & UNCERTAINTY (§4, §5)
// Every proposal is simulated across six horizons. Confidence
// is never mistaken for certainty: each horizon reports its
// evidence, model agreement, data quality, and unknowns.
// ═══════════════════════════════════════════════

export const HORIZONS = [
  { id: 'immediate', label: 'Immediate', decay: 1.0 },
  { id: 'day', label: '1 Day', decay: 0.95 },
  { id: 'week', label: '1 Week', decay: 0.85 },
  { id: 'month', label: '1 Month', decay: 0.7 },
  { id: 'year', label: '1 Year', decay: 0.5 },
  { id: 'long', label: 'Long Horizon', decay: 0.3 },
];

export function forecast(proposal) {
  const gain = proposal.expected_gain ?? 0.1;         // 0..1
  const risk0 = proposal.risks?.operational ?? 0.1;
  const quality = proposal.data_quality ?? 0.6;        // 0..1
  const agreement = proposal.model_agreement ?? 0.7;   // 0..1

  const horizons = HORIZONS.map((h, i) => {
    const benefit = Math.round(gain * h.decay * 100) / 100;
    const risk = Math.round(Math.min(1, risk0 * (1 + i * 0.15)) * 100) / 100;
    // Uncertainty compounds with distance and shrinks with data quality/agreement.
    const uncertainty = Math.round(Math.min(1, (0.08 + i * 0.09) * (2 - quality) * (2 - agreement) * 0.6) * 100) / 100;
    return {
      ...h,
      benefit,
      risk,
      uncertainty,
      confidence: uncertainty < 0.2 ? 'MEDIUM' : uncertainty < 0.4 ? 'LOW-MEDIUM' : 'LOW',
      branch_divergence: Math.round(Math.min(1, i * 0.14 + uncertainty * 0.4) * 100) / 100,
      unknowns: i >= 4 ? ['Environmental drift', 'Unmodelled user behaviour change', 'Dependency ecosystem change'] : i >= 2 ? ['Load pattern change'] : [],
    };
  });

  // §5 — sensitivity: which input moves the long-horizon result most.
  const sensitivity = [
    { input: 'expected_gain', impact: Math.round(gain * 0.3 * 100) / 100 },
    { input: 'data_quality', impact: Math.round((1 - quality) * 0.5 * 100) / 100 },
    { input: 'model_agreement', impact: Math.round((1 - agreement) * 0.5 * 100) / 100 },
  ].sort((a, b) => b.impact - a.impact);

  return {
    horizons,
    evidence: proposal.evidence || ['Local runtime profiler measurements'],
    model_agreement: agreement,
    data_quality: quality,
    sensitivity,
    disclaimer: 'Confidence is not certainty. Every value above is a modelled estimate with an explicit uncertainty band.',
  };
}