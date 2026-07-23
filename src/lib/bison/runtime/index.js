// ═══════════════════════════════════════════════
// RUNTIME ORCHESTRATOR — PUBLIC API (Base 44.4)
// Re-exports for clean imports across the app.
// ═══════════════════════════════════════════════

export { orchestrator } from './orchestrator';
export {
  RUNTIME_PRIORITIES,
  FREQUENCY_MS,
  PRIORITY_LABELS,
  FREQUENCY_LABELS,
} from './priorities';
export {
  getTemporalState,
  recordUserInteraction,
  buildTemporalContextString,
  isUserIdle,
} from './timeClock';
export {
  getResources,
  isBatteryCritical,
  isBatteryLow,
  isNetworkAvailable,
  canExecute,
} from './resourceManager';
export { emitEvent, subscribe, EVENT_TYPES } from './eventEngine';
export { scheduleTask, cancelTask, getTaskStatus } from './taskScheduler';
export { evaluateRisk } from './riskGate';
export {
  audit,
  getLogs,
  getRuntimeStatistics,
  exportLogs,
} from './auditLog';
export {
  isFailsafeActive,
  getFailsafeReason,
  buildFailsafeContextString,
} from './failsafe';
export {
  registerModule,
  getRegistrySnapshot,
  getModuleHealth,
} from './moduleRegistry';
export { getHealthSummary } from './healthMonitor';