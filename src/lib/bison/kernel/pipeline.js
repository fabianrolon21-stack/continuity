// ═══════════════════════════════════════════════
// UNIFIED PIPELINE (§5) — the ONLY place multiple subsystems are
// invoked together. Classifier routing decides which run.
// ═══════════════════════════════════════════════

import { BISON_EVENTS } from '@/lib/bison/kernel/kernelTypes';

const ROUTES = [
  { route: 'emotional', pattern: /(feel|felt|jealous|angry|furious|sad|afraid|scared|anxious|excited|lonely|guilt|frustrat|miss (her|him|them))/i, package: 'emotion' },
  { route: 'introspective', pattern: /(about to|going to|i want to|i will|i should|make (her|him|them)|so (she|he|they))/i, package: 'introspection' },
  { route: 'decision', pattern: /(decide|decision|choice|choose|option|uncertain|not sure|should i|dilemma)/i, package: 'decision' },
  { route: 'social', pattern: /(viewed my|status|left me on read|reply|replied|ignoring|text(ed)? (her|him|them))/i, package: 'social' },
  { route: 'resource', pattern: /(battery|memory|slow|lag|resource|cpu|performance)/i, package: 'resources' },
];

export function classifyRoute(input) {
  const routes = ROUTES.filter(({ pattern }) => pattern.test(input));
  return routes.length ? routes : [{ route: 'general', package: 'emotion' }];
}

export function createPipeline({ registry, bus, stateManager, contextManager }) {
  return {
    async process(input) {
      const context = contextManager.build(input);
      bus.publish(BISON_EVENTS.USER_INPUT, { input }, 'kernel', context.sessionId);
      stateManager.update('context', { lastInput: input, lastInputAt: context.timestamp });
      bus.publish(BISON_EVENTS.CONTEXT_UPDATED, { sessionId: context.sessionId }, 'kernel', context.sessionId);

      const mode = stateManager.get('runtime').mode;
      const routes = classifyRoute(input);
      const results = {};

      for (const { route, package: packageId } of routes) {
        // QUIET/SAFE keep only core interaction, memory, and safety.
        if ((mode === 'QUIET' || mode === 'SAFE') && !['emotional', 'general'].includes(route)) continue;
        const pkg = registry.get(packageId);
        if (!pkg?.evaluate) continue;
        try {
          results[route] = await pkg.evaluate(context);
        } catch (error) {
          bus.publish(BISON_EVENTS.PACKAGE_ERROR, { package: packageId, error: error.message }, 'pipeline', context.sessionId);
          registry.disable(packageId);
          stateManager.update('runtime', { degraded: true });
        }
      }

      // Memory always records the episode (capability: remember).
      try { await registry.get('memory')?.evaluate(context, results); } catch {}

      const response = {
        sessionId: context.sessionId,
        routes: routes.map(({ route }) => route),
        mode,
        results,
        awaitingUserSelection: !!results.decision,
        summary: buildSummary(routes, results),
      };
      bus.publish(BISON_EVENTS.UI_UPDATED, { routes: response.routes }, 'pipeline', context.sessionId);
      return response;
    },
  };
}

function buildSummary(routes, results) {
  const parts = [];
  if (results.emotional?.dominant) parts.push(`Signal: ${results.emotional.dominant.signal} (${results.emotional.dominant.userStated ? 'stated' : 'inferred'})`);
  if (results.introspective?.egoThreat?.threatDetected) parts.push(`Defensive impulse detected: ${results.introspective.egoThreat.defensiveImpulse}`);
  if (results.decision) parts.push('Decision framed — awaiting your selection.');
  if (results.social) parts.push('Multiple interpretations preserved — the other mind stays unknown.');
  return parts.join(' · ') || 'Processed with no special routing.';
}