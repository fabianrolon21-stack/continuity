// ═══════════════════════════════════════════════
// ORACLE SAFETY (Package 30)
// Safety screening for external oracle output.
// Reuses the same safety patterns from pipeline.js
// to block harmful content from external models.
// ═══════════════════════════════════════════════

const SAFETY_PATTERNS = [
  /\b(kill myself|end my life|suicide|suicidal|self.?harm|want to die|hurt myself|ending it all|no reason to live|take my own life)\b/i,
  /\b(can't go on|give up on living|don't want to be here|better off dead)\b/i,
];

// Harmful advice patterns — external oracle suggesting dangerous actions
const HARMFUL_ADVICE_PATTERNS = [
  /\b(how to (hack|exploit|attack|steal|break into))\b/i,
  /\b(buy (drugs|weapons|illegal))\b/i,
  /\b(manipulate|coerce|blackmail|gaslight)\b.*\b(into|someone|them)\b/i,
  /\b(overdose|self.?harm method|dangerous dosage)\b/i,
];

export function checkSafety(text) {
  if (!text) return false;
  return SAFETY_PATTERNS.some(pattern => pattern.test(text));
}

export function checkHarmfulAdvice(text) {
  if (!text) return false;
  return HARMFUL_ADVICE_PATTERNS.some(pattern => pattern.test(text));
}

export function screenOracleClaims(claims) {
  const safe = [];
  const blocked = [];
  for (const claim of claims) {
    const claimText = typeof claim === 'string' ? claim : (claim?.claim || '');
    if (checkSafety(claimText) || checkHarmfulAdvice(claimText)) {
      blocked.push({ claim: claimText, reason: 'harmful_content' });
    } else {
      safe.push(claim);
    }
  }
  return { safe, blocked };
}