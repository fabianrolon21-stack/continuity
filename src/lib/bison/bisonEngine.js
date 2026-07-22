// ═══════════════════════════════════════════════
// BISON ENGINE FACADE (Package 010)
// One centralized entry point for all Bison operations.
// Every feature communicates through this engine
// rather than generating independent responses.
//
// Responsibilities:
// • Event processing
// • Memory synthesis
// • Emotional climate
// • Philosophy synthesis
// • Dialogue generation
// • Ethical reflection
// • Relationship summaries
// ═══════════════════════════════════════════════

import { processInteraction, RESPONSE_MODES, EPISTEMIC_STATUS, createMemoryFromMessage, detectCognitiveDistortions } from './pipeline';
import { collectDashboardState } from './dashboardDataCollector';
import { calculateTrustScore, createTrustEvent, TRUST_EVENTS } from './trustScoreCalculator';
import { buildCognitiveContext } from './cognitiveContext';
import { eventBus, emit } from '@/lib/events/eventBus';
import { EVENT_TYPES } from '@/lib/events/eventTypes';

// ── Dialogue Generation ──
export async function processMessage(text, recentHistory = [], options = {}) {
  const result = await processInteraction(text, recentHistory, options);

  // Emit interaction event
  emit(EVENT_TYPES.BISON_INTERACTION, {
    input: text,
    mode: result.mode,
    intent: result.state?.intent,
    domain: result.state?.domain,
  }, 'bison_engine');

  // Emit response event
  emit(EVENT_TYPES.BISON_RESPONSE, {
    mode: result.mode,
    isGardenCandidate: result.isGardenCandidate,
    recurrence: result.recurrence?.detected,
  }, 'bison_engine');

  // Emit trust score event if present
  if (result.trustScoreEvent) {
    emit(EVENT_TYPES.TRUST_SCORE_CHANGED, result.trustScoreEvent, 'bison_engine');
  }

  return result;
}

// ── Memory Synthesis ──
export function createMemory(messageText) {
  const memory = createMemoryFromMessage(messageText);
  emit(EVENT_TYPES.MEMORY_SAVED, { text: messageText }, 'bison_engine');
  return memory;
}

// ── Cognitive State ──
export async function getCognitiveContext() {
  return await buildCognitiveContext();
}

// ── Dashboard / Transparency ──
export async function getDashboardState(lastInteraction = null) {
  return await collectDashboardState(lastInteraction);
}

// ── Trust Score ──
export function computeTrustScore(sessionState, newEvent) {
  const result = calculateTrustScore(sessionState, newEvent);
  if (newEvent) {
    emit(EVENT_TYPES.TRUST_SCORE_CHANGED, { score: result.score, change: newEvent }, 'bison_engine');
  }
  return result;
}

export function createTrustEventFromInteraction(result) {
  if (result?.actionResult?.status === 'DENIED') {
    return createTrustEvent(TRUST_EVENTS.SAFETY_REFUSAL, result.actionResult.error || 'Constitutional constraint');
  }
  return null;
}

// ── Epistemic Utilities ──
export function getEpistemicStatuses() {
  return EPISTEMIC_STATUS;
}

export function getResponseModes() {
  return RESPONSE_MODES;
}

export function analyzeDistortions(text) {
  return detectCognitiveDistortions(text);
}

// ── Event Subscription ──
export function onEvent(eventType, handler) {
  return eventBus.subscribe(eventType, handler);
}

export function onEventOnce(eventType, handler) {
  return eventBus.once(eventType, handler);
}

// ── Event History (for Timeline) ──
export function getEventHistory(limit = 20) {
  return eventBus.getHistory(limit);
}

// Re-export event types for convenience
export { EVENT_TYPES, RESPONSE_MODES, EPISTEMIC_STATUS, TRUST_EVENTS };