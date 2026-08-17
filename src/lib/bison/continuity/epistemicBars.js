// ═══════════════════════════════════════════════
// PACKAGE 60 §2.6 — EPISTEMIC BARS (Ancient System Bars)
// KNOWN / INFERRED / SPECULATIVE / UNKNOWN, derived deterministically
// from the reliability report — never artificially inflated.
// ═══════════════════════════════════════════════

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

export function computeBars(reliabilityReport) {
  const { reliability = 50, unknowns = 2, alternatives = 2 } = reliabilityReport;
  const known = clamp(reliability * 0.8);
  const unknown = clamp(unknowns * 12);
  const inferred = clamp((100 - known) * 0.5 + alternatives * 4);
  const speculative = clamp(100 - known * 0.6 - inferred * 0.4 - unknown * 0.3);
  return { known, inferred, speculative, unknown };
}

export function barGraph(percent) {
  const filled = Math.round(percent / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}