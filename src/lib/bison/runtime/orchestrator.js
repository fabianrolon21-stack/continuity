// ═══════════════════════════════════════════════
// UNIFIED RUNTIME ORCHESTRATOR (Base 44.4)
// Central execution coordinator for every Bison
// subsystem. Manages scheduling, synchronization,
// priorities, resource allocation, runtime state,
// and lifecycle control.
//
// EXECUTION ORDER (per cycle):
// Time Update → System Events → Permission Validation →
// Sensor Updates → Human State → Identity → Pattern
// Detection → Forecasting → Meta Intelligence →
// Risk Evaluation → Decision Queue → Response
// Generation → UI Update → Reflection → Sleep
// ═══════════════════════════════════════════════

import {
  initClock,
  tick,
  getTemporalState,
  recordUserInteraction,
  buildTemporalContextString,
} from './timeClock';
import {
  initResources,
  getResources,
  canExecute,
  buildResourceContextString,
  isBatteryCritical,
} from './resourceManager';
import {
  getModulesDueForExecution,
  recordExecution,
  getRegistrySnapshot,
} from './moduleRegistry';
import { startHealthMonitor, stopHealthMonitor } from './healthMonitor';
import {
  evaluateFailsafe,
  isFailsafeActive,
  getFailsafeReason,
  isModuleSuspended,
  buildFailsafeContextString,
} from './failsafe';
import {
  emitEvent,
  processExpiredEvents,
  EVENT_TYPES,
} from './eventEngine';
import {
  scheduleTask,
  runPendingTasks,
  getPendingTaskCount,
  getRunningTaskCount,
} from './taskScheduler';
import { evaluateRisk } from './riskGate';
import {
  audit,
  getRuntimeStatistics,
  getLogs,
  exportLogs,
} from './auditLog';
import { registerBuiltinModules } from './builtinModules';
import { RUNTIME_PRIORITIES } from './priorities';
import { base44 } from '@/api/base44Client';
import { resumeSession, startCheckpointing, stopCheckpointing, finalizeSession, buildContinuityContextString } from './sessionResumeService';

const CYCLE_INTERVAL_MS = 3000;

class Orchestrator {
  constructor() {
    this.state = 'uninitialized';
    this.cycleCount = 0;
    this.runtimeInterval = null;
    this.lastCycleDuration = 0;
    this.startedAt = null;
    this.user = null;
  }

  // ─── LIFECYCLE ───

  async startup(user) {
    if (this.state !== 'uninitialized' && this.state !== 'stopped') return;
    this.state = 'starting';
    this.startedAt = Date.now();
    this.user = user;

    audit({
      module: 'orchestrator',
      action: 'startup_begin',
      outcome: 'SUCCESS',
      priority: RUNTIME_PRIORITIES.CRITICAL,
    });

    // 0. Resume previous session state (Package 47.2)
    try {
      await resumeSession();
    } catch (e) {}

    // 1. Initialize unified clock
    initClock(user);

    // 2. Initialize resource monitoring
    await initResources();

    // 3. Load constitution (via constitutionalKernel — already loaded)
    emitEvent({
      type: EVENT_TYPES.RUNTIME_UPDATE,
      source: 'orchestrator',
      data: { phase: 'constitution_loaded' },
      priority: RUNTIME_PRIORITIES.HIGH,
    });

    // 4. Load runtime identity
    emitEvent({
      type: EVENT_TYPES.RUNTIME_UPDATE,
      source: 'orchestrator',
      data: { phase: 'identity_loaded' },
      priority: RUNTIME_PRIORITIES.HIGH,
    });

    // 5. Load permissions
    emitEvent({
      type: EVENT_TYPES.RUNTIME_UPDATE,
      source: 'orchestrator',
      data: { phase: 'permissions_loaded' },
      priority: RUNTIME_PRIORITIES.HIGH,
    });

    // 6. Load memory (deferred to consciousnessEngine)
    emitEvent({
      type: EVENT_TYPES.RUNTIME_UPDATE,
      source: 'orchestrator',
      data: { phase: 'memory_loaded' },
      priority: RUNTIME_PRIORITIES.HIGH,
    });

    // 7. Register built-in modules
    registerBuiltinModules();

    // 8. Start health monitor
    startHealthMonitor();

    // 9. Evaluate failsafe
    const resources = getResources();
    evaluateFailsafe(resources);

    // 10. Start unified runtime loop
    this.state = isFailsafeActive() ? 'failsafe' : 'running';
    this.runtimeInterval = setInterval(
      () => this.runCycle(),
      CYCLE_INTERVAL_MS
    );

    // 11. Start periodic session checkpointing (Package 47.2)
    startCheckpointing(() => this.getState());

    audit({
      module: 'orchestrator',
      action: 'startup_complete',
      outcome: 'SUCCESS',
      priority: RUNTIME_PRIORITIES.CRITICAL,
    });
    emitEvent({
      type: EVENT_TYPES.RUNTIME_UPDATE,
      source: 'orchestrator',
      data: { phase: 'running' },
      priority: RUNTIME_PRIORITIES.HIGH,
    });
  }

  async shutdown() {
    if (this.state === 'stopped' || this.state === 'shutting_down') return;
    this.state = 'shutting_down';

    audit({
      module: 'orchestrator',
      action: 'shutdown_begin',
      outcome: 'SUCCESS',
      priority: RUNTIME_PRIORITIES.CRITICAL,
    });

    // 1. Stop runtime loop
    if (this.runtimeInterval) {
      clearInterval(this.runtimeInterval);
      this.runtimeInterval = null;
    }

    // 2. Stop health monitor
    stopHealthMonitor();

    // 3. Flush pending events
    processExpiredEvents();

    // 4. Finalize session — generate summary and checkpoint (Package 47.2)
    try {
      await finalizeSession(this.getState());
    } catch (e) {}

    audit({
      module: 'orchestrator',
      action: 'shutdown_complete',
      outcome: 'SUCCESS',
      priority: RUNTIME_PRIORITIES.CRITICAL,
    });
    this.state = 'stopped';
  }

  // ─── SESSION CONTINUITY ───

  getContinuityContext() {
    return buildContinuityContextString();
  }

  // ─── MASTER RUNTIME LOOP ───

  async runCycle() {
    if (this.state !== 'running' && this.state !== 'failsafe') return;
    const cycleStart = Date.now();
    this.cycleCount++;

    try {
      // 1. Time Update
      tick();

      // 2. System Events
      processExpiredEvents();

      // 3. Permission Validation (handled per-module)

      // 4-14. Dispatch modules by frequency and priority
      await this.dispatchModules();

      // 15. Run pending background tasks
      await runPendingTasks();

      // 16. Evaluate failsafe
      const resources = getResources();
      const wasFailsafe = isFailsafeActive();
      evaluateFailsafe(resources);
      if (isFailsafeActive() && !wasFailsafe) {
        this.state = 'failsafe';
        emitEvent({
          type: EVENT_TYPES.BATTERY_LOW,
          source: 'orchestrator',
          data: { reason: getFailsafeReason() },
          priority: RUNTIME_PRIORITIES.CRITICAL,
        });
      } else if (!isFailsafeActive() && wasFailsafe) {
        this.state = 'running';
      }
    } catch (e) {
      audit({
        module: 'orchestrator',
        action: 'cycle_error',
        outcome: 'FAILED',
        reason: e.message,
        priority: RUNTIME_PRIORITIES.HIGH,
      });
    }

    this.lastCycleDuration = Date.now() - cycleStart;
  }

  async dispatchModules() {
    const dueModules = getModulesDueForExecution();
    for (const mod of dueModules) {
      // Failsafe: skip suspended modules
      if (isModuleSuspended(mod.name)) continue;

      // Resource check
      if (!canExecute(mod.estimatedResources)) continue;

      const execStart = Date.now();
      let success = true;
      try {
        await mod.execute({
          temporalState: getTemporalState(),
          user: this.user,
        });
      } catch (e) {
        success = false;
        audit({
          module: mod.name,
          action: 'execute',
          outcome: 'FAILED',
          reason: e.message,
          priority: mod.priority,
        });
      }
      const duration = Date.now() - execStart;
      recordExecution(mod.name, duration, success);
    }
  }

  // ─── PUBLIC API ───

  requestAction(action) {
    return evaluateRisk(action);
  }

  submitEvent(config) {
    return emitEvent(config);
  }

  submitTask(config) {
    return scheduleTask(config);
  }

  recordInteraction() {
    recordUserInteraction();
    emitEvent({
      type: EVENT_TYPES.USER_INTERACTION,
      source: 'orchestrator',
      priority: RUNTIME_PRIORITIES.HIGH,
    });
  }

  getState() {
    return {
      state: this.state,
      cycleCount: this.cycleCount,
      uptime: this.startedAt ? Date.now() - this.startedAt : 0,
      lastCycleDuration: this.lastCycleDuration,
      failsafe: isFailsafeActive(),
      failsafeReason: getFailsafeReason(),
      modules: getRegistrySnapshot(),
      tasks: {
        pending: getPendingTaskCount(),
        running: getRunningTaskCount(),
      },
      statistics: getRuntimeStatistics(),
    };
  }

  getTemporalContext() {
    return buildTemporalContextString();
  }

  getResourceContext() {
    return buildResourceContextString();
  }

  getFailsafeContext() {
    return buildFailsafeContextString();
  }

  getLogs(filter) {
    return getLogs(filter);
  }

  exportLogs() {
    return exportLogs();
  }
}

export const orchestrator = new Orchestrator();