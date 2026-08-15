import { base44 } from '@/api/base44Client';
import { permissionFor } from '../capabilities/capabilityPermissionManager';
import { validateCapabilityRequest, validateResult } from '../capabilities/capabilityValidator';
import { auditCapability } from '../capabilities/capabilityAuditLog';
import { recordActivity } from '../activity/activityManager';
import { nextReadyTask } from './taskQueue';
import { completedResult, failedResult } from './taskResult';
import { executeTask } from './taskExecutor';
import { bisonSimulation } from '../life/bisonSimulation';

export function createTask(data) { return base44.entities.BisonTask.create({ ...data, status: 'QUEUED', attempts: 0, max_attempts: data.max_attempts || 2, max_runtime_ms: data.max_runtime_ms || 30000 }); }
export function cancelTask(taskId) { return base44.entities.BisonTask.update(taskId, { status: 'CANCELLED' }); }
export async function runNextTask() {
  const [tasks, goals] = await Promise.all([base44.entities.BisonTask.list('-created_date', 100), base44.entities.BisonGoal.list('-priority', 100)]);
  const task = nextReadyTask(tasks, goals);
  if (!task) return null;
  const validation = validateCapabilityRequest(task.capability_id, task.input || '');
  if (!validation.valid) return fail(task, validation.reason);
  await auditCapability(task.capability_id, 'VALIDATED', 'Input and policy checks passed.', task.id);
  const permission = await permissionFor(validation.capability);
  if (!permission.allowed) {
    await base44.entities.BisonTask.update(task.id, { status: 'WAITING_FOR_PERMISSION' });
    await auditCapability(task.capability_id, 'PERMISSION_DENIED', permission.reason, task.id);
    return recordActivity('PERMISSION_REQUIRED', `Bison is waiting to run “${task.title}”`, permission.reason, { task_id: task.id });
  }
  await base44.entities.BisonTask.update(task.id, { status: 'RUNNING', started_at: new Date().toISOString(), attempts: (task.attempts || 0) + 1 });
  await auditCapability(task.capability_id, 'PERMISSION_GRANTED', 'Permission profile allows execution.', task.id);
  try {
    const result = await executeTask(validation.capability, task.input || '');
    if (!validateResult(result)) throw new Error('Result validation failed.');
    await base44.entities.BisonTask.update(task.id, completedResult(result));
    await auditCapability(task.capability_id, 'EXECUTED', 'Completed and result validated.', task.id);
    await recordActivity('TASK_COMPLETED', `Bison completed “${task.title}”`, result.slice(0, 240), { task_id: task.id, goal_id: task.goal_id });
    bisonSimulation.celebrate();
    return { task, result };
  } catch (error) { return fail(task, error.message); }
}
async function fail(task, reason) {
  await base44.entities.BisonTask.update(task.id, failedResult(reason));
  await auditCapability(task.capability_id, 'BLOCKED', reason, task.id);
  return recordActivity('TASK_FAILED', `Bison couldn't complete “${task.title}”`, reason, { task_id: task.id, goal_id: task.goal_id });
}