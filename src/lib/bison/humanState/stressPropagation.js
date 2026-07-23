// Base 44.2 — Stress Propagation
// Models stress as weighted relationships between life domains.
// Stress in one domain can affect another. Weights, not deterministic rules.
// Never infers hidden motives as facts.

const STRESS_EDGES = [
  { source: 'finances', target: 'cognitive_bandwidth', weight: 0.6 },
  { source: 'finances', target: 'emotional_stability', weight: 0.5 },
  { source: 'sleep', target: 'emotional_reactivity', weight: 0.7 },
  { source: 'sleep', target: 'cognitive_bandwidth', weight: 0.5 },
  { source: 'workload', target: 'planning_ability', weight: 0.5 },
  { source: 'workload', target: 'emotional_stability', weight: 0.4 },
  { source: 'workload', target: 'physical_energy', weight: 0.4 },
  { source: 'relationships', target: 'emotional_stability', weight: 0.6 },
  { source: 'health', target: 'physical_energy', weight: 0.7 },
  { source: 'health', target: 'cognitive_bandwidth', weight: 0.3 },
  { source: 'workload', target: 'sleep', weight: 0.4 },
  { source: 'emotional_reactivity', target: 'decision_quality', weight: 0.5 },
  { source: 'cognitive_bandwidth', target: 'decision_quality', weight: 0.6 },
];

const DOMAIN_PATTERNS = {
  finances: [/money|financial|bills|debt|rent|mortgage|salary|pay|cost|expensive|budget|afford/i],
  sleep: [/sleep|tired|exhausted|insomnia|restless|awake|can't sleep|wake up/i],
  workload: [/work|deadline|project|overwhelm|busy|too much|pressure|meeting|report|presentation/i],
  relationships: [/relationship|partner|friend|family|conflict|argument|breakup|fight|lonely|isolat/i],
  health: [/sick|pain|illness|injury|doctor|health|symptom|fatigue|chronic/i],
};

export function detectStressDomains(input) {
  if (!input || typeof input !== 'string') return [];
  const detected = [];
  for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (patterns.some(p => p.test(input))) detected.push(domain);
  }
  return detected;
}

// Returns map of affected capacity → degradation (0-1, 1 = fully degraded)
export function propagateStress(activeDomains = [], stressLevels = {}) {
  const degradations = {};
  for (const edge of STRESS_EDGES) {
    if (!activeDomains.includes(edge.source)) continue;
    const sourceStress = stressLevels[edge.source] ?? 0.5;
    const impact = sourceStress * edge.weight;
    if (!degradations[edge.target] || impact > degradations[edge.target]) {
      degradations[edge.target] = impact;
    }
  }
  return degradations;
}

export function buildStressPropagationContextString(activeDomains, degradations) {
  if (!activeDomains?.length || !degradations || Object.keys(degradations).length === 0) return '';
  const parts = ['[STRESS PROPAGATION]'];
  parts.push(`Active stress domains: ${activeDomains.join(', ')}`);
  const affected = Object.entries(degradations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  for (const [capacity, degradation] of affected) {
    parts.push(`  ${capacity}: ~${Math.round(degradation * 100)}% degraded`);
  }
  parts.push('Note: Weighted estimates, not deterministic rules. Use to understand context, not to diagnose.');
  parts.push('[/STRESS PROPAGATION]\n');
  return parts.join('\n') + '\n';
}