// ═══════════════════════════════════════════════
// SARG §4 — RESOURCE STEWARDSHIP ENGINE
// Watches what this runtime can actually measure, estimates cost
// honestly, and degrades gracefully when the device is strained.
//
// HONEST LIMITATION: the spec reads CPU percent, storage GB, and
// network GB from a system monitor. A browser exposes none of those.
// What is genuinely available is listed in MEASURABLE below; the rest
// is reported as unavailable instead of being invented. The continuous
// loop is interval-driven, not `while (true)`, which would freeze the
// single UI thread.
// ═══════════════════════════════════════════════

import { emit } from '@/lib/bison/observability/observabilityBus';

export const MEASURABLE = [
  'logical CPU cores (navigator.hardwareConcurrency)',
  'approximate device memory tier (navigator.deviceMemory)',
  'JS heap usage (Chromium only, performance.memory)',
  'effective network type and downlink estimate (navigator.connection)',
  'battery level and charging state (where permitted)',
  'frame budget, measured directly',
  'local storage bytes used by this app',
];

export const NOT_MEASURABLE = [
  'CPU utilization percent — no browser API exposes it',
  'GPU utilization',
  'disk storage in GB outside this app\'s own quota',
  'network transfer totals in GB',
  'electricity cost or power draw',
  'hardware serial numbers or MAC addresses',
];

async function frameBudgetMs() {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start < 300) requestAnimationFrame(tick);
      else resolve((performance.now() - start) / frames);
    };
    requestAnimationFrame(tick);
  });
}

function localStorageBytes() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      total += (k.length + (localStorage.getItem(k) || '').length) * 2;
    }
  } catch {}
  return total;
}

export async function getUsageSnapshot() {
  const conn = navigator.connection || {};
  let battery = null;
  try { if (navigator.getBattery) battery = await navigator.getBattery(); } catch {}
  const heap = performance.memory || null;
  const frameMs = await frameBudgetMs();

  return {
    cores: navigator.hardwareConcurrency ?? null,
    deviceMemoryGB: navigator.deviceMemory ?? null,
    heapUsedMB: heap ? Math.round(heap.usedJSHeapSize / 1048576) : null,
    heapLimitMB: heap ? Math.round(heap.jsHeapSizeLimit / 1048576) : null,
    networkType: conn.effectiveType || null,
    downlinkMbps: conn.downlink ?? null,
    saveData: conn.saveData ?? false,
    batteryLevel: battery ? Math.round(battery.level * 100) : null,
    charging: battery ? battery.charging : null,
    frameMs: Math.round(frameMs * 10) / 10,
    localStorageKB: Math.round(localStorageBytes() / 1024),
    measuredAt: new Date().toISOString(),
  };
}

/**
 * Strain is derived only from measured values. Where a signal is missing it is
 * excluded from the score rather than defaulted, and the excluded signals are
 * reported so the number is never mistaken for a full picture.
 */
export function assessStrain(s) {
  const signals = [];
  if (s.frameMs !== null) signals.push({ name: 'frame budget', strain: Math.min(1, Math.max(0, (s.frameMs - 16.7) / 33)) });
  if (s.heapUsedMB && s.heapLimitMB) signals.push({ name: 'JS heap', strain: Math.min(1, s.heapUsedMB / s.heapLimitMB) });
  if (s.batteryLevel !== null && !s.charging) signals.push({ name: 'battery', strain: Math.min(1, Math.max(0, (40 - s.batteryLevel) / 40)) });
  if (s.saveData) signals.push({ name: 'data saver', strain: 0.6 });
  if (s.networkType && ['slow-2g', '2g'].includes(s.networkType)) signals.push({ name: 'network', strain: 0.7 });

  const score = signals.length ? signals.reduce((a, b) => a + b.strain, 0) / signals.length : 0;
  const mode = score > 0.66 ? 'QUIET_LIGHTHOUSE' : score > 0.35 ? 'LOW_POWER' : 'NORMAL';
  return { score: Math.round(score * 100), mode, signals, unmeasured: NOT_MEASURABLE };
}

/**
 * Cost estimate. This runtime pays no metered compute bill it can observe, so
 * the only honest answer is a qualitative one plus the integration credits the
 * app actually spends — not a fabricated dollar figure.
 */
export function estimateCost(snapshot) {
  return {
    observableMonetaryCost: null,
    note: 'This app runs on the user\'s device and Base44\'s hosted platform. No per-CPU-hour bill is observable from here, so no dollar figure is invented. The real variable cost is integration credits spent on AI calls, which the platform meters.',
    localFootprint: `${snapshot.localStorageKB} KB stored locally`,
  };
}

const listeners = [];
let timer = null;
let last = null;

export async function runStewardCycle() {
  const snapshot = await getUsageSnapshot();
  const strain = assessStrain(snapshot);
  last = { snapshot, strain, cost: estimateCost(snapshot) };
  if (strain.mode !== 'NORMAL') {
    emit({ subsystem: 'sustainability', event_type: 'graceful_degradation', outcome: strain.mode, meta: { strain: strain.score } });
  }
  listeners.forEach(fn => fn(last));
  return last;
}

export function startSteward(intervalMs = 300000) {
  if (timer) return;
  runStewardCycle();
  timer = setInterval(runStewardCycle, intervalMs);
}

export function stopSteward() { clearInterval(timer); timer = null; }
export const stewardStatus = () => ({ running: !!timer, last });
export function subscribeSteward(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; }