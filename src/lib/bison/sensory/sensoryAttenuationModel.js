// HEURISTIC LENS ONLY. Not a factual claim. Never presented to the user as science.
// Sensory acuity is shaped by attention, culture, training, and environment —
// not simply "dulled by technology." This model is scientifically contested.

export const SENSORY_DOMAINS = ['hearing', 'smell', 'sight', 'taste', 'touch'];

export const ATTENTION_SHIFT = {
  SURVIVAL_ORIENTED: 'survival_oriented',   // attention tuned to threat, decay, movement
  AMBIENT_ORIENTED: 'ambient_oriented',     // attention spread across many inputs
  DEVICE_ORIENTED: 'device_oriented',       // attention captured by a single channel
  REFLECTIVE: 'reflective'                  // attention turned inward
};

// Classify what the user's attention seems tuned to right now.
export function classifyAttention(userInput) {
  const t = (userInput || '').toLowerCase();
  if (/\b(danger|threat|watch out|careful|alert)\b/.test(t)) return ATTENTION_SHIFT.SURVIVAL_ORIENTED;
  if (/\b(scroll|feed|notification|phone|screen)\b/.test(t)) return ATTENTION_SHIFT.DEVICE_ORIENTED;
  if (/\b(i feel|i notice|i sense|my body)\b/.test(t)) return ATTENTION_SHIFT.REFLECTIVE;
  return ATTENTION_SHIFT.AMBIENT_ORIENTED;
}

// Optional reflection prompt — used only if the user is already curious about this.
export function buildSensoryReflectionPrompt(userInput) {
  const attention = classifyAttention(userInput);
  return `\n[SENSORY LENS — HEURISTIC ONLY]
If relevant, you may gently reflect on what the user's attention is tuned to (${attention}).
This is a reflective lens, not a scientific claim. Do not present it as fact about human history.
Do not lecture. One sentence at most, and only if it serves the user.
`;
}