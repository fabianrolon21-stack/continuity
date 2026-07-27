// ═══════════════════════════════════════════════
// CONTEXT PLANNER (Package 45 + Parts II, III, VII, VIII, X)
// The SINGLE AUTHORITY that decides which context
// modules load for each interaction.
//
// Pipeline flow:
//   Intent → Dependency Resolver → Planner →
//   Context Budget → Cache → Prompt Builder → LLM
//
// Every decision is recorded in RuntimeAuthority.
// Every number originates from the runtime.
// ═══════════════════════════════════════════════

import { CONTEXT_MODULES, PRIORITIES, defaultVerify, VERIFY_STATUS } from './contextRegistry';
import { getDependencies, getDependencyReason, resolveTransitiveDeps } from './plannerDependencyGraph';
import { startTimer, endTimer } from './profiler';
import {
  computeRemainingBudget, getPromptTokenBudget,
  recordContextLoaded, recordContextSkipped, incrementDBQuery,
} from './runtimeAuthority';

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

// ── Intent bundles — optional contexts per intent ──

const INTENT_OPTIONALS = {
  GENERAL_CHAT: ['humanState', 'humor', 'consciousness', 'wellbeingForecast', 'correlationPatterns', 'wellbeingInterventions'],
  EMOTIONAL_SUPPORT: ['consciousness', 'stressPropagation', 'communicationAdaptation', 'humor', 'wellbeingForecast', 'correlationPatterns', 'wellbeingInterventions'],
  SOCIAL: ['socialNav', 'communicationAdaptation'],
  SELF_REFLECTION: ['reflection', 'valueModel', 'continuity'],
  META_ANALYSIS: ['evolution', 'consciousness', 'continuity'],
  BUILDING_STORY: [],
  ORACLE: [],
  TECHNICAL: ['curatedKnowledge', 'cognitive'],
  CONSTITUTION: [],
  SCIENCE: ['curatedKnowledge'],
  KNOWLEDGE: ['neuroKnowledge'],
  CREATIVE: ['humor'],
  DEBUGGING: [],
  IMPLEMENTATION: ['cognitive'],
  WORLD: [],
  TIME: [],
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

// ── Budget enforcement — fits highest priority first ──

function applyBudget(decisions, loadedSet, optionalSet, remainingBudget) {
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
    if (totalTokens <= remainingBudget && totalQueries <= 8) break;
    const mod = CONTEXT_MODULES[name];
    if (!mod) continue;
    totalTokens -= mod.estimatedTokens;
    totalQueries -= mod.estimatedQueries;
    optionalSet.delete(name);
    skippedDueToBudget.push(name);
    decisions[name].decision = 'SKIP';
    decisions[name].reason = 'Budget exceeded — deferred.';
  }

  // If still over budget, trim LOW priority required (never CRITICAL/HIGH)
  if (totalTokens > remainingBudget || totalQueries > 8) {
    const sortedLoaded = [...loadedSet].sort((a, b) =>
      (PRIORITY_ORDER[CONTEXT_MODULES[a]?.priority] || 0) - (PRIORITY_ORDER[CONTEXT_MODULES[b]?.priority] || 0)
    );

    for (const name of sortedLoaded) {
      if (totalTokens <= remainingBudget && totalQueries <= 8) break;
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

// ── Context verification (Part VIII) ──

function verifyContext(name, value) {
  const mod = CONTEXT_MODULES[name];
  if (!mod) return VERIFY_STATUS.INVALID;
  return defaultVerify(value);
}

// ── Main entry: planContext ──

export function planContext(userInput, currentState, options = {}) {
  startTimer('planning');

  const intent = classifyIntent(userInput, currentState);

  // Use the dependency graph to determine required contexts (Part II)
  const depRequired = getDependencies(intent);
  const requiredSet = new Set([...ALWAYS_LOADED, ...depRequired]);
  const optionalSet = new Set(INTENT_OPTIONALS[intent] || []);

  // Check for explicit requests that override intent classification
  for (const [name, check] of Object.entries(EXPLICIT_REQUEST_CHECKS)) {
    if (check(userInput || '')) {
      requiredSet.add(name);
    }
  }

  // Resolve transitive dependencies
  const allResolved = resolveTransitiveDeps([...requiredSet, ...optionalSet]);
  for (const dep of allResolved) {
    if (!optionalSet.has(dep)) requiredSet.add(dep);
  }

  // Compute remaining budget (Part III)
  const remainingBudget = computeRemainingBudget(options.recentHistory || []);

  // Build decisions for all registered contexts (Part VII)
  const decisions = {};
  for (const name of Object.keys(CONTEXT_MODULES)) {
    let decision = 'SKIP';
    if (requiredSet.has(name)) decision = 'LOAD';
    else if (optionalSet.has(name)) decision = 'OPTIONAL';

    const mod = CONTEXT_MODULES[name];
    decisions[name] = {
      decision,
      priority: mod.priority,
      reason: getDependencyReason(name, intent),
      estimatedTokens: mod.estimatedTokens,
      minimumTokens: mod.minimumTokens,
      estimatedQueries: mod.estimatedQueries,
      dependency: mod.dependencies?.[0] || null,
    };
  }

  // Apply budget constraints
  const budgetResult = applyBudget(decisions, requiredSet, optionalSet, remainingBudget);

  // Compute skipped contexts
  const skippedContexts = Object.keys(CONTEXT_MODULES).filter(
    name => !requiredSet.has(name) && !optionalSet.has(name)
  );

  // Record in RuntimeAuthority (Parts VII, X)
  for (const name of requiredSet) {
    const mod = CONTEXT_MODULES[name];
    if (!mod) continue;
    recordContextLoaded({
      module: name,
      reason: getDependencyReason(name, intent),
      dependency: mod.dependencies?.[0] || null,
      priority: mod.priority,
      tokenCost: mod.estimatedTokens,
      loadedAt: new Date().toISOString(),
      origin: 'LIVE',
    });
    // Track DB queries (Part V)
    if (mod.estimatedQueries > 0) {
      for (let i = 0; i < mod.estimatedQueries; i++) incrementDBQuery();
    }
  }

  for (const name of skippedContexts) {
    recordContextSkipped(name, getDependencyReason(name, intent));
  }
  for (const name of budgetResult.skippedDueToBudget) {
    recordContextSkipped(name, 'Budget exceeded — deferred.');
  }

  endTimer('planning');

  return {
    intent,
    requiredContexts: [...requiredSet],
    optionalContexts: [...optionalSet],
    skippedContexts,
    decisions,
    estimatedTotalTokens: budgetResult.totalTokens,
    estimatedTotalQueries: budgetResult.totalQueries,
    tokenBudget: getPromptTokenBudget(),
    queryBudget: 8,
    remainingBudget,
    verifyContext,

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