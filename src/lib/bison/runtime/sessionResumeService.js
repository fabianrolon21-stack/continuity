// ═══════════════════════════════════════════════
// SESSION RESUME SERVICE (Package 47.2)
// On startup, restores the last session's state and
// generates a continuity context for the pipeline.
// During the session, periodically checkpoints state.
// On shutdown, generates a session summary.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { serializeSessionState, isValidSnapshot, computeSessionGap, isResumable } from './sessionStateSerializer';

const CHECKPOINT_INTERVAL_MS = 60000; // 1 minute

let _checkpointTimer = null;
let _lastSnapshot = null;
let _sessionStartTime = null;

// ─── RESUME ───

// Load and validate the last session snapshot from the user entity.
// Returns the snapshot if resumable, null otherwise.
export async function resumeSession() {
  _sessionStartTime = Date.now();
  try {
    const user = await base44.auth.me();
    const snapshot = user?.session_state;
    if (!isValidSnapshot(snapshot) || !isResumable(snapshot)) {
      _lastSnapshot = null;
      return null;
    }
    _lastSnapshot = snapshot;
    return snapshot;
  } catch (e) {
    return null;
  }
}

// Build a continuity context string for the pipeline, so Bison
// is aware of the previous session when the user returns.
export function buildContinuityContextString() {
  if (!_lastSnapshot) return null;
  const gap = computeSessionGap(_lastSnapshot);
  const parts = ['[SESSION CONTINUITY]'];

  if (gap.days >= 1) {
    parts.push(`The user was last here ${gap.days} day(s) ago.`);
  } else if (gap.hours >= 1) {
    parts.push(`The user was last here ${gap.hours} hour(s) ago.`);
  } else if (gap.minutes >= 1) {
    parts.push(`The user was last here ${gap.minutes} minute(s) ago.`);
  } else {
    parts.push('The user just returned.');
  }

  if (_lastSnapshot.orchestrator) {
    const orch = _lastSnapshot.orchestrator;
    if (orch.cycleCount > 0) {
      parts.push(`Previous session ran for ${orch.cycleCount} runtime cycles (${Math.round(orch.uptime / 1000)}s uptime).`);
    }
    if (orch.failsafe) {
      parts.push(`The previous session ended in failsafe mode: ${orch.failsafeReason || 'resource constraint'}.`);
    }
  }

  if (_lastSnapshot.runtime) {
    const r = _lastSnapshot.runtime;
    parts.push(`Previous runtime state: ${r.computeMode} mode, ${r.bandwidth}% bandwidth, ${r.apiCalls} API calls, ${r.hallucinationsPrevented} hallucinations prevented.`);
    if (r.contextsLoaded?.length > 0) {
      parts.push(`Contexts active at last checkpoint: ${r.contextsLoaded.join(', ')}.`);
    }
  }

  if (_lastSnapshot.provenance?.stats) {
    const p = _lastSnapshot.provenance.stats;
    parts.push(`Provenance registry: ${p.registered} tracked, ${p.quarantined} quarantined.`);
  }

  if (_lastSnapshot.sessionSummary) {
    parts.push(`LAST SESSION SUMMARY: ${_lastSnapshot.sessionSummary}`);
  }

  parts.push('Use this continuity awareness naturally. Do not recite these numbers to the user. If the gap was long, a gentle welcome-back is appropriate. If the previous session ended in failsafe, check in gently.');
  parts.push('[/SESSION CONTINUITY]\n');
  return parts.join('\n');
}

export function getLastSnapshot() {
  return _lastSnapshot;
}

// ─── CHECKPOINT ───

// Persist the current session state to the user entity.
// Called periodically and on shutdown.
export async function checkpoint(orchestratorState = {}) {
  try {
    const snapshot = serializeSessionState(orchestratorState);
    // Preserve the session summary from the last resume if present
    if (_lastSnapshot?.sessionSummary && !snapshot.sessionSummary) {
      snapshot.sessionSummary = _lastSnapshot.sessionSummary;
    }
    await base44.auth.updateMe({ session_state: snapshot });
    _lastSnapshot = snapshot;
    return snapshot;
  } catch (e) {
    return null;
  }
}

// Start periodic checkpointing during the active session.
export function startCheckpointing(getOrchestratorState) {
  stopCheckpointing();
  _checkpointTimer = setInterval(async () => {
    const state = typeof getOrchestratorState === 'function' ? getOrchestratorState() : {};
    await checkpoint(state);
  }, CHECKPOINT_INTERVAL_MS);
}

export function stopCheckpointing() {
  if (_checkpointTimer) {
    clearInterval(_checkpointTimer);
    _checkpointTimer = null;
  }
}

// ─── SESSION SUMMARY ───

// Generate a natural-language summary of the session on shutdown.
// Uses the last checkpoint's provenance + runtime data.
export async function generateSessionSummary(orchestratorState = {}) {
  const duration = _sessionStartTime ? Date.now() - _sessionStartTime : 0;
  const snapshot = serializeSessionState(orchestratorState);

  const facts = [];
  if (snapshot.orchestrator?.cycleCount > 0) {
    facts.push(`Ran ${snapshot.orchestrator.cycleCount} runtime cycles over ${Math.round(duration / 1000)}s.`);
  }
  if (snapshot.runtime?.apiCalls > 0) {
    facts.push(`Made ${snapshot.runtime.apiCalls} LLM calls.`);
  }
  if (snapshot.runtime?.hallucinationsPrevented > 0) {
    facts.push(`Prevented ${snapshot.runtime.hallucinationsPrevented} hallucinations.`);
  }
  if (snapshot.provenance?.recent?.length > 0) {
    facts.push(`Tracked ${snapshot.provenance.stats.registered} provenance entries.`);
  }
  if (snapshot.orchestrator?.failsafe) {
    facts.push(`Session ended in failsafe mode.`);
  }

  if (facts.length === 0) {
    return 'Session ended with minimal activity.';
  }

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a single concise sentence (max 25 words) summarizing this Bison session for continuity purposes. State only what happened — no fluff.\n\nFACTS:\n${facts.join('\n')}`,
    });
    return typeof result === 'string' ? result.trim() : (result?.text || facts.join(' '));
  } catch (e) {
    return facts.join(' ');
  }
}

// Final shutdown: generate summary, checkpoint, and stop.
export async function finalizeSession(orchestratorState = {}) {
  stopCheckpointing();
  try {
    const summary = await generateSessionSummary(orchestratorState);
    const snapshot = serializeSessionState(orchestratorState);
    snapshot.sessionSummary = summary;
    snapshot.sessionEndedAt = new Date().toISOString();
    await base44.auth.updateMe({ session_state: snapshot, last_session_at: snapshot.sessionEndedAt });
    _lastSnapshot = snapshot;
    return { summary, snapshot };
  } catch (e) {
    return { summary: null, snapshot: null };
  }
}