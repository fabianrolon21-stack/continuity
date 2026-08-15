// ═══════════════════════════════════════════════
// SRTRS §7, §8, §9, §12 — FREE RESOURCE FINDER
// Returns CANDIDATES. Discovery authorizes nothing.
//
// The previous version claimed `requiresSignIn: false, costPerMonth: 0,
// verified: false` — a contradiction: unverified properties must not be
// asserted. Candidates now carry a multi-state verification status that
// starts at UNVERIFIED, and cost and sign-in are recorded only as what
// the source ADVERTISES, never as fact.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { requestExternal } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { requireCapability } from './capabilityRegistry';
import { authorizationFor } from './resourceApprovals';
import { emit } from '@/lib/bison/observability/observabilityBus';

export const VERIFICATION_STATES = [
  'UNVERIFIED', 'VERIFIED_FREE', 'VERIFIED_LIMITED_FREE', 'VERIFIED_PAID',
  'UNAVAILABLE', 'REQUIRES_ACCOUNT', 'REQUIRES_PAYMENT', 'TERMS_UNCLEAR',
];

export const CATEGORIES = {
  compute: 'free developer compute or hosting tiers, official documentation and pricing',
  storage: 'free object or file storage tiers, official documentation and pricing',
  api: 'free API tiers for developers, official documentation and pricing',
  data: 'open public datasets with clear licensing',
};

const SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          source: { type: 'string' },
          advertised_cost_per_month_usd: { type: 'number' },
          advertised_requires_sign_in: { type: 'boolean' },
          terms_note: { type: 'string' },
        },
      },
    },
  },
};

/**
 * DISCOVERED stage only. §9 — an ordinary authorized web client, official
 * documentation preferred, no auth bypass, no scraping of private content,
 * and a search result is never treated as authorization.
 */
export async function findCandidates(category = 'compute') {
  requireCapability('resource.external.discover', category);
  const topic = CATEGORIES[category];
  if (!topic) return { status: 'FAILED', reason: 'Unknown category.' };

  const result = await requestExternal({
    channel: 'web',
    destination: `open web discovery (${category})`,
    purpose: 'Discovering candidate low-cost alternatives — discovery only, no usage',
    payload: `Find publicly documented ${topic}. Name only services you can actually identify, cite the source, and do not invent URLs or terms.`,
    consentCategories: ['current_question'],
    execute: async (clean) => base44.integrations.Core.InvokeLLM({
      prompt: clean,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: SCHEMA,
    }),
  });

  emit({ subsystem: 'sustainability', event_type: 'resource_discovery', outcome: result.status, meta: { category } });
  if (result.blocked || !result.data) return result;

  const candidates = (result.data.candidates || []).map(c => ({
    name: c.name,
    url: c.url,
    category,
    source: c.source || 'web search',
    // Advertised, not confirmed — the naming keeps the distinction visible.
    advertisedCostPerMonthUSD: c.advertised_cost_per_month_usd ?? null,
    advertisedRequiresSignIn: c.advertised_requires_sign_in ?? null,
    verificationStatus: 'UNVERIFIED',
    verificationNotes: c.terms_note || 'Discovered through search. Pricing, availability, terms, and access requirements are unverified.',
    stage: 'DISCOVERED',
    authorized: false,
    discoveredAt: Date.now(),
  }));

  return { ...result, candidates };
}

/**
 * §12 — the gate between finding something and using it. Called before any
 * candidate is touched; refuses without a live, scoped approval.
 */
export async function canUse(candidate) {
  const auth = await authorizationFor(candidate.name);
  if (!auth.authorized) {
    return { allowed: false, stage: candidate.stage, reason: auth.reason };
  }
  if (candidate.verificationStatus === 'UNVERIFIED' || candidate.verificationStatus === 'TERMS_UNCLEAR') {
    return { allowed: false, reason: 'Approved, but still unverified. Verification must precede use.' };
  }
  if ((candidate.advertisedCostPerMonthUSD || 0) > 0) {
    requireCapability('resource.external.paid', candidate.name); // throws — needs explicit paid approval
  }
  return { allowed: true, ceilingUSD: auth.ceilingUSD, expiresAt: auth.expiresAt };
}

export const WEB_ACCESS_RULES = [
  'Uses ordinary web APIs through the app\'s sovereignty doorway.',
  'Prefers official documentation and official APIs.',
  'Never bypasses authentication, rate limits, or access controls.',
  'Never rotates proxies, credentials, or identities to obtain resources.',
  'robots.txt compliance is not a legal authorization and is not treated as one.',
  'A search result is never authorization to access a service.',
];