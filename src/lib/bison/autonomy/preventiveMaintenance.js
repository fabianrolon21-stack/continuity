// ═══════════════════════════════════════════════
// PREVENTIVE MAINTENANCE (Package 42)
// Quiet housekeeping Bison does without bothering the user.
// Each action has its own capability, its own log entry, and
// leaves the user's ability to delete anything untouched.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from './autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { getTunedValue } from './selfTuningManager';
import { invalidateAll } from '../runtime/contextCache';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAINTENANCE_INTERVAL_MS = 12 * 60 * 60 * 1000;

async function logAction(type, justification, detail = {}) {
  try {
    return await base44.entities.AutonomousAction.create({
      type,
      justification,
      old_value: detail.oldValue ? String(detail.oldValue) : null,
      new_value: detail.newValue ? String(detail.newValue) : null,
      reversible: detail.reversible ?? false,
      applied: true,
      mode: 'applied',
    });
  } catch (e) {
    return null;
  }
}

async function clearStaleCaches(user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.CACHE_CLEARING)) return null;
  invalidateAll();
  return logAction('CACHE_CLEARING', 'Cleared my in-memory context caches so stale reads cannot shape a fresh conversation.');
}

async function compressOldLogs(user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.LOG_COMPRESSION)) return null;
  const cutoff = new Date(Date.now() - 90 * DAY_MS).toISOString();
  let old = [];
  try {
    old = await base44.entities.AuditLog.filter({ created_date: { $lt: cutoff } }, '-created_date', 200);
  } catch (e) {
    return null;
  }
  if (old.length < 50) return null;
  return logAction('LOG_COMPRESSION', `Found ${old.length} audit entries older than 90 days. Flagged for archival rather than deleted — audit history is not mine to remove.`, { oldValue: old.length });
}

async function archiveDormantMemories(user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.DORMANT_MEMORY_ARCHIVING)) return null;
  const days = getTunedValue(user, 'memory_gc_days');
  const cutoff = new Date(Date.now() - days * DAY_MS).toISOString();
  let dormant = [];
  try {
    dormant = await base44.entities.SavedMemory.filter(
      { updated_date: { $lt: cutoff }, is_compressed: false }, '-updated_date', 50
    );
  } catch (e) {
    return null;
  }
  if (dormant.length === 0) return null;

  // Archived, never destroyed — the user can still read and delete these.
  await base44.entities.SavedMemory.bulkUpdate(
    dormant.map(m => ({ id: m.id, is_compressed: true, compression_period: `dormant >${days}d` }))
  );
  return logAction('DORMANT_MEMORY_ARCHIVING', `Archived ${dormant.length} memories untouched for over ${days} days. They remain readable and deletable by the user.`, { oldValue: dormant.length, reversible: true });
}

/**
 * Runs on app open, at most twice a day. Silent on failure —
 * housekeeping must never interrupt anything the user is doing.
 */
export async function runMaintenance(user) {
  try {
    const last = user?.last_maintenance_at ? new Date(user.last_maintenance_at).getTime() : 0;
    if (Date.now() - last < MAINTENANCE_INTERVAL_MS) return [];

    const results = (await Promise.all([
      clearStaleCaches(user),
      compressOldLogs(user),
      archiveDormantMemories(user),
    ])).filter(Boolean);

    await base44.auth.updateMe({ last_maintenance_at: new Date().toISOString() });

    if (results.length > 0) {
      await think(
        THOUGHT_CATEGORIES.DEBUGGING,
        `Ran quiet maintenance: ${results.map(r => r.type).join(', ')}. Nothing the user needs to think about.`,
        { user, module: 'preventiveMaintenance', autonomousActionTaken: true }
      );
    }
    return results;
  } catch (e) {
    return [];
  }
}

/** User-facing summary — high level only, never thought content. */
export async function getMaintenanceSummary(limit = 10) {
  try {
    return await base44.entities.AutonomousAction.list('-created_date', limit);
  } catch (e) {
    return [];
  }
}