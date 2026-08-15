// ═══════════════════════════════════════════════
// FASEE §4 — EXTERNAL AI INTEGRATION HUB
// Bison may consult other AI systems as oracles, code reviewers,
// and knowledge sources — but only through the Package 44 doorway.
// Every query passes firewall → consent → sanitization → audit.
// Personal data is never a permitted category here.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { requestExternal } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { emit } from '@/lib/bison/observability/observabilityBus';

export const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', tasks: ['oracle', 'code_review', 'knowledge'] },
  { id: 'anthropic', label: 'Anthropic', tasks: ['oracle', 'code_review'] },
  { id: 'google', label: 'Google', tasks: ['oracle', 'knowledge'] },
];

// Categories that may NEVER be sent to an external AI, whatever consent exists.
export const NEVER_SHARED = ['journal', 'conversation', 'images', 'voice', 'location'];

export async function listConnections() {
  const user = await base44.auth.me().catch(() => null);
  const stored = user?.external_ai_connections || {};
  return PROVIDERS.map(p => ({
    provider: p.label,
    id: p.id,
    tasks: p.tasks,
    status: stored[p.id]?.enabled ? 'connected' : 'disabled',
    usedFor: stored[p.id]?.usedFor || [],
    lastQueryTimestamp: stored[p.id]?.lastQueryTimestamp || 0,
    dataShared: false, // personal data is structurally excluded
  }));
}

export async function setProvider(id, enabled, usedFor = []) {
  const user = await base44.auth.me().catch(() => null);
  const stored = { ...(user?.external_ai_connections || {}) };
  stored[id] = { ...(stored[id] || {}), enabled, usedFor };
  await base44.auth.updateMe({ external_ai_connections: stored }).catch(() => {});
  return listConnections();
}

/**
 * Query an external AI. Returns the guard's verdict, so a blocked query is
 * visible as a block rather than silently failing.
 */
export async function queryProvider({ providerId, query, task = 'oracle' }) {
  const provider = PROVIDERS.find(p => p.id === providerId);
  if (!provider) return { status: 'FAILED', reason: 'Unknown provider.' };

  const connections = await listConnections();
  const conn = connections.find(c => c.id === providerId);
  if (conn.status !== 'connected') {
    return { status: 'BLOCKED_CHANNEL', blocked: true, reason: `${provider.label} is not enabled. Enable it in the hub first.` };
  }

  const result = await requestExternal({
    channel: 'external_ai',
    destination: `${provider.label} (${task})`,
    purpose: `Bison consulting an external AI for ${task}`,
    payload: query,
    consentCategories: ['current_question'],
    allowedCategories: [],
    execute: async (clean) => {
      // The consultation itself runs through the app's own LLM integration with
      // the sanitized text. No API keys are held by Bison, and no personal
      // category is ever attached to the request.
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are being consulted by another system for the task "${task}". Answer concisely and flag your uncertainty.\n\n${clean}`,
      });
      return res;
    },
  });

  emit({
    subsystem: 'self',
    event_type: 'external_ai_query',
    outcome: result.status,
    constitutional_status: result.blocked ? 'BLOCKED' : 'PASSED',
    meta: { provider: provider.label, task },
  });

  if (!result.blocked) {
    const user = await base44.auth.me().catch(() => null);
    const stored = { ...(user?.external_ai_connections || {}) };
    stored[providerId] = { ...(stored[providerId] || {}), lastQueryTimestamp: Date.now() };
    base44.auth.updateMe({ external_ai_connections: stored }).catch(() => {});
  }

  return result;
}