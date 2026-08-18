// RUNTIME CLOCK — mode-aware tick rates for kernel housekeeping.
const TICK_BY_MODE = { FULL: 15000, REDUCED: 30000, QUIET: 60000, SAFE: 120000 };

export const runtimeClock = {
  now: () => Date.now(),
  tickMsFor: mode => TICK_BY_MODE[mode] ?? TICK_BY_MODE.FULL,
};