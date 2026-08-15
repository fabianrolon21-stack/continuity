// ═══════════════════════════════════════════════
// SARG §6 — CONTINUITY WATCHDOG
//
// HONEST LIMITATION: the spec's AutoRestartDaemon supervises an OS
// process and restarts it after a crash. Nothing in this app can do
// that — a web page cannot supervise or relaunch anything, and code
// that is itself dead cannot notice that it died. A daemon here would
// be theatre.
//
// What is genuinely achievable is the half that matters for continuity:
// a heartbeat that lets the NEXT session detect that the last one ended
// uncleanly, and resume from persisted state rather than from zero.
// Bison's life simulation already performs elapsed-time catch-up on
// load; this records the gap and reports it honestly.
// ═══════════════════════════════════════════════

import { emit } from '@/lib/bison/observability/observabilityBus';

const KEY = 'bison_heartbeat';
const CLEAN_KEY = 'bison_clean_exit';
const BEAT_MS = 30000;

let timer = null;
let startupReport = null;

function beat() {
  try { localStorage.setItem(KEY, String(Date.now())); } catch {}
}

/**
 * Inspect the previous session before overwriting its trace.
 */
function inspectPreviousSession() {
  let lastBeat = null, cleanExit = false;
  try {
    lastBeat = Number(localStorage.getItem(KEY)) || null;
    cleanExit = localStorage.getItem(CLEAN_KEY) === 'true';
  } catch {}

  if (!lastBeat) return { firstRun: true, unclean: false, gapMinutes: 0, resumed: false };

  const gapMinutes = Math.round((Date.now() - lastBeat) / 60000);
  const unclean = !cleanExit;
  const report = {
    firstRun: false,
    unclean,
    gapMinutes,
    lastSeen: new Date(lastBeat).toISOString(),
    resumed: true,
    detail: unclean
      ? `The previous session ended without a clean shutdown — last heartbeat ${gapMinutes} minute(s) ago. State was restored from local persistence; nothing was restarted, because a page cannot restart itself.`
      : `The previous session exited cleanly ${gapMinutes} minute(s) ago and state resumed normally.`,
  };

  if (unclean) emit({ subsystem: 'sustainability', event_type: 'unclean_shutdown_detected', outcome: 'RESUMED', meta: { gapMinutes } });
  return report;
}

export function startWatchdog() {
  if (timer) return startupReport;
  startupReport = inspectPreviousSession();

  try { localStorage.setItem(CLEAN_KEY, 'false'); } catch {}
  beat();
  timer = setInterval(beat, BEAT_MS);

  window.addEventListener('pagehide', () => {
    try { localStorage.setItem(CLEAN_KEY, 'true'); } catch {}
  });

  return startupReport;
}

export const watchdogStatus = () => ({
  running: !!timer,
  beatSeconds: BEAT_MS / 1000,
  startupReport,
  cannotDo: [
    'Restart this app after a crash — a page cannot supervise or relaunch itself.',
    'Notice its own crash while it is happening; only the next session can see the gap.',
    'Run when the browser tab is closed. Bison exists in time by reconstructing elapsed time on load, not by running in the background.',
  ],
});