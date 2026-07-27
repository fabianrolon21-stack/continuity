// ═══════════════════════════════════════════════
// HUMOR THROTTLE (Package 44.5)
// Enforces humor and metaphor cooldowns.
// Humor: max 1 every 20 interactions (~5%).
// Metaphors: max 1 every 20 responses.
// ═══════════════════════════════════════════════

const COOLDOWN = 20;

let interactionCount = 0;
let lastHumorInteraction = -COOLDOWN;
let lastMetaphorInteraction = -COOLDOWN;

export function recordInteraction() {
  interactionCount++;
}

export function shouldAllowHumor() {
  return interactionCount - lastHumorInteraction >= COOLDOWN;
}

export function recordHumorUsage() {
  lastHumorInteraction = interactionCount;
}

export function shouldAllowMetaphor() {
  return interactionCount - lastMetaphorInteraction >= COOLDOWN;
}

export function recordMetaphorUsage() {
  lastMetaphorInteraction = interactionCount;
}

export function getHumorStats() {
  return {
    interactionCount,
    humorCooldownRemaining: Math.max(0, COOLDOWN - (interactionCount - lastHumorInteraction)),
    metaphorCooldownRemaining: Math.max(0, COOLDOWN - (interactionCount - lastMetaphorInteraction)),
  };
}