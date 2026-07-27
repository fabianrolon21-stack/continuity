// ═══════════════════════════════════════════════
// PLANNER DEPENDENCY GRAPH (Part II)
// Explicit dependency declarations per intent.
// The planner loads ONLY declared dependencies —
// nothing else.
//
// Intent → Dependency Resolver → Planner →
//   Context Budget → Cache → Prompt Builder → LLM
// ═══════════════════════════════════════════════

export const DEPENDENCY_GRAPH = {
  META_INSIGHT: {
    requires: ['identity', 'reflection', 'evolution', 'insight', 'constitutional'],
    description: 'Meta-systemic analysis requires identity, reflection, evolution, insight, and constitutional guardrails.',
  },
  BUILDING_STORY: {
    requires: ['buildingStory', 'constitutional', 'reflection'],
    description: 'Building Story simulation requires the simulation engine, constitutional guardrails, and reflection.',
  },
  SOCIAL_NAVIGATION: {
    requires: ['socialNav', 'masking', 'empathyLoop', 'bandwidth', 'humanState'],
    description: 'Social navigation requires relationship data, masking, empathy, bandwidth, and human state.',
  },
  EMOTIONAL_SUPPORT: {
    requires: ['humanState', 'affective', 'bandwidth', 'masking', 'empathyLoop', 'protection', 'constitutional'],
    description: 'Emotional support requires human state, affective context, bandwidth, masking, empathy, protection, and constitutional guardrails.',
  },
  SELF_REFLECTION: {
    requires: ['identity', 'consciousness', 'reflection', 'constitutional'],
    description: 'Self-reflection requires identity, consciousness, reflection, and constitutional guardrails.',
  },
  ORACLE: {
    requires: ['oracle', 'constitutional', 'provenance'],
    description: 'Oracle consultation requires the oracle engine, constitutional guardrails, and provenance tracking.',
  },
  SCIENCE: {
    requires: ['neuroKnowledge', 'curatedKnowledge', 'constitutional'],
    description: 'Science questions require neuroscience knowledge, curated knowledge, and constitutional guardrails.',
  },
  KNOWLEDGE: {
    requires: ['curatedKnowledge', 'constitutional'],
    description: 'Knowledge questions require curated knowledge and constitutional guardrails.',
  },
  DEBUGGING: {
    requires: ['cognitive', 'constitutional'],
    description: 'Debugging requires cognitive context and constitutional guardrails.',
  },
  GENERAL_CHAT: {
    requires: ['affective', 'constitutional', 'runtime', 'world', 'temporal', 'protection', 'selfModel', 'bandwidth', 'masking', 'empathyLoop', 'provenance', 'nonEvidentiaryFirewall'],
    description: 'General chat requires core infrastructure contexts.',
  },
  TECHNICAL: {
    requires: ['constitutional', 'runtime', 'temporal', 'protection', 'bandwidth', 'provenance', 'nonEvidentiaryFirewall'],
    description: 'Technical questions require core infrastructure with reduced emotional context.',
  },
  CONSTITUTION: {
    requires: ['constitutional', 'runtime'],
    description: 'Constitutional questions require constitutional guardrails and runtime.',
  },
  CREATIVE: {
    requires: ['constitutional', 'runtime', 'humor'],
    description: 'Creative tasks require constitutional guardrails, runtime, and humor.',
  },
  IMPLEMENTATION: {
    requires: ['constitutional', 'runtime', 'cognitive'],
    description: 'Implementation requires constitutional guardrails, runtime, and cognitive context.',
  },
  WORLD: {
    requires: ['constitutional', 'runtime', 'world', 'temporal'],
    description: 'World questions require constitutional guardrails, runtime, world awareness, and temporal context.',
  },
  TIME: {
    requires: ['constitutional', 'runtime', 'temporal'],
    description: 'Time questions require constitutional guardrails, runtime, and temporal context.',
  },
};

export function getDependencies(intent) {
  const entry = DEPENDENCY_GRAPH[intent];
  if (!entry) return DEPENDENCY_GRAPH.GENERAL_CHAT.requires;
  return [...entry.requires];
}

export function getDependencyReason(module, intent) {
  const entry = DEPENDENCY_GRAPH[intent];
  if (!entry) return 'Default context';
  if (entry.requires.includes(module)) {
    return `Dependency of ${intent}`;
  }
  return `Optional for ${intent}`;
}

export function resolveTransitiveDeps(modules) {
  // Modules may declare their own dependencies in the registry;
  // this resolves those transitively.
  const resolved = new Set(modules);
  const queue = [...modules];
  while (queue.length > 0) {
    const mod = queue.shift();
    const deps = REGISTRY_DEPS[mod];
    if (!deps) continue;
    for (const dep of deps) {
      if (!resolved.has(dep)) {
        resolved.add(dep);
        queue.push(dep);
      }
    }
  }
  return [...resolved];
}

// Deadlock detection: find circular dependencies in the registry
export function detectCycles() {
  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(node, path) {
    visited.add(node);
    stack.add(node);

    const deps = REGISTRY_DEPS[node] || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep, [...path, dep]);
      } else if (stack.has(dep)) {
        const cycleStart = path.indexOf(dep);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), dep]);
        }
      }
    }

    stack.delete(node);
  }

  for (const node of Object.keys(REGISTRY_DEPS)) {
    if (!visited.has(node)) dfs(node, [node]);
  }

  return cycles;
}

// Minimal dependency map (supplements the registry)
const REGISTRY_DEPS = {
  metaInsight: ['reflection', 'identity', 'cognitive'],
  buildingStory: ['reflection'],
  socialNav: ['masking', 'empathyLoop', 'bandwidth', 'humanState'],
  humanState: ['affective'],
  protection: ['affective'],
  bandwidth: ['affective'],
  fairness: ['adaptation'],
  stressPropagation: ['humanState'],
  communicationAdaptation: ['humanState'],
};