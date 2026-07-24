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

// ═══════════════════════════════════════════════
// SYSTEM MODE (Package: Somatic Anchor)
// Extended mode tracking for co-regulation state.
// Co-regulation auto-exits after 10 minutes of
// inactivity to prevent prolonged override.
// ═══════════════════════════════════════════════

export const SystemMode = {
  NORMAL: 'NORMAL',
  CO_REGULATION_ACTIVE: 'CO_REGULATION_ACTIVE',
  DO_NOT_DISTURB: 'DO_NOT_DISTURB',
};

let _currentMode = SystemMode.NORMAL;
let _coRegulationTimeout = null;
const CO_REGULATION_TIMEOUT_MS = 10 * 60 * 1000;

export function setMode(mode) {
  if (_coRegulationTimeout) {
    clearTimeout(_coRegulationTimeout);
    _coRegulationTimeout = null;
  }
  _currentMode = mode;
  if (mode === SystemMode.CO_REGULATION_ACTIVE) {
    _coRegulationTimeout = setTimeout(() => {
      if (_currentMode === SystemMode.CO_REGULATION_ACTIVE) {
        _currentMode = SystemMode.NORMAL;
      }
    }, CO_REGULATION_TIMEOUT_MS);
  }
}

export function getMode() {
  return _currentMode;
}

export function clearCoRegulation() {
  if (_coRegulationTimeout) {
    clearTimeout(_coRegulationTimeout);
    _coRegulationTimeout = null;
  }
  _currentMode = SystemMode.NORMAL;
}