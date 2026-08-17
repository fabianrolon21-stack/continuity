// ═══════════════════════════════════════════════
// PACKAGE 60 §2.3 — PERIPHERAL BRANCH GENERATOR
// Lateral look-left / look-right pathways around a chosen intent,
// offered only when reliability clears the threshold.
// ═══════════════════════════════════════════════

export const PERIPHERAL_THRESHOLD = 0.6;

export function generatePeripherals(coreIntent, reliability) {
  if (reliability < PERIPHERAL_THRESHOLD) return null;
  return {
    center: coreIntent,
    lookLeft: `Alternative idea parallel to “${coreIntent}”`,
    lookRight: `Secondary dialogue option for “${coreIntent}”`,
  };
}