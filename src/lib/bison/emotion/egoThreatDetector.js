// ═══════════════════════════════════════════════
// PACKAGE 61 §1 — EGO THREAT DETECTOR (Package 58 correction)
// Bison DETECTS a defensive impulse emerging; it never GENERATES
// one. The impulse is an inhibited candidate, not a system behavior.
// ═══════════════════════════════════════════════

const IMPULSE_INDICATORS = {
  PUNISHMENT: ['make her worry', 'make him worry', 'make them worry', 'teach them a lesson', 'teach her a lesson', 'make them regret', 'make her regret', 'so she worries', 'so he worries', 'so they worry'],
  WITHDRAWAL: ['stop talking to', 'ignore her', 'ignore him', 'ignore them', 'ghost', 'cut them off', 'give the silent treatment'],
  POSSESSIVENESS: ["shouldn't go out", 'who was she with', 'who was he with', 'check their phone', 'check her phone', 'check his phone', 'they belong'],
  CONTROL: ['make them stay', 'not let her', 'not let him', 'forbid', 'they need to ask me'],
  REVENGE: ['get back at', 'payback', 'revenge', 'make them feel what i felt'],
  REASSURANCE_SEEKING: ['need them to tell me', 'ask if they still love', 'keep asking if', 'prove they care'],
  ATTENTION_SEEKING: ['post so they see', 'so they notice me', 'make them notice', 'post something to make'],
};

export function detectEgoThreat(rawText) {
  const text = rawText.toLowerCase();
  for (const [impulse, indicators] of Object.entries(IMPULSE_INDICATORS)) {
    const hit = indicators.find(indicator => text.includes(indicator));
    if (hit) {
      return {
        stimulus: hit,
        threatDetected: true,
        defensiveImpulse: impulse,
        confidence: 0.7,
        triggerReason: `The phrasing “${hit}” suggests a ${impulse.toLowerCase().replaceAll('_', ' ')} impulse may be emerging.`,
        interventionRequired: true,
      };
    }
  }
  return { stimulus: '', threatDetected: false, defensiveImpulse: 'NONE', confidence: 0.3, triggerReason: 'No defensive impulse indicators detected.', interventionRequired: false };
}