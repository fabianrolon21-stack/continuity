// ═══════════════════════════════════════════════
// BISON FACE — CONFIGURATION (Phase System)
// Face is a progression/presentation layer. It is a game metaphor
// implemented with deterministic state, stored interaction counts,
// UI changes and feature unlocking. It does NOT create intelligence,
// it does not rewrite code, and it claims no consciousness.
// Every value here is configuration — tune freely without touching the engine.
// ═══════════════════════════════════════════════

export const EGGS = [
  { id: 'blue', label: 'Blue', color: 'hsl(199 56% 64%)' },
  { id: 'green', label: 'Green', color: 'hsl(120 40% 58%)' },
  { id: 'amber', label: 'Amber', color: 'hsl(42 63% 55%)' },
  { id: 'violet', label: 'Violet', color: 'hsl(265 41% 64%)' },
];

export const GROWTH_THRESHOLDS = { 1: 0, 2: 50, 3: 150, 4: 300, 5: 500 };

export const GROWTH_VALUES = { feed: 10, play: 15, talk: 20 };

export const FACE_ANIMATIONS = {
  feed: 'anim_eat_happy',
  play: 'anim_jump_playful',
  hatch: 'anim_hatch',
  phase2: 'anim_growth_phase2',
  phase3: 'anim_growth_phase3',
  phase4: 'anim_growth_phase4',
  phase5: 'anim_growth_phase5',
};

export const PHASE_CONFIG = {
  1: {
    phase: 1, label: 'Baby', presentationStyle: 'baby',
    guidance: 'Very young. Simple vocabulary, short replies (1-2 sentences), playful and warm. Minimal analysis. Charm over intelligence. No frameworks, no long reasoning.',
    unlockedFeatures: ['baby_animations', 'basic_conversation', 'feed', 'play'],
    animationSet: ['anim_hatch', 'anim_eat_happy', 'anim_jump_playful'],
  },
  2: {
    phase: 2, label: 'Discovery', presentationStyle: 'discovery',
    guidance: 'Curious and exploratory. Ask more questions, notice repeated topics, still fairly short and expressive. Light context use.',
    unlockedFeatures: ['discovery_dialogue', 'extra_animations', 'memory_references'],
    animationSet: ['anim_growth_phase2'],
  },
  3: {
    phase: 3, label: 'Integration', presentationStyle: 'integration',
    guidance: 'Connect the current moment with accumulated context. Name recurring themes and communication patterns. More nuanced, more mature expression.',
    unlockedFeatures: ['context_integration', 'pattern_recognition', 'mature_conversation'],
    animationSet: ['anim_growth_phase3'],
  },
  4: {
    phase: 4, label: 'Adaptive Continuity', presentationStyle: 'adaptive',
    guidance: 'Use accumulated context and established patterns; adapt how you present things and surface when stored information looks outdated. Say "I have adjusted how I use what you have told me" — never claim to have rewritten your own code or retrained yourself.',
    unlockedFeatures: ['adaptive_continuity', 'advanced_context'],
    animationSet: ['anim_growth_phase4'],
  },
  5: {
    phase: 5, label: 'Apex', presentationStyle: 'apex',
    guidance: 'Full available Bison capability: structured reasoning, continuity translation, financial triage, behavioral mirroring, pattern recognition. Separate claim from evidence, mechanism from effect, and what is within the user\'s control. Same character as the baby — just fully grown.',
    unlockedFeatures: ['full_system_integration'],
    animationSet: ['anim_growth_phase5'],
  },
};

export function phaseForGrowth(points) {
  let phase = 1;
  for (const p of [2, 3, 4, 5]) {
    if (points >= GROWTH_THRESHOLDS[p]) phase = p;
  }
  return phase;
}

export function progressToNextPhase(points, phase) {
  if (phase >= 5) return { next: null, percent: 100 };
  const floor = GROWTH_THRESHOLDS[phase];
  const ceil = GROWTH_THRESHOLDS[phase + 1];
  return { next: phase + 1, percent: Math.min(100, Math.round(((points - floor) / (ceil - floor)) * 100)) };
}