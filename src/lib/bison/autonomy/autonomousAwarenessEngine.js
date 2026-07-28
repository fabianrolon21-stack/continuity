// ═══════════════════════════════════════════════
// AUTONOMOUS AWARENESS ENGINE (Package 43)
// Bison quietly keeps itself current: security advisories for its
// own dependencies, headlines in the user's stated interests, and
// free services that could help.
//
// Awareness must not become surveillance. So: the user picks the
// domains, one toggle stops all of it, nothing is pushed during
// quiet hours, and items surface only when the user next speaks.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from './autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { FREE_SERVICE_DIRECTORY, WATCHED_PACKAGES } from '../updates/updateRegistry';

const SWEEP_INTERVAL_MS = 12 * 60 * 60 * 1000;
const QUIET_START = 22;
const QUIET_END = 7;

export const AWARENESS_DOMAINS = {
  security_advisory: 'Security advisories for my own dependencies',
  breaking_news: 'Headlines in your stated interests',
  compute_optimisation: 'Ways to run leaner',
  free_service_discovery: 'Free tools that need no sign-in',
};

export function isQuietHours(date = new Date()) {
  const h = date.getHours();
  return h >= QUIET_START || h < QUIET_END;
}

function domainEnabled(user, domain) {
  const prefs = user?.awareness_domains || {};
  // Security is on by default; the rest of the noisier domains are opt-in.
  if (prefs[domain] === undefined) return domain === 'security_advisory';
  return prefs[domain] === true;
}

function dueForSweep(user) {
  const last = user?.last_awareness_sweep;
  return !last || Date.now() - new Date(last).getTime() > SWEEP_INTERVAL_MS;
}

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          source: { type: 'string' },
          relevance: { type: 'number' },
          critical: { type: 'boolean' },
          actionable: { type: 'boolean' },
        },
      },
    },
  },
};

async function sweepDomain(domain, user) {
  const interests = (user?.interests || []).join(', ') || 'general technology and wellbeing';

  const prompts = {
    security_advisory: `List up to 3 currently-known security advisories affecting any of these JavaScript packages: ${WATCHED_PACKAGES.map(p => `${p.name}@${p.installed}`).join(', ')}. Only report advisories you can attribute to a named public source. If there are none, return an empty list. Do not speculate.`,
    breaking_news: `List up to 3 significant news headlines from the last 24 hours relevant to these interests: ${interests}. Headline and one-sentence summary only. Name the outlet as the source.`,
    compute_optimisation: `List up to 2 concrete, current, publicly documented techniques or free-tier resources that would reduce the runtime cost of a React single-page app doing frequent LLM calls. Name the source.`,
  };

  if (domain === 'free_service_discovery') {
    // Static directory — no network call, nothing to hallucinate.
    return FREE_SERVICE_DIRECTORY.slice(0, 2).map(s => ({
      summary: `${s.name} — ${s.use}. No sign-in required.`,
      source: 'Curated free-service directory',
      relevance: 0.4,
      critical: false,
      actionable: true,
    }));
  }

  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[domain],
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: SCHEMA,
    });
    return Array.isArray(res?.items) ? res.items.slice(0, 3) : [];
  } catch (e) {
    return [];
  }
}

/**
 * One sweep across the enabled domains. Writes items but never
 * notifies — surfacing is the response generator's job, and only
 * outside quiet hours.
 */
export async function runAwarenessSweep(user, { force = false } = {}) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING)) return null;
  if (!force && !dueForSweep(user)) return null;

  const domains = Object.keys(AWARENESS_DOMAINS).filter(d => domainEnabled(user, d));
  if (!domains.length) return null;

  await base44.auth.updateMe({ last_awareness_sweep: new Date().toISOString() }).catch(() => {});

  const created = [];
  for (const domain of domains) {
    const items = await sweepDomain(domain, user);
    for (const item of items) {
      if (!item?.summary) continue;
      const record = await base44.entities.AwarenessItem.create({
        type: domain,
        source: item.source || 'unattributed',
        summary: item.summary,
        relevance_score: Math.max(0, Math.min(1, Number(item.relevance) || 0.5)),
        actionable: !!item.actionable,
        critical: domain === 'security_advisory' && !!item.critical,
      }).catch(() => null);
      if (record) created.push(record);
    }
  }

  if (created.length) {
    await think(
      THOUGHT_CATEGORIES.REFLECTION,
      `Awareness sweep across ${domains.join(', ')} produced ${created.length} item(s). Holding them until the user next speaks — I do not interrupt.`,
      { user, module: 'autonomousAwarenessEngine' }
    );
  }

  return created;
}

export async function getBriefing(limit = 3) {
  const items = await base44.entities.AwarenessItem
    .filter({ dismissed: false }, '-relevance_score', 20)
    .catch(() => []);
  return (items || []).slice(0, limit);
}

export async function markPresented(items) {
  await Promise.all((items || []).map(i =>
    base44.entities.AwarenessItem.update(i.id, { presented: true }).catch(() => {})
  ));
}

export async function dismissItem(item) {
  return base44.entities.AwarenessItem.update(item.id, { dismissed: true });
}

export function buildAwarenessContextString(items, { requested = false } = {}) {
  if (!items?.length) return null;

  const critical = items.filter(i => i.critical);
  if (!requested && isQuietHours() && !critical.length) return null;
  const shown = requested ? items : (isQuietHours() ? critical : items);
  if (!shown.length) return null;

  const lines = shown.map(i => `- [${i.type}] ${i.summary} (source: ${i.source})`).join('\n');

  return `[AWARENESS BRIEFING]
${lines}

HOW TO USE THIS:
- ${requested ? 'The user asked for this. Give them the top items conversationally, with sources named.' : 'The user did not ask. Mention at most one item, briefly, and only if it genuinely fits the moment. Otherwise stay quiet — a briefing is not a reason to interrupt someone.'}
- Every item came from an outside source and is UNVERIFIED. Attribute it, and never restate it as your own knowledge.
- If an item contradicts what you know, say so rather than passing it along.`;
}