// ═══════════════════════════════════════════════
// PACKAGE 51 — ARCHITECTURAL GRAPH (§2, §9)
// A live dependency graph of packages, subsystems,
// capabilities, data flow, and trust boundaries.
// Derived from declared package metadata, so it updates
// as packages are added rather than being hand-drawn.
// ═══════════════════════════════════════════════

export const TRUST_BOUNDARIES = [
  { id: 'local_core', label: 'Local Core', note: 'Runs entirely on device. No egress possible.' },
  { id: 'user_data', label: 'User Data Vault', note: 'Memories, journal, check-ins. Crossing outward requires Package 44 consent.' },
  { id: 'governed_egress', label: 'Governed Egress', note: 'Firewall + consent + sanitization + audit. The only path outward.' },
  { id: 'external', label: 'External World', note: 'Untrusted. Inbound traffic is quarantined until verified.' },
];

// Each node declares which packages it belongs to and what it depends on.
export const NODES = [
  { id: 'identity', label: 'Identity Kernel', kind: 'subsystem', boundary: 'user_data', packages: [1], depends: ['memory'] },
  { id: 'memory', label: 'Memory & Archives', kind: 'subsystem', boundary: 'user_data', packages: [1, 12], depends: [] },
  { id: 'pipeline', label: 'Bison Pipeline', kind: 'subsystem', boundary: 'local_core', packages: [1, 44, 47], depends: ['identity', 'memory', 'sovereignty', 'ustp', 'constitution'] },
  { id: 'constitution', label: 'Constitutional Kernel', kind: 'capability', boundary: 'local_core', packages: [46], depends: [] },
  { id: 'sovereignty', label: 'Data Sovereignty Guard', kind: 'capability', boundary: 'governed_egress', packages: [44], depends: ['firewall', 'consent', 'sanitizer', 'audit'] },
  { id: 'firewall', label: 'External Firewall', kind: 'capability', boundary: 'governed_egress', packages: [44], depends: [] },
  { id: 'consent', label: 'Consent Ledger', kind: 'capability', boundary: 'governed_egress', packages: [44], depends: [] },
  { id: 'sanitizer', label: 'Payload Sanitizer', kind: 'capability', boundary: 'governed_egress', packages: [44], depends: [] },
  { id: 'audit', label: 'Audit Ledger', kind: 'capability', boundary: 'local_core', packages: [44, 51], depends: [] },
  { id: 'ustp', label: 'USTP Protocol', kind: 'subsystem', boundary: 'governed_egress', packages: [47], depends: ['sovereignty', 'constitution', 'concepts'] },
  { id: 'concepts', label: 'Concept Registry', kind: 'capability', boundary: 'local_core', packages: [47], depends: [] },
  { id: 'simulation', label: 'World Simulation', kind: 'subsystem', boundary: 'local_core', packages: [14, 16], depends: ['constitution'] },
  { id: 'policy', label: 'Policy Simulation Engine', kind: 'subsystem', boundary: 'local_core', packages: [49], depends: ['constitution', 'evidence'] },
  { id: 'evidence', label: 'Evidence Base', kind: 'capability', boundary: 'local_core', packages: [49], depends: [] },
  { id: 'soc', label: 'Security Ops & Optimization', kind: 'subsystem', boundary: 'local_core', packages: [50], depends: ['constitution', 'sovereignty', 'forecast', 'audit'] },
  { id: 'forecast', label: 'Forecast & Uncertainty', kind: 'capability', boundary: 'local_core', packages: [50], depends: [] },
  { id: 'observability', label: 'Observability Layer', kind: 'subsystem', boundary: 'local_core', packages: [51], depends: ['audit', 'forecast'] },
  { id: 'presence', label: 'Presence & Sanctuary', kind: 'subsystem', boundary: 'local_core', packages: [7, 8], depends: ['identity'] },
];

export const graphEdges = () =>
  NODES.flatMap(n => n.depends.map(d => ({ from: n.id, to: d })));

// §9 — Package Interaction Analyzer
export function analyzeInteractions() {
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const findings = [];

  // Circular dependencies via DFS
  const cycles = [];
  const visit = (id, path, seen) => {
    if (path.includes(id)) { cycles.push([...path.slice(path.indexOf(id)), id]); return; }
    if (seen.has(id)) return;
    seen.add(id);
    (byId[id]?.depends || []).forEach(d => visit(d, [...path, id], seen));
  };
  NODES.forEach(n => visit(n.id, [], new Set()));
  if (cycles.length) cycles.forEach(c => findings.push({ type: 'Circular dependency', severity: 'high', detail: c.join(' → ') }));

  // Unreachable functionality — nodes nothing depends on and that are not entry points
  const ENTRY = ['pipeline', 'presence', 'observability', 'soc', 'policy', 'simulation'];
  const depended = new Set(NODES.flatMap(n => n.depends));
  NODES.filter(n => !depended.has(n.id) && !ENTRY.includes(n.id))
    .forEach(n => findings.push({ type: 'Unreachable functionality', severity: 'moderate', detail: `${n.label} has no dependents and is not an entry point.` }));

  // Unexpected coupling — a node depending across a trust boundary it does not belong to
  NODES.forEach(n => n.depends.forEach(d => {
    const t = byId[d];
    if (t && t.boundary === 'user_data' && n.boundary === 'governed_egress') {
      findings.push({ type: 'Unexpected coupling', severity: 'high', detail: `${n.label} (egress) depends directly on ${t.label} (user data) — must route through the sovereignty guard.` });
    }
  }));

  // Resource contention — nodes with many dependents
  const counts = {};
  NODES.forEach(n => n.depends.forEach(d => { counts[d] = (counts[d] || 0) + 1; }));
  Object.entries(counts).filter(([, c]) => c >= 4)
    .forEach(([id, c]) => findings.push({ type: 'Resource contention', severity: 'moderate', detail: `${byId[id].label} is depended on by ${c} subsystems — a hot path and single point of failure.` }));

  return {
    findings,
    nodeCount: NODES.length,
    edgeCount: graphEdges().length,
    clean: findings.length === 0,
  };
}