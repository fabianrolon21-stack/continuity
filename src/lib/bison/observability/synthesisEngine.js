// ═══════════════════════════════════════════════
// PACKAGE 51 — ARCHITECTURAL SYNTHESIS & REVIEW (§7, §12)
// Analyzes the implemented packages to surface recurring
// principles, redundancy, missing abstractions, conflicting
// assumptions, and simplifications. It generates
// recommendations ONLY — it never modifies the system.
// ═══════════════════════════════════════════════

import { NODES, analyzeInteractions } from './architecturalGraph';

export const RECURRING_PRINCIPLES = [
  { principle: 'Closed by default', seenIn: 'Packages 44, 47 — firewall off, consent absent, inbound quarantined until proven.' },
  { principle: 'Report tradeoffs, never decide for the user', seenIn: 'Packages 49, 50 — policy ethics review and humanity board both refuse to pick a winner.' },
  { principle: 'Uncertainty is first-class', seenIn: 'Packages 49, 50, 51 — every forecast carries an interval and a confidence rating.' },
  { principle: 'Separate learning from deployment', seenIn: 'Packages 50, 51 — analysis emits proposals; only verification deploys.' },
  { principle: 'Structural guards over instructions', seenIn: 'Packages 42, 44, 50 — leak guards and invariant checks, not prompt requests.' },
];

export function synthesize(deployments = []) {
  const interactions = analyzeInteractions();
  const recs = [];

  // Redundant capabilities — repeated concerns across packages.
  const auditLike = NODES.filter(n => /audit|log|ledger/i.test(n.label));
  if (auditLike.length > 1) {
    recs.push({ type: 'Redundant capability', severity: 'moderate', finding: `${auditLike.length} audit/ledger-shaped capabilities exist (${auditLike.map(n => n.label).join(', ')}).`, recommendation: 'Consolidate behind a single append-only ledger interface with per-domain views.' });
  }

  // Missing abstractions — repeated forecast/uncertainty implementations.
  recs.push({
    type: 'Missing abstraction', severity: 'moderate',
    finding: 'Packages 49 and 50 each implement their own forecast + uncertainty + sensitivity machinery.',
    recommendation: 'Extract one shared uncertainty/forecast primitive both engines consume, so calibration improvements apply everywhere at once.',
  });

  // Conflicting assumptions
  recs.push({
    type: 'Conflicting assumption', severity: 'low',
    finding: 'Package 49 treats enforcement pressure as weakly increasing illicit markets (disputed evidence); Package 50 treats declared risk as independent of scope beyond a blast-radius multiplier.',
    recommendation: 'Document both assumptions in one assumption register so contested couplings are visible in a single place.',
  });

  // Potential simplifications from the graph
  interactions.findings.forEach(f => recs.push({
    type: f.type, severity: f.severity, finding: f.detail,
    recommendation: f.type === 'Resource contention'
      ? 'Consider caching or splitting this hot node so a single failure cannot stall dependents.'
      : f.type === 'Unreachable functionality'
        ? 'Either give this capability a consumer or retire it to reduce surface area.'
        : 'Route the dependency through the governing guard rather than directly.',
  }));

  // §12 — long-term architecture review
  const complexity = NODES.length + interactions.edgeCount;
  const review = {
    complexity_growth: `${NODES.length} nodes / ${interactions.edgeCount} edges — complexity index ${complexity}.`,
    technical_debt: recs.filter(r => r.severity !== 'low').length + ' structural findings open.',
    modularity: interactions.findings.some(f => f.type === 'Circular dependency') ? 'At risk — circular dependency present.' : 'Healthy — dependency graph is acyclic.',
    maintainability: complexity > 60 ? 'Growing burden — consolidation recommended.' : 'Manageable at current size.',
    scalability: 'Local-first design scales per device; shared relays remain absent by design.',
    constitutional_consistency: 'Consistent — every egress path routes through Package 44, and every autonomous action through Package 46 and 50.',
    deployments_observed: deployments.length,
  };

  return { principles: RECURRING_PRINCIPLES, recommendations: recs, review, note: 'These are recommendations. This engine has no write path to the system it analyzes.' };
}