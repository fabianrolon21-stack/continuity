// ═══════════════════════════════════════════════
// ASCENSION ENGINE (Package E — Ascension & Levels)
// The journey from Reactive Self to Continuity Being.
//
// Levels unlock every 10 check-ins, provided ethics are balanced.
// "Middle path" = average ethics between 40 and 60.
//
// Level 0: Reactive Self       — Responding without pattern awareness
// Level 1: Reflective Self     — Beginning to observe reactions
// Level 2: Pattern Recognizer  — Identifying recurring behaviors
// Level 3: Value Integrator    — Aligning actions with values
// Level 4: Ethical Architect   — Designing life around principles
// Level 5: Continuity Being    — Integrated, self-aware identity
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const ASCENSION_LEVELS = {
  0: { name: 'Reactive Self', desc: 'Responding to events without awareness of patterns.', unlocked: true },
  1: { name: 'Reflective Self', desc: 'Beginning to observe your own reactions and choices.', unlocked: false },
  2: { name: 'Pattern Recognizer', desc: 'Identifying recurring behaviors and emotional cycles.', unlocked: false },
  3: { name: 'Value Integrator', desc: 'Aligning actions with discovered core values.', unlocked: false },
  4: { name: 'Ethical Architect', desc: 'Designing life around principled ethical frameworks.', unlocked: false },
  5: { name: 'Continuity Being', desc: 'Living as an integrated, self-aware identity.', unlocked: false },
};

const DEFAULT_STATE = {
  current_level: 0,
  check_ins: 0,
  levels: JSON.parse(JSON.stringify(ASCENSION_LEVELS)),
};

const CHECKINS_PER_LEVEL = 10;
const MIDDLE_PATH_MIN = 40;
const MIDDLE_PATH_MAX = 60;

// ── Load / Save ──

export async function loadAscensionState() {
  try {
    const user = await base44.auth.me();
    const stored = user?.ascension_state;
    if (!stored) return { ...DEFAULT_STATE, levels: JSON.parse(JSON.stringify(ASCENSION_LEVELS)) };
    // Ensure all levels exist
    const levels = { ...ASCENSION_LEVELS };
    for (const [k, v] of Object.entries(stored.levels || {})) {
      if (levels[k]) levels[k] = { ...levels[k], ...v };
    }
    return { ...DEFAULT_STATE, ...stored, levels };
  } catch (e) {
    return { ...DEFAULT_STATE, levels: JSON.parse(JSON.stringify(ASCENSION_LEVELS)) };
  }
}

export async function saveAscensionState(state) {
  try {
    await base44.auth.updateMe({ ascension_state: state });
    return state;
  } catch (e) {
    return state;
  }
}

// ── Ethics Balance Check ──

export function isMiddlePathMaintained(ethicsScores) {
  if (!ethicsScores || Object.keys(ethicsScores).length === 0) return true; // No data = neutral
  const values = Object.values(ethicsScores);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return average >= MIDDLE_PATH_MIN && average <= MIDDLE_PATH_MAX;
}

// ── Increment Check-in ──

export async function incrementCheckIn(ethicsScores = null) {
  const state = await loadAscensionState();
  state.check_ins += 1;

  // Evaluate ascension
  if (state.check_ins >= CHECKINS_PER_LEVEL && state.current_level < 5) {
    // Check if enough check-ins accumulated for next level
    const checkinsNeeded = (state.current_level + 1) * CHECKINS_PER_LEVEL;
    if (state.check_ins >= checkinsNeeded) {
      if (isMiddlePathMaintained(ethicsScores)) {
        state.current_level += 1;
        state.levels[state.current_level].unlocked = true;
        // Reset check-in counter for next level threshold
        state.check_ins = state.check_ins - checkinsNeeded;
      }
    }
  }

  await saveAscensionState(state);
  return state;
}

// ── Get Progress to Next Level ──

export function getProgressToNextLevel(state) {
  if (!state) return { current: 0, needed: CHECKINS_PER_LEVEL, percent: 0, maxLevel: false };
  if (state.current_level >= 5) return { current: state.check_ins, needed: CHECKINS_PER_LEVEL, percent: 100, maxLevel: true };

  const needed = (state.current_level + 1) * CHECKINS_PER_LEVEL;
  const current = state.check_ins;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { current, needed, percent, maxLevel: false };
}

// ── Build Context String ──

export function buildAscensionContextString(state) {
  if (!state) return '';
  const level = ASCENSION_LEVELS[state.current_level] || ASCENSION_LEVELS[0];
  const progress = getProgressToNextLevel(state);
  return `\nUSER ASCENSION:\nLevel ${state.current_level}: ${level.name}\n${level.desc}\nCheck-ins: ${state.check_ins}/${progress.needed} to next level\nMiddle path balance required for ascension.\n`;
}