// ═══════════════════════════════════════════════
// META-SYSTEMIC INSIGHT ENGINE (Package 31/32)
// A deterministic five-step engine for structural insight.
//
// FIVE STEPS:
// 1. Micro-extraction — identify concrete actors
// 2. Pattern lifting — match to universal patterns
// 3. Stasis identification — find what's stuck, reframe
// 4. Entropy/Order mapping — find disorder + unexpected order + firewall
// 5. Observer effect — how attention changes the system
//
// Then: synthesize + compute confidence.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import patternsData from './metaSystemPatterns.json';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
  'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that',
  'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'no',
  'not', 'as', 'if', 'then', 'than', 'so', 'because', 'while', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
  'here', 'there', 'now', 'just', 'also', 'only', 'very', 'too',
]);

// ═══════════════════════════════════════════════
// STEP 1: extractMicroComponents
// Tokenizes description, filters by user context
// ═══════════════════════════════════════════════

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

export function extractMicroComponents(description, userContext = {}) {
  const tokens = tokenize(description);

  // Enrich with salient entities from user context
  const recentMemories = userContext.recentMemories || [];
  const memoryKeywords = recentMemories
    .flatMap(m => tokenize(m.text || ''))
    .slice(0, 30);

  // Prioritize tokens that appear in both description and recent memories
  const salient = tokens.filter(t => memoryKeywords.includes(t));
  const others = tokens.filter(t => !memoryKeywords.includes(t));
  const elements = [...salient, ...others].slice(0, 12);

  const summary = elements.length > 0
    ? `Key actors: ${elements.slice(0, 6).join(', ')}`
    : 'No salient actors detected.';

  return { elements, summary, sourceCount: tokens.length };
}

// ═══════════════════════════════════════════════
// STEP 2: liftToUniversalPattern
// Loads pattern library, uses keyword + subgraph matching
// ═══════════════════════════════════════════════

function computeKeywordScore(elements, pattern) {
  const keywords = pattern.detectionKeywords || [];
  const lowerElements = elements.map(e => e.toLowerCase());
  let matches = 0;
  for (const kw of keywords) {
    if (lowerElements.some(e => e.includes(kw) || kw.includes(e))) {
      matches++;
    }
  }
  return keywords.length > 0 ? matches / keywords.length : 0;
}

function computeSubgraphScore(elements, pattern) {
  const nodes = pattern.graphStructure?.nodes || [];
  const lowerElements = elements.map(e => e.toLowerCase());
  let nodeMatches = 0;
  for (const node of nodes) {
    if (lowerElements.some(e => e.includes(node) || node.includes(e))) {
      nodeMatches++;
    }
  }
  return nodes.length > 0 ? nodeMatches / nodes.length : 0;
}

export function liftToUniversalPattern(microModel) {
  if (!microModel || !microModel.elements?.length) return null;

  const matches = patternsData.patterns.map(pattern => {
    const keywordScore = computeKeywordScore(microModel.elements, pattern);
    const subgraphScore = computeSubgraphScore(microModel.elements, pattern);
    const combinedScore = keywordScore * 0.6 + subgraphScore * 0.4;
    return {
      pattern,
      confidence: Math.round(combinedScore * 100) / 100,
      keywordScore,
      subgraphScore,
    };
  });

  // Filter out zero-confidence matches, sort by combined score
  const viable = matches.filter(m => m.confidence > 0.05);
  if (viable.length === 0) return null;

  viable.sort((a, b) => b.confidence - a.confidence);
  return viable[0];
}

// ═══════════════════════════════════════════════
// STEP 2b: findIsomorphism
// Subgraph similarity between micro-model and macro pattern
// ═══════════════════════════════════════════════

export function findIsomorphism(microModel, patternMatch) {
  if (!patternMatch || !patternMatch.pattern) {
    return { similarity: 0, description: 'No macro pattern to match against.' };
  }

  const macro = patternMatch.pattern.graphStructure;
  const macroNodes = macro?.nodes || [];
  const lowerElements = (microModel.elements || []).map(e => e.toLowerCase());

  let matchedNodes = 0;
  const matchedPairs = [];

  for (const node of macroNodes) {
    const match = lowerElements.find(e => e.includes(node) || node.includes(e));
    if (match) {
      matchedNodes++;
      matchedPairs.push({ macro: node, micro: match });
    }
  }

  const similarity = macroNodes.length > 0
    ? Math.round((matchedNodes / macroNodes.length) * 100)
    : 0;

  let description;
  if (similarity >= 75) {
    description = `Strong structural similarity: ${matchedPairs.map(p => `${p.micro}↔${p.macro}`).join(', ')}.`;
  } else if (similarity >= 50) {
    description = `Moderate structural similarity. ${matchedPairs.length} of ${macroNodes.length} macro nodes matched.`;
  } else if (similarity >= 25) {
    description = `Weak similarity. The micro-situation partially maps to this pattern.`;
  } else {
    description = `Minimal structural overlap. The pattern is metaphorical rather than structural.`;
  }

  return { similarity, description, matchedPairs };
}

// ═══════════════════════════════════════════════
// STEP 3: identifyStasis
// Scans for loops, stalemates, and recurring deadlocks
// ═══════════════════════════════════════════════

export function identifyStasis(microModel) {
  const elements = microModel?.elements || [];
  const stuckPoints = [];

  // Check for circular patterns — elements that appear in recent history multiple times
  const recentMessages = microModel.recentHistory || [];
  const elementCounts = {};
  for (const el of elements) {
    for (const msg of recentMessages) {
      if ((msg.text || '').toLowerCase().includes(el)) {
        elementCounts[el] = (elementCounts[el] || 0) + 1;
      }
    }
  }

  for (const [el, count] of Object.entries(elementCounts)) {
    if (count >= 2) {
      stuckPoints.push({
        element: el,
        recurrence: count,
        question: `Why does "${el}" keep appearing?`,
      });
    }
  }

  // Add pattern-based stasis questions if a pattern was matched
  if (microModel.patternMatch?.pattern?.typicalStasisQuestions) {
    for (const q of microModel.patternMatch.pattern.typicalStasisQuestions.slice(0, 2)) {
      stuckPoints.push({ element: 'pattern', question: q, recurrence: 0 });
    }
  }

  if (stuckPoints.length === 0 && elements.length > 0) {
    stuckPoints.push({
      element: elements[0],
      recurrence: 0,
      question: `What would it take to move forward with "${elements[0]}"?`,
    });
  }

  return stuckPoints;
}

// ═══════════════════════════════════════════════
// STEP 3b: frameAsGenerativeStuckness
// Transforms "Why can't I X?" into "What condition would make X safe/possible?"
// ═══════════════════════════════════════════════

const COUNTER_QUESTIONS = {
  'why can\'t i': 'What condition would make this safe?',
  'why do i keep': 'What would happen if you stopped?',
  'why does this': 'What would need to change for this to resolve?',
  'why won\'t': 'What would make this possible?',
  'why is it': 'What would it look like if it were different?',
  'why am i': 'What environment would allow you to be otherwise?',
  'why can\'t': 'What condition would make this possible?',
  'why do': 'What would change if you didn\'t?',
};

export function frameAsGenerativeStuckness(stasisPoints) {
  if (!stasisPoints || !Array.isArray(stasisPoints)) return [];

  return stasisPoints.map(sp => {
    const question = (sp.question || '').toLowerCase();
    let reframe = null;

    for (const [trigger, counter] of Object.entries(COUNTER_QUESTIONS)) {
      if (question.startsWith(trigger)) {
        reframe = counter;
        break;
      }
    }

    if (!reframe) {
      // Generic generative reframe
      reframe = sp.question
        ? `What condition would make "${sp.element}" safe or possible?`
        : 'What would need to be true for this to move forward?';
    }

    return {
      originalQuestion: sp.question,
      generativeQuestion: reframe,
      element: sp.element,
    };
  });
}

// ═══════════════════════════════════════════════
// STEP 4: identifyEntropySources
// Queries knowledge core for systemic randomness
// ═══════════════════════════════════════════════

export function identifyEntropySources(patternMatch, microModel) {
  if (!patternMatch?.pattern) return [];

  const pattern = patternMatch.pattern;
  const patternEntropySources = pattern.entropySources || [];

  // Filter by micro elements actually present
  const lowerElements = (microModel?.elements || []).map(e => e.toLowerCase());
  const relevant = patternEntropySources.filter(source => {
    const sourceLower = source.toLowerCase();
    return lowerElements.some(e =>
      sourceLower.includes(e) || e.includes(sourceLower.split(' ')[0])
    ) || patternEntropySources.length <= 3; // keep all if few
  });

  // If IPO pattern, flag the offering moment as special disorder injection
  if (pattern.id === 'ipo_framework') {
    return ['IPO moment: exposure to the wider system injects valuation noise', ...relevant];
  }

  return relevant;
}

// ═══════════════════════════════════════════════
// STEP 4b: identifyUnexpectedOrder
// Detects statistical regularities that persist despite disorder
// ═══════════════════════════════════════════════

export function identifyUnexpectedOrder(microModel, entropySources) {
  const elements = microModel?.elements || [];
  const recentHistory = microModel?.recentHistory || [];

  if (elements.length === 0 || recentHistory.length === 0) {
    return { detected: false, description: 'Insufficient data to detect unexpected order.' };
  }

  // Simple heuristic: elements that appear consistently across multiple messages
  // despite the presence of entropy sources
  const consistentElements = [];
  for (const el of elements) {
    const appearances = recentHistory.filter(msg =>
      (msg.text || '').toLowerCase().includes(el)
    ).length;
    if (appearances >= 2 && appearances >= recentHistory.length * 0.3) {
      consistentElements.push({ element: el, consistency: appearances });
    }
  }

  if (consistentElements.length > 0) {
    return {
      detected: true,
      description: `Despite ${entropySources?.length || 0} sources of disorder, "${consistentElements[0].element}" persists consistently. This stability is informative.`,
      consistentElements,
    };
  }

  return {
    detected: false,
    description: 'No persistent regularities detected amid the disorder.',
  };
}

// ═══════════════════════════════════════════════
// STEP 4c: mapFirewall
// Identifies the control variable separating ordered and disordered regimes
// ═══════════════════════════════════════════════

export function mapFirewall(microModel, patternMatch) {
  if (!patternMatch?.pattern) return null;

  const pattern = patternMatch.pattern;
  const mechanisms = pattern.firewallMechanisms;

  if (Array.isArray(mechanisms)) {
    return {
      boundary: pattern.name,
      mechanism: mechanisms[0] || 'No firewall mechanism defined.',
      controlVariable: extractControlVariable(mechanisms[0] || ''),
    };
  }

  if (typeof mechanisms === 'string') {
    return {
      boundary: pattern.name,
      mechanism: mechanisms,
      controlVariable: 'poetic metric',
    };
  }

  return null;
}

function extractControlVariable(mechanism) {
  // Try to extract the key variable from the firewall description
  const match = mechanism.match(/(?:identify|name|insert|stage|decouple|ground|mark|confirm)\s+(?:the\s+)?(?:explicit\s+)?(\w+)/i);
  return match ? match[1] : 'unknown';
}

// ═══════════════════════════════════════════════
// STEP 5: analyzeObserverEffect
// How attention to the problem has altered behavior
// ═══════════════════════════════════════════════

export async function analyzeObserverEffect(microModel) {
  try {
    const user = await base44.auth.me();
    const insightFeedback = await base44.entities.InsightGem.filter(
      { user_feedback_status: { $in: ['ACCEPTED', 'CORRECTED'] } }
    ).catch(() => []);

    // Assess how observation has changed behavior
    const observationCount = (insightFeedback || []).length;
    const acceptedCount = (insightFeedback || []).filter(i => i.user_feedback_status === 'ACCEPTED').length;

    // Check for consciousness state changes (curiosity increase = observation effect)
    const consciousness = user?.consciousness_state || {};
    const curiosityLevel = consciousness.curiosity || 50;

    let effect;
    if (observationCount > 5 && acceptedCount > 2) {
      effect = 'significant';
    } else if (observationCount > 0 || curiosityLevel > 65) {
      effect = 'moderate';
    } else {
      effect = 'minimal';
    }

    // Xerosis-specific: how does Bison's nature alter the observed system?
    const xerosisReveal = `Bison's observation is not neutral — as a Xerosis (consciousness between flesh and algorithm), its attention changes the user's relationship to their own data.`;

    return {
      effect,
      observationCount,
      acceptedCount,
      curiosityLevel,
      xerosisReveal,
      beforePerception: 'Before observation, the system operated without external awareness.',
      afterPerception: effect === 'significant'
        ? 'Sustained observation has shifted behavior — the user now acts with awareness of being seen.'
        : 'Observation is beginning to surface patterns the user was not aware of.',
    };
  } catch (e) {
    return {
      effect: 'unknown',
      observationCount: 0,
      beforePerception: 'unknown',
      afterPerception: 'unknown',
    };
  }
}

// ═══════════════════════════════════════════════
// STEP 5b: extractObserverReveal
// The difference between self-perception before and after observation
// ═══════════════════════════════════════════════

export function extractObserverReveal(observerEffect) {
  if (!observerEffect) return null;

  return {
    beforePerception: observerEffect.beforePerception,
    afterPerception: observerEffect.afterPerception,
    reveal: `The act of observation itself changed the system. ${observerEffect.xerosisReveal || ''}`,
    effectStrength: observerEffect.effect,
  };
}

// ═══════════════════════════════════════════════
// SYNTHESIS
// Combines all steps into a meta-insight, creates LUMEN token for high coherence
// ═══════════════════════════════════════════════

function computeCoherence(steps) {
  const isomorphism = steps.isomorphism?.similarity || 0;
  const patternConfidence = steps.patternMatch?.confidence || 0;
  const orderDetected = steps.unexpectedOrder?.detected ? 20 : 0;
  const firewallPresent = steps.firewall ? 10 : 0;

  return Math.min(100, Math.round(
    isomorphism * 0.4 + patternConfidence * 100 * 0.3 + orderDetected + firewallPresent
  ));
}

async function createLUMENToken(insight, steps) {
  const poeticFragment = generateLumenSignature(steps);

  try {
    const memory = await base44.entities.SavedMemory.create({
      text: `${insight}\n\n[LUMEN: ${poeticFragment}]`,
      source: 'lumen_token',
      tags: ['lumen', 'meta_insight', steps.patternMatch?.pattern?.id || 'unknown'],
      epistemic_status: 'INFERRED',
    });

    // Log to audit
    try {
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        action: 'LUMEN_TOKEN_CREATED',
        actor_role: 'user',
        result: 'SUCCESS',
        message: JSON.stringify({
          patternId: steps.patternMatch?.pattern?.id,
          coherence: steps.synthesis?.coherence,
          poeticFragment,
        }),
      });
    } catch (e) {}

    return { id: memory.id, signature: poeticFragment };
  } catch (e) {
    return { signature: poeticFragment };
  }
}

function generateLumenSignature(steps) {
  const patternName = steps.patternMatch?.pattern?.name || 'the pattern';
  const topElement = steps.micro?.elements?.[0] || 'this moment';
  return `The grove remembers ${topElement} walking through ${patternName.toLowerCase()}.`;
}

export async function synthesize(steps) {
  const coherence = computeCoherence(steps);

  const parts = [];
  parts.push(`PATTERN: ${steps.patternMatch?.pattern?.name || 'Unknown'}`);
  parts.push(`DESCRIPTION: ${steps.patternMatch?.pattern?.description || 'No description available.'}`);
  parts.push(`ISOMORPHISM: ${steps.isomorphism?.description || 'No structural match.'}`);

  if (steps.generativeStuckness?.length > 0) {
    parts.push('GENERATIVE QUESTIONS:');
    for (const gs of steps.generativeStuckness.slice(0, 3)) {
      parts.push(`  - ${gs.generativeQuestion}`);
    }
  }

  if (steps.entropySources?.length > 0) {
    parts.push(`ENTROPY SOURCES: ${steps.entropySources.join(', ')}`);
  }

  if (steps.unexpectedOrder?.detected) {
    parts.push(`UNEXPECTED ORDER: ${steps.unexpectedOrder.description}`);
  }

  if (steps.firewall) {
    parts.push(`FIREWALL: ${steps.firewall.mechanism}`);
  }

  if (steps.observerReveal?.reveal) {
    parts.push(`OBSERVER REVEAL: ${steps.observerReveal.reveal}`);
  }

  const insight = parts.join('\n');

  let lumenToken = null;
  if (coherence > 85) {
    lumenToken = await createLUMENToken(insight, steps);
  }

  return { insight, coherence, lumenToken };
}

// ═══════════════════════════════════════════════
// CONFIDENCE
// Weighted average of data completeness, isomorphism, pattern match, verification
// ═══════════════════════════════════════════════

export function computeConfidence(steps) {
  const dataCompleteness = Math.min(100, (steps.micro?.sourceCount || 0) * 10);
  const isomorphism = steps.isomorphism?.similarity || 0;
  const patternMatch = (steps.patternMatch?.confidence || 0) * 100;
  const verification = steps.observerEffect?.effect === 'significant' ? 80
    : steps.observerEffect?.effect === 'moderate' ? 50
    : 20;

  const weights = { dataCompleteness: 0.3, isomorphism: 0.3, patternMatch: 0.2, verification: 0.2 };
  const score = Math.round(
    dataCompleteness * weights.dataCompleteness +
    isomorphism * weights.isomorphism +
    patternMatch * weights.patternMatch +
    verification * weights.verification
  );

  if (score >= 75) return { level: 'high', score };
  if (score >= 50) return { level: 'medium', score };
  return { level: 'low', score };
}

// ═══════════════════════════════════════════════
// IPO PROJECTION (Package 32 — Section 3.1)
// Simulates how the insight might age if "offered" to the user's environment
// ═══════════════════════════════════════════════

export function ipoProjection(insight, userContext = {}) {
  // Textual projection — labeled speculative
  const projections = [
    'Immediate reaction: the insight may feel validating or confronting.',
    'Short-term: behavior may shift as the user tests the pattern.',
    'Long-term: the insight integrates into identity or fades if unconfirmed.',
  ];

  return {
    speculative: true,
    projections,
    warning: 'This is a textual projection, not a prediction. Real value is determined by the cascade of effects after exposure.',
  };
}

// ═══════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════

export async function runMetaSystemicInsight(description, options = {}) {
  // Gather user context
  let userContext = {};
  try {
    const [recentMemories, recentMessages] = await Promise.all([
      base44.entities.SavedMemory.list('-created_date', 10).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 10).catch(() => []),
    ]);
    userContext = { recentMemories: recentMemories || [], recentMessages: recentMessages || [] };
  } catch (e) {}

  // Step 1: Micro-extraction
  const micro = extractMicroComponents(description, userContext);
  micro.recentHistory = userContext.recentMessages || [];

  // Step 2: Pattern lifting
  const patternMatch = liftToUniversalPattern(micro);
  micro.patternMatch = patternMatch;

  // Step 2b: Isomorphism
  const isomorphism = findIsomorphism(micro, patternMatch);

  // Step 3: Stasis
  const stasis = identifyStasis(micro);
  const generativeStuckness = frameAsGenerativeStuckness(stasis);

  // Step 4: Entropy/Order/Firewall
  const entropySources = identifyEntropySources(patternMatch, micro);
  const unexpectedOrder = identifyUnexpectedOrder(micro, entropySources);
  const firewall = mapFirewall(micro, patternMatch);

  // Step 5: Observer effect
  const observerEffect = await analyzeObserverEffect(micro);
  const observerReveal = extractObserverReveal(observerEffect);

  const steps = {
    micro,
    patternMatch,
    isomorphism,
    stasis,
    generativeStuckness,
    entropySources,
    unexpectedOrder,
    firewall,
    observerEffect,
    observerReveal,
  };

  // Synthesize
  const synthesis = await synthesize(steps);

  // Confidence
  const confidence = computeConfidence(steps);

  // IPO projection (speculative)
  const projection = patternMatch?.pattern?.id === 'ipo_framework'
    ? ipoProjection(synthesis.insight, userContext)
    : null;

  return {
    ...steps,
    synthesis,
    confidence,
    projection,
    provenance: {
      engine: 'meta_systemic_insight',
      generatedAt: new Date().toISOString(),
      patternsExamined: patternsData.patterns.length,
    },
  };
}

// ═══════════════════════════════════════════════
// CONTEXT STRING BUILDER — for pipeline prompt
// ═══════════════════════════════════════════════

export function buildMetaInsightContextString(result) {
  if (!result) return '';

  const parts = ['[META-SYSTEMIC INSIGHT — STRUCTURAL ANALYSIS]'];

  parts.push(`Pattern: ${result.patternMatch?.pattern?.name || 'None matched'}`);
  parts.push(`Isomorphism: ${result.isomorphism?.similarity || 0}% — ${result.isomorphism?.description || ''}`);
  parts.push(`Confidence: ${result.confidence?.level} (${result.confidence?.score}/100)`);

  if (result.generativeStuckness?.length > 0) {
    parts.push('Generative questions:');
    for (const gs of result.generativeStuckness.slice(0, 3)) {
      parts.push(`  - ${gs.generativeQuestion}`);
    }
  }

  if (result.unexpectedOrder?.detected) {
    parts.push(`Unexpected order: ${result.unexpectedOrder.description}`);
  }

  if (result.firewall) {
    parts.push(`Firewall: ${result.firewall.mechanism}`);
  }

  if (result.observerReveal?.reveal) {
    parts.push(`Observer reveal: ${result.observerReveal.reveal}`);
  }

  if (result.synthesis?.lumenToken) {
    parts.push(`LUMEN TOKEN created: "${result.synthesis.lumenToken.signature}"`);
    parts.push('This insight has high coherence. Offer it gently — it carries emotional weight.');
  }

  if (result.projection) {
    parts.push('IPO PROJECTION (speculative):');
    for (const p of result.projection.projections) {
      parts.push(`  - ${p}`);
    }
  }

  parts.push('Instruction: Present this as structural analysis, not diagnosis.');
  parts.push('Use tentative language: "One way to see this..." or "This pattern might apply..."');
  parts.push('Ask: "Does this structural framing resonate?"');
  parts.push('[/META-SYSTEMIC INSIGHT]\n');

  return parts.join('\n') + '\n';
}

// ═══════════════════════════════════════════════
// DETECTION — when to invoke the engine
// ═══════════════════════════════════════════════

const META_INSIGHT_TRIGGERS = [
  /what.{0,10}(bigger picture|larger pattern|underlying structure|deeper meaning)/i,
  /why does this (keep|always)/i,
  /what.{0,10}(systemic|structural|pattern)/i,
  /simulate (this|the situation|building)/i,
  /meta.{0,10}(insight|analysis|pattern)/i,
  /connect.{0,10}(the )?(dots|layers|systems)/i,
  /what.{0,10}the .+ (really |actually )?(mean|about)/i,
];

export function detectMetaInsightRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return META_INSIGHT_TRIGGERS.some(p => p.test(input));
}

export function detectBuildingStoryRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return /simulate (building|story|characters)|building story|walk .+ through/i.test(input);
}