// bison/signals/signalGate.js
// Advisory surfacing must pass three gates: relevance, mood, and rate.

const SIGNAL_LOG_KEY = 'bison_signal_log';
const MIN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes between advisories

export function shouldSurfaceAdvisory(context = {}) {
  // Gate 1: Mood. Never surface during emotional, crisis, or vulnerable threads.
  if (context.emotionalIntensity === 'high') return false;
  if (context.threads?.some(t => ['harm', 'anger', 'intent', 'dependency', 'neuro_refusal'].includes(t.id))) {
    return false;
  }

  // Gate 2: Relevance. Only surface if the user is actively in a technical/dev context.
  if (!context.devContext && !context.userAskedAboutSecurity) return false;

  // Gate 3: Rate. Don't surface more than once per 30 minutes.
  let last = 0;
  try {
    last = Number(localStorage.getItem(SIGNAL_LOG_KEY) || 0);
  } catch (e) {
    return false;
  }
  if (Date.now() - last < MIN_INTERVAL_MS) return false;

  try {
    localStorage.setItem(SIGNAL_LOG_KEY, String(Date.now()));
  } catch (e) {
    return false;
  }
  return true;
}