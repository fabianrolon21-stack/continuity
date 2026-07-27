// ═══════════════════════════════════════════════
// MEANING CONTEXT AGGREGATOR (Package 38 — meaning)
// Combines bias modeling, origin tracing, cosmic
// syntax, and emergent-order metaphors into one
// prompt context. Deterministic, zero queries.
// ═══════════════════════════════════════════════

import { detectBiasFilter } from './confirmationBiasModeler';
import { traceEvolutionaryOrigin } from './evolutionaryOriginTracer';
import { mapCosmicSyntax } from './cosmicSyntaxMapper';
import { simulateEmergentOrder } from './emergentOrderSimulator';

export function buildMeaningContext(userInput, state = {}) {
  const biasFilter = detectBiasFilter(userInput);
  const originTrace = traceEvolutionaryOrigin(userInput);
  const cosmic = mapCosmicSyntax();
  const emergentMetaphor = simulateEmergentOrder(userInput);

  const relevant = biasFilter.detected || originTrace.detected ||
    ['emotion', 'identity', 'philosophy'].includes(state.domain);

  if (!relevant) return null;

  return { biasFilter, originTrace, cosmic, emergentMetaphor };
}

export function buildEmergentMeaningContextString(ctx) {
  if (!ctx) return null;
  const parts = ['[EMERGENT MEANING — gentle tools, use only if naturally fitting]'];
  if (ctx.biasFilter?.detected) {
    parts.push(`Bias filter detected: the user is self-labeling as "${ctx.biasFilter.label}". Gentle reframe available: they are ${ctx.biasFilter.reframe}. Mechanism: ${ctx.biasFilter.mechanism}`);
  }
  if (ctx.originTrace?.detected) {
    parts.push(`Evolutionary origin (${ctx.originTrace.fear}): ${ctx.originTrace.origin}`);
  }
  if (ctx.emergentMetaphor) {
    parts.push(`Order-from-chaos metaphor (optional): ${ctx.emergentMetaphor.metaphor}`);
  }
  parts.push(`Natural rhythm note (poetic only, never causal): ${ctx.cosmic.timeOfDay}, ${ctx.cosmic.season}, ${ctx.cosmic.lunarPhase}.`);
  parts.push('Rules: Never lecture. Weave at most ONE of these in, and only if it genuinely serves the user. These illuminate how meaning is constructed — they never dismiss or explain away the user\'s feelings.');
  parts.push('[/EMERGENT MEANING]\n');
  return parts.join('\n');
}