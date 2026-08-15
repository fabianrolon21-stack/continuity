import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { TASK_TYPES, generateTask } from '../../shared/computeTasks.ts';

// Issues one unit of verifiable work. The answer is not computed here and
// not stored — verification recomputes it later, so the record a client can
// read contains nothing that would let it skip the work.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const consentId = body.consentId;
    // The server refuses to hand out work without the client presenting a
    // consent reference, so consent is not merely a client-side gate.
    if (!consentId) {
      return Response.json({ error: 'A consent reference is required before compute tasks are issued.' }, { status: 403 });
    }

    const taskType = TASK_TYPES.includes(body.taskType)
      ? body.taskType
      : TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];

    const spec = generateTask(taskType);
    const task = await base44.entities.ComputeTask.create({
      task_id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...spec,
      status: 'ISSUED',
      consent_id: consentId,
    });

    return Response.json({
      task: {
        id: task.id,
        task_id: task.task_id,
        task_type: task.task_type,
        params: task.params,
        difficulty: task.difficulty,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}