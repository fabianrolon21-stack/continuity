import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { solve } from '../../shared/computeTasks.ts';

// Verifies a submitted receipt by recomputing the answer server-side.
// Credits are awarded ONLY on an exact match. A wrong or replayed receipt
// earns zero and is recorded as REJECTED.
//
// HONEST NOTE: recomputation costs the server the same work the client did,
// so this proves the work happened — it does not create an economic surplus.
// Credits are internal compute units, never money.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { taskId, result, workerMs } = body;
    if (!taskId || typeof result !== 'number') {
      return Response.json({ error: 'taskId and a numeric result are required.' }, { status: 400 });
    }

    const matches = await base44.entities.ComputeTask.filter({ task_id: taskId });
    const task = matches[0];
    if (!task) return Response.json({ error: 'Unknown task.' }, { status: 404 });

    // Replay protection: a task pays out at most once.
    if (task.status !== 'ISSUED') {
      return Response.json({ verified: false, reason: `Task already ${task.status}. No credit awarded.` });
    }

    const expected = solve(task.task_type, task.params);
    const correct = expected === result;

    const updated = await base44.entities.ComputeTask.update(task.id, {
      status: correct ? 'VERIFIED' : 'REJECTED',
      submitted_result: result,
      worker_ms: typeof workerMs === 'number' ? workerMs : 0,
      credits_awarded: correct ? task.difficulty : 0,
      reject_reason: correct ? undefined : 'Submitted result did not match server recomputation.',
      verified_at: new Date().toISOString(),
    });

    return Response.json({
      verified: correct,
      creditsAwarded: updated.credits_awarded,
      reason: correct ? 'Result matched server recomputation.' : 'Result did not match. Zero credited.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}