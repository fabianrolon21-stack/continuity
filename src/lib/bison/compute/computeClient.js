// ═══════════════════════════════════════════════
// DISTRIBUTED EDGE COMPUTE — CLIENT ORCHESTRATOR
//
//   consent → request task → worker computes → server verifies → credit
//
// NO_DECEPTION, enforced structurally:
//  · Credits come only from the server's `verified: true` response. The
//    client never increments a counter on its own.
//  · With no consent, or no tasks issued, every number below stays 0.
//  · Monetary earnings are not modeled at all. Nothing here buys compute,
//    so a dollar figure would be fabricated — the unit is compute credits.
//  · Duty cycle is capped so the tab stays responsive, and the worker
//    stands down when the resource steward degrades.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { hasValidConsent } from '@/lib/bison/legal/consentLedger';
import { evaluateAction } from '@/lib/bison/legal/legalComplianceEngine';
import { status as stewardStatus } from '@/lib/bison/sustainability/resourceSteward';

const CONSENT_ACTION = 'distributed_compute';
const CONSENT_SCOPE = ['cpu'];
const DUTY_CYCLE = 0.25;          // work ~25% of the time, idle the rest
const MAX_DEGRADATION_LEVEL = 3;  // level 4+ pauses contribution entirely

const state = {
  running: false,
  consent: null,
  tasksAttempted: 0,
  tasksVerified: 0,
  tasksRejected: 0,
  creditsEarned: 0,
  totalWorkerMs: 0,
  lastTask: null,
  lastError: null,
  stoppedReason: null,
};

let worker = null;
let listeners = [];
let stopping = false;

const emit = () => listeners.forEach(fn => fn(snapshot()));

export function snapshot() {
  const avg = state.tasksAttempted ? Math.round(state.totalWorkerMs / state.tasksAttempted) : 0;
  return {
    ...state,
    averageTaskMs: avg,
    // Deliberately constant: no buyer of this compute exists.
    earningsUSD: 0,
    earningsNote: 'No party pays for this compute, so monetary earnings are exactly $0.00 and always will be. Credits below are internal compute units backed by server-verified task receipts.',
  };
}

export function subscribe(fn) {
  listeners.push(fn);
  fn(snapshot());
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export const consentStatus = () => hasValidConsent(CONSENT_ACTION, CONSENT_SCOPE);

function ensureWorker() {
  if (!worker) {
    worker = new Worker(new URL('./computeWorker.js', import.meta.url), { type: 'module' });
  }
  return worker;
}

function runOnWorker(task) {
  return new Promise((resolve, reject) => {
    const w = ensureWorker();
    const onMessage = (e) => {
      if (e.data?.taskId !== task.task_id) return;
      w.removeEventListener('message', onMessage);
      e.data.error ? reject(new Error(e.data.error)) : resolve(e.data);
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ taskId: task.task_id, taskType: task.task_type, params: task.params });
  });
}

async function oneCycle(consentId) {
  const issued = await base44.functions.invoke('issueComputeTask', { consentId });
  const task = issued.data?.task;
  if (!task) throw new Error(issued.data?.error || 'No task was issued.');

  state.tasksAttempted++;
  state.lastTask = { type: task.task_type, difficulty: task.difficulty, status: 'COMPUTING' };
  emit();

  const { result, workerMs } = await runOnWorker(task);
  state.totalWorkerMs += workerMs;

  // The server is the only source of truth for credit.
  const verification = await base44.functions.invoke('verifyComputeReceipt', {
    taskId: task.task_id, result, workerMs,
  });
  const v = verification.data || {};

  if (v.verified) {
    state.tasksVerified++;
    state.creditsEarned += v.creditsAwarded || 0;
  } else {
    state.tasksRejected++;
  }
  state.lastTask = {
    type: task.task_type,
    difficulty: task.difficulty,
    status: v.verified ? 'VERIFIED' : 'REJECTED',
    result, workerMs,
    reason: v.reason,
  };
  emit();
  return workerMs;
}

async function loop() {
  while (state.running && !stopping) {
    const level = stewardStatus().level?.level || 1;
    if (level > MAX_DEGRADATION_LEVEL) {
      state.stoppedReason = `Paused: the device is under load (degradation level ${level}). Contribution resumes when it recovers.`;
      emit();
      await new Promise(r => setTimeout(r, 30000));
      continue;
    }
    // Consent is re-checked every cycle, so revoking stops work immediately.
    if (!consentStatus().valid) {
      stop('Consent was revoked.');
      return;
    }
    state.stoppedReason = null;

    try {
      const workedMs = await oneCycle(state.consent);
      const idleMs = Math.round(workedMs * (1 - DUTY_CYCLE) / DUTY_CYCLE);
      await new Promise(r => setTimeout(r, Math.min(idleMs, 20000)));
    } catch (e) {
      state.lastError = e.message;
      emit();
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

export async function start() {
  if (state.running) return { started: true };

  const consent = consentStatus();
  if (!consent.valid) {
    return { started: false, reason: 'Compute sharing requires your explicit consent. Nothing runs until you grant it.' };
  }

  // Routed through the legal engine so the start is recorded like any action.
  const decision = await evaluateAction({
    actionType: CONSENT_ACTION,
    scope: CONSENT_SCOPE,
    rationale: 'Starting consented distributed edge compute contribution',
    module: 'edge_compute_worker',
    initiator: 'user',
  });
  if (!decision.allowed) return { started: false, reason: decision.reason };

  stopping = false;
  state.running = true;
  state.consent = consent.consentId;
  state.stoppedReason = null;
  emit();
  loop();
  return { started: true };
}

export function stop(reason = 'Stopped by you.') {
  stopping = true;
  state.running = false;
  state.stoppedReason = reason;
  if (worker) { worker.terminate(); worker = null; }
  emit();
}

/** Verified history straight from the server's records, not local counters. */
export async function loadReceipts() {
  const tasks = await base44.entities.ComputeTask.list('-created_date', 25).catch(() => []);
  return tasks;
}