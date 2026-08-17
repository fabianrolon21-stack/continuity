// ═══════════════════════════════════════════════
// PACKAGE 60 v1.5 §17, §25 — SESSION PERSISTENCE
// Continuity sessions can be paused and resumed; world state
// persists even when rendering pauses.
// ═══════════════════════════════════════════════

const SESSION_KEY = 'bison_continuity_session_v1';

export function saveSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, savedAt: Date.now() })); } catch {}
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}