// ═══════════════════════════════════════════════
// PACKAGE 49 — ASSUMPTION ENGINE (§4)
// Every simulation exposes its assumptions. Users may
// change any of them; results update accordingly.
// All values 0–100 with documented defaults.
// ═══════════════════════════════════════════════

export const ASSUMPTIONS = [
  { id: 'funding_level', label: 'Funding Level', note: 'Overall program funding relative to need.', default: 50 },
  { id: 'enforcement_intensity', label: 'Enforcement Intensity', note: 'Policing and prosecution resources applied.', default: 50 },
  { id: 'treatment_capacity', label: 'Treatment Capacity', note: 'Available addiction treatment relative to demand.', default: 40 },
  { id: 'healthcare_access', label: 'Healthcare Access', note: 'How easily the population reaches care.', default: 55 },
  { id: 'regulatory_compliance', label: 'Regulatory Compliance', note: 'How well regulated actors follow the rules.', default: 60 },
  { id: 'inspection_quality', label: 'Inspection Quality', note: 'Rigor and frequency of quality inspection.', default: 50 },
  { id: 'international_cooperation', label: 'International Cooperation', note: 'Cross-border information sharing and joint programs.', default: 45 },
  { id: 'public_education', label: 'Public Education', note: 'Reach and quality of evidence-based education.', default: 45 },
  { id: 'taxation', label: 'Taxation', note: 'Tax rate applied to any legal market.', default: 50 },
  { id: 'participation_rate', label: 'Participation Rate', note: 'Share of affected people engaging with legal channels.', default: 50 },
];

export const defaultAssumptions = () =>
  ASSUMPTIONS.reduce((acc, a) => ({ ...acc, [a.id]: a.default }), {});