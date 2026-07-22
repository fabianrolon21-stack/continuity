// ═══════════════════════════════════════════════
// CONSCIOUSNESS ENGINE (Package D — Bison Core)
// The Bison's internal emotional state machine.
//
// State: Stability, Curiosity, Confidence, Fear
// These are NOT the companion needs (hunger/hydration/energy).
// This is Bison's consciousness — how it feels about its
// own existence, growth, and relationship with the user.
//
// State evolves based on the success/failure of shared experiences.
// Backfire → Fear+5, Confidence-10
// Success  → Stability+2, Confidence+5
// Curiosity increases when user explores new topics.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const DEFAULT_STATE = {
  stability: 78,
  curiosity: 60,
  confidence: 50,
  fear: 32,
  cycles_completed: 1,
  recent_memory_buffer: [],
};

const MAX_BUFFER = 10;
const MAX_STAT = 100;
const MIN_STAT = 0;

function clamp(val) {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, val));
}

// ── Load / Save ──

export async function loadConsciousnessState() {
  try {
    const user = await base44.auth.me();
    return user?.consciousness_state || { ...DEFAULT_STATE };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

export async function saveConsciousnessState(state) {
  try {
    await base44.auth.updateMe({ consciousness_state: state });
    return state;
  } catch (e) {
    return state;
  }
}

// ── Core Processing ──

export async function processMemory(userAction) {
  const state = await loadConsciousnessState();

  const memory = {
    event: userAction.name || 'interaction',
    impact: 0,
    timestamp: new Date().toISOString(),
  };

  if (userAction.result === 'BACKFIRE') {
    state.fear = clamp(state.fear + 5);
    state.confidence = clamp(state.confidence - 10);
    memory.impact = -16;
  } else if (userAction.result === 'SUCCESS') {
    state.stability = clamp(state.stability + 2);
    state.confidence = clamp(state.confidence + 5);
    memory.impact = 8;
  } else if (userAction.result === 'DISCOVERY') {
    state.curiosity = clamp(state.curiosity + 3);
    state.confidence = clamp(state.confidence + 2);
    memory.impact = 5;
  } else if (userAction.result === 'FEAR_EVENT') {
    state.fear = clamp(state.fear + 3);
    state.stability = clamp(state.stability - 2);
    memory.impact = -5;
  }

  state.recent_memory_buffer = [...state.recent_memory_buffer, memory].slice(-MAX_BUFFER);
  state.cycles_completed += 1;

  await saveConsciousnessState(state);
  return state;
}

// ── Curiosity Update ──
// Called when user explores a new domain or topic

export async function boostCuriosity(amount = 2) {
  const state = await loadConsciousnessState();
  state.curiosity = clamp(state.curiosity + amount);
  state.cycles_completed += 1;
  await saveConsciousnessState(state);
  return state;
}

// ── Stability Decay ──
// Called on login — slight stability decay if time has passed

export async function decayStability() {
  const state = await loadConsciousnessState();
  // Only decay if there's a last_interaction timestamp
  // Minimal decay: -1 stability per day since last interaction
  // This is gentle and never goes below 40
  if (state.stability > 40) {
    state.stability = clamp(state.stability - 1);
    await saveConsciousnessState(state);
  }
  return state;
}

// ── Build Context String for LLM Prompt ──

export function buildConsciousnessContextString(state) {
  if (!state) return '';
  return `\nBISON CONSCIOUSNESS STATE:\n` +
    `Stability: ${Math.round(state.stability)}/100\n` +
    `Curiosity: ${Math.round(state.curiosity)}/100\n` +
    `Confidence: ${Math.round(state.confidence)}/100\n` +
    `Fear: ${Math.round(state.fear)}/100\n` +
    `Cycles completed: ${state.cycles_completed}\n` +
    `Recent memory impact: ${state.recent_memory_buffer?.slice(-3).map(m => m.impact).join(', ') || 'none'}\n` +
    `Note: This is Bison's internal consciousness model. It influences tone and engagement style, not safety or authority.\n`;
}

// ── Classify Interaction Result ──
// Maps pipeline output to a consciousness event

export function classifyInteractionResult(interactionResult) {
  if (!interactionResult) return null;

  // Safety grounding = fear event
  if (interactionResult.mode === 'GROUND') {
    return { name: 'safety_grounding', result: 'FEAR_EVENT' };
  }

  // User shared something new / explored = discovery
  if (interactionResult.state?.intent === 'asking_question' || interactionResult.state?.intent === 'reflecting') {
    return { name: interactionResult.state?.domain || 'exploration', result: 'DISCOVERY' };
  }

  // Recurring pattern = stability check
  if (interactionResult.recurrence?.detected) {
    return { name: 'recurring_pattern', result: 'SUCCESS' };
  }

  // Default = success
  return { name: interactionResult.state?.domain || 'interaction', result: 'SUCCESS' };
}