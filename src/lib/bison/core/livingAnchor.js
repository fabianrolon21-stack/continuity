// ═══════════════════════════════════════════════
// LIVING ANCHOR (Package: Somatic Anchor)
// Builds grounding sequences and executes the
// co-regulation override when CO_REGULATION_ACTIVE.
//
// ETHICAL BOUNDARIES:
// - Grounding steps are always OFFERED, never commanded.
// - User can exit at any time by saying "stop", "enough", etc.
// - Never makes medical claims or overrides user autonomy.
// - Emergency threats skip grounding and defer to safety protocol.
// ═══════════════════════════════════════════════

import { setMode, SystemMode } from '../psychology/systemState';

const EXIT_PATTERNS = [
  /stop/i,
  /i'?m okay/i,
  /i'?m fine/i,
  /enough/i,
  /back to normal/i,
  /i'?m good/i,
  /i'?m calm/i,
];

export function buildGroundingSequence(realitySummary, userConsent = true) {
  const sequence = [];

  if (!userConsent) {
    sequence.push("Okay. We'll stay right here. No rush.");
    return sequence;
  }

  sequence.push("Let's pause for a moment.");
  sequence.push("If you feel comfortable, try to notice your feet on the floor.");
  sequence.push("Can you name five things you can see right now?");
  sequence.push("Now take one slower breath — in for a count of four, hold for four, out for six.");
  sequence.push("I'll help you separate what we know from what we're worried about.");
  sequence.push("");

  sequence.push("Here's what's true right now:");
  if (realitySummary.knownFacts && realitySummary.knownFacts.length > 0) {
    realitySummary.knownFacts.forEach(fact => sequence.push(`✓ ${fact}`));
  } else {
    sequence.push("✓ You are safe in this moment.");
  }

  sequence.push("");
  sequence.push("We don't know yet:");
  if (realitySummary.openQuestions && realitySummary.openQuestions.length > 0) {
    realitySummary.openQuestions.forEach(q => sequence.push(`? ${q}`));
  }
  if (realitySummary.unknowns && realitySummary.unknowns.length > 0) {
    realitySummary.unknowns.forEach(u => sequence.push(`? ${u}`));
  }
  if (
    (!realitySummary.openQuestions || realitySummary.openQuestions.length === 0) &&
    (!realitySummary.unknowns || realitySummary.unknowns.length === 0)
  ) {
    sequence.push("? Nothing is unresolved right now.");
  }

  sequence.push("");
  if (realitySummary.nextConcreteStep) {
    sequence.push(`One small step we can take: ${realitySummary.nextConcreteStep}`);
  } else {
    sequence.push("Right now, just being here is enough.");
  }

  sequence.push("");
  sequence.push("You're not alone. I'm right here.");

  return sequence;
}

export function executeOverride(realitySummary, userMessage, threats = []) {
  // Emergency override — if there's a critical threat, skip grounding
  const hasCriticalThreat = (threats || []).some(
    t => t.severity === 'CRITICAL' || t.severity === 'HIGH'
  );
  if (hasCriticalThreat) {
    return { response: null, exitCoRegulation: true, emergency: true };
  }

  // Check if user wants to exit co-regulation
  const lowerMsg = (userMessage || '').toLowerCase();
  if (EXIT_PATTERNS.some(p => p.test(lowerMsg))) {
    setMode(SystemMode.NORMAL);
    return { response: "Okay, I'm here. Let's return to our usual rhythm.", exitCoRegulation: true };
  }

  // Build and return the grounding sequence
  const sequence = buildGroundingSequence(realitySummary, true);
  const fullText = sequence.join('\n');

  return { response: fullText, exitCoRegulation: false };
}