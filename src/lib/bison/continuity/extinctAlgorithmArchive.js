// ═══════════════════════════════════════════════
// PACKAGE 60 §2.4 — EXTINCT ALGORITHM ARCHIVE
// Discarded paths are never deleted; they go extinct and are kept
// locally (never shared externally) for future predictive modeling.
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'bison_extinct_algorithms_v1';

export function loadArchive() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function archiveExtinctData(chosenPath, discardedPath, contextHash) {
  const record = { discardedIdea: discardedPath, chosenInstead: chosenPath, timestamp: Date.now(), contextHash };
  const archive = [record, ...loadArchive()].slice(0, 200);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(archive)); } catch {}
  return record;
}

export const getArchiveForTraining = () => loadArchive();