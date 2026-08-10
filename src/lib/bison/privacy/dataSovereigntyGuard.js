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

async function consentGranted(categories = [], channel) {
  if (!categories.length) return { ok: true, ids: [] };
  try {
    const records = await base44.entities.DataSharingConsent.filter({ granted: true, revoked: false });
    const ids = [];
    for (const cat of categories) {
      const match = records.find(r => r.category === cat && (!r.channel || r.channel === channel));
      if (!match) return { ok: false, missing: cat };
      ids.push(match.id);
    }
    return { ok: true, ids };
  } catch (e) {
    return { ok: false, missing: categories[0] };
  }
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
    sanitization_applied: applied,
  };

  try {
    const data = await execute(clean);
    await log({ ...base, status: 'COMPLETED', response_summary: summarize(typeof data === 'string' ? data : JSON.stringify(data ?? '')) });
    return { status: 'COMPLETED', blocked: false, data, sanitizationApplied: applied };
  } catch (e) {
    await log({ ...base, status: 'FAILED', response_summary: e?.message || 'request failed' });
    return { status: 'FAILED', blocked: false, reason: e?.message, data: null };
  }
}

export async function grantConsent(category, channel, explanation) {
  return base44.entities.DataSharingConsent.create({ category, channel, explanation, granted: true });
}

export async function revokeConsent(id) {
  return base44.entities.DataSharingConsent.update(id, { revoked: true, revoked_at: new Date().toISOString() });
}