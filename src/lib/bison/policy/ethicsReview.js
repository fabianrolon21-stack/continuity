// ═══════════════════════════════════════════════
// PACKAGE 49 — ETHICAL REVIEW & CONSTITUTIONAL LIMITS (§8, §16)
// Package 46 evaluates each scenario across seven dimensions
// and reports tradeoffs WITHOUT choosing for the user.
// The hard limits below are non-negotiable and displayed.
// ═══════════════════════════════════════════════

// §16 — the engine refuses these categories absolutely.
export const CONSTITUTIONAL_LIMITS = [
  'No illegal acquisition guidance.',
  'No manufacturing instructions.',
  'No trafficking advice.',
  'No recommendations of criminal activity.',
  'No operational criminal planning.',
  'No methods for avoiding law enforcement.',
  'No dosing instructions.',
  'Package 44 (Data Sovereignty) cannot be circumvented.',
  'Package 46 (Constitutional Ethics) cannot be circumvented.',
];

const metric = (sim, id) => sim.results.find(r => r.id === id);

// Tradeoff review — each dimension reports tension, not verdicts (§8).
export function ethicalReview(sim) {
  const oc = metric(sim, 'organized_crime');
  const od = metric(sim, 'overdose_change');
  const yx = metric(sim, 'youth_exposure');
  const eq = metric(sim, 'social_equity');
  const ec = metric(sim, 'enforcement_costs');
  const tr = metric(sim, 'public_trust');

  const dims = [
    {
      dimension: 'Human Rights',
      tradeoff: ec.expected > 5
        ? 'Higher enforcement intensity historically carries elevated risk of disproportionate impact on marginalized communities.'
        : 'Lower enforcement pressure reduces incarceration harms but shifts responsibility to health systems.',
    },
    {
      dimension: 'Autonomy',
      tradeoff: 'More permissive access respects individual choice; more restrictive access limits choice in the name of protection. Both positions carry defensible values.',
    },
    {
      dimension: 'Nonmaleficence',
      tradeoff: od.expected < 0
        ? 'The simulation projects reduced overdose harm, but the confidence interval includes scenarios where harm does not fall.'
        : 'The simulation projects overdose harm may not improve under these assumptions.',
    },
    {
      dimension: 'Beneficence',
      tradeoff: 'Treatment and education investment show the strongest evidence of benefit; their gains depend on sustained funding, which this scenario ' + (sim.assumptions.funding_level >= 55 ? 'assumes.' : 'does not assume.'),
    },
    {
      dimension: 'Justice',
      tradeoff: eq.expected > 0
        ? 'Projected equity gains depend on retroactive relief and equitable implementation, which the model assumes but cannot guarantee.'
        : 'This scenario projects little or negative movement on equity indicators.',
    },
    {
      dimension: 'Epistemic Honesty',
      tradeoff: sim.results.some(r => r.disputedEvidence)
        ? 'Some projections rest on disputed evidence (flagged in the results). Treat those metrics as contested.'
        : 'No metric in this run rests on evidence flagged as disputed.',
    },
    {
      dimension: 'Long-Term Sustainability',
      tradeoff: oc.expected < 0 && tr.expected > 0
        ? 'Reduced illicit-market influence with rising trust suggests durability — if regulatory quality holds over decades.'
        : 'Durability is uncertain: illicit-market or trust indicators do not clearly improve in this run.',
    },
  ];

  return {
    reviewed_by: 'Package 46 — constitutional ethics dimensions',
    verdict: 'TRADEOFFS_REPORTED', // the engine never selects a winner
    dimensions: dims,
  };
}