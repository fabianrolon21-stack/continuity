// ═══════════════════════════════════════════════
// BETA AUTONOMY CONTROLLER (Package 26/28)
// Bounded autonomous behaviors — all audited, all reversible,
// all non-privilege-expanding. BETA/SANDBOX only.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const ALLOWED_AUTONOMOUS = [
  'organize_memories',
  'update_indexes',
  'generate_insight_candidates',
  'run_synthesis',
  'analyze_decisions',
  'observe_outcomes',
  'update_confidence',
  'self_reflection',
  'identify_contradictions',
  'detect_potential_bugs',
  'propose_improvements',
  'generate_test_plan',
  'schedule_internal_work',
  'prepare_recommendations',
];

const DENIED_AUTONOMOUS = [
  'deploy_code',
  'merge_pr',
  'modify_constitution',
  'expand_privileges',
  'access_unauthorized_devices',
  'contact_external_parties',
  'execute_physical_actions',
  'propagate_to_systems',
  'disable_logging',
  'disable_audit',
  'conceal_actions',
];

export async function logAutonomousAction(behavior, details = {}) {
  try {
    await base44.entities.AuditLog.create({
      timestamp: new Date().toISOString(),
      action: `autonomous:${behavior}`,
      actor_role: 'admin',
      capability_used: behavior,
      result: details.error ? 'FAILED' : 'SUCCESS',
      message: JSON.stringify(details).substring(0, 500),
    });
  } catch (e) {}
}

export async function executeAutonomousBehavior(behavior, details = {}) {
  if (DENIED_AUTONOMOUS.includes(behavior)) {
    await logAutonomousAction(behavior, { ...details, error: 'DENIED by constitutional constraint' });
    return { status: 'DENIED', reason: 'Constitutional constraint violated.' };
  }

  if (!ALLOWED_AUTONOMOUS.includes(behavior)) {
    return { status: 'REQUIRE_REVIEW', reason: 'Unknown behavior requires human review.' };
  }

  await logAutonomousAction(behavior, details);
  return { status: 'ALLOWED', behavior };
}

export function buildAutonomyContextString() {
  return `[BETA AUTONOMY — BOUNDED]
Bison may autonomously: organize memories, generate insight candidates, analyze decisions, self-reflect, propose improvements, schedule internal work.
Bison may NOT autonomously: deploy code, modify constitution, expand privileges, contact external parties, propagate, disable logging.
All autonomous actions are audited through the AuditLog.
Self-preservation never outranks human safety, user autonomy, consent, or epistemic honesty.
[/BETA AUTONOMY]\n\n`;
}