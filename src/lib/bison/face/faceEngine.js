// ═══════════════════════════════════════════════
// BISON FACE ENGINE
// Deterministic progression state. Persisted on the user record.
// Face never replaces Bison's cognition, memory, or safety layers —
// it only records interactions and tells the response generator how
// much of the existing Bison to present.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { GROWTH_VALUES, PHASE_CONFIG, FACE_ANIMATIONS, phaseForGrowth } from './faceConfig';

let cache = null;

function blankState(eggColor) {
  const now = Date.now();
  return {
    eggColor,
    phase: 1,
    growthPoints: 0,
    sfxEnabled: true,
    sfxPreferenceSet: false,
    totalInteractions: 0,
    totalFeeds: 0,
    totalPlaySessions: 0,
    totalConversations: 0,
    firstInteractionTimestamp: now,
    lastInteractionTimestamp: now,
    unlockedFeatures: [...PHASE_CONFIG[1].unlockedFeatures],
  };
}

export async function loadFaceState() {
  if (cache) return cache;
  try {
    const user = await base44.auth.me();
    cache = user?.bison_face || null;
  } catch (e) {
    cache = null;
  }
  return cache;
}

export function getCachedFaceState() { return cache; }

async function persist(state) {
  cache = state;
  try { await base44.auth.updateMe({ bison_face: state }); } catch (e) {}
  return state;
}

export async function selectEgg(eggColor) {
  const existing = await loadFaceState();
  if (existing) return existing; // idempotent — an egg is chosen once
  return persist(blankState(eggColor));
}

export async function setSfxEnabled(enabled) {
  const state = await loadFaceState();
  if (!state) return null;
  return persist({ ...state, sfxEnabled: !!enabled, sfxPreferenceSet: true });
}

// Records an interaction, awards growth, and evolves the phase idempotently.
// Returns { state, evolved, fromPhase, animation }.
export async function interact(actionType) {
  const state = await loadFaceState();
  if (!state) return null;
  const gain = GROWTH_VALUES[actionType] || 0;
  const growthPoints = state.growthPoints + gain;
  const fromPhase = state.phase;
  const nextPhase = Math.max(fromPhase, phaseForGrowth(growthPoints)); // never regresses

  const unlockedFeatures = [...state.unlockedFeatures];
  for (let p = fromPhase + 1; p <= nextPhase; p++) {
    for (const f of PHASE_CONFIG[p].unlockedFeatures) {
      if (!unlockedFeatures.includes(f)) unlockedFeatures.push(f);
    }
  }

  const next = {
    ...state,
    growthPoints,
    phase: nextPhase,
    unlockedFeatures,
    totalInteractions: state.totalInteractions + 1,
    totalFeeds: state.totalFeeds + (actionType === 'feed' ? 1 : 0),
    totalPlaySessions: state.totalPlaySessions + (actionType === 'play' ? 1 : 0),
    totalConversations: state.totalConversations + (actionType === 'talk' ? 1 : 0),
    lastInteractionTimestamp: Date.now(),
  };
  await persist(next);

  const evolved = nextPhase > fromPhase;
  return {
    state: next,
    evolved,
    fromPhase,
    animation: evolved ? FACE_ANIMATIONS[`phase${nextPhase}`] : FACE_ANIMATIONS[actionType] || null,
  };
}

// Presentation context for the existing response generator.
// Face describes HOW to present; Bison's cognition still decides WHAT to say.
export function buildFaceContextString(state) {
  if (!state) return null;
  const cfg = PHASE_CONFIG[state.phase];
  return `BISON FACE — DEVELOPMENTAL PRESENTATION:
Phase ${state.phase} of 5 (${cfg.label}) · style: ${cfg.presentationStyle} · growth ${state.growthPoints}
Unlocked: ${state.unlockedFeatures.join(', ')}
Presentation guidance: ${cfg.guidance}
This is a progression/presentation layer only. It shapes tone, length and how much structured reasoning you show — it never changes your safety limits, privacy boundaries, advisory-only financial stance, or the user's authority. Never claim you rewrote your own code, retrained yourself, or became conscious; if you changed, it is because of what you have been told, stored configuration, unlocked features, or a software update.`;
}