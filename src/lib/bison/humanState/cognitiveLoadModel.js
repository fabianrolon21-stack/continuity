// Base 44.2 — Cognitive Load Model
// Estimates operational capacity (Low/Moderate/High/Overloaded).
// Determines response adaptation: length, suggestions, depth, simplicity.
// Never diagnoses mental health conditions.

export const COGNITIVE_LOAD = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  OVERLOADED: 'OVERLOADED',
};

export function estimateCognitiveLoad({ stressLevel, focusLevel, sleepQuality, emotionalIntensity, stressDegradation } = {}) {
  let score = 0;
  let components = 0;

  if (stressLevel != null) { score += (stressLevel / 10) * 30; components++; }
  if (focusLevel != null) { score += ((10 - focusLevel) / 10) * 25; components++; }
  if (sleepQuality != null) { score += ((10 - sleepQuality) / 10) * 20; components++; }
  if (emotionalIntensity != null) { score += emotionalIntensity * 15; components++; }
  if (stressDegradation != null) { score += stressDegradation * 10; components++; }

  const normalized = components > 0 ? Math.min(100, Math.round(score)) : null;

  let level = COGNITIVE_LOAD.MODERATE;
  if (normalized == null) level = COGNITIVE_LOAD.MODERATE;
  else if (normalized >= 80) level = COGNITIVE_LOAD.OVERLOADED;
  else if (normalized >= 60) level = COGNITIVE_LOAD.HIGH;
  else if (normalized >= 35) level = COGNITIVE_LOAD.MODERATE;
  else level = COGNITIVE_LOAD.LOW;

  return { score: normalized, level };
}

export function getResponseAdaptations(cognitiveLoadLevel) {
  switch (cognitiveLoadLevel) {
    case COGNITIVE_LOAD.OVERLOADED:
      return {
        maxLength: 'very_short', maxSuggestions: 0,
        postponeDeepAnalysis: true, simplifyExplanations: true,
        pacing: 'gentle',
        guidance: 'User is overloaded. Be brief. Do not introduce new complexity. Prioritize grounding over analysis.',
      };
    case COGNITIVE_LOAD.HIGH:
      return {
        maxLength: 'short', maxSuggestions: 1,
        postponeDeepAnalysis: true, simplifyExplanations: true,
        pacing: 'measured',
        guidance: 'User has high cognitive load. Keep responses short. At most one suggestion. Postpone deep analysis unless explicitly requested.',
      };
    case COGNITIVE_LOAD.MODERATE:
      return {
        maxLength: 'medium', maxSuggestions: 2,
        postponeDeepAnalysis: false, simplifyExplanations: false,
        pacing: 'normal',
        guidance: 'User has moderate capacity. Normal response length and depth.',
      };
    case COGNITIVE_LOAD.LOW:
      return {
        maxLength: 'medium', maxSuggestions: 3,
        postponeDeepAnalysis: false, simplifyExplanations: false,
        pacing: 'normal',
        guidance: 'User has good cognitive capacity. Can handle depth if relevant.',
      };
    default:
      return {
        maxLength: 'medium', maxSuggestions: 2,
        postponeDeepAnalysis: false, simplifyExplanations: false,
        pacing: 'normal',
        guidance: 'Default capacity assumed.',
      };
  }
}

export function computeBandwidth(cognitiveLoadScore) {
  if (cognitiveLoadScore == null) return null;
  return Math.max(0, Math.min(100, 100 - cognitiveLoadScore));
}