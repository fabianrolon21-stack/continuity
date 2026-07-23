// ═══════════════════════════════════════════════
// FAILSAFE MODE (Base 44.4)
// If runtime integrity drops, suspend non-essential
// modules. Preserve memory, conversation, safety,
// identity. Recovery prioritizes user interaction.
// ═══════════════════════════════════════════════

import { isBatteryCritical, getResources } from './resourceManager';
import { setModuleHealth, getModule } from './moduleRegistry';
import { audit } from './auditLog';

const PRESERVED_MODULES = [
  'conversation',
  'safety',
  'identity_runtime',
  'memory',
];

const SUSPENDED_IN_FAILSAFE = [
  'meta_intelligence',
  'simulation',
  'background_analysis',
  'learning',
  'garden',
  'knowledge',
  'ambient_runtime',
  'forecast_engine',
  'memory_maintenance',
  'continuity_audit',
];

let failsafeActive = false;
let failsafeReason = null;

export function evaluateFailsafe(resources) {
  const res = resources || getResources();
  let shouldActivate = false;
  let reason = null;

  if (isBatteryCritical()) {
    shouldActivate = true;
    reason = 'battery_critical';
  }
  if (res.memoryUsage > 0.92) {
    shouldActivate = true;
    reason = 'memory_pressure';
  }

  if (shouldActivate && !failsafeActive) {
    activateFailsafe(reason);
  } else if (!shouldActivate && failsafeActive) {
    deactivateFailsafe();
  }
  return failsafeActive;
}

export function activateFailsafe(reason) {
  failsafeActive = true;
  failsafeReason = reason;
  for (const name of SUSPENDED_IN_FAILSAFE) {
    setModuleHealth(name, 'paused');
  }
  audit({
    module: 'failsafe',
    action: 'activate',
    reason,
    outcome: 'SUCCESS',
    priority: 0,
  });
}

export function deactivateFailsafe() {
  failsafeActive = false;
  failsafeReason = null;
  for (const name of SUSPENDED_IN_FAILSAFE) {
    const mod = getModule(name);
    if (mod && mod.health === 'paused') {
      setModuleHealth(name, 'healthy');
    }
  }
  audit({
    module: 'failsafe',
    action: 'deactivate',
    reason: 'recovery',
    outcome: 'SUCCESS',
    priority: 1,
  });
}

export function isFailsafeActive() {
  return failsafeActive;
}

export function getFailsafeReason() {
  return failsafeReason;
}

export function isModuleSuspended(moduleName) {
  return failsafeActive && SUSPENDED_IN_FAILSAFE.includes(moduleName);
}

export function isModulePreserved(moduleName) {
  return PRESERVED_MODULES.includes(moduleName);
}

export function buildFailsafeContextString() {
  if (!failsafeActive) return '';
  return `\nFAILSAFE MODE ACTIVE (reason: ${failsafeReason}).\nSuspended: ${SUSPENDED_IN_FAILSAFE.join(', ')}.\nPreserved: ${PRESERVED_MODULES.join(', ')}.\nOnly critical operations and conversation are active.\n`;
}