// ═══════════════════════════════════════════════
// PACKAGE 51 — STRUCTURED EVENT BUS (§1, §3, §8)
// Standardized events from every major subsystem. Local-first
// and in-memory: nothing is transmitted, and no user content
// is ever recorded unless explicitly authorized.
// Observability is not surveillance.
// ═══════════════════════════════════════════════

const MAX_EVENTS = 300;
let events = [];
let subscribers = [];

export const EVENT_SHAPE = ['timestamp', 'subsystem', 'event_type', 'outcome', 'duration_ms', 'confidence', 'constitutional_status'];

// Payload keys that may never enter the event stream.
const FORBIDDEN_KEYS = ['content', 'text', 'message', 'journal', 'memory', 'email', 'prompt', 'body'];

function stripUserContent(meta = {}) {
  const safe = {};
  for (const [k, v] of Object.entries(meta)) {
    if (FORBIDDEN_KEYS.some(f => k.toLowerCase().includes(f))) { safe[k] = '[withheld — user content never logged]'; continue; }
    safe[k] = typeof v === 'string' && v.length > 80 ? `${v.slice(0, 80)}…` : v;
  }
  return safe;
}

/**
 * Emit a structured observability event.
 * @param {object} e - { subsystem, event_type, outcome, duration_ms, confidence, constitutional_status, meta }
 */
export function emit(e) {
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    subsystem: e.subsystem || 'unknown',
    event_type: e.event_type || 'generic',
    outcome: e.outcome || 'OK',
    duration_ms: e.duration_ms ?? null,
    confidence: e.confidence ?? null,
    constitutional_status: e.constitutional_status || 'NOT_EVALUATED',
    meta: stripUserContent(e.meta),
  };
  events = [event, ...events].slice(0, MAX_EVENTS);
  subscribers.forEach(fn => fn(event));
  return event;
}

/** Time an operation and emit its event automatically. */
export async function traced(descriptor, fn) {
  const t0 = performance.now();
  try {
    const value = await fn();
    emit({ ...descriptor, outcome: 'OK', duration_ms: Math.round(performance.now() - t0) });
    return value;
  } catch (err) {
    emit({ ...descriptor, outcome: 'FAILED', duration_ms: Math.round(performance.now() - t0), meta: { ...descriptor.meta, error: err.message } });
    throw err;
  }
}

export const listEvents = (filter = {}) => events.filter(e =>
  (!filter.subsystem || e.subsystem === filter.subsystem) &&
  (!filter.outcome || e.outcome === filter.outcome)
);

export const subscribe = (fn) => { subscribers.push(fn); return () => { subscribers = subscribers.filter(s => s !== fn); }; };
export const clearEvents = () => { events = []; };

export const subsystemsSeen = () => [...new Set(events.map(e => e.subsystem))];

// §8 — Constitutional observability record attached to autonomous actions.
export function constitutionalRecord({ rulesEvaluated = [], passed = [], failed = [], evidence = [], confidence = null }) {
  return {
    rules_evaluated: rulesEvaluated,
    rules_passed: passed,
    rules_failed: failed,
    evidence_used: evidence,
    confidence,
    auditable: true,
    recorded_at: new Date().toISOString(),
  };
}