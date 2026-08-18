// ═══════════════════════════════════════════════
// PACKAGE 61 §15 — POST-ACTION REFLECTION LOOP
// The actual cycle breaker: observe → act → evaluate → adjust.
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_reflections_v1';

export const REFLECTION_QUESTIONS = [
  { id: 'happened', label: 'What actually happened?' },
  { id: 'different', label: 'What was different from what you expected?' },
  { id: 'learned', label: 'What did you learn? What would you change?' },
];

export function loadReflections() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function recordReflection({ decisionId, intended, did, answers }) {
  const record = { id: `refl_${Date.now()}`, decisionId, intended, did, ...answers, timestamp: Date.now() };
  const records = [record, ...loadReflections()].slice(0, 100);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
  return record;
}