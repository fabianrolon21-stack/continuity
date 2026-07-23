// ═══════════════════════════════════════════════
// TASK SCHEDULER (Base 44.4)
// Long operations never block conversation.
// Tasks become asynchronous runtime jobs.
// ═══════════════════════════════════════════════

import { RUNTIME_PRIORITIES } from './priorities';
import { audit } from './auditLog';
import { canExecute } from './resourceManager';

const pendingTasks = [];
const runningTasks = new Map();
const MAX_CONCURRENT = 3;
let taskCounter = 0;

export function scheduleTask(config) {
  const task = {
    id: `task_${Date.now()}_${++taskCounter}`,
    name: config.name || 'unnamed',
    priority: config.priority ?? RUNTIME_PRIORITIES.LOW,
    execute: config.execute || (async () => {}),
    estimatedResources: config.estimatedResources || {},
    dependencies: config.dependencies || [],
    status: 'pending',
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null,
  };
  pendingTasks.push(task);
  pendingTasks.sort((a, b) => a.priority - b.priority);
  return task.id;
}

export async function runPendingTasks() {
  while (runningTasks.size < MAX_CONCURRENT && pendingTasks.length > 0) {
    const task = pendingTasks.shift();
    if (!canExecute(task.estimatedResources)) {
      pendingTasks.unshift(task);
      break;
    }
    runTask(task);
  }
}

async function runTask(task) {
  task.status = 'running';
  task.startedAt = Date.now();
  runningTasks.set(task.id, task);
  const startTime = Date.now();
  try {
    task.result = await task.execute();
    task.status = 'completed';
    task.completedAt = Date.now();
    audit({
      module: 'task_scheduler',
      action: `task:${task.name}`,
      outcome: 'SUCCESS',
      executionTimeMs: Date.now() - startTime,
      priority: task.priority,
    });
  } catch (e) {
    task.error = e.message;
    task.status = 'failed';
    audit({
      module: 'task_scheduler',
      action: `task:${task.name}`,
      outcome: 'FAILED',
      reason: e.message,
      executionTimeMs: Date.now() - startTime,
      priority: task.priority,
    });
  } finally {
    runningTasks.delete(task.id);
  }
}

export function cancelTask(taskId) {
  const idx = pendingTasks.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    pendingTasks[idx].status = 'cancelled';
    pendingTasks.splice(idx, 1);
    return true;
  }
  return false;
}

export function getPendingTaskCount() {
  return pendingTasks.length;
}

export function getRunningTaskCount() {
  return runningTasks.size;
}

export function getTaskStatus(taskId) {
  const running = runningTasks.get(taskId);
  if (running) return { ...running };
  const pending = pendingTasks.find((t) => t.id === taskId);
  if (pending) return { ...pending };
  return null;
}