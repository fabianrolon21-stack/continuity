// ═══════════════════════════════════════════════
// PACKAGE 61 §7 — FINANCIAL BOUNDARY ENGINE 2.0
// Debt does not mean "deny everything." Financial information is
// a constraint, never a moral judgment. Bison never transacts.
// ═══════════════════════════════════════════════

export const FINANCIAL_PRIORITIES = ['ESSENTIAL', 'OBLIGATION', 'WORK', 'EDUCATION', 'CHILD', 'HEALTH', 'DISCRETIONARY', 'LUXURY'];

const PROTECTED = ['ESSENTIAL', 'OBLIGATION', 'WORK', 'EDUCATION', 'CHILD', 'HEALTH'];

export function computeFinancialClarity(balance, obligations) {
  const committed = obligations.filter(item => PROTECTED.includes(item.priority)).reduce((sum, item) => sum + item.amount, 0);
  const discretionaryPlanned = obligations.filter(item => !PROTECTED.includes(item.priority)).reduce((sum, item) => sum + item.amount, 0);
  const remaining = balance - committed;
  return {
    balance,
    knownObligations: committed,
    discretionaryPlanned,
    remainingDiscretionary: Math.round((remaining - discretionaryPlanned) * 100) / 100,
    uncertainty: Math.round(Math.max(10, balance * 0.05)),
    note: remaining < 0
      ? 'Committed obligations exceed the current balance — the constraint is timing and sequencing, not a verdict on you.'
      : 'This is a constraint map, not a judgment. Bison never performs transactions.',
  };
}