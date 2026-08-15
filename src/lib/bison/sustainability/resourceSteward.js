// ═══════════════════════════════════════════════
// SRTRS §1, §3, §4, §5 — RESOURCE STEWARDSHIP ENGINE
//
//   OBSERVE → ESTIMATE → OPTIMIZE → REQUEST CONSENT IF NECESSARY
//           → APPLY ONLY AUTHORIZED ACTIONS
//
// Only reversible, non-financial, local actions are applied autonomously.
// Anything with an external cost stops at the consent step.
//
// HONEST LIMITATION (§5): a browser exposes no CPU percent, no GPU
// percent, no disk GB, and no network GB. Those fields are reported as
// unavailable rather than fabricated, and no invented dollar figure is
// ever presented as a bill. §16 — this monitor is deliberately cheap
// and runs on a 60s interval, never per frame.
// ═══════════════════════════════════════════════

import { requireCapability } from './capabilityRegistry';
import { levelForStrain, getLevel } from './degradationLadder';
import { getBudget } from './resourceApprovals';
import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';
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
  'GPU utilization percent',
  'disk storage in GB outside this app\'s own quota',
  'network transfer totals in GB',
  'electricity cost or power draw',
];

function frameBudgetMs() {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start < 250) requestAnimationFrame(tick);
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

// ─── OBSERVE ───
export async function getUsageSnapshot() {
  const conn = navigator.connection || {};
  let battery = null;
  try { if (navigator.getBattery) battery = await navigator.getBattery(); } catch {}
  const heap = performance.memory || null;
  const frameMs = await frameBudgetMs();

  return {
    timestamp: Date.now(),
    cpuPercent: null,
    gpuPercent: null,
    storageGB: null,
    networkGB: null,
    cores: navigator.hardwareConcurrency ?? null,
    deviceMemoryGB: navigator.deviceMemory ?? null,
    memoryMB: heap ? Math.round(heap.usedJSHeapSize / 1048576) : null,
    heapLimitMB: heap ? Math.round(heap.jsHeapSizeLimit / 1048576) : null,
    networkType: conn.effectiveType || null,
    downlinkMbps: conn.downlink ?? null,
    saveData: conn.saveData ?? false,
    batteryLevel: battery ? Math.round(battery.level * 100) : null,
    charging: battery ? battery.charging : null,
    frameMs: Math.round(frameMs * 10) / 10,
    localStorageKB: Math.round(localStorageBytes() / 1024),
  };
}

export function assessStrain(s) {
  const signals = [];
  if (s.frameMs !== null) signals.push({ name: 'frame budget', strain: Math.min(1, Math.max(0, (s.frameMs - 16.7) / 33)) });
  if (s.memoryMB && s.heapLimitMB) signals.push({ name: 'JS heap', strain: Math.min(1, s.memoryMB / s.heapLimitMB) });
  if (s.batteryLevel !== null && !s.charging) signals.push({ name: 'battery', strain: Math.min(1, Math.max(0, (40 - s.batteryLevel) / 40)) });
  if (s.saveData) signals.push({ name: 'data saver', strain: 0.6 });
  if (s.networkType && ['slow-2g', '2g'].includes(s.networkType)) signals.push({ name: 'network', strain: 0.7 });

  const score = signals.length ? Math.round((signals.reduce((a, b) => a + b.strain, 0) / signals.length) * 100) : 0;
  return { score, signals, unmeasured: NOT_MEASURABLE };
}

// ─── ESTIMATE (§5) ───
export async function estimateCost(snapshot) {
  const budget = await getBudget();
  return {
    // No external provider is configured, so the honest external cost is zero.
    estimatedPeriodCostUSD: 0,
    budget,
    note: 'Bison runs on your device and the app\'s hosted platform. No per-CPU-hour bill is observable here, so no local-resource cost is presented as a bill. The only metered variable cost is AI integration credits, which the platform meters directly.',
    localFootprint: `${snapshot.localStorageKB} KB stored locally`,
  };
}

// ─── OPTIMIZE / APPLY ───
const actionLog = [];

function applyAction(type, justification, apply) {
  requireCapability('resource.local.optimize', type);
  const action = {
    actionId: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type, justification,
    userConsentRequired: false,   // reversible, local, non-financial
    reversible: true,
    applied: false,
    timestamp: Date.now(),
  };
  apply();
  action.applied = true;
  actionLog.unshift(action);
  if (actionLog.length > 40) actionLog.pop();
  return action;
}

/**
 * SRTRS explicitly has no SCALE_UP. A page cannot summon RAM or cores, so
 * pressure is answered by doing less, in a defined order.
 */
function applyLevel(level, reason) {
  const def = getLevel(level);
  return applyAction(
    level === 1 ? 'RESUME_NORMAL_MODE' : level >= 4 ? 'PAUSE_NONESSENTIAL_TASKS' : 'SCALE_DOWN',
    `${reason} → level ${def.level} (${def.label}): ${def.describe}`,
    () => bisonSimulation.applyResourceLevel(def),
  );
}

const listeners = [];
let timer = null;
let last = null;
let currentLevel = 1;

// ─── TICK (§15 — 60s, never per frame) ───
export async function tick() {
  const snapshot = await getUsageSnapshot();
  const strain = assessStrain(snapshot);
  const cost = await estimateCost(snapshot);

  const target = levelForStrain(strain.score, strain.signals.length);
  let action = null;
  if (target !== currentLevel) {
    action = applyLevel(target, `strain ${strain.score}%`);
    emit({
      subsystem: 'sustainability',
      event_type: target > currentLevel ? 'graceful_degradation' : 'resource_recovery',
      outcome: getLevel(target).id,
      meta: { from: currentLevel, to: target, strain: strain.score },
    });
    currentLevel = target;
  }

  last = { snapshot, strain, cost, level: getLevel(currentLevel), lastAction: action };
  listeners.forEach(fn => fn(last));
  return last;
}

/** §14 — the user returning restores the full experience immediately. */
export function restoreNormal(reason = 'user activity detected') {
  if (currentLevel === 1) return null;
  const action = applyLevel(1, reason);
  currentLevel = 1;
  if (last) { last = { ...last, level: getLevel(1), lastAction: action }; listeners.forEach(fn => fn(last)); }
  return action;
}

export function start(intervalMs = 60000) {
  if (timer) return;
  tick();
  timer = setInterval(tick, intervalMs);
}

export function stop() { clearInterval(timer); timer = null; }
export const status = () => ({ running: !!timer, last, level: getLevel(currentLevel) });
export const getActionLog = () => actionLog;
export function subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; }