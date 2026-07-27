// ═══════════════════════════════════════════════
// MEMORY VERIFICATION (Package 46.2)
// Verification states with explicit, audited transitions.
// No memory ever changes state silently — every
// transition is appended to verification_history.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const VERIFICATION_STATES = {
  OBSERVED: 'OBSERVED',
  USER_CONFIRMED: 'USER_CONFIRMED',
  CORRECTED: 'CORRECTED',
  CONTRADICTED: 'CONTRADICTED',
  ARCHIVED: 'ARCHIVED',
};

const ALLOWED_TRANSITIONS = {
  OBSERVED: ['USER_CONFIRMED', 'CORRECTED', 'CONTRADICTED', 'ARCHIVED'],
  USER_CONFIRMED: ['CORRECTED', 'CONTRADICTED', 'ARCHIVED'],
  CORRECTED: ['USER_CONFIRMED', 'CONTRADICTED', 'ARCHIVED'],
  CONTRADICTED: ['CORRECTED', 'USER_CONFIRMED', 'ARCHIVED'],
  ARCHIVED: ['OBSERVED'],
};

export function canTransition(fromState, toState) {
  const allowed = ALLOWED_TRANSITIONS[fromState] || [];
  return allowed.includes(toState);
}

// Every transition requires a reason and is appended to history.
// Returns the updated memory record, or throws if the transition is invalid.
export async function transitionMemoryState(memory, toState, reason) {
  const fromState = memory.verification_state || VERIFICATION_STATES.OBSERVED;
  if (fromState === toState) return memory;
  if (!canTransition(fromState, toState)) {
    throw new Error(`Invalid transition: ${fromState} → ${toState}`);
  }
  if (!reason) {
    throw new Error('A reason is required for every state transition.');
  }
  const historyEntry = {
    from_state: fromState,
    to_state: toState,
    reason,
    timestamp: new Date().toISOString(),
  };
  const updates = {
    verification_state: toState,
    verification_history: [...(memory.verification_history || []), historyEntry],
  };
  await base44.entities.SavedMemory.update(memory.id, updates);
  return { ...memory, ...updates };
}

// Correct a memory: preserves the original text, records the
// corrected version, and transitions to CORRECTED with history.
export async function correctMemory(memory, correctedText, reason) {
  const fromState = memory.verification_state || VERIFICATION_STATES.OBSERVED;
  const historyEntry = {
    from_state: fromState,
    to_state: VERIFICATION_STATES.CORRECTED,
    reason: reason || 'User provided a correction.',
    timestamp: new Date().toISOString(),
  };
  const updates = {
    verification_state: VERIFICATION_STATES.CORRECTED,
    corrected_text: correctedText,
    verification_history: [...(memory.verification_history || []), historyEntry],
  };
  await base44.entities.SavedMemory.update(memory.id, updates);
  return { ...memory, ...updates };
}

// Build the full 46.1 provenance field set for a new memory.
export function buildMemoryProvenance({ origin, confidence, permissionScope, initialState, reason }) {
  const state = initialState || VERIFICATION_STATES.OBSERVED;
  return {
    origin: origin || 'Unknown origin',
    confidence: confidence || 'medium',
    permission_scope: permissionScope || 'PERSISTENT',
    verification_state: state,
    verification_history: [{
      from_state: 'CREATED',
      to_state: state,
      reason: reason || 'Memory created.',
      timestamp: new Date().toISOString(),
    }],
  };
}