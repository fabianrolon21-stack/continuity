// ═══════════════════════════════════════════════
// PROFILER (Package 45 + Part I)
// Lightweight timing utility for every pipeline phase.
// Reports to RuntimeAuthority so every number originates
// from the runtime — never the LLM.
// ═══════════════════════════════════════════════

import { recordPlannerTime, recordContextBuildTime, recordLLMLatency } from './runtimeAuthority';

const _timings = {};

export function startTimer(name) {
  _timings[name] = { start: _now(), end: null, duration: null };
}

export function endTimer(name) {
  const timing = _timings[name];
  if (!timing) return;
  timing.end = _now();
  timing.duration = timing.end - timing.start;

  // Report to RuntimeAuthority
  const ms = Math.round(timing.duration);
  if (name === 'planning') recordPlannerTime(ms);
  else if (name === 'total' || name === 'cognitive' || name === 'identity' || name === 'evolution' || name === 'humanState') {
    recordContextBuildTime(ms);
  } else if (name === 'llm') {
    recordLLMLatency(ms);
  }
}

function _now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function getTimings() {
  const result = {};
  for (const [name, timing] of Object.entries(_timings)) {
    result[name] = timing.duration;
  }
  return result;
}

export function getProfileSummary() {
  const timings = getTimings();
  const total = timings.total || 0;
  const phases = {};
  for (const [name, duration] of Object.entries(timings)) {
    if (name === 'total') continue;
    if (duration == null) continue;
    phases[name] = duration;
  }
  return { phases, totalMs: total };
}

export function clearTimings() {
  for (const key of Object.keys(_timings)) {
    delete _timings[key];
  }
}