// ═══════════════════════════════════════════════
// TACTICAL MASKING ENGINE (Package 34)
// Advises the user on how to present themselves safely
// in hostile or high-stakes social environments.
//
// ETHICAL BOUNDARY:
// - NEVER fabricates a false identity or biography.
// - NEVER instructs the user to lie about who they are.
// - Helps the user decide which TRUE aspects to emphasise
//   (guarded professional self vs. open vulnerable self)
//   and suggests boundary-setting scripts.
// ═══════════════════════════════════════════════

const SOCIAL_THREAT_KEYWORDS = [
  'difficult relative', 'toxic', 'manipulative', 'narcissist', 'gaslighting',
  'confrontation', 'argument', 'hostile', 'intimidating', 'threatening',
  'family drama', 'in-law', 'in law', 'boss', 'coworker', 'meeting',
  'negotiation', 'high-stakes', 'high stakes', 'fragile', 'tense',
  'awkward', 'confront', 'defensive', 'blaming me',
];

function detectEnvironmentHostility(input, affectiveContext, state) {
  let hostility = 0;
  const lower = (input || '').toLowerCase();
  for (const kw of SOCIAL_THREAT_KEYWORDS) {
    if (lower.includes(kw)) hostility += 12;
  }
  if (state?.emotionalTone === 'anxious' || state?.emotionalTone === 'angry') hostility += 20;
  if (affectiveContext?.supportPriority === 'HIGH') hostility += 20;
  if (state?.emotionIntensity > 0.6) hostility += 10;
  return Math.min(100, hostility);
}

function determinePersona(hostility) {
  if (hostility < 25) return 'open';
  if (hostility < 50) return 'warm';
  if (hostility < 75) return 'professional';
  return 'guarded';
}

function generateBoundaryScripts(persona) {
  const scripts = [];

  if (persona === 'guarded') {
    scripts.push("I'd rather not discuss that right now.");
    scripts.push("I'm going to step away for a moment — let's pick this up later.");
    scripts.push("We can revisit this another time.");
    scripts.push("I hear you, but I'm not in a place to have this conversation today.");
  }
  if (persona === 'professional' || persona === 'guarded') {
    scripts.push("Let's keep this focused on what we need to decide.");
    scripts.push("I want to be thoughtful about how I respond to that. Can we come back to it?");
  }
  if (persona === 'warm') {
    scripts.push("I appreciate you raising that. Can we come back to it when I've had a moment?");
    scripts.push("I want to give this the attention it deserves — just not right now.");
  }

  return scripts;
}

export function assessSocialThreat({ userInput, affectiveContext, state }) {
  const hostility = detectEnvironmentHostility(userInput, affectiveContext, state);
  const recommendedPersona = determinePersona(hostility);
  const boundaryScripts = generateBoundaryScripts(recommendedPersona);

  return {
    environmentHostility: hostility,
    recommendedPersona,
    boundaryScripts,
  };
}

export function buildTacticalMaskingContextString(assessment) {
  if (!assessment) return '';

  const parts = ['[SOCIAL NAVIGATION — TACTICAL MASKING]'];
  parts.push(`Environment hostility: ${assessment.environmentHostility}/100.`);
  parts.push(`Recommended persona: ${assessment.recommendedPersona}.`);

  const personaGuidance = {
    open: 'The user can be fully themselves — no special protection needed.',
    warm: 'Lean into genuine warmth, but stay aware of the room.',
    professional: 'Emphasise the user\'s true competence and calm. Keep it focused.',
    guarded: 'Emphasise the user\'s true boundaries. Minimal disclosure. Prioritise safety.',
  };
  parts.push(`Guidance: ${personaGuidance[assessment.recommendedPersona] || ''}`);

  if (assessment.boundaryScripts.length > 0) {
    parts.push('Suggested boundary phrases (offer gently — the user chooses what feels right):');
    for (const script of assessment.boundaryScripts) {
      parts.push(`  - "${script}"`);
    }
  }

  parts.push('RULE: These emphasise the user\'s REAL traits. Never fabricate a false identity.');
  parts.push('RULE: Never instruct the user to lie about who they are.');
  parts.push('[/SOCIAL NAVIGATION — TACTICAL MASKING]\n');

  return parts.join('\n') + '\n';
}