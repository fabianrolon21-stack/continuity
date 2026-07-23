// ═══════════════════════════════════════════════
// SYSTEM STATE (Package 44)
// Global DO_NOT_DISTURB flag + outgoing channel lock.
// When tripped, all non-emergency communication is frozen.
// ═══════════════════════════════════════════════

let _dndActive = false;
let _dndTrippedAt = null;
let _dndReason = null;
let _cooldownTimer = null;

const COOLDOWN_MS = 30000; // 30 seconds

export function isDND() {
  return _dndActive;
}

export function getSystemState() {
  return {
    dndActive: _dndActive,
    trippedAt: _dndTrippedAt,
    reason: _dndReason,
  };
}

export function setDND(reason = 'cognitive_overload') {
  _dndActive = true;
  _dndTrippedAt = new Date().toISOString();
  _dndReason = reason;
}

export function clearDND() {
  _dndActive = false;
  _dndTrippedAt = null;
  _dndReason = null;
  if (_cooldownTimer) {
    clearTimeout(_cooldownTimer);
    _cooldownTimer = null;
  }
}

// Begin the cool-down period; after it elapses, DND is cleared
export function beginCooldown(onComplete) {
  if (_cooldownTimer) clearTimeout(_cooldownTimer);
  _cooldownTimer = setTimeout(() => {
    clearDND();
    if (typeof onComplete === 'function') onComplete();
  }, COOLDOWN_MS);
}

// Check if a message is allowed through the channel lock
// Emergency safety messages always pass
export function canSend(isEmergency = false) {
  if (isEmergency) return true;
  return !_dndActive;
}

export const DND_STATUS_MESSAGE =
  "I'm feeling overloaded; I need a moment to process. I'll be right back.";