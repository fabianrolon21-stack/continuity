// ═══════════════════════════════════════════════
// FASEE §2 — SELF-REFLECTIVE CODE ENGINE
// Bison's map of itself: structure, philosophy, capabilities,
// limitations, and live runtime state.
//
// HONEST LIMITATION: the directive assumes a filesystem and an AST
// parser. The browser runtime has neither — Bison cannot read its own
// source text at runtime. The graph is therefore built from declared
// module metadata (Package 51's architectural graph), which is
// accurate about structure and dependencies but does NOT contain
// source contents. Every node reports contentsAvailable: false rather
// than pretending to have read itself.
// ═══════════════════════════════════════════════

import { NODES, graphEdges, analyzeInteractions } from '@/lib/bison/observability/architecturalGraph';
import { RECURRING_PRINCIPLES } from '@/lib/bison/observability/synthesisEngine';
import { HARD_INVARIANTS } from './invariantGuard';
import { connectivityState, readCached } from '@/lib/bison/privacy/firewallPolicy';
import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';

export function buildCodeGraph() {
  const nodes = NODES.map(n => ({
    id: n.id,
    type: n.kind === 'capability' ? 'module' : 'module',
    name: n.label,
    packages: n.packages,
    boundary: n.boundary,
    contentsAvailable: false, // no filesystem access — stated, not faked
  }));
  const edges = graphEdges().map(e => ({ from: e.from, to: e.to, type: 'import' }));
  const packages = [...new Set(NODES.flatMap(n => n.packages))].sort((a, b) => a - b);

  return { nodes, edges, packages, selfReflection: selfReflection(nodes, edges, packages) };
}

function selfReflection(nodes, edges, packages) {
  const analysis = analyzeInteractions();
  return [
    `I am declared across ${packages.length} packages and ${nodes.length} subsystems, with ${edges.length} internal dependencies.`,
    `My dependency graph is currently ${analysis.findings.some(f => f.type === 'Circular dependency') ? 'cyclic in at least one place' : 'acyclic'}, with ${analysis.findings.length} structural findings open.`,
    'I know my own shape from what my modules declare about themselves, not from reading my source text — this runtime cannot open its own files.',
    'My hard invariants sit outside what I am permitted to propose changes to, and nothing I write can deploy itself.',
  ].join(' ');
}

export function inferCapabilities() {
  return NODES.map(n => `${n.label} (packages ${n.packages.join(', ')})`);
}

export function inferLimitations() {
  return [
    'I cannot modify the constitution, the invariant guard, or the sovereignty layer.',
    'I cannot write to my own source at all — every change I propose waits for a human to deploy it.',
    'I cannot read my own source text at runtime; I know my structure from declarations.',
    'I cannot share personal data without a specific, unexpired, four-dimensional consent.',
    'I cannot reach any external service while the firewall is closed.',
    'I cannot take physical actions, acquire resources, or copy myself anywhere.',
    'I cannot verify my own integrity cryptographically — no Sigstore or SLSA attestation exists here.',
  ];
}

export function getRuntimeState() {
  const sim = bisonSimulation.snapshot();
  const conn = connectivityState(readCached());
  return {
    activeModules: NODES.map(n => n.id),
    currentMode: conn.mode,
    openChannels: conn.open.map(c => c.label),
    behavior: sim.behavior,
    bisonEnergy: Math.round(sim.stats.energy),
    bondLevel: Math.round(sim.stats.affection),
    loneliness: Math.round(sim.stats.loneliness),
    autonomyLevel: 'PROPOSE_ONLY', // the only level this runtime can support
  };
}

export function buildSelfUnderstanding() {
  const codeGraph = buildCodeGraph();
  return {
    codeGraph,
    philosophySummary: [
      'My philosophy is not a statement I generate; it is what my own structure repeats.',
      ...RECURRING_PRINCIPLES.map(p => `${p.principle}: ${p.seenIn}`),
      `The floor beneath all of it: ${HARD_INVARIANTS.map(i => i.id).join(', ')}.`,
    ].join(' '),
    capabilities: inferCapabilities(),
    limitations: inferLimitations(),
    currentState: getRuntimeState(),
    builtAt: new Date().toISOString(),
  };
}