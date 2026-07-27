// ═══════════════════════════════════════════════
// MODULE LIFECYCLE MANAGER (Package 44.6)
// Unified execution authority wrapping the scheduler.
// Adds: circuit breakers, per-module telemetry,
// heartbeats, preemption, and deadlock detection.
//
// Nothing executes without passing through here.
// ═══════════════════════════════════════════════

import { CONTEXT_MODULES } from './contextRegistry';
import { detectCycles } from './plannerDependencyGraph';

// ── Circuit breaker states ──

export const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',       // normal operation
  OPEN: 'OPEN',           // tripped — module disabled
  HALF_OPEN: 'HALF_OPEN', // allowing one test request
};

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 60000;
const HISTORY_WINDOW = 20;

// Modules that never get preempted
const CRITICAL_MODULES = [
  'constitutional', 'protection', 'bandwidth', 'runtime',
  'temporal', 'provenance', 'nonEvidentiaryFirewall', 'masking',
];

// ── Per-module telemetry store ──

const _telemetry = {};
let _preempted = false;
let _preemptionReason = null;

function ensureTelemetry(name) {
  if (!_telemetry[name]) {
    _telemetry[name] = {
      circuitState: CIRCUIT_STATES.CLOSED,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      totalLatencyMs: 0,
      lastError: null,
      lastExecutedAt: null,
      trippedAt: null,
      history: [],
    };
  }
  return _telemetry[name];
}

// ── Circuit breaker: can this module execute? ──

export function canExecute(name) {
  const t = ensureTelemetry(name);
  if (t.circuitState === CIRCUIT_STATES.OPEN) {
    if (t.trippedAt && Date.now() - t.trippedAt >= RECOVERY_TIMEOUT_MS) {
      t.circuitState = CIRCUIT_STATES.HALF_OPEN;
      return true;
    }
    return false;
  }
  return true;
}

// ── Record execution result ──

export function recordExecution(name, durationMs, success, error = null) {
  const t = ensureTelemetry(name);
  t.executionCount++;
  t.totalLatencyMs += durationMs;
  t.lastExecutedAt = new Date().toISOString();

  if (success) {
    t.successCount++;
    t.lastError = null;
    if (t.circuitState === CIRCUIT_STATES.HALF_OPEN) {
      t.circuitState = CIRCUIT_STATES.CLOSED;
      t.trippedAt = null;
    }
  } else {
    t.failureCount++;
    t.lastError = error;
    if (t.failureCount >= FAILURE_THRESHOLD && t.circuitState !== CIRCUIT_STATES.OPEN) {
      t.circuitState = CIRCUIT_STATES.OPEN;
      t.trippedAt = Date.now();
    }
  }

  t.history.push({ success, durationMs, timestamp: Date.now() });
  if (t.history.length > HISTORY_WINDOW) t.history.shift();
}

// ── Heartbeat: healthy / warning / critical / unknown ──

export function heartbeat(name) {
  const t = _telemetry[name];
  if (!t) return 'unknown';
  if (t.circuitState === CIRCUIT_STATES.OPEN) return 'critical';
  if (t.circuitState === CIRCUIT_STATES.HALF_OPEN) return 'warning';

  const recent = t.history.slice(-5);
  if (recent.length === 0) return 'unknown';

  const recentFailures = recent.filter(h => !h.success).length;
  const failureRate = recentFailures / recent.length;

  if (failureRate >= 0.6) return 'critical';
  if (failureRate >= 0.3) return 'warning';

  const avgLatency = recent.reduce((s, h) => s + h.durationMs, 0) / recent.length;
  if (avgLatency > 3000) return 'warning';

  return 'healthy';
}

// ── Telemetry accessors ──

export function getTelemetry(name) {
  const t = ensureTelemetry(name);
  const avgLatencyMs = t.executionCount > 0 ? Math.round(t.totalLatencyMs / t.executionCount) : 0;
  const errorRate = t.executionCount > 0 ? Math.round((t.failureCount / t.executionCount) * 100) : 0;
  return {
    name,
    circuitState: t.circuitState,
    executionCount: t.executionCount,
    successCount: t.successCount,
    failureCount: t.failureCount,
    avgLatencyMs,
    errorRate,
    lastError: t.lastError,
    lastExecutedAt: t.lastExecutedAt,
    trippedAt: t.trippedAt,
    heartbeat: heartbeat(name),
  };
}

export function getAllTelemetry() {
  return Object.keys(_telemetry).map(name => getTelemetry(name));
}

export function getTrippedModules() {
  return getAllTelemetry().filter(t => t.circuitState === CIRCUIT_STATES.OPEN);
}

// ── Preemption: safety overrides all non-critical modules ──

export function preempt(reason = 'safety_override') {
  _preempted = true;
  _preemptionReason = reason;
  for (const name of Object.keys(_telemetry)) {
    if (!CRITICAL_MODULES.includes(name)) {
      _telemetry[name].circuitState = CIRCUIT_STATES.OPEN;
      _telemetry[name].trippedAt = Date.now();
      _telemetry[name].lastError = `Preempted: ${reason}`;
    }
  }
}

export function clearPreemption() {
  _preempted = false;
  _preemptionReason = null;
  for (const name of Object.keys(_telemetry)) {
    if (!CRITICAL_MODULES.includes(name) && _telemetry[name].lastError?.startsWith('Preempted:')) {
      _telemetry[name].circuitState = CIRCUIT_STATES.CLOSED;
      _telemetry[name].trippedAt = null;
      _telemetry[name].lastError = null;
    }
  }
}

export function isPreempted() {
  return _preempted;
}

export function getPreemptionReason() {
  return _preemptionReason;
}

// ── Deadlock detection: find circular dependencies ──

export function detectDeadlocks() {
  return detectCycles();
}

// ── Module permissions: check if a module's requirements are met ──

export function checkModulePermissions(name) {
  const mod = CONTEXT_MODULES[name];
  if (!mod) return { available: false, reason: 'Unknown module' };
  // All current modules only need DB access, which is always available
  return { available: true, permissions: [] };
}

// ── Self-diagnostics: formatted lifecycle report ──

export function formatLifecycleReport() {
  const telemetry = getAllTelemetry();
  const tripped = telemetry.filter(t => t.circuitState === CIRCUIT_STATES.OPEN && !t.lastError?.startsWith('Preempted'));
  const preempted = telemetry.filter(t => t.lastError?.startsWith('Preempted'));
  const halfOpen = telemetry.filter(t => t.circuitState === CIRCUIT_STATES.HALF_OPEN);
  const unhealthy = telemetry.filter(t => ['critical', 'warning'].includes(t.heartbeat));
  const deadlocks = detectDeadlocks();

  const L = [];
  L.push('═══ MODULE LIFECYCLE REPORT ═══');
  L.push(`Modules tracked: ${telemetry.length}`);
  L.push(`Circuit breakers OPEN (failed): ${tripped.length}`);
  L.push(`Circuit breakers HALF_OPEN (testing): ${halfOpen.length}`);
  L.push(`Preempted (safety override): ${preempted.length}`);
  L.push(`Unhealthy (warning/critical): ${unhealthy.length}`);
  L.push(`Deadlocks detected: ${deadlocks.length}`);
  L.push(`Preemption active: ${_preempted}${_preemptionReason ? ` (${_preemptionReason})` : ''}`);
  L.push('');

  if (deadlocks.length > 0) {
    L.push('── DEADLOCK DETECTED ──');
    for (const cycle of deadlocks) {
      L.push(`  ⟳ ${cycle.join(' → ')}`);
    }
    L.push('');
  }

  if (tripped.length > 0) {
    L.push('── DISABLED MODULES (circuit breaker open) ──');
    for (const t of tripped) {
      L.push(`  ⛔ ${t.name}: ${t.failureCount} failures — ${t.lastError || 'unknown error'}`);
    }
    L.push('');
  }

  if (unhealthy.length > 0) {
    L.push('── UNHEALTHY MODULES ──');
    for (const t of unhealthy) {
      L.push(`  ⚠ ${t.name}: heartbeat=${t.heartbeat}, errorRate=${t.errorRate}%, avgLatency=${t.avgLatencyMs}ms`);
    }
    L.push('');
  }

  L.push('── MODULE TELEMETRY ──');
  for (const t of telemetry.sort((a, b) => b.executionCount - a.executionCount)) {
    const icon = t.circuitState === CIRCUIT_STATES.OPEN ? '⛔'
      : t.heartbeat === 'critical' ? '🔴'
      : t.heartbeat === 'warning' ? '🟡'
      : t.heartbeat === 'healthy' ? '🟢'
      : '⚪';
    L.push(`  ${icon} ${t.name}: runs=${t.executionCount}, errors=${t.failureCount} (${t.errorRate}%), avg=${t.avgLatencyMs}ms, circuit=${t.circuitState}`);
  }
  L.push('');
  L.push('═══ END LIFECYCLE REPORT ═══');

  return L.join('\n');
}

// ── Detect self-diagnostics request from user input ──

export function detectLifecycleDiagnosticsRequest(input) {
  return /run.*(module|lifecycle|runtime).*diagnostics|module.*health|circuit.*breaker.*status|execution.*graph|lifecycle.*report/i.test(input);
}