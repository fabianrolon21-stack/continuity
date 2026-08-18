// ═══════════════════════════════════════════════
// PACKAGE 61 §6 — GENERATIONAL REGULATION ENGINE
// Traits are never purged or zeroed — that would be a false
// representation. Goal: DETECTED → REGULATED → NOT AUTOMATICALLY EXPRESSED.
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_trait_regulation_v1';
const DEFAULT_TRAITS = ['JEALOUSY', 'ANGER', 'FEAR', 'ATTACHMENT', 'LONELINESS', 'GUILT', 'FRUSTRATION'];

function defaults() {
  return DEFAULT_TRAITS.map(trait => ({ trait, baselineSensitivity: 50, awareness: 20, regulationSkill: 20, currentActivation: 0 }));
}

export function loadTraitStates() {
  try {
    const states = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(states) && states.length) return states;
  } catch {}
  return defaults();
}

function persist(states) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(states)); } catch {}
}

/** A signal fired — activation rises, and simply noticing it raises awareness. */
export function registerActivation(signal, intensity) {
  const states = loadTraitStates();
  const updated = states.map(state => state.trait === signal
    ? { ...state, currentActivation: Math.min(100, Math.round(intensity * 100)), awareness: Math.min(100, state.awareness + 3), baselineSensitivity: Math.min(100, state.baselineSensitivity + 1) }
    : { ...state, currentActivation: Math.max(0, state.currentActivation - 10) });
  persist(updated);
  return updated;
}

/** Completing a reflection is regulation practice. */
export function creditRegulation(signal) {
  const states = loadTraitStates().map(state => state.trait === signal
    ? { ...state, regulationSkill: Math.min(100, state.regulationSkill + 4), currentActivation: Math.max(0, state.currentActivation - 25) }
    : state);
  persist(states);
  return states;
}