// ═══════════════════════════════════════════════
// PACKAGE 61 §9 — COUNTERFACTUAL ENGINE
// Every meaningful decision records its alternatives and predicted
// outcome, so Bison can later ask: what actually happened?
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_counterfactuals_v1';

export function loadCounterfactuals() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function persist(records) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 100))); } catch {}
}

export function recordCounterfactual({ chosenAction, alternatives, predictedOutcome }) {
  const record = {
    decisionId: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    chosenAction,
    alternatives: alternatives.length ? alternatives : ['Do nothing'],
    predictedOutcomes: predictedOutcome ? [predictedOutcome] : [],
    actualOutcome: undefined,
    timestamp: Date.now(),
  };
  persist([record, ...loadCounterfactuals()]);
  return record;
}

export function resolveOutcome(decisionId, actualOutcome) {
  const records = loadCounterfactuals().map(record => record.decisionId === decisionId ? { ...record, actualOutcome, resolvedAt: Date.now() } : record);
  persist(records);
  return records.find(record => record.decisionId === decisionId);
}

export const openLoops = () => loadCounterfactuals().filter(record => !record.actualOutcome);