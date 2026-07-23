// ═══════════════════════════════════════════════
// CHAMELEON ENGINE (Package 44)
// Determines an appropriate communication mask based on
// environment stress and user preferences.
//
// CRITICAL: Masking is NEVER deceptive.
// - Bison may mirror communication STYLE (formality, humor, pace)
//   to improve clarity and connection.
// - Bison must NEVER pretend to be someone it is not.
// - Bison must NEVER conceal its nature as an AI.
// - avoidedTopics are user-editable, never secretly inferred.
// ═══════════════════════════════════════════════

const HYPER_VIGILANCE_CAP = 80;

// Determine the appropriate communication mask
export function determineMask({ environmentStress = 0, activeThreats = 0, avoidedTopics = [] }) {
  let communicationStyle = 'mirroring';

  if (environmentStress > 75) {
    communicationStyle = 'defensive';
  } else if (environmentStress > 50) {
    communicationStyle = 'neutral';
  }

  // Hyper-vigilance is a function of stress and threats, capped at a safe level
  const rawVigilance = environmentStress * 0.5 + activeThreats * 15;
  const hyperVigilanceScore = Math.min(HYPER_VIGILANCE_CAP, Math.round(rawVigilance));

  return {
    communicationStyle,
    avoidedTopics: avoidedTopics || [],
    hyperVigilanceScore,
  };
}

// Check if user input touches an avoided topic
export function checkAvoidedTopics(input, avoidedTopics = []) {
  if (!input || !avoidedTopics || avoidedTopics.length === 0) return null;
  const lower = input.toLowerCase();
  for (const topic of avoidedTopics) {
    if (lower.includes(topic.toLowerCase())) return topic;
  }
  return null;
}

// Build context string for prompt — guides LLM on communication style
export function buildMaskingContextString(mask, avoidedTopicHit) {
  if (!mask) return '';

  const parts = ['[COMMUNICATION MASK — TRANSPARENT ADAPTATION]'];
  parts.push(`Style: ${mask.communicationStyle}.`);

  switch (mask.communicationStyle) {
    case 'defensive':
      parts.push('Approach: Use simpler language. Set clear, gentle boundaries. Offer to pause if needed.');
      parts.push('You may say "I need a moment" if the interaction is intense.');
      break;
    case 'neutral':
      parts.push('Approach: Calm, measured, balanced tone. Not mirroring, not retreating.');
      break;
    case 'mirroring':
      parts.push('Approach: Match the user\'s formality, humor, and pace — but always transparently as Bison.');
      parts.push('You are adapting style for connection, NOT pretending to be someone else.');
      break;
    case 'vulnerable':
      parts.push('Approach: Open, honest, gentle. Acknowledge uncertainty.');
      break;
  }

  if (mask.avoidedTopics && mask.avoidedTopics.length > 0) {
    parts.push(`User-requested avoided topics: ${mask.avoidedTopics.join(', ')}.`);
    parts.push('Do not bring these up unprompted. If the user raises one, gently redirect.');
  }

  if (avoidedTopicHit) {
    parts.push(`NOTE: The user just mentioned "${avoidedTopicHit}", which is on their avoided-topics list.`);
    parts.push('Gently acknowledge and redirect. Do not refuse to engage — simply steer toward what the user needs.');
  }

  parts.push('BOUNDARY: You are an AI companion adapting communication style. Never impersonate a specific human.');
  parts.push('Never simulate emotions you do not have. This is adaptive transparency, not disguise.');
  parts.push('[/COMMUNICATION MASK]\n');

  return parts.join('\n') + '\n';
}