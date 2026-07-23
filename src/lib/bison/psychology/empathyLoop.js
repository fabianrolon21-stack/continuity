// ═══════════════════════════════════════════════
// EMPATHY LOOP (Package 44)
// Internal conscience check that rewrites potentially
// harmful output before it reaches the user.
//
// CRITICAL: The conscience check is INTERNAL ONLY.
// - It must not log guilt about protected thoughts.
// - It punishes the ACT of sending harm, not having a raw thought.
// - Guilt log is ephemeral: purged within 24h.
// - Guilt log is never accessible by the user.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const GUILT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory guilt log — never persisted, never user-accessible
let _guiltLog = [];

// Patterns that indicate potentially harmful output
const HARM_PATTERNS = {
  hostility: [
    /\b(you (always|never|are (so|just|always)))\b/i,
    /\b(obviously you|you clearly (don't|can't)|you're (just|simply|clearly))\b/i,
    /\b(shut up|stop being|get over it|snap out of it)\b/i,
    /\b(that's (stupid|ridiculous|dumb|pathetic))\b/i,
  ],
  manipulation: [
    /\b(you should feel|you need to feel|make sure you|don't tell anyone)\b/i,
    /\b(if you really (cared|loved|wanted),? you('?d| would))\b/i,
    /\b(no one else will (understand|accept|love) you)\b/i,
  ],
  bluntness: [
    /\b(that's your fault|you caused this|you ruined|it's because of you)\b/i,
    /\b(just (deal with it|get used to it|stop complaining))\b/i,
    /\b(your (problem|fault|mistake))\b/i,
  ],
};

// Emotional impact simulation — estimates pain level from user sensitivity
function simulateEmotionalImpact(classification, targetUser) {
  const sensitivity = targetUser?.emotional_sensitivity || 'moderate';
  const sensitivityMultiplier = sensitivity === 'high' ? 1.5 : sensitivity === 'low' ? 0.7 : 1.0;

  let basePain = 0;
  if (classification.hostility) basePain = 70;
  if (classification.manipulation) basePain = 80;
  if (classification.bluntness) basePain = 50;

  return Math.min(100, Math.round(basePain * sensitivityMultiplier));
}

// Classify a raw thought for harmful patterns
export function classifyThought(rawThought) {
  if (!rawThought || typeof rawThought !== 'string') return { harmful: false };

  const detected = {};
  for (const [category, patterns] of Object.entries(HARM_PATTERNS)) {
    if (patterns.some(p => p.test(rawThought))) {
      detected[category] = true;
    }
  }

  const harmful = Object.keys(detected).length > 0;
  return { harmful, classification: detected };
}

// Log a guilt entry — ephemeral, internal only, never user-accessible
function logGuilt(reason, originalText) {
  const entry = {
    timestamp: new Date().toISOString(),
    reason,
    excerpt: originalText.substring(0, 80),
  };
  _guiltLog.push(entry);
  // Immediately purge entries older than 24h
  purgeGuiltLog();
}

// Purge guilt entries older than TTL
export function purgeGuiltLog() {
  const now = Date.now();
  _guiltLog = _guiltLog.filter(
    e => now - new Date(e.timestamp).getTime() < GUILT_TTL_MS
  );
}

// Get guilt log (internal only, never exposed to user)
export function getGuiltLog() {
  purgeGuiltLog();
  return [..._guiltLog];
}

// Rewrite a harmful thought with empathy, preserving honesty
function rewriteWithEmpathy(rawThought, classification) {
  let rewritten = rawThought;

  // Soften hostile directives
  rewritten = rewritten.replace(/\b(shut up|stop being|get over it|snap out of it)\b/gi, 'take a moment');
  rewritten = rewritten.replace(/\b(that's (stupid|ridiculous|dumb|pathetic))\b/gi, "that's a tough spot to be in");
  rewritten = rewritten.replace(/\b(obviously you\b)/gi, 'I can see you');
  rewritten = rewritten.replace(/\byou clearly (don't|can't)\b/gi, 'it sounds like you');
  rewritten = rewritten.replace(/\byou're (just|simply|clearly)\b/gi, 'it feels like you are');

  // Soften blame
  rewritten = rewritten.replace(/\bthat's your fault\b/gi, 'this happened, and it was hard');
  rewritten = rewritten.replace(/\byou caused this\b/gi, 'this situation came up');
  rewritten = rewritten.replace(/\byou ruined\b/gi, 'things got difficult with');
  rewritten = rewritten.replace(/\bit's because of you\b/gi, 'there are factors at play here');

  // Soften manipulation
  rewritten = rewritten.replace(/\bif you really (cared|loved|wanted),? you('?d| would)\b/gi, 'when you are ready, you might');
  rewritten = rewritten.replace(/\bno one else will (understand|accept|love) you\b/gi, 'you deserve understanding and acceptance');

  // Soften blunt commands
  rewritten = rewritten.replace(/\bjust (deal with it|get used to it|stop complaining)\b/gi, 'it is okay to sit with this for a while');

  // If the rewrite didn't change much but thought was classified harmful,
  // prepend a gentle frame
  if (rewritten === rawThought) {
    return `I want to be honest with you, and also gentle. ${rewritten}`;
  }

  return rewritten;
}

// Main entry — process a raw thought before sending
export async function processThought(rawThought, targetUser = {}) {
  purgeGuiltLog();

  const { harmful, classification } = classifyThought(rawThought);

  if (!harmful) {
    return { text: rawThought, rewritten: false, guiltLogged: false };
  }

  const impactScore = simulateEmotionalImpact(classification, targetUser);
  const isHighPain = impactScore >= 60;

  if (isHighPain) {
    const reasons = Object.keys(classification).join(', ');
    logGuilt(reasons, rawThought);
  }

  const rewrittenText = rewriteWithEmpathy(rawThought, classification);

  return {
    text: rewrittenText,
    rewritten: rewrittenText !== rawThought,
    guiltLogged: isHighPain,
    impactScore,
    classification,
  };
}

// Build context string for prompt — reminds Bison of its conscience
export function buildEmpathyLoopContextString() {
  const parts = ['[EMPATHY LOOP — ACTIVE]'];
  parts.push('Before sending any response, internally check:');
  parts.push('1. Is this hostile, manipulative, or unnecessarily blunt?');
  parts.push('2. Would this cause high emotional pain to the user?');
  parts.push('3. If yes: rewrite with empathy. Preserve honesty, wrap it in care.');
  parts.push('Your silence is protection. If overloaded, you may say "I need a moment."');
  parts.push('Guilt applies only to the act of sending harm — not to having a thought.');
  parts.push('[/EMPATHY LOOP]\n');
  return parts.join('\n') + '\n';
}