// ═══════════════════════════════════════════════
// PROFILER (Package 45)
// Lightweight timing utility for every pipeline phase.
// Measures: planning, context build, prompt assembly, LLM, total.
// ═══════════════════════════════════════════════

const _timings = {};

export function startTimer(name) {
  _timings[name] = { start: Date.now(), end: null, duration: null };
}

export function endTimer(name) {
  const timing = _timings[name];
  if (!timing) return;
  timing.end = Date.now();
  timing.duration = timing.end - timing.start;
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
  return {
    phases,
    totalMs: total,
  };
}

export function clearTimings() {
  for (const key of Object.keys(_timings)) {
    delete _timings[key];
  }
}