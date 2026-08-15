import { base44 } from '@/api/base44Client';

export function auditCapability(capabilityId, stage, detail = '', taskId) {
  return base44.entities.BisonCapabilityAudit.create({ capability_id: capabilityId, task_id: taskId, stage, detail });
}