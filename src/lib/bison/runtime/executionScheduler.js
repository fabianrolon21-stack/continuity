// ═══════════════════════════════════════════════
// EXECUTION SCHEDULER (Package 45.4)
// Lazy loading + execution priorities + module states.
// States: ACTIVE (executing), IDLE (loaded, done),
// SUSPENDED (not scheduled this interaction), FAILED.
//
// All timings are measured here — never LLM-generated.
// ═══════════════════════════════════════════════

import { canExecute, recordExecution } from './moduleLifecycleManager';

export const MODULE_STATES = {
  ACTIVE: 'ACTIVE',
  IDLE: 'IDLE',
  SUSPENDED: 'SUSPENDED',
  FAILED: 'FAILED',
  UNAVAILABLE: 'UNAVAILABLE',
};

let _modules = {};

function ensureModule(name) {
  if (!_modules[name]) {
    _modules[name] = {
      name,
      state: MODULE_STATES.SUSPENDED,
      lastDurationMs: null,
      lastError: null,
      runs: 0,
      lastRunAt: null,
    };
  }
  return _modules[name];
}

export function resetScheduler() {
  _modules = {};
}

// Lazy execution: the loader only runs when this is called.
// Errors are contained — a failed module never breaks the pipeline.
export async function runModule(name, loader) {
  // Circuit breaker check (Package 44.6) — skip if tripped
  if (!canExecute(name)) {
    const mod = ensureModule(name);
    mod.state = MODULE_STATES.UNAVAILABLE;
    return null;
  }

  const mod = ensureModule(name);
  mod.state = MODULE_STATES.ACTIVE;
  mod.runs++;
  mod.lastRunAt = new Date().toISOString();
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    const result = await loader();
    mod.lastDurationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
    mod.state = MODULE_STATES.IDLE;
    mod.lastError = null;
    recordExecution(name, mod.lastDurationMs, true);
    return result;
  } catch (e) {
    mod.lastDurationMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
    mod.state = MODULE_STATES.FAILED;
    mod.lastError = e?.message || String(e);
    recordExecution(name, mod.lastDurationMs, false, mod.lastError);
    return null;
  }
}

// Async execution where dependencies allow: runs independent
// modules in parallel. entries: [{ name, loader }]
export async function runParallel(entries) {
  const results = await Promise.all(entries.map(e => runModule(e.name, e.loader)));
  const out = {};
  entries.forEach((e, i) => { out[e.name] = results[i]; });
  return out;
}

export function suspendModule(name) {
  const mod = ensureModule(name);
  mod.state = MODULE_STATES.SUSPENDED;
}

export function getSchedulerState() {
  return Object.values(_modules).map(m => ({ ...m }));
}