// ═══════════════════════════════════════════════
// MODULE REGISTRY (Base 44.4)
// Every subsystem registers itself with version,
// dependencies, priority, health, execution time.
// ═══════════════════════════════════════════════

import { RUNTIME_PRIORITIES } from './priorities';

const modules = new Map();
const executionHistory = new Map();

export function registerModule(config) {
  if (modules.has(config.name)) return;
  modules.set(config.name, {
    name: config.name,
    version: config.version || '1.0.0',
    dependencies: config.dependencies || [],
    priority: config.priority ?? RUNTIME_PRIORITIES.NORMAL,
    frequency: config.frequency ?? 60000,
    execute: config.execute || (async () => {}),
    estimatedResources: config.estimatedResources || {},
    health: 'healthy',
    lastRun: null,
    lastDuration: 0,
    runCount: 0,
    failCount: 0,
  });
  executionHistory.set(config.name, []);
}

export function unregisterModule(name) {
  modules.delete(name);
  executionHistory.delete(name);
}

export function getModule(name) {
  return modules.get(name) || null;
}

export function getAllModules() {
  return Array.from(modules.values());
}

export function getModulesByFrequency(frequencyMs) {
  return getAllModules().filter((m) => m.frequency === frequencyMs);
}

export function getModulesDueForExecution() {
  const now = Date.now();
  return getAllModules()
    .filter((m) => {
      if (m.health === 'paused' || m.health === 'failed') return false;
      if (m.frequency === 0) return true;
      if (!m.lastRun) return true;
      return now - m.lastRun >= m.frequency;
    })
    .sort((a, b) => a.priority - b.priority);
}

export function recordExecution(name, durationMs, success) {
  const mod = modules.get(name);
  if (!mod) return;
  mod.lastRun = Date.now();
  mod.lastDuration = durationMs;
  mod.runCount++;
  if (!success) mod.failCount++;

  const history = executionHistory.get(name) || [];
  history.push({ time: Date.now(), duration: durationMs, success });
  if (history.length > 20) history.shift();
  executionHistory.set(name, history);

  const recentFailures = history.filter((h) => !h.success).length;
  if (recentFailures >= 3) {
    mod.health = 'failed';
  } else if (recentFailures >= 1) {
    mod.health = 'recovering';
  } else if (durationMs > 5000) {
    mod.health = 'delayed';
  } else {
    mod.health = 'healthy';
  }
}

export function setModuleHealth(name, health) {
  const mod = modules.get(name);
  if (mod) mod.health = health;
}

export function getModuleHealth(name) {
  const mod = modules.get(name);
  return mod ? mod.health : 'unknown';
}

export function getUnhealthyModules() {
  return getAllModules().filter((m) => m.health !== 'healthy');
}

export function getRegistrySnapshot() {
  return getAllModules().map((m) => ({
    name: m.name,
    version: m.version,
    priority: m.priority,
    frequency: m.frequency,
    health: m.health,
    lastRun: m.lastRun,
    runCount: m.runCount,
    failCount: m.failCount,
    lastDuration: m.lastDuration,
  }));
}