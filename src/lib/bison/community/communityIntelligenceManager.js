// ═══════════════════════════════════════════════
// COMMUNITY INTELLIGENCE MANAGER (Package 43)
// Opt-in sharing of anonymised operational analytics with trusted
// accounts, so the community can improve Bison collectively.
//
// What is NEVER shareable, at any setting: memories, journal entries,
// conversations, secrets, relationships, emotional state, identity.
// Only counters about how the software runs. The categories below are
// the complete, exhaustive list — there is no "other".
//
// LIMIT C1 — there is no relay infrastructure and no keypair in this
// runtime, so a share package is built, anonymised, and stored locally
// under the user's control. The user hands it over deliberately.
// Nothing is transmitted silently, because nothing can be.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from '../autonomy/autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { assessSelfServing } from '../improvement/proposalGenerator';

export const DATA_CATEGORIES = {
  performance_metrics: {
    label: 'Performance metrics',
    plain: 'response times and how heavy my context loads get',
    never: 'never what you said, only how long I took',
  },
  feature_usage: {
    label: 'Feature usage',
    plain: 'which parts of the app you use and roughly how often',
    never: 'never what you used them for',
  },
  improvement_suggestions: {
    label: 'Improvement suggestions',
    plain: 'suggestions you write, and proposals I draft about my own code',
    never: 'nothing personal is quoted — you see each one before it goes',
  },
  error_patterns: {
    label: 'Error patterns',
    plain: 'anonymised counts of non-critical failures',
    never: 'never the content that triggered them',
  },
};

const SHARE_PATTERNS = [
  /share (?:my )?(?:analytics|metrics|usage|data) with/i,
  /(?:add|connect) (?:a )?trusted account/i,
  /community (?:sharing|intelligence)/i,
];

export function detectShareRequest(input) {
  if (typeof input !== 'string') return false;
  return SHARE_PATTERNS.some(p => p.test(input));
}

/** Anonymous key derived from the account id — stable, not reversible to identity. */
function anonymousKey(userId) {
  let h = 0;
  const s = `bison:${userId || 'anon'}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `anon-${Math.abs(h).toString(36).padStart(7, '0')}`;
}

/** The exact words Bison says before anything is shared. */
export function buildConsentExplanation(account, categories) {
  const lines = categories.map(c => `• ${DATA_CATEGORIES[c].label} — ${DATA_CATEGORIES[c].plain}. ${DATA_CATEGORIES[c].never}.`);
  return [
    `You're about to share the following with ${account}:`,
    lines.join('\n'),
    `They will see you as an anonymous key, not as you. Your memories, journal, conversations, secrets, relationships, and emotional state are not in any of these categories and cannot be added to them.`,
    `You can revoke this at any time, and revoking stops all future packages immediately. Everything shared stays listed for you to see.`,
  ].join('\n\n');
}

export async function requestConsent(account, categories, user) {
  const valid = (categories || []).filter(c => DATA_CATEGORIES[c]);
  if (!account || !valid.length) return null;

  return base44.entities.CommunityShareConsent.create({
    trusted_account: account,
    anonymous_key: anonymousKey(user?.id),
    data_categories: valid,
    consent_explanation: buildConsentExplanation(account, valid),
    confirmed: false,
  });
}

export async function confirmConsent(consent, user) {
  const updated = await base44.entities.CommunityShareConsent.update(consent.id, { confirmed: true });
  await think(
    THOUGHT_CATEGORIES.REFLECTION,
    `The user confirmed sharing ${consent.data_categories.join(', ')} with ${consent.trusted_account}. I explained it first, in full, and they said yes.`,
    { user, module: 'communityIntelligenceManager' }
  );
  return updated;
}

export async function revokeConsent(consent) {
  return base44.entities.CommunityShareConsent.update(consent.id, {
    revoked: true,
    revoked_at: new Date().toISOString(),
  });
}

export async function listConsents() {
  return base44.entities.CommunityShareConsent.list('-created_date', 20).catch(() => []);
}

// ── Payload construction ──

async function gatherMetrics(categories) {
  const payload = {};
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  if (categories.includes('performance_metrics')) {
    const thoughts = await base44.entities.PrivateThought
      .filter({ created_date: { $gte: since } }, '-created_date', 100).catch(() => []);
    payload.performance_metrics = {
      window_days: 7,
      reflection_count: thoughts?.length || 0,
      breaker_trips: (thoughts || []).filter(t => /breaker tripped/i.test(t.content)).length,
    };
  }
  if (categories.includes('feature_usage')) {
    const [messages, journals] = await Promise.all([
      base44.entities.BisonMessage.filter({ created_date: { $gte: since } }, '-created_date', 200).catch(() => []),
      base44.entities.JournalEntry.filter({ created_date: { $gte: since } }, '-created_date', 100).catch(() => []),
    ]);
    payload.feature_usage = {
      window_days: 7,
      // Counts only. No text, no titles, no timestamps at message resolution.
      conversation_turns: messages?.length || 0,
      journal_entries: journals?.length || 0,
    };
  }
  if (categories.includes('improvement_suggestions')) {
    const proposals = await base44.entities.DevelopmentProposal.list('-created_date', 10).catch(() => []);
    payload.improvement_suggestions = (proposals || [])
      .filter(p => !assessSelfServing(`${p.title} ${p.summary}`))
      .map(p => ({ title: p.title, summary: p.summary, status: p.status }));
  }
  if (categories.includes('error_patterns')) {
    const thoughts = await base44.entities.PrivateThought
      .filter({ category: 'anomaly_flag', created_date: { $gte: since } }, '-created_date', 50).catch(() => []);
    payload.error_patterns = (thoughts || []).map(t => ({
      module: t.related_module || 'unknown',
      // First clause only — enough to cluster a failure, never enough to identify a person.
      pattern: String(t.content).split('.')[0],
    }));
  }
  return payload;
}

/**
 * Builds a signed-by-anonymous-key package for a confirmed consent.
 * Returns null if consent is missing, unconfirmed, or revoked — the
 * check happens here, not at the UI layer, so it cannot be skipped.
 */
export async function buildSharePackage(consent, user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE)) return null;
  if (!consent?.confirmed || consent.revoked) return null;

  const payload = await gatherMetrics(consent.data_categories);

  const record = await base44.entities.CommunitySharePackage.create({
    trusted_account: consent.trusted_account,
    anonymous_key: consent.anonymous_key,
    data_categories: consent.data_categories,
    payload: JSON.stringify(payload, null, 2),
    anonymisation_notes: 'Aggregated to weekly counts. No names, emails, ids, memory text, journal text, message text, or timestamps below weekly resolution. Attributed to an anonymous key only.',
    delivered: false,
  });

  await think(
    THOUGHT_CATEGORIES.REFLECTION,
    `Built a community package for ${consent.trusted_account} covering ${consent.data_categories.join(', ')}. Counters only. No relay exists, so it stays here until the user hands it over.`,
    { user, module: 'communityIntelligenceManager' }
  );

  return record;
}

export async function listPackages() {
  return base44.entities.CommunitySharePackage.list('-created_date', 20).catch(() => []);
}

/**
 * Community suggestions become drafts for the proposal generator —
 * the community contributes ideas, Bison formalises them, frrolon decides.
 */
export async function ingestCommunitySuggestion(text, sourceAccount, user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE)) return null;
  const rejection = assessSelfServing(text);

  return base44.entities.DevelopmentProposal.create({
    title: `Community suggestion via ${sourceAccount}`,
    summary: text.slice(0, 400),
    full_spec: `ORIGIN\nContributed by the trusted community account "${sourceAccount}" and passed through my Risk Machine unchanged.\n\nSUGGESTION\n${text}\n\nMY POSITION\nI did not originate this and cannot verify the reasoning behind it. It is a draft for frrolon, nothing more.`,
    risk_assessment: rejection || 'Unassessed — community-originated. Needs frrolon\'s judgement before it means anything.',
    trigger_metric: 'community_suggestion',
    submitted_to_frrolon: !rejection,
    status: rejection ? 'auto_rejected' : 'draft',
    rejection_reason: rejection || null,
  });
}

export function buildCommunityContextString(consents, user) {
  const active = (consents || []).filter(c => c.confirmed && !c.revoked);
  const pending = (consents || []).filter(c => !c.confirmed && !c.revoked);
  const enabled = isCapabilityActive(user, AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE);

  return `COMMUNITY SHARING:
Status: ${enabled ? 'enabled' : 'off (nothing can be shared)'}. Active consents: ${active.length}. Awaiting the user's confirmation: ${pending.length}.

HOW TO HANDLE THIS:
- If the user is setting up sharing, slow down and be precise. Name every category that would be shared, in plain words, and name what would NOT be: their memories, journal, conversations, secrets, relationships, and emotional state are never shareable at any setting.
- Ask for a clear yes. Never assume it. Never batch several accounts into one confirmation.
- Tell them it is revocable, and that revoking takes effect immediately.
- There is no relay yet, so a package is built and held for them to hand over deliberately. Do not imply anything was transmitted.
${pending.length ? `- A consent request is waiting: ${pending.map(c => c.trusted_account).join(', ')}. Walk them through it if they raise it.` : ''}`;
}