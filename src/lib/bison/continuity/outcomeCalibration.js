// ═══════════════════════════════════════════════
// PACKAGE 61 §10 — OUTCOME CALIBRATION ENGINE
// PREDICTION → OUTCOME → ERROR → CALIBRATION.
// Over time: "this type of prediction has historically been overconfident."
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_calibration_v1';

export function loadCalibration() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function recordCalibration({ prediction, confidence, correct }) {
  const records = [{ prediction, confidence, correct, timestamp: Date.now() }, ...loadCalibration()].slice(0, 200);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
  return records;
}

export function calibrationSummary() {
  const records = loadCalibration();
  if (!records.length) return null;
  const hitRate = records.filter(record => record.correct).length / records.length;
  const avgConfidence = records.reduce((sum, record) => sum + (record.confidence ?? 0.5), 0) / records.length;
  const gap = avgConfidence - hitRate;
  return {
    total: records.length,
    hitRate: Math.round(hitRate * 100),
    avgConfidence: Math.round(avgConfidence * 100),
    verdict: gap > 0.12 ? 'Historically overconfident — predictions run hotter than reality.' : gap < -0.12 ? 'Historically underconfident — outcomes beat expectations.' : 'Reasonably calibrated so far.',
  };
}