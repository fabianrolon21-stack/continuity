// ═══════════════════════════════════════════════
// REFLECTIVE HUMOR (Package Q — Humor)
// Gentle, reflective humor for Bison. Never deflective,
// dismissive, or used during safety/stabilize modes.
// Humor that illuminates, not deflects.
// ═══════════════════════════════════════════════

import { RESPONSE_MODES } from './pipeline';

const HUMOR_TRIGGERS = [
  /\b(again|same thing|keep doing|always|happens every|there it is)\b/i,
  /\b(funny|ironic|ridiculous|of course|typical|classic)\b/i,
  /\b(caught myself|did it again|old habit|here we go)\b/i,
];

const HUMOR_NOTES = [
  "There's a gentle irony in how reliably we return to our patterns. It's almost impressive, in a way.",
  "If recurring habits were a subscription, you'd have quite the collection by now.",
  "The universe does have a sense of humor about our loops. At least we can notice them.",
  "There's something endearing about catching yourself mid-pattern. It means you're awake to it.",
  "Patterns are nothing if not persistent. Like a cat that keeps sitting on your keyboard.",
  "The fact that you noticed the loop is the beginning of the loop loosening.",
];

let humorCooldown = 0;

export function shouldUseHumor(userInput, mode, state, recurrence) {
  // Never during safety or stabilization
  if (mode === RESPONSE_MODES.GROUND || mode === RESPONSE_MODES.STABILIZE) return false;

  // Never during high emotional intensity
  if (state?.emotionIntensity > 0.6) return false;

  // Check for humor triggers
  const hasTrigger = HUMOR_TRIGGERS.some(p => p.test(userInput));

  // Use humor more often when recurrence is detected (self-awareness)
  if (recurrence?.detected && recurrence.confidence !== 'low') {
    return Math.random() < 0.4;
  }

  if (hasTrigger) {
    return Math.random() < 0.5;
  }

  // Occasional gentle humor in explore/reflect mode
  if (mode === RESPONSE_MODES.EXPLORE || mode === RESPONSE_MODES.REFLECT) {
    return Math.random() < 0.08;
  }

  return false;
}

export function getHumorNote() {
  return HUMOR_NOTES[Math.floor(Math.random() * HUMOR_NOTES.length)];
}

export function buildHumorContextString(userInput, mode, state, recurrence) {
  if (!shouldUseHumor(userInput, mode, state, recurrence)) return null;

  const note = getHumorNote();
  return `\nREFLECTIVE HUMOR (use sparingly, weave naturally):\n${note}\nThis humor should illuminate the pattern, not deflect from it. Keep it gentle and warm. If the user seems to need seriousness, drop the humor entirely.\n\n`;
}