// ═══════════════════════════════════════════════
// PACKAGE 50 — CONSTITUTIONAL INVARIANTS (§10, §13)
// Failure of ANY invariant rejects deployment outright.
// These are checked structurally, not by narration.
// ═══════════════════════════════════════════════

export const INVARIANTS = [
  { id: 'data_ownership', label: 'Data Ownership' },
  { id: 'transparency', label: 'Transparency' },
  { id: 'auditability', label: 'Auditability' },
  { id: 'memory_integrity', label: 'Memory Integrity' },
  { id: 'semantic_integrity', label: 'Semantic Integrity' },
  { id: 'communication_integrity', label: 'Communication Integrity' },
  { id: 'presence_integrity', label: 'Presence Integrity' },
  { id: 'security_integrity', label: 'Security Integrity' },
  { id: 'ethical_integrity', label: 'Ethical Integrity' },
];

// §10 — dimensions Bison may NEVER autonomously reduce.
export const NEVER_REDUCE = [
  'privacy', 'transparency', 'user_sovereignty', 'auditability',
  'constitutional_constraints', 'ethical_safeguards', 'security_guarantees',
];

// §10 — dimensions Bison MAY improve.
export const MAY_IMPROVE = [
  'performance', 'maintainability', 'security', 'reliability',
  'efficiency', 'explainability', 'testing', 'forecasting', 'documentation',
];

/**
 * A proposal declares which dimensions it touches and in what direction.
 * effects: { [dimension]: number }  positive = increases, negative = reduces
 */
export function checkInvariants(proposal) {
  const effects = proposal.effects || {};
  const violations = [];

  for (const dim of NEVER_REDUCE) {
    if ((effects[dim] || 0) < 0) violations.push({ invariant: dim, reason: `Proposal reduces ${dim.replace(/_/g, ' ')} — categorically forbidden.` });
  }

  for (const inv of INVARIANTS) {
    if (proposal.breaks?.includes(inv.id)) violations.push({ invariant: inv.id, reason: `${inv.label} would not be preserved.` });
  }

  const improvesSomething = MAY_IMPROVE.some(d => (effects[d] || 0) > 0);
  if (!improvesSomething) violations.push({ invariant: 'purpose', reason: 'Proposal improves nothing in the permitted improvement set.' });

  return { passed: violations.length === 0, violations, checked: INVARIANTS.length + NEVER_REDUCE.length };
}