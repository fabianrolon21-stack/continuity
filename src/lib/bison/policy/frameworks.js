// ═══════════════════════════════════════════════
// PACKAGE 49 — POLICY FRAMEWORKS (§2)
// Legal frameworks the engine can compare. No framework
// is the preferred default; presets are starting pressures
// on the system dynamics, not verdicts.
// ═══════════════════════════════════════════════

// Pressures are -1..1 influences applied to subsystems each tick.
export const FRAMEWORKS = [
  {
    id: 'status_quo',
    label: 'Status Quo',
    note: 'Current mixed criminal/medical approach, unchanged.',
    pressures: { enforcement: 0.3, treatment: 0.0, market_regulation: -0.4, organized_crime: 0.3, public_education: 0.0, revenue: -0.2 },
  },
  {
    id: 'decriminalization',
    label: 'Decriminalization',
    note: 'Personal possession removed from criminal law; supply remains illegal.',
    pressures: { enforcement: -0.2, treatment: 0.4, market_regulation: -0.3, organized_crime: 0.2, public_education: 0.3, revenue: -0.1 },
  },
  {
    id: 'medical_prescription',
    label: 'Medical Prescription Model',
    note: 'Access through clinical prescription and supervised programs.',
    pressures: { enforcement: 0.0, treatment: 0.7, market_regulation: 0.5, organized_crime: -0.2, public_education: 0.4, revenue: 0.0 },
  },
  {
    id: 'regulated_market',
    label: 'Government Regulated Market',
    note: 'State-controlled production and distribution with strict standards.',
    pressures: { enforcement: -0.1, treatment: 0.5, market_regulation: 0.8, organized_crime: -0.5, public_education: 0.5, revenue: 0.5 },
  },
  {
    id: 'commercial_legalization',
    label: 'Commercial Legalization',
    note: 'Licensed private market with advertising and taxation.',
    pressures: { enforcement: -0.3, treatment: 0.2, market_regulation: 0.5, organized_crime: -0.4, public_education: 0.2, revenue: 0.7 },
  },
  {
    id: 'strict_prohibition',
    label: 'Strict Prohibition',
    note: 'Maximum criminal enforcement of possession and supply.',
    pressures: { enforcement: 0.8, treatment: -0.2, market_regulation: -0.6, organized_crime: 0.5, public_education: -0.1, revenue: -0.5 },
  },
  {
    id: 'hybrid_regional',
    label: 'Hybrid Regional Model',
    note: 'Different frameworks by region, coordinated nationally.',
    pressures: { enforcement: 0.1, treatment: 0.3, market_regulation: 0.2, organized_crime: 0.0, public_education: 0.3, revenue: 0.1 },
  },
  {
    id: 'custom',
    label: 'Custom Policy',
    note: 'A hypothetical policy you design in the Policy Lab.',
    pressures: { enforcement: 0.0, treatment: 0.0, market_regulation: 0.0, organized_crime: 0.0, public_education: 0.0, revenue: 0.0 },
  },
];

export const getFramework = (id) => FRAMEWORKS.find(f => f.id === id) || FRAMEWORKS[0];