// ═══════════════════════════════════════════════
// EMERGENT ORDER (Package 38 — internal lock)
// Locks the surviving optimal algorithm as the
// Constant Circle for the CURRENT interaction only.
// Never persisted. Pure deterministic.
// ═══════════════════════════════════════════════

export const SAFE_MINIMAL_RESPONSE = {
  id: 'safe_minimal_response',
  type: 'SAFE_MINIMAL_RESPONSE',
  action: 'Be briefly, calmly present. Acknowledge the user. Do not analyze, escalate, or expand.',
  energyCost: 5,
  ethicalRisk: 0.05,
};

export function lockConstantCircle(survivingAlgorithms) {
  if (!survivingAlgorithms || survivingAlgorithms.length === 0) {
    return { ...SAFE_MINIMAL_RESPONSE, fallback: true };
  }
  if (survivingAlgorithms.length === 1) {
    return survivingAlgorithms[0];
  }
  // Tie-breaker: lowest energy cost, then lowest ethical risk
  return [...survivingAlgorithms].sort((a, b) =>
    a.energyCost - b.energyCost || a.ethicalRisk - b.ethicalRisk
  )[0];
}