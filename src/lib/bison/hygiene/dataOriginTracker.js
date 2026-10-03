// ═══════════════════════════════════════════════
// SYSTEM 7 — DATA GENERATION HYGIENE
// Model collapse by self-consumption: when a system reasons from its own
// output, the distribution narrows and distorts. Bison tracks the ratio of
// derived to human input and, past the threshold, asks for something new
// from the user's day rather than generating more from itself.
// ═══════════════════════════════════════════════

export const ORIGINS = { HUMAN_INPUT: 'HUMAN_INPUT', BISON_DERIVED: 'BISON_DERIVED', EXTERNAL_SOURCE: 'EXTERNAL_SOURCE' };

const THRESHOLD = 0.7;
const MIN_TURNS = 6;
const history = [];

export function recordOrigin(origin) {
  history.push({ origin, timestamp: Date.now() });
  if (history.length > 60) history.shift();
}

export function getOriginRatio() {
  const derived = history.filter(h => h.origin === ORIGINS.BISON_DERIVED).length;
  const human = history.filter(h => h.origin === ORIGINS.HUMAN_INPUT).length;
  const external = history.filter(h => h.origin === ORIGINS.EXTERNAL_SOURCE).length;
  const total = derived + human + external;
  return { derived, human, external, total, ratio: total ? derived / total : 0 };
}

export function buildHygieneContext() {
  const r = getOriginRatio();
  if (r.total < MIN_TURNS || r.ratio < THRESHOLD) return null;
  return `[DATA HYGIENE — self-reference threshold reached]
${Math.round(r.ratio * 100)}% of this thread is now your own reasoning rather than fresh human input. Proactively ask for something new from the user's day — a real detail, a recent moment — instead of continuing to reason from your own reasoning. Never treat your own derived output as confirmation of anything.`;
}

export function resetOriginTracker() { history.length = 0; }