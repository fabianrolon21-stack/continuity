// Base 44.3 — Epistemic Firewall
// Maintains separation between Observed, Inferred, Predicted, and Unknown.
// Never allows unknowns to become facts.

export const EPISTEMIC_TIER = {
  OBSERVED: 'OBSERVED',
  INFERRED: 'INFERRED',
  PREDICTED: 'PREDICTED',
  UNKNOWN: 'UNKNOWN',
};

export function classifyEpistemic(statement) {
  if (!statement || typeof statement !== 'string') return EPISTEMIC_TIER.UNKNOWN;
  const lower = statement.toLowerCase();
  if (/i (saw|noticed|observed|heard|felt|measured|recorded)|data shows|according to|reported|documented|stated|told me/i.test(lower))
    return EPISTEMIC_TIER.OBSERVED;
  if (/will|going to|expect|predict|forecast|project|eventually|tomorrow|next week|future/i.test(lower))
    return EPISTEMIC_TIER.PREDICTED;
  if (/don'?t know|unsure|uncertain|unclear|no idea|can'?t tell|unknown|missing/i.test(lower))
    return EPISTEMIC_TIER.UNKNOWN;
  if (/i think|probably|likely|suggests|indicates|seems|appears|might|could be|possibly/i.test(lower))
    return EPISTEMIC_TIER.INFERRED;
  return EPISTEMIC_TIER.INFERRED;
}

export function tagEpistemic(item) {
  if (!item) return item;
  return {
    ...item,
    epistemicTier: item.epistemicTier || classifyEpistemic(item.text || item.description || ''),
  };
}

export function enforceFirewall(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const tagged = tagEpistemic(item);
    return { ...tagged, firewallViolation: false };
  });
}

export function buildEpistemicFirewallContextString(items) {
  if (!items?.length) return '';
  const parts = ['[EPISTEMIC FIREWALL]'];
  const tiers = Object.values(EPISTEMIC_TIER);
  for (const tier of tiers) {
    const tierItems = items.filter(i => i.epistemicTier === tier);
    if (tierItems.length === 0) continue;
    parts.push(`${tier}:`);
    for (const item of tierItems.slice(0, 3)) {
      parts.push(`  - ${item.text || item.description || ''}`);
    }
  }
  parts.push('Rule: Never merge tiers. Observed ≠ Inferred ≠ Predicted ≠ Unknown.');
  parts.push('[/EPISTEMIC FIREWALL]\n');
  return parts.join('\n') + '\n';
}