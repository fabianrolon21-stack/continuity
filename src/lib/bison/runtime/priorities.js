// ═══════════════════════════════════════════════
// RUNTIME PRIORITIES (Base 44.4)
// Lower number = higher priority.
// No low-priority task may interrupt high-priority work.
// ═══════════════════════════════════════════════

export const RUNTIME_PRIORITIES = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export const PRIORITY_LABELS = {
  0: 'CRITICAL',
  1: 'HIGH',
  2: 'NORMAL',
  3: 'LOW',
};

export const FREQUENCY_MS = {
  REAL_TIME: 0,
  FAST: 3000,
  MINUTE: 60000,
  HOURLY: 3600000,
  DAILY: 86400000,
};

export const FREQUENCY_LABELS = {
  0: 'REAL_TIME',
  3000: 'FAST',
  60000: 'MINUTE',
  3600000: 'HOURLY',
  86400000: 'DAILY',
};