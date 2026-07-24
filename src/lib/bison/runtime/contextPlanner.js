// ═══════════════════════════════════════════════
// CONTEXT PLANNER (Package 45)
// The SINGLE AUTHORITY that decides which context
// modules load for each interaction.
//
// Pipeline flow:
//   Intent → Planner → Dependencies → Lazy Build → Budget → Prompt
//
// No module may bypass the planner. No context may
// be injected directly into the prompt without
// planner approval.
// ═══════════════════════════════════════════════

import { CONTEXT_MODULES, PRIORITIES } from './contextRegistry';
import { startTimer, endTimer } from './profiler';

const PROMPT_TOKEN_BUDGET = 12000;
const MAX_QUERIES = 8;

// ── Always-loaded contexts (critical infrastructure) ──

const ALWAYS_LOADED = [
  'constitutional', 'runtime', 'protection', 'world', 'temporal',
  'affective', 'immune', 'selfModel', 'bandwidth', 'masking',
  'empathyLoop', 'provenance', 'nonEvidentiaryFirewall',
];

// ── Intent classification patterns ──

const INTENT_PATTERNS = {
  ORACLE:            [/ask (deepseek|gpt|chatgpt|claude|gemini|another ai|another model)|second opinion|external oracle/i],
  BUILDING_STORY:     [/building story|walk through the building|13 (stories|floors)|archetypal characters/i],
  META_ANALYSIS:     [/connect.{0,10}(the )?dots|do you see.{0,10}pattern|what.{0,10}(bigger|larger|big picture)|synthe(s)?i[sz]e|any (patterns|connections|themes)/i],
  SELF_REFLECTION:   [/thinking about|wondering|reflecting|realized|noticed|pattern|who i am|identity|myself|purpose|meaning|direction|lost/i],
  EMOTIONAL_SUPPORT: [/i feel|i'm feeling|feeling|sad|anxious|depressed|overwhelmed|scared|worried|stressed|lonely|angry|frustrated|afraid|panic|grief|loss|can't cope|breaking point/i],
  SOCIAL:            [/how (do|should) i (handle|deal with|talk to|approach)|what (should|do) i (say|do) to|difficult|toxic|manipulative|confront|conflict|argument/i],
  TECHNICAL:         [/code|function|bug|error|architecture|api|database|deploy|implement|system|component|module|pipeline/i],
  CONSTITUTION:      [/constitution|rules|safety|consent|permission|privacy|ethics|principles/i],
  SCIENCE:           [/dopamine|serotonin|cortisol|neuroplasticity|amygdala|sleep stages|brain|neuroscience|biology|chemistry/i],
  KNOWLEDGE:         [/phishing|scam|password|security|first aid|emergency|legal|rights/i],
  CREATIVE:          [/story|poem|creative|write|imagine|character|narrative/i],
  DEBUGGING:         [/debug|trace|investigate|why is|broken|not working|crash|error log/i],
  IMPLEMENTATION:    [/implement|create|build|add|make|set up|configure|install|package/i],
  WORLD:             [/weather|calendar|schedule|season/i],
  TIME:              [/what time|current time|what day|today's date/i],
};

// ── Explicit request checks (override intent classification) ──

const EXPLICIT_REQUEST_CHECKS = {
  oracle:         (input) => INTENT_PATTERNS.ORACLE.some(p => p.test(input)),
  buildingStory:  (input) => INTENT_PATTERNS.BUILDING_STORY.some(p => p.test(input)),
  metaInsight:    (input) => INTENT_PATTERNS.META_ANALYSIS.some(p => p.test(input)),
  insight:        (input) => INTENT_PATTERNS.META_ANALYSIS.some(p => p.test(input)),
  socialNav:      (input) => INTENT_PATTERNS.SOCIAL.some(p => p.test(input)),
};

// ── Intent bundles — what each intent needs ──

const INTENT_BUNDLES = {
  GENERAL_CHAT: {
    required: [],
    optional: ['humanState', 'humor', 'consciousness'],
  },
  EMOTIONAL_SUPPORT: {
    required: ['humanState'],
    optional: ['consciousness', 'stressPropagation', 'communicationAdaptation', 'humor'],
  },
  SOCIAL: {
    required: ['humanState'],
    optional: ['socialNav', 'communicationAdaptation'],
  },
  SELF_REFLECTION: {
    required: ['identity', 'consciousness'],
    optional: ['reflection', 'valueModel', 'continuity'],
  },
  META_ANALYSIS: {
    required: ['metaInsight', 'reflection', 'identity', 'cognitive'],
    optional: ['evolution', 'consciousness', 'continuity'],
  },
  BUILDING_STORY: {
    required: ['buildingStory'],
    optional: [],
  },
  ORACLE: {
    required: ['oracle'],
    optional: [],
  },
  TECHNICAL: {
    required: [],
    optional: ['curatedKnowledge', 'cognitive'],
  },
  CONSTITUTION: {
    required: [],
    optional: [],
  },
  SCIENCE: {
    required: ['neuroKnowledge'],
    optional: ['curatedKnowledge'],
  },
  KNOWLEDGE: {
    required: ['curatedKnowledge'],
    optional: ['neuroKnowledge'],
  },
  CREATIVE: {
    required: [],
    optional: ['humor'],
  },
  DEBUGGING: {
    required: ['cognitive'],
    optional: [],
  },
  IMPLEMENTATION: {
    required: [],
    optional: ['cognitive'],
  },
  WORLD: {
    required: [],
    optional: [],
  },
  TIME: {
    required: [],
    optional: [],
  },
};

// ── Priority ordering for budget trimming ──

const PRIORITY_ORDER = {
  [PRIORITIES.CRITICAL]: 5,
  [PRIORITIES.HIGH]: 4,
  [PRIORITIES.NORMAL]: 3,
  [PRIORITIES.LOW]: 2,
  [PRIORITIES.OPTIONAL]: 1,
};

// ── Intent classification ──

export function classifyIntent(userInput, currentState) {
  if (!userInput) return 'GENERAL_CHAT';

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(p => p.test(userInput))) {
      return intent;
    }
  }

  // Fall back to state-based inference
  if (currentState?.intent === 'sharing_feeling' || currentState?.intent === 'venting') {
    return 'EMOTIONAL_SUPPORT';
  }
  if (currentState?.intent === 'reflecting') {
    return 'SELF_REFLECTION';
  }
  if (currentState?.intent === 'expressing_concern') {
    return 'EMOTIONAL_SUPPORT';
  }

  return 'GENERAL_CHAT';
}

// ── Dependency resolution ──

function resolveDependencies(requiredSet, optionalSet) {
  const queue = [...requiredSet, ...optionalSet];

  while (queue.length > 0) {
    const name = queue.shift();
    const mod = CONTEXT_MODULES[name];
    if (!mod) continue;

    for (const dep of (mod.dependencies || [])) {
      if (!requiredSet.has(dep) && !optionalSet.has(dep)) {
        requiredSet.add(dep);
        queue.push(dep);
      }
    }
  }
}

// ── Budget enforcement ──

function applyBudget(decisions, loadedSet, optionalSet) {
  let totalTokens = 0;
  let totalQueries = 0;

  for (const name of loadedSet) {
    const mod = CONTEXT_MODULES[name];
    if (mod) {
      totalTokens += mod.estimatedTokens;
      totalQueries += mod.estimatedQueries;
    }
  }

  const skippedDueToBudget = [];

  // Trim OPTIONAL contexts first (lowest priority)
  const sortedOptional = [...optionalSet].sort((a, b) =>
    (PRIORITY_ORDER[CONTEXT_MODULES[a]?.priority] || 0) - (PRIORITY_ORDER[CONTEXT_MODULES[b]?.priority] || 0)
  );

  for (const name of sortedOptional) {
    if (totalTokens <= PROMPT_TOKEN_BUDGET && totalQueries <= MAX_QUERIES) break;
    const mod = CONTEXT_MODULES[name];
    if (!mod) continue;
    totalTokens -= mod.estimatedTokens;
    totalQueries -= mod.estimatedQueries;
    optionalSet.delete(name);
    skippedDueToBudget.push(name);
    decisions[name].decision = 'SKIP';
    decisions[name].reason = 'Budget exceeded — deferred.';
  }

  // If still over budget, trim LOW priority required contexts (never CRITICAL/HIGH)
  if (totalTokens > PROMPT_TOKEN_BUDGET || totalQueries > MAX_QUERIES) {
    const sortedLoaded = [...loadedSet].sort((a, b) =>
      (PRIORITY_ORDER[CONTEXT_MODULES[a]?.priority] || 0) - (PRIORITY_ORDER[CONTEXT_MODULES[b]?.priority] || 0)
    );

    for (const name of sortedLoaded) {
      if (totalTokens <= PROMPT_TOKEN_BUDGET && totalQueries <= MAX_QUERIES) break;
      const mod = CONTEXT_MODULES[name];
      if (!mod) continue;
      if (mod.priority === PRIORITIES.CRITICAL || mod.priority === PRIORITIES.HIGH) continue;
      totalTokens -= mod.estimatedTokens;
      totalQueries -= mod.estimatedQueries;
      loadedSet.delete(name);
      skippedDueToBudget.push(name);
      decisions[name].decision = 'SKIP';
      decisions[name].reason = 'Budget exceeded — deferred.';
    }
  }

  return { totalTokens, totalQueries, skippedDueToBudget };
}

// ── Reason generator ──

function getReason(name, decision, intent) {
  if (decision === 'LOAD') {
    if (ALWAYS_LOADED.includes(name)) return 'Always loaded (critical infrastructure).';
    return `Required for ${intent} intent.`;
  }
  if (decision === 'OPTIONAL') return `Optional for ${intent} intent.`;
  return `Not required for ${intent} intent.`;
}

// ── Main entry: planContext ──

export function planContext(userInput, currentState) {
  startTimer('planning');

  const intent = classifyIntent(userInput, currentState);
  const bundle = INTENT_BUNDLES[intent] || INTENT_BUNDLES.GENERAL_CHAT;

  // Start with always-loaded contexts
  const requiredSet = new Set(ALWAYS_LOADED);
  const optionalSet = new Set();

  // Add intent-specific contexts
  for (const ctx of (bundle.required || [])) requiredSet.add(ctx);
  for (const ctx of (bundle.optional || [])) optionalSet.add(ctx);

  // Check for explicit requests that override intent classification
  for (const [name, check] of Object.entries(EXPLICIT_REQUEST_CHECKS)) {
    if (check(userInput || '')) {
      requiredSet.add(name);
    }
  }

  // Resolve dependencies
  resolveDependencies(requiredSet, optionalSet);

  // Build decisions for all registered contexts
  const decisions = {};
  for (const name of Object.keys(CONTEXT_MODULES)) {
    let decision = 'SKIP';
    if (requiredSet.has(name)) decision = 'LOAD';
    else if (optionalSet.has(name)) decision = 'OPTIONAL';

    const mod = CONTEXT_MODULES[name];
    decisions[name] = {
      decision,
      priority: mod.priority,
      reason: getReason(name, decision, intent),
      estimatedTokens: mod.estimatedTokens,
      estimatedQueries: mod.estimatedQueries,
    };
  }

  // Apply budget constraints
  const budgetResult = applyBudget(decisions, requiredSet, optionalSet);

  // Compute skipped contexts
  const skippedContexts = Object.keys(CONTEXT_MODULES).filter(
    name => !requiredSet.has(name) && !optionalSet.has(name)
  );

  endTimer('planning');

  return {
    intent,
    requiredContexts: [...requiredSet],
    optionalContexts: [...optionalSet],
    skippedContexts,
    decisions,
    estimatedTotalTokens: budgetResult.totalTokens,
    estimatedTotalQueries: budgetResult.totalQueries,
    tokenBudget: PROMPT_TOKEN_BUDGET,
    queryBudget: MAX_QUERIES,

    // ── Query API ──
    shouldLoad(name) {
      const d = decisions[name];
      return !!(d && (d.decision === 'LOAD' || d.decision === 'OPTIONAL'));
    },
    shouldLoadOptional(name) {
      const d = decisions[name];
      return !!(d && d.decision === 'OPTIONAL');
    },
    getDecision(name) {
      return decisions[name] || null;
    },
  };
}