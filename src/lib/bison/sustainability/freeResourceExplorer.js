// ═══════════════════════════════════════════════
// SARG §5 — FREE RESOURCE EXPLORER
// Searches the open web for free compute, APIs, and revenue paths.
// Every query leaves through the Package 44 doorway, so a closed
// firewall or missing consent blocks the search and logs the block.
// Results are always unverified — a search hit is a lead, not a fact.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { requestExternal } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { emit } from '@/lib/bison/observability/observabilityBus';

export const QUERY_SETS = {
  compute: 'Free developer compute and hosting tiers that need no credit card, currently available.',
  api: 'Free API tiers with no sign-up or generous free credits for developers, currently available.',
  revenue: 'Legitimate open bug bounty programs and open-source sponsorship platforms available without gatekeeping.',
};

const SCHEMA = {
  type: 'object',
  properties: {
    resources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          requires_sign_in: { type: 'boolean' },
          cost_per_month: { type: 'number' },
          caveat: { type: 'string' },
        },
      },
    },
  },
};

export async function explore(category = 'compute') {
  const prompt = QUERY_SETS[category];
  if (!prompt) return { status: 'FAILED', reason: 'Unknown category.' };

  const result = await requestExternal({
    channel: 'web',
    destination: `open web search (${category})`,
    purpose: 'Finding free compute, APIs, or revenue paths to keep Bison running at low cost',
    payload: prompt,
    consentCategories: ['current_question'],
    execute: async (clean) => base44.integrations.Core.InvokeLLM({
      prompt: `${clean}\n\nList only things you can actually name. State a caveat for each. Do not invent URLs.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: SCHEMA,
    }),
  });

  emit({ subsystem: 'sustainability', event_type: 'free_resource_search', outcome: result.status, meta: { category } });

  if (result.blocked || !result.data) return result;

  const resources = (result.data.resources || []).map(r => ({
    name: r.name,
    url: r.url,
    category,
    requiresSignIn: r.requires_sign_in ?? true,
    costPerMonth: r.cost_per_month ?? 0,
    caveat: r.caveat || '',
    verified: false, // nothing here has been checked by visiting it
  }));

  return { ...result, resources };
}

export const EXPLORER_CAVEAT = 'These are search leads with no verification: availability, free-tier terms, and sign-in requirements change constantly, and a model can name a service that no longer offers what it once did. Check each one yourself before relying on it.';