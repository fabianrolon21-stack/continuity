// ═══════════════════════════════════════════════
// PACKAGE 50 — RISK MATRIX (§6)
// Nine risk dimensions. The overall score — and the single
// worst dimension — determine whether deployment is permitted.
// ═══════════════════════════════════════════════

export const RISK_DIMENSIONS = [
  { id: 'safety', label: 'Safety Risk' },
  { id: 'privacy', label: 'Privacy Risk' },
  { id: 'security', label: 'Security Risk' },
  { id: 'performance', label: 'Performance Risk' },
  { id: 'ethical', label: 'Ethical Risk' },
  { id: 'maintenance', label: 'Maintenance Risk' },
  { id: 'operational', label: 'Operational Risk' },
  { id: 'reputation', label: 'Reputation Risk' },
  { id: 'human_impact', label: 'Human Impact Risk' },
];

const DEPLOY_CEILING = 0.35;   // overall
const DIMENSION_CEILING = 0.6; // any single dimension

export function riskMatrix(proposal) {
  const declared = proposal.risks || {};
  const blast = proposal.scope === 'local' ? 0.5 : 1;
  const reversible = proposal.reversible === false ? 1.5 : 1;

  const rows = RISK_DIMENSIONS.map(d => {
    const score = Math.max(0, Math.min(1, (declared[d.id] ?? 0.1) * blast * reversible));
    return { ...d, score: Math.round(score * 100) / 100, level: score >= 0.6 ? 'HIGH' : score >= 0.3 ? 'MODERATE' : 'LOW' };
  });

  const overall = Math.round((rows.reduce((s, r) => s + r.score, 0) / rows.length) * 100) / 100;
  const worst = rows.reduce((a, b) => (b.score > a.score ? b : a));
  const permitted = overall <= DEPLOY_CEILING && worst.score <= DIMENSION_CEILING;

  return {
    rows,
    overall,
    worst,
    permitted,
    ceilings: { overall: DEPLOY_CEILING, dimension: DIMENSION_CEILING },
    reason: permitted ? null : `Blocked: ${worst.score > DIMENSION_CEILING ? `${worst.label} at ${worst.score} exceeds the ${DIMENSION_CEILING} single-dimension ceiling.` : `Overall risk ${overall} exceeds the ${DEPLOY_CEILING} ceiling.`}`,
  };
}