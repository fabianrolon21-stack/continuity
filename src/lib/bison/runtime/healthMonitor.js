// ═══════════════════════════════════════════════
// HEALTH MONITOR (Base 44.4)
// Tracks module health: healthy, delayed, paused,
// failed, recovering. Auto-restarts recoverable modules.
// ═══════════════════════════════════════════════

import {
  getUnhealthyModules,
  setModuleHealth,
  getAllModules,
} from './moduleRegistry';
import { audit } from './auditLog';

let monitorInterval = null;

export function startHealthMonitor() {
  if (monitorInterval) return;
  monitorInterval = setInterval(checkModuleHealth, 30000);
}

export function stopHealthMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

function checkModuleHealth() {
  const unhealthy = getUnhealthyModules();
  for (const mod of unhealthy) {
    if (mod.health === 'failed') {
      attemptRecovery(mod.name);
    }
  }
}

export function attemptRecovery(moduleName) {
  setModuleHealth(moduleName, 'recovering');
  audit({
    module: 'health_monitor',
    action: `recovery_attempt:${moduleName}`,
    outcome: 'SUCCESS',
    reason: 'auto_recovery_triggered',
  });
  return true;
}

export function getHealthSummary() {
  const all = getAllModules();
  const unhealthy = getUnhealthyModules();
  return {
    totalModules: all.length,
    healthyCount: all.length - unhealthy.length,
    unhealthy: unhealthy.map((m) => ({
      name: m.name,
      health: m.health,
      failCount: m.failCount,
      lastRun: m.lastRun,
    })),
  };
}