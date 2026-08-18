// ═══════════════════════════════════════════════
// PACKAGE 61 §14 — GROUNDED TRYING ENGINE
// Distinguishes "I share this because I like it" (grounded) from
// "I need this specific person to react" (outcome-dependent).
// Neither is forbidden — the dependency is simply made visible.
// ═══════════════════════════════════════════════

const OUTCOME_DEPENDENT = /\bso (that )?(she|he|they|it)\b|\bto make (her|him|them)\b|\bneed (her|him|them) to\b/i;
const MOTIVATION_HINTS = [
  { pattern: /(worry|regret|hurt|jealous|miss me)/i, motivation: 'PUNISHMENT' },
  { pattern: /(notice me|see it|react|respond|reply)/i, motivation: 'ATTENTION' },
  { pattern: /(prove|reassure|still (love|care))/i, motivation: 'REASSURANCE' },
  { pattern: /(stay|not leave|stop (her|him|them))/i, motivation: 'CONTROL' },
  { pattern: /(share|show|express|tell)/i, motivation: 'EXPRESSION' },
  { pattern: /(connect|talk|reach out|catch up)/i, motivation: 'CONNECTION' },
  { pattern: /(wonder|curious|find out|learn)/i, motivation: 'CURIOSITY' },
];

export function assessTrying(text, impulse) {
  const action = impulse || text;
  const outcomeDependent = OUTCOME_DEPENDENT.test(text);
  const motivation = MOTIVATION_HINTS.find(({ pattern }) => pattern.test(text))?.motivation || 'EXPRESSION';
  const pressured = ['PUNISHMENT', 'CONTROL'].includes(motivation);
  return {
    objective: action.slice(0, 100),
    action: action.slice(0, 100),
    motivation,
    outcomeDependency: outcomeDependent ? 0.85 : 0.25,
    autonomyRespect: pressured ? 0.25 : 0.8,
    pressureLevel: pressured ? 0.75 : outcomeDependent ? 0.45 : 0.15,
    grounded: !outcomeDependent && !pressured,
  };
}