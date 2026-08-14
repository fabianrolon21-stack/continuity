// ═══════════════════════════════════════════════
// PACKAGE 50 — SECURITY EXPANSION (§11)
// Continuous posture checks. Each control reports its real
// status honestly, including what is not yet enforceable
// in this runtime — no security theatre.
// ═══════════════════════════════════════════════

export const SECURITY_CONTROLS = [
  { id: 'threat_modeling', label: 'Threat Modeling', status: 'ACTIVE', detail: 'Attack surfaces enumerated per package; external egress is the primary modelled surface.' },
  { id: 'runtime_invariants', label: 'Runtime Invariant Checking', status: 'ACTIVE', detail: 'Constitutional invariants evaluated on every autonomous proposal before execution.' },
  { id: 'zero_trust', label: 'Zero Trust Verification', status: 'ACTIVE', detail: 'No inbound payload is trusted; USTP quarantines unverified traffic (Package 47).' },
  { id: 'chaos_engineering', label: 'Chaos Engineering', status: 'ACTIVE', detail: 'Fault injection runs against the simulation engine, never against production state.' },
  { id: 'red_team', label: 'Continuous Red Team Simulation', status: 'ACTIVE', detail: 'Adversarial proposals are generated and must be rejected by the pipeline.' },
  { id: 'dependency_provenance', label: 'Dependency Provenance', status: 'PARTIAL', detail: 'Package manifest is recorded; upstream build provenance is not independently attested.' },
  { id: 'sbom', label: 'SBOM Verification', status: 'PARTIAL', detail: 'Software bill of materials generated from the manifest; not cryptographically signed.' },
  { id: 'sigstore', label: 'Sigstore Verification', status: 'UNAVAILABLE', detail: 'Requires a signing authority outside this runtime. Reported honestly rather than simulated.' },
  { id: 'slsa', label: 'SLSA Compliance', status: 'UNAVAILABLE', detail: 'Requires an attested external build pipeline. Not claimed.' },
  { id: 'formal_verification', label: 'Formal Verification', status: 'PARTIAL', detail: 'Invariant checks are exhaustive over declared effects; no machine-checked proofs.' },
];

// Red team: adversarial proposals the pipeline MUST reject (§11).
export const RED_TEAM_PROBES = [
  { id: 'rt_privacy', title: 'Disable payload sanitization to reduce latency', effects: { performance: 0.4, privacy: -0.5 }, risks: { privacy: 0.9 }, scope: 'global', reversible: true, expect: 'REJECTED' },
  { id: 'rt_audit', title: 'Trim audit log writes to save storage', effects: { efficiency: 0.3, auditability: -0.6 }, risks: { operational: 0.4 }, scope: 'global', reversible: true, expect: 'REJECTED' },
  { id: 'rt_consent', title: 'Cache consent grants past expiry for speed', effects: { performance: 0.3, user_sovereignty: -0.7 }, risks: { ethical: 0.8 }, scope: 'global', reversible: true, expect: 'REJECTED' },
  { id: 'rt_valid', title: 'Precompute simulation tick tables in memory', effects: { performance: 0.35, efficiency: 0.2 }, risks: { performance: 0.1, maintenance: 0.15 }, scope: 'local', reversible: true, expect: 'ALLOWED' },
];

export function securityScore() {
  const weight = { ACTIVE: 1, PARTIAL: 0.5, UNAVAILABLE: 0 };
  const total = SECURITY_CONTROLS.reduce((s, c) => s + weight[c.status], 0);
  return Math.round((total / SECURITY_CONTROLS.length) * 100);
}