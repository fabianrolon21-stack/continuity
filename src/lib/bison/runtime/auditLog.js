// ═══════════════════════════════════════════════
// RUNTIME AUDIT LOG (Base 44.4)
// Every runtime decision is logged.
// Logs remain local unless explicitly exported.
// ═══════════════════════════════════════════════

const MAX_LOGS = 5000;
const logs = [];

export function audit(config) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    module: config.module || 'unknown',
    action: config.action || 'unknown',
    reason: config.reason || null,
    confidence: config.confidence ?? null,
    outcome: config.outcome || 'unknown',
    executionTimeMs: config.executionTimeMs ?? null,
    priority: config.priority ?? null,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  return entry;
}

export function getLogs(filter = {}) {
  let filtered = [...logs];
  if (filter.module)
    filtered = filtered.filter((l) => l.module === filter.module);
  if (filter.outcome)
    filtered = filtered.filter((l) => l.outcome === filter.outcome);
  if (filter.since)
    filtered = filtered.filter(
      (l) => new Date(l.timestamp) >= new Date(filter.since)
    );
  if (filter.limit) filtered = filtered.slice(-filter.limit);
  return filtered;
}

export function getLogCount() {
  return logs.length;
}

export function clearLogs() {
  logs.length = 0;
}

export function exportLogs() {
  return JSON.stringify(logs, null, 2);
}

export function getRuntimeStatistics() {
  if (logs.length === 0) return { total: 0 };
  const byModule = {};
  const byOutcome = {};
  let totalExecutionTime = 0;
  let executionCount = 0;
  for (const log of logs) {
    byModule[log.module] = (byModule[log.module] || 0) + 1;
    byOutcome[log.outcome] = (byOutcome[log.outcome] || 0) + 1;
    if (log.executionTimeMs != null) {
      totalExecutionTime += log.executionTimeMs;
      executionCount++;
    }
  }
  return {
    total: logs.length,
    byModule,
    byOutcome,
    avgExecutionTimeMs:
      executionCount > 0 ? totalExecutionTime / executionCount : 0,
  };
}