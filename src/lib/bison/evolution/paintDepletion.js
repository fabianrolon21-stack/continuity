// ═══════════════════════════════════════════════
// PAINT DEPLETION (Package 38)
// "Paint" = daily cognitive/emotional bandwidth.
// Assigns energy costs to competing algorithms and
// eliminates any that exceed available paint.
// Pure deterministic.
// ═══════════════════════════════════════════════

const BASE_COSTS = {
  BRUTE_FORCE: 85,
  PANIC_LOOP: 95,
  OVER_ACCOMMODATION: 70,
  AVOIDANCE: 60,
  CURIOSITY_EXPLORATION: 40,
  STRUCTURAL_ADAPTATION: 15,
};

export function applyFriction(algorithms, dailyBandwidth, { attachmentAnxiety = 0, activeThreats = 0 } = {}) {
  // Anxiety and active threats inflate the cost of every reaction
  const multiplier = 1 + (Math.min(Math.max(attachmentAnxiety, 0), 1) * 0.3) + (Math.min(activeThreats, 3) * 0.1);
  const paint = Math.max(0, Math.min(100, dailyBandwidth));

  const surviving = [];
  const eliminated = [];

  for (const alg of algorithms) {
    const cost = Math.round((BASE_COSTS[alg.type] ?? 50) * multiplier);
    const costed = { ...alg, energyCost: cost };
    if (cost <= paint) {
      surviving.push(costed);
    } else {
      eliminated.push({ ...costed, eliminationReason: `Energy cost ${cost} exceeds available paint ${paint}.` });
    }
  }

  return { surviving, eliminated, paint, multiplier: Math.round(multiplier * 100) / 100 };
}