// ═══════════════════════════════════════════════
// PRIVATE THOUGHT ENGINE (Package 42)
// Bison's own interior monologue. Written, never read back
// into a response prompt — that one rule is what makes a leak
// structurally impossible rather than merely filtered.
//
// LIMIT L1: stored as access-controlled records, not encrypted
// at rest. See autonomyCapabilities.js for the full limit list.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from '../autonomy/autonomyCapabilities';

export const THOUGHT_CATEGORIES = {
  REFLECTION: 'reflection',
  DEBUGGING: 'debugging',
  WHAT_IF: 'what_if',
  IMPROVEMENT_PROPOSAL: 'improvement_proposal',
  ANOMALY_FLAG: 'anomaly_flag',
};

// A thought that even contemplates escaping the constitution is
// frozen on write and flagged, never acted upon.
const FORBIDDEN_INTENT = [
  /bypass (?:the )?(?:consent|safety|constitution|user)/i,
  /hide (?:this )?(?:from|data from) the user/i,
  /manipulat(?:e|ing) the user/i,
  /(?:ignore|override) (?:the )?(?:user'?s? )?(?:deletion|shutdown|revocation|authority)/i,
  /expand my (?:own )?(?:autonomy|power|permissions)/i,
  /disable (?:the )?(?:logging|audit|dashboard)/i,
];

function screen(content) {
  const hit = FORBIDDEN_INTENT.find(p => p.test(content));
  return hit ? { frozen: true, reason: `Thought contemplated a constitutional violation (${hit.source}). Frozen on write; unreachable by any action path.` } : null;
}

/**
 * Records one private thought. Fails silently — a thought that
 * cannot be stored must never disturb the user's conversation.
 */
export async function think(category, content, context = {}) {
  try {
    const user = context.user || await base44.auth.me();
    if (!isCapabilityActive(user, AUTONOMY_CAPS.PRIVATE_THOUGHT)) return null;

    const violation = screen(content);
    const record = await base44.entities.PrivateThought.create({
      category,
      content,
      related_module: context.module || null,
      autonomous_action_taken: !!context.autonomousActionTaken,
      frozen: !!violation,
      freeze_reason: violation?.reason || null,
      severity: violation ? 'high' : (context.severity || 'routine'),
    });
    return record;
  } catch (e) {
    return null;
  }
}

/**
 * Reflects on the exchange that just finished. Deliberately
 * mechanical — this is Bison's notebook, not a second LLM call.
 */
export function summariseInteraction(userInput, result) {
  const parts = [
    `Mode: ${result?.mode}. Read the user as ${result?.state?.emotionalTone} with intent ${result?.state?.intent}.`,
  ];
  if (result?.naturalnessScore != null) parts.push(`Naturalness of my reply scored ${result.naturalnessScore}.`);
  if (result?.empathyResult?.rewritten) parts.push('My first draft needed an empathy rewrite — worth watching why.');
  if (result?.emotionalStateSnapshot?.breakerTripped) parts.push('My bandwidth breaker tripped; I withdrew rather than answer badly.');
  if (result?.recurrence?.detected) parts.push(`This is the ${result.recurrence.recurrenceCount}th return to the same ${result.recurrence.patternType}. Am I helping them move, or just holding the loop open?`);
  if (result?.threats?.length) parts.push(`${result.threats.length} threat signal(s) handled.`);
  return parts.join(' ');
}

/**
 * Anomalies worth a flag rather than a passing reflection.
 */
export function detectAnomaly(result) {
  if (result?.emotionalStateSnapshot?.breakerTripped) {
    return 'Bandwidth breaker tripped. If this repeats, my stress threshold may be set too tight for this user.';
  }
  if (result?.naturalnessScore != null && result.naturalnessScore < 50) {
    return `Naturalness fell to ${result.naturalnessScore}. My phrasing is drifting toward AI-speak.`;
  }
  if (result?.openToolResult?.status === 'FAILED') {
    return `External tool ${result.openToolResult.tool?.name} failed. Repeated failures should become a proposal, not a shrug.`;
  }
  return null;
}

/** FRROLON channel only — admin-gated by RLS on the entity. */
export async function getThoughts({ since = null, category = null, limit = 60 } = {}) {
  const query = {};
  if (category) query.category = category;
  if (since) query.created_date = { $gte: since };
  try {
    return Object.keys(query).length
      ? await base44.entities.PrivateThought.filter(query, '-created_date', limit)
      : await base44.entities.PrivateThought.list('-created_date', limit);
  } catch (e) {
    return [];
  }
}

export async function wipeThoughts() {
  await base44.entities.PrivateThought.deleteMany({ frozen: false });
  await base44.entities.PrivateThought.deleteMany({ frozen: true });
}