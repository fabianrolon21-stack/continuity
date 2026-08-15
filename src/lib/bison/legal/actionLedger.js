// ═══════════════════════════════════════════════
// ALSRE §2.3 — AUTONOMOUS ACTION LEDGER
// Append-only, hash-chained. Blocked attempts are recorded exactly like
// executed actions — a record that only kept successes would be useless
// as evidence.
// ═══════════════════════════════════════════════

import { appendTo, verifyChain, readStore, writeStore, randomId } from './hashChain';

const KEY = 'alsre_action_ledger_v1';

let logs = readStore(KEY);

export async function record(entry) {
  const linked = await appendTo(logs, {
    actionId: `act_${Date.now()}_${randomId()}`,
    timestamp: Date.now(),
    ...entry,
  });
  logs = [...logs, linked];
  if (logs.length > 500) logs = logs.slice(-500); // rotation truncates the chain head; verification reports from the retained head
  writeStore(KEY, logs);
  return linked;
}

export const allLogs = () => [...logs];
export const getLog = (actionId) => logs.find(l => l.actionId === actionId) || null;
export const verify = () => verifyChain(logs);

export async function exportForLegal() {
  const integrity = await verify();
  return JSON.stringify({
    ledger: 'ALSRE autonomous action ledger v1',
    exportedAt: new Date().toISOString(),
    integrity,
    caveat: 'Tamper-evident local record of this app\'s own decisions. Not a notarized document, not a legal opinion, and not proof of anything occurring outside this app.',
    logs,
  }, null, 2);
}