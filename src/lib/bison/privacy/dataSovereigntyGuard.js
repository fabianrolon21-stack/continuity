// ═══════════════════════════════════════════════
// DATA SOVEREIGNTY GUARD (Package 44)
// The single doorway to the outside world.
//
//   request → policy → consent → sanitize → log → service
//
// Nothing bypasses this module. If a caller cannot pass
// every gate, the request never happens — and the refusal
// itself is written down, so the record stays honest.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { loadPolicy } from './firewallPolicy';
import { sanitize, summarize } from './payloadSanitizer';

async function log(entry) {
  try {
    await base44.entities.ExternalRequestLog.create(entry);
  } catch (e) {}
}

// Consent is four-dimensional: purpose × category × target × duration.
// Expired consent is as good as no consent, and "once" consents are
// consumed by the request that uses them.
function consentValid(record) {
  if (!record.granted || record.revoked || record.consumed) return false;
  if (record.expires_at && new Date(record.expires_at) <= new Date()) return false;
  return true;
}

async function consentGranted(categories = [], channel) {
  if (!categories.length) return { ok: true, ids: [], onceIds: [] };
  try {
    const records = await base44.entities.DataSharingConsent.filter({ granted: true, revoked: false });
    const ids = [];
    const onceIds = [];
    for (const cat of categories) {
      const match = records.find(r => r.category === cat && (!r.channel || r.channel === channel) && consentValid(r));
      if (!match) return { ok: false, missing: cat };
      ids.push(match.id);
      if (match.duration === 'once') onceIds.push(match.id);
    }
    return { ok: true, ids, onceIds };
  } catch (e) {
    return { ok: false, missing: categories[0] };
  }
}

async function consumeOnceConsents(onceIds = []) {
  for (const id of onceIds) {
    try { await base44.entities.DataSharingConsent.update(id, { consumed: true }); } catch (e) {}
  }
}

function expiryFor(duration) {
  const now = Date.now();
  if (duration === 'one_hour') return new Date(now + 3600000).toISOString();
  if (duration === 'today') {
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  return null; // once, until_revoked, permanent — no timed expiry
}

/**
 * The only sanctioned path outward.
 *
 * @param {object} req
 * @param {string} req.channel      one of the firewall channels
 * @param {string} req.destination  human-readable service name
 * @param {string} req.purpose      why this request exists
 * @param {string} req.payload      the text being sent
 * @param {string[]} req.consentCategories
 * @param {string[]} req.allowedCategories  sanitizer exemptions the user authorized
 * @param {(cleanPayload: string) => Promise<any>} req.execute
 */
export async function requestExternal(req) {
  const {
    channel,
    destination,
    purpose = '',
    payload = '',
    consentCategories = [],
    allowedCategories = [],
    execute,
  } = req;

  const policy = await loadPolicy({ force: true });

  const deny = async (status, reason) => {
    await log({
      channel, destination, purpose,
      consent_categories: consentCategories,
      payload_summary: summarize(payload),
      status, block_reason: reason,
    });
    return { status, blocked: true, reason, data: null };
  };

  if (policy.lockdown) return deny('BLOCKED_LOCKDOWN', 'Emergency lockdown is engaged.');
  if (policy.master_firewall) return deny('BLOCKED_FIREWALL', 'The external communication firewall is on.');
  if (!policy.channels?.[channel]) return deny('BLOCKED_CHANNEL', `The ${channel} channel is closed.`);

  const consent = await consentGranted(consentCategories, channel);
  if (!consent.ok) return deny('BLOCKED_CONSENT', `Consent missing for: ${consent.missing}`);

  const { clean, applied } = sanitize(payload, { allowedCategories });

  const base = {
    channel, destination, purpose,
    consent_used: consent.ids.join(', '),
    consent_categories: consentCategories,
    payload_summary: summarize(clean),
    payload_bytes: new Blob([clean]).size,
    sanitization_applied: applied,
  };

  try {
    const data = await execute(clean);
    await consumeOnceConsents(consent.onceIds);
    await log({ ...base, status: 'COMPLETED', response_summary: summarize(typeof data === 'string' ? data : JSON.stringify(data ?? '')) });
    return { status: 'COMPLETED', blocked: false, data, sanitizationApplied: applied };
  } catch (e) {
    await log({ ...base, status: 'FAILED', response_summary: e?.message || 'request failed' });
    return { status: 'FAILED', blocked: false, reason: e?.message, data: null };
  }
}

export async function grantConsent(category, channel, explanation, { purpose = '', duration = 'until_revoked' } = {}) {
  return base44.entities.DataSharingConsent.create({
    category, channel, explanation, purpose, duration,
    expires_at: expiryFor(duration) || undefined,
    granted: true,
  });
}

export async function revokeConsent(id) {
  return base44.entities.DataSharingConsent.update(id, { revoked: true, revoked_at: new Date().toISOString() });
}