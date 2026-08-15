// ═══════════════════════════════════════════════
// ALSRE §2.2 — CONSENT LEDGER
// Hash-chained record of what the user actually authorized, for which
// action type, with which scope, and until when. Revocation is recorded
// as a new chain entry rather than an edit, so history stays intact.
// ═══════════════════════════════════════════════

import { appendTo, verifyChain, readStore, writeStore, randomId } from './hashChain';

const KEY = 'alsre_consent_ledger_v1';

let entries = readStore(KEY);

/** Every entry is GRANT or REVOKE; state is derived, never overwritten. */
async function append(entry) {
  const linked = await appendTo(entries, { ...entry, timestamp: Date.now() });
  entries = [...entries, linked];
  writeStore(KEY, entries);
  return linked;
}

export async function grantConsent({ actionType, scope = [], purpose = '', expiresAt = null, userId = 'local_user' }) {
  return append({
    kind: 'GRANT',
    consentId: `consent_${Date.now()}_${randomId()}`,
    userId, actionType, scope, purpose,
    givenAt: Date.now(),
    expiresAt,
  });
}

export async function revokeConsent(consentId) {
  return append({ kind: 'REVOKE', consentId, revokedAt: Date.now() });
}

function isExpired(g) {
  return !!g.expiresAt && g.expiresAt <= Date.now();
}

/** Current state of each consent, derived by replaying the chain. */
export function currentConsents() {
  const grants = entries.filter(e => e.kind === 'GRANT');
  const revoked = new Set(entries.filter(e => e.kind === 'REVOKE').map(e => e.consentId));
  return grants.map(g => ({
    ...g,
    revoked: revoked.has(g.consentId),
    expired: isExpired(g),
    active: !revoked.has(g.consentId) && !isExpired(g),
  }));
}

/**
 * The gate. Scope must be covered exactly — a consent for one scope never
 * silently widens to cover another.
 */
export function hasValidConsent(actionType, scope = []) {
  const match = currentConsents().find(c =>
    c.active && c.actionType === actionType && scope.every(s => c.scope.includes(s))
  );
  return match ? { valid: true, consentId: match.consentId, expiresAt: match.expiresAt } : { valid: false };
}

export const verify = () => verifyChain(entries);
export const allEntries = () => [...entries];

export async function exportBundle() {
  const integrity = await verify();
  return JSON.stringify({
    ledger: 'ALSRE consent ledger v1',
    exportedAt: new Date().toISOString(),
    integrity,
    caveat: 'Tamper-evident local record. Not a notarized document and not legal advice.',
    entries,
  }, null, 2);
}