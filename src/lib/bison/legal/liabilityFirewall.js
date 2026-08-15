// ═══════════════════════════════════════════════
// ALSRE §2.7 — DEVELOPER LIABILITY FIREWALL
// Records the distinction between an authenticated developer command and
// an action the app took on its own, so the two can be told apart later.
//
// HONEST SCOPE: this produces evidence, not immunity. Software cannot
// assign or remove legal responsibility for anyone — including frrolon.
// Distributing an app that acts autonomously carries developer
// responsibility in most jurisdictions no matter how the log reads. What
// this genuinely provides: a tamper-evident record of which actions were
// directly ordered and which were not.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { record, getLog, allLogs } from './actionLedger';

/** Only an authenticated admin can attribute an action to a developer command. */
export async function recordDeveloperCommand(command) {
  const user = await base44.auth.me().catch(() => null);
  if (!user || user.role !== 'admin') {
    return { recorded: false, reason: 'Only an authenticated admin can record a developer command.' };
  }
  const log = await record({
    actionType: 'developer_command',
    initiator: 'developer',
    developerId: user.id,
    developerEmail: user.email,
    rationale: command,
    outcome: 'EXECUTED',
    jurisdictionCheck: { allowed: true, jurisdiction: 'n/a', rulesChecked: ['authenticated_developer_command'] },
  });
  return { recorded: true, actionId: log.actionId, log };
}

export function attribution(actionId) {
  const log = getLog(actionId);
  if (!log) return { found: false };
  const isDeveloper = log.initiator === 'developer';
  return {
    found: true,
    initiator: log.initiator,
    autonomous: !isDeveloper,
    developerId: isDeveloper ? log.developerId : null,
    evidenceHash: log.evidenceHash,
    statement: isDeveloper
      ? 'Directly ordered by an authenticated developer, recorded at the time of the command.'
      : 'Taken by the app without a developer command. No developer identity is attached to this entry.',
  };
}

export function summary() {
  const logs = allLogs();
  const developer = logs.filter(l => l.initiator === 'developer').length;
  return { total: logs.length, developer, autonomous: logs.length - developer };
}