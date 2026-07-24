// ═══════════════════════════════════════════════
// COMMUNICATION CLIMATE (Part XIII)
// Uses trusted public trend sources only when needed.
// Purpose: improve communication style, NOT beliefs.
//
// Returns CommunicationClimate:
//   { formality, readingLevel, polarization,
//     recommendedTone, avoidJargon }
//
// Never infers what people believe.
// Only adapts presentation.
// ═══════════════════════════════════════════════

export function assessCommunicationClimate(input, context = {}) {
  const formality = detectFormality(input);
  const readingLevel = detectReadingLevel(input);
  const polarization = detectPolarization(input);
  const recommendedTone = recommendTone(formality, polarization, context);

  return {
    formality,
    readingLevel,
    polarization,
    recommendedTone,
    avoidJargon: formality === 'casual',
    timestamp: new Date().toISOString(),
    origin: 'INFERRED',
  };
}

function detectFormality(input) {
  const formalMarkers = /\b(therefore|furthermore|nevertheless|accordingly|hence|thus|shall|may I|if you would|regarding)\b/i;
  const casualMarkers = /\b(hey|yeah|nah|gonna|wanna|kinda|sorta|tbh|imo|lol|haha|sup|yep|nope)\b/i;
  if (formalMarkers.test(input)) return 'formal';
  if (casualMarkers.test(input)) return 'casual';
  return 'neutral';
}

function detectReadingLevel(input) {
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'unknown';
  const avgWordLength = input.replace(/\s/g, '').length / words.length;
  if (avgWordLength > 6) return 'advanced';
  if (avgWordLength > 4.5) return 'intermediate';
  return 'basic';
}

function detectPolarization(input) {
  const polarizing = /\b(always|never|everyone|no one|nothing|everything|destroyed|ruined|perfect|terrible|amazing|horrible|worst|best)\b/i;
  return polarizing.test(input) ? 'high' : 'low';
}

function recommendTone(formality, polarization, context) {
  if (context?.groundingMode) return 'calm-grounding';
  if (polarization === 'high') return 'de-escalating';
  if (formality === 'formal') return 'respectful-measured';
  if (formality === 'casual') return 'warm-conversational';
  return 'balanced';
}

export function buildClimateContextString(climate) {
  if (!climate) return '';
  let s = `\nCOMMUNICATION CLIMATE (origin: ${climate.origin}):\n`;
  s += `Formality: ${climate.formality}. Reading level: ${climate.readingLevel}. Polarization: ${climate.polarization}.\n`;
  s += `Recommended tone: ${climate.recommendedTone}.${climate.avoidJargon ? ' Avoid jargon.' : ''}\n`;
  s += `NOTE: This adapts presentation only. Never infer what people believe.\n`;
  return s;
}