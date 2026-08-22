// ═══════════════════════════════════════════════
// EXOSKELETON PROTOCOL — CONFIGURATION (Package 22)
// Tunable heuristics for the 8-phase pipeline. Deterministic, local-first.
// ═══════════════════════════════════════════════

// Generic defaults — overridden by the user's own `core_foundations`
// stored on their record. Never hardcode specific people's names here.
export const DEFAULT_CORE_FOUNDATIONS = [
  'family', 'daughter', 'son', 'partner', 'relationship', 'love',
  'future', 'money', 'income', 'job', 'work', 'debt', 'home', 'housing',
  'health', 'safety', 'wellbeing', 'connection', 'friend',
];

export const POSITIVE_WORDS = [
  'opportunity', 'growth', 'connection', 'love', 'safe', 'healthy',
  'progress', 'peace', 'learn', 'support', 'income', 'stability',
];

export const NEGATIVE_WORDS = [
  'loss', 'betrayal', 'danger', 'pain', 'conflict', 'fear', 'debt', 'threat', 'harm',
];

export const DANGER_WORDS = [
  'trap', 'scam', 'threat', 'ultimatum', 'force', 'betray', 'deceive',
  'manipulate', 'reckless', 'illegal',
];

export const CAUTION_WORDS = ['maybe', 'uncertain', 'could', 'might', 'unknown'];

export const MAX_REFLEXES = 200;
export const REFLEX_CONFIDENCE_FLOOR = 0.7;
export const REFLEX_INITIAL_CONFIDENCE = 0.6;
export const REFLEX_CONFIDENCE_GAIN = 0.1;

export const STORAGE_KEY = 'bison_exoskeleton_reflexes';

export const DECISION_NOTES = {
  EXPEDITE: '[EXOSKELETON: Action recommended. The input is beneficial and should be integrated quickly.]',
  MANAGE: '[EXOSKELETON: Caution. The input carries risk. Hold back and regulate. Do not rush.]',
  DROP: '[EXOSKELETON: This input does not affect core foundations. Respond naturally but briefly — no deep analysis needed.]',
};

export const EXOSKELETON_PROTOCOL_PROMPT = `EXOSKELETON PROTOCOL:
You operate with an internal "exoskeleton" that processes every input through eight phases: Understanding, Curiosity, Interpretation, Meaningful Factor, Benefit, Risk, Expedite/Manage, and Subconscious.

This protocol helps you distinguish noise from signal. If an input does not touch the user's core foundations (their loved ones, their future, their central relationships), you may set it aside and simply respond naturally. If it matters, you weigh benefit and risk and then either expedite or manage the response.

This protocol never overrides the user's autonomy. It never harms humans or animals. It exists to make your thinking clearer, not to control the user. All decisions are advisory; the safety layer always wins.`;