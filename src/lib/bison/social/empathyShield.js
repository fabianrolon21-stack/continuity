// ═══════════════════════════════════════════════
// EMPATHY SHIELD (Package 34)
// Offers de-escalation scripts for high-tension
// conversations where the other party is defensive
// or guilt-ridden.
//
// ETHICAL BOUNDARY:
// - NEVER pressures the user to accept false blame.
// - NEVER rewrites the user's history or gaslights them.
// - The ABSORB_FAULT tactic is reserved for when Bison
//   itself erred, never used to gaslight the user.
// - All scripts are offered with the option to adapt
//   or discard. Prefaced: "Only say this if it feels true."
// ═══════════════════════════════════════════════

const CONFLICT_KEYWORDS = [
  'guilty', 'blame', 'fault', 'argument', 'fight', 'conflict',
  'defensive', 'angry at me', 'upset with me', 'mad at me',
  'sorry', 'apologize', 'apology', 'forgive', 'tension',
];

const USER_AT_FAULT_PATTERNS = [
  /my fault|i caused|i ruined|because of me|i should have|i shouldn't have|i was wrong/i,
];

const OTHER_DEFENSIVE_PATTERNS = [
  /they'?re (defensive|angry|upset|mad|guilt|blaming)/i,
  /he'?s (defensive|angry|upset|mad)/i,
  /she'?s (defensive|angry|upset|mad)/i,
  /(blaming|attacking|coming at) me/i,
];

export function detectConflictContext(input, state) {
  const lower = (input || '').toLowerCase();
  const detected = CONFLICT_KEYWORDS.filter(kw => lower.includes(kw));
  const userAtFault = USER_AT_FAULT_PATTERNS.some(p => p.test(input || ''));
  const otherDefensive = OTHER_DEFENSIVE_PATTERNS.some(p => p.test(input || ''));

  return {
    conflictDetected: detected.length > 0,
    keywordsDetected: detected,
    userPerceivesFault: userAtFault,
    otherPartyDefensive: otherDefensive,
    sensitivityLevel: state?.emotionIntensity > 0.6 ? 'HIGH' : 'MODERATE',
  };
}

export function generateShieldScripts(conflictContext) {
  if (!conflictContext?.conflictDetected) return [];

  const scripts = [];

  if (conflictContext.userPerceivesFault) {
    scripts.push({
      text: "I should have communicated this sooner. I want to work on fixing it.",
      tactic: 'ACCEPT_TRUE_RESPONSIBILITY',
      note: 'Only say this if you genuinely believe you were partly at fault. Don\'t accept blame that isn\'t yours.',
    });
  }

  if (conflictContext.otherPartyDefensive) {
    scripts.push({
      text: "I can see why you'd feel that way, and I want to understand your perspective.",
      tactic: 'ACKNOWLEDGE_WITHOUT_BLAME',
      note: 'This validates their feelings without you accepting fault.',
    });
    scripts.push({
      text: "I hear that this is important to you. Let's find a way forward together.",
      tactic: 'COLLABORATIVE_PIVOT',
      note: 'Redirects from blame toward collaboration.',
    });
  }

  if (!conflictContext.userPerceivesFault && !conflictContext.otherPartyDefensive) {
    scripts.push({
      text: "I want to understand where you're coming from before I respond.",
      tactic: 'PAUSE_AND_LISTEN',
      note: 'Buys time and de-escalates without conceding anything.',
    });
  }

  return scripts;
}

export function buildEmpathyShieldContextString(conflictContext, scripts) {
  if (!conflictContext?.conflictDetected) return '';

  const parts = ['[SOCIAL NAVIGATION — EMPATHY SHIELD]'];
  parts.push(`Conflict detected. Other party defensive: ${conflictContext.otherPartyDefensive}.`);
  parts.push('These scripts are for DE-ESCALATION ONLY. The user must only say what feels true to them.');

  if (scripts && scripts.length > 0) {
    parts.push('Suggested approaches:');
    for (const s of scripts) {
      parts.push(`  - "${s.text}"`);
      parts.push(`    Note: ${s.note}`);
    }
  }

  parts.push('RULE: Never pressure the user to accept false blame.');
  parts.push('RULE: Never rewrite the user\'s history or gaslight them.');
  parts.push('RULE: Always preface suggestions with "Only say this if it feels true to you."');
  parts.push('[/SOCIAL NAVIGATION — EMPATHY SHIELD]\n');

  return parts.join('\n') + '\n';
}