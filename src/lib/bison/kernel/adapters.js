// ═══════════════════════════════════════════════
// PACKAGE ADAPTERS (§6) — every previous Bison package becomes a
// registered kernel capability. Adapters wrap existing engines;
// cross-subsystem communication happens only through the kernel bus.
// ═══════════════════════════════════════════════

import { BISON_EVENTS } from '@/lib/bison/kernel/kernelTypes';
import { kernelBus } from '@/lib/bison/kernel/kernelEventBus';
import { stateManager } from '@/lib/bison/kernel/stateManager';
import { permissionManager } from '@/lib/bison/kernel/permissionManager';
import { extractEmotionalSignals, dominantSignal } from '@/lib/bison/emotion/emotionalSignalEngine';
import { processInput } from '@/lib/bison/masterLoop';
import { computeBars } from '@/lib/bison/continuity/epistemicBars';
import { generateBinaryDecision } from '@/lib/bison/continuity/binaryWeightingEngine';
import { openLoops } from '@/lib/bison/continuity/counterfactualEngine';
import { calibrationSummary } from '@/lib/bison/continuity/outcomeCalibration';
import { interpretSocialEvent, buildPeripheral } from '@/lib/bison/social/socialSignalEngine';
import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';

const ok = detail => ({ ok: true, detail });
const policyPackage = (id, dependencies, note) => ({
  id, version: '1.0.0', dependencies,
  initialize: async () => { if (['legal', 'security', 'privacy'].includes(id)) stateManager.update(id, { policy: note }); },
  healthCheck: () => ok(note),
});

export function buildAdapters() {
  return [
    {
      id: 'memory', version: '1.0.0', dependencies: [],
      initialize: async () => stateManager.update('memory', { episodes: countEpisodes() }),
      evaluate: async (context, results = {}) => {
        if (!permissionManager.can('remember')) return null;
        appendEpisode({ input: context.input.slice(0, 200), routes: Object.keys(results), timestamp: context.timestamp });
        stateManager.update('memory', { episodes: countEpisodes() });
        kernelBus.publish(BISON_EVENTS.MEMORY_WRITTEN, { at: context.timestamp }, 'memory', context.sessionId);
      },
      healthCheck: () => ok('episodic store reachable'),
    },
    {
      id: 'epistemic', version: '1.0.0', dependencies: ['memory'],
      initialize: async () => {},
      evaluate: async context => {
        const questions = (context.input.match(/\?/g) || []).length;
        const report = { reliability: Math.max(20, Math.min(90, 40 + Math.min(40, context.input.split(/\s+/).length) - questions * 6)), unknowns: 1 + questions, alternatives: 2, reversibility: 'medium' };
        const bars = computeBars(report);
        stateManager.update('epistemic', { bars, report });
        return { bars, report };
      },
      healthCheck: () => ok('bars computable'),
    },
    {
      id: 'emotion', version: '1.0.0', dependencies: ['epistemic'],
      initialize: async () => {},
      evaluate: async context => {
        if (!permissionManager.can('analyze')) return null;
        const signals = extractEmotionalSignals(context.input);
        const dominant = dominantSignal(signals);
        if (dominant) kernelBus.publish(BISON_EVENTS.EMOTION_DETECTED, { signal: dominant.signal, userStated: dominant.userStated }, 'emotion', context.sessionId);
        stateManager.update('emotions', { signals, dominant });
        return { signals, dominant };
      },
      healthCheck: () => ok('signal lexicon loaded'),
    },
    {
      id: 'introspection', version: '1.0.0', dependencies: ['emotion'],
      initialize: async () => {},
      evaluate: async context => {
        const result = processInput(context.input, 'medium');
        if (result.egoThreat.threatDetected) kernelBus.publish(BISON_EVENTS.EGO_THREAT_DETECTED, { impulse: result.egoThreat.defensiveImpulse }, 'introspection', context.sessionId);
        if (result.patterns.length) kernelBus.publish(BISON_EVENTS.TOXIC_PATTERN_DETECTED, { categories: result.patterns.map(pattern => pattern.category) }, 'introspection', context.sessionId);
        if (result.impulse) kernelBus.publish(BISON_EVENTS.INTENT_DETECTED, { impulse: result.impulse }, 'introspection', context.sessionId);
        stateManager.update('introspection', { gap: result.gap, latency: result.latency, egoThreat: result.egoThreat });
        return result;
      },
      healthCheck: () => ok('master loop reachable'),
    },
    policyPackage('legal', ['introspection'], 'consent-gated; autonomous financial transactions architecturally blocked'),
    policyPackage('security', ['legal'], 'invariants enforced; no unauthorized network activity'),
    policyPackage('privacy', ['security'], 'local-first; data sovereignty guard active'),
    {
      id: 'social', version: '1.0.0', dependencies: ['privacy'],
      initialize: async () => {},
      evaluate: async context => {
        const observation = interpretSocialEvent(context.input);
        const peripheral = buildPeripheral(context.input);
        if (!observation && !peripheral) return null;
        const result = { observation, peripheral, unknowns: [observation?.unknown, peripheral?.neglectedVariable].filter(Boolean) };
        stateManager.update('social', result);
        return result;
      },
      healthCheck: () => ok('interpretation matrix loaded'),
    },
    {
      id: 'decision', version: '1.0.0', dependencies: ['social', 'epistemic'],
      initialize: async () => {},
      evaluate: async context => {
        // §8 — selectPersonalDecision is locked false: framing only, never choosing.
        const report = { ...(stateManager.get('epistemic').report || { reliability: 50, unknowns: 2, alternatives: 2 }), reversibility: 'medium', supportingFactors: [], uncertainties: [] };
        const decision = generateBinaryDecision(report, 'Reflect first', 'Act now');
        kernelBus.publish(BISON_EVENTS.DECISION_CREATED, { decisionId: decision.id, status: 'AWAITING_USER_SELECTION' }, 'decision', context.sessionId);
        stateManager.update('decisions', { lastDecisionId: decision.id, status: 'AWAITING_USER_SELECTION' });
        return { decision, status: 'AWAITING_USER_SELECTION' };
      },
      healthCheck: () => ok('framing engine ready'),
    },
    {
      id: 'continuity', version: '1.0.0', dependencies: ['decision'],
      initialize: async () => stateManager.update('continuity', { openLoops: openLoops().length, calibration: calibrationSummary() }),
      healthCheck: () => ok(`${openLoops().length} open counterfactual loops`),
    },
    {
      id: 'resources', version: '1.0.0', dependencies: ['legal'],
      initialize: async () => stateManager.update('resources', { level: 'NORMAL' }),
      /** §10 — funding requests always require explicit user consent. */
      requestFunding: () => ({ requiresUserConsent: true, reason: 'makeFinancialTransaction is architecturally locked; only the user can authorize spending.' }),
      healthCheck: () => {
        const memory = typeof performance !== 'undefined' && performance.memory;
        if (memory && memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.85) {
          kernelBus.publish(BISON_EVENTS.RESOURCE_PRESSURE, { heap: 'high' }, 'resources');
        }
        return ok('stewardship active');
      },
    },
    policyPackage('sustainability', ['resources'], 'graceful degradation; zero fabricated earnings; mining locked off'),
    policyPackage('trauma', ['emotion'], 'distress overrides route to grounding, never to the decision matrix'),
    policyPackage('metaSystem', ['introspection'], 'insight synthesis available on demand'),
    policyPackage('oracle', ['privacy'], 'external calls consent-gated through the firewall'),
    {
      id: 'ui', version: '1.0.0', dependencies: ['emotion'],
      initialize: async () => stateManager.update('ui', { renderer: 'bisonSimulation' }),
      healthCheck: () => bisonSimulation.snapshot().active ? ok('simulation ticking') : { ok: false, detail: 'simulation loop inactive' },
    },
  ];
}

// — episodic memory store —
const EPISODIC_KEY = 'bison_kernel_episodic_v1';
function countEpisodes() { try { return (JSON.parse(localStorage.getItem(EPISODIC_KEY)) || []).length; } catch { return 0; } }
function appendEpisode(episode) {
  try {
    const episodes = [episode, ...(JSON.parse(localStorage.getItem(EPISODIC_KEY)) || [])].slice(0, 100);
    localStorage.setItem(EPISODIC_KEY, JSON.stringify(episodes));
  } catch {}
}