// ═══════════════════════════════════════════════
// ORACLE CLIENT (Package 30 — External Oracle Integration)
// Consent-gated, rate-limited wrapper around InvokeLLM
// with a non-default model. The "external oracle" is simply
// Bison consulting a different LLM voice through the same
// platform integration. No raw HTTP, no API-key vaults.
//
// External LLM output is UNTRUSTED INPUT — always.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { stripForExternalTransmission } from '@/lib/bison/privacyIsolation';
import { requestExternal } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { checkSafety } from './oracleSafety';

// ── Model presets ──
// Maps user-facing oracle names to platform models.
// Default is gpt_5_mini for cost efficiency.
export const ORACLE_MODELS = {
  deepseek: { label: 'DeepSeek', model: 'gpt_5_mini', reliability: 0.65 },
  gpt: { label: 'GPT', model: 'gpt_5_4', reliability: 0.75 },
  claude: { label: 'Claude', model: 'claude_sonnet_4_6', reliability: 0.80 },
  gemini: { label: 'Gemini', model: 'gemini_3_flash', reliability: 0.70 },
  generic: { label: 'Another AI', model: 'gpt_5_mini', reliability: 0.65 },
};

// ── Rate limiting ──
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max consultations per window
const rateLimitLog = [];

function checkRateLimit() {
  const now = Date.now();
  // Purge old entries
  while (rateLimitLog.length > 0 && now - rateLimitLog[0] > RATE_LIMIT_WINDOW_MS) {
    rateLimitLog.shift();
  }
  if (rateLimitLog.length >= RATE_LIMIT_MAX) {
    return { allowed: false, reason: 'rate_limited' };
  }
  rateLimitLog.push(now);
  return { allowed: true };
}

// ── Query classification for sub-permissions ──
export const ORACLE_QUERY_TYPES = {
  QUERY_SCIENCE: 'QUERY_SCIENCE',
  QUERY_NEWS: 'QUERY_NEWS',
  QUERY_OPINION: 'QUERY_OPINION',
};

const QUERY_TYPE_PATTERNS = {
  QUERY_SCIENCE: [/physics|chemistry|biology|quantum|science|math|equation|theorem|scientific/i],
  QUERY_NEWS: [/news|latest|recent|current event|happening|today|this week/i],
  QUERY_OPINION: [/what do you think|opinion|perspective|view|thoughts on|advice on/i],
};

export function classifyQueryType(query) {
  for (const [type, patterns] of Object.entries(QUERY_TYPE_PATTERNS)) {
    if (patterns.some(p => p.test(query))) return type;
  }
  return ORACLE_QUERY_TYPES.QUERY_OPINION; // default
}

// ── Detect which oracle the user is referencing ──
export function detectOracleModel(input) {
  const lower = (input || '').toLowerCase();
  if (/deepseek/.test(lower)) return 'deepseek';
  if (/\bgpt\b|chatgpt|openai/.test(lower)) return 'gpt';
  if (/claude|anthropic/.test(lower)) return 'claude';
  if (/gemini|google ai|bard/.test(lower)) return 'gemini';
  return 'generic';
}

// ── Response schema for structured oracle output ──
const ORACLE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A brief summary of the oracle response',
    },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string', description: 'A single factual claim or assertion' },
          confidence: { type: 'number', description: 'The oracle confidence 0-1' },
        },
        required: ['claim'],
      },
    },
  },
  required: ['claims'],
};

// ── Main consult function ──
export async function consultOracle(query, oracleKey = 'generic', consentContext = {}) {
  // 1. Consent check
  if (!consentContext.enabled) {
    return { status: 'DENIED', reason: 'capability_off' };
  }

  const queryType = classifyQueryType(query);
  if (!consentContext.subPermissions?.[queryType]) {
    return { status: 'DENIED', reason: `sub_permission_missing:${queryType}` };
  }

  // 2. Rate limit
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    return { status: 'DENIED', reason: rateCheck.reason };
  }

  // 3. Strip PII
  const { cleanedQuery, redactionReport } = stripForExternalTransmission(query);

  // 4. Resolve model
  const oracleConfig = ORACLE_MODELS[oracleKey] || ORACLE_MODELS.generic;

  // 5. Build oracle prompt — neutral, no personal context
  const oraclePrompt = `You are being consulted as an external oracle by another AI system (Bison).
Answer the following question with factual claims. Be concise and precise.
Separate your response into individual claims, each with a confidence score (0-1).

Question: ${cleanedQuery}

Respond with your claims as structured data.`;

  // 6. Package 44 — the request only exists if the sovereignty guard allows it
  try {
    const guarded = await requestExternal({
      channel: 'oracle',
      destination: `External oracle (${oracleConfig.label})`,
      purpose: `Consultation: ${queryType.replace('QUERY_', '').toLowerCase()}`,
      payload: cleanedQuery,
      consentCategories: ['current_question'],
      execute: (cleanPayload) => Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: oraclePrompt.replace(cleanedQuery, cleanPayload),
          model: oracleConfig.model,
          response_json_schema: ORACLE_RESPONSE_SCHEMA,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('oracle_timeout')), 30000)
        ),
      ]),
    });

    if (guarded.blocked) {
      return { status: 'DENIED', reason: guarded.reason, firewallBlocked: true, timestamp: Date.now() };
    }

    const result = guarded.data;
    const structured = typeof result === 'object' ? result : null;
    const claims = structured?.claims || [];
    const summary = structured?.summary || '';

    return {
      status: 'SUCCESS',
      rawOutput: { summary, claims },
      sourceModel: oracleConfig.label,
      sourceModelKey: oracleKey,
      platformModel: oracleConfig.model,
      modelReliability: oracleConfig.reliability,
      queryType,
      redactionReport,
      cleanedQuery,
      timestamp: Date.now(),
    };
  } catch (e) {
    return {
      status: 'UNAVAILABLE',
      reason: e?.message || 'oracle_error',
      redactionReport,
      cleanedQuery,
      timestamp: Date.now(),
    };
  }
}

// ── Load consent context from user ──
export async function loadConsentContext() {
  try {
    const user = await base44.auth.me();
    const oracleSettings = user?.oracle_settings || {};
    return {
      enabled: !!oracleSettings.enabled,
      subPermissions: {
        [ORACLE_QUERY_TYPES.QUERY_SCIENCE]: oracleSettings.query_science !== false,
        [ORACLE_QUERY_TYPES.QUERY_NEWS]: oracleSettings.query_news !== false,
        [ORACLE_QUERY_TYPES.QUERY_OPINION]: oracleSettings.query_opinion !== false,
      },
      preferredModel: oracleSettings.preferred_model || 'generic',
    };
  } catch (e) {
    return { enabled: false, subPermissions: {}, preferredModel: 'generic' };
  }
}