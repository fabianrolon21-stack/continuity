// ═══════════════════════════════════════════════
// SESSION STATE SERIALIZER (Package 47.1)
// Captures the complete ephemeral runtime state into
// a serializable snapshot that can be persisted and
// restored across sessions. Nothing is lost between
// visits — the runtime resumes where it left off.
// ═══════════════════════════════════════════════

import { getReport as getRuntimeReport } from './runtimeAuthority';
import { getProfileSummary } from './profiler';
import { getCacheStats } from './contextCache';
import { getRegistrySnapshot } from './moduleRegistry';
import { getRuntimeStatistics } from './auditLog';
import { getRecentProvenance, getQuarantinedCount, getRegisteredCount } from '../provenance/provenanceTracker';

export const SESSION_STATE_VERSION = '1.0';

// Capture a complete snapshot of the current ephemeral state.
// This is the single source of truth for what gets persisted.
export function serializeSessionState(orchestratorState = {}) {
  let runtimeReport = null;
  let profileSummary = null;
  let cacheStats = null;
  let provenanceRecent = [];
  let provenanceStats = null;
  let moduleRegistry = [];
  let runtimeStats = null;

  try { runtimeReport = getRuntimeReport(); } catch (e) {}
  try { profileSummary = getProfileSummary(); } catch (e) {}
  try { cacheStats = getCacheStats(); } catch (e) {}
  try { provenanceRecent = getRecentProvenance(10); } catch (e) {}
  try { provenanceStats = { registered: getRegisteredCount(), quarantined: getQuarantinedCount() }; } catch (e) {}
  try { moduleRegistry = getRegistrySnapshot(); } catch (e) {}
  try { runtimeStats = getRuntimeStatistics(); } catch (e) {}

  return {
    version: SESSION_STATE_VERSION,
    serializedAt: new Date().toISOString(),
    orchestrator: {
      state: orchestratorState.state || 'unknown',
      cycleCount: orchestratorState.cycleCount || 0,
      uptime: orchestratorState.uptime || 0,
      lastCycleDuration: orchestratorState.lastCycleDuration || 0,
      failsafe: orchestratorState.failsafe || false,
      failsafeReason: orchestratorState.failsafeReason || null,
    },
    runtime: runtimeReport ? {
      computeMode: runtimeReport.computeMode,
      bandwidth: runtimeReport.bandwidth,
      apiCalls: runtimeReport.apiCalls,
      externalCalls: runtimeReport.externalCalls,
      hallucinationsPrevented: runtimeReport.hallucinationsPrevented,
      memoryUsageMB: runtimeReport.memoryUsageMB,
      averageLatencyMs: runtimeReport.averageLatencyMs,
      contextsLoaded: runtimeReport.contextsLoaded,
      contextsSkippedCount: runtimeReport.contextsSkipped?.length || 0,
    } : null,
    cache: cacheStats,
    profile: profileSummary,
    provenance: {
      recent: provenanceRecent.map(r => ({
        value: typeof r.value === 'string' ? r.value.substring(0, 200) : JSON.stringify(r.value).substring(0, 200),
        source: r.source,
        confidence: r.confidence,
        epistemicStatus: r.epistemicStatus,
        timestamp: r.timestamp,
      })),
      stats: provenanceStats,
    },
    modules: moduleRegistry,
    statistics: runtimeStats,
  };
}

// Validate that a loaded snapshot is structurally sound.
export function isValidSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (!snapshot.version || !snapshot.serializedAt) return false;
  return true;
}

// Compute the gap between the last session and now.
export function computeSessionGap(snapshot) {
  if (!snapshot?.serializedAt) return null;
  const last = new Date(snapshot.serializedAt).getTime();
  const now = Date.now();
  const gapMs = now - last;
  return {
    ms: gapMs,
    seconds: Math.round(gapMs / 1000),
    minutes: Math.round(gapMs / 60000),
    hours: Math.round(gapMs / 3600000),
    days: Math.round(gapMs / 86400000),
  };
}

// Determine if the snapshot is recent enough to resume from.
// Sessions older than 7 days are considered stale — a fresh start
// is more appropriate than restoring ancient state.
export function isResumable(snapshot) {
  const gap = computeSessionGap(snapshot);
  if (!gap) return false;
  return gap.days < 7;
}