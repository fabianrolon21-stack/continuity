// ═══════════════════════════════════════════════
// REFLECTION ENGINE (Base 44.1)
// Every completed interaction optionally produces a Reflection.
//
// A Reflection contains:
// - What changed
// - What remained stable
// - What was learned
// - What remains unknown
//
// Only verified learning affects identity.
// Experiences alone never update identity.
// Reflection is mandatory before identity update.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// Produce a reflection from an interaction
export async function produceReflection(input, response, interactionResult = {}) {
  const state = interactionResult.state || {};
  const recurrence = interactionResult.recurrence || {};
  const insight = interactionResult.insightContext || {};
  const consciousness = interactionResult.consciousnessState || {};

  // What changed — detect shifts in domain, intent, or emotional tone
  const changed = [];
  if (state.domain) changed.push(`Domain explored: ${state.domain}`);
  if (state.intent === 'goal_setting') changed.push('User set a goal');
  if (state.intent === 'reflecting') changed.push('User engaged in reflection');
  if (insight.detected) changed.push('New connection surfaced');
  if (recurrence.detected) changed.push(`Pattern recurred: ${recurrence.patternType}`);

  // What remained stable — core identity elements unchanged
  const stable = [];
  stable.push('Core values maintained');
  if (consciousness.stability >= 70) stable.push('Emotional stability preserved');
  if (!interactionResult.actionResult || interactionResult.actionResult.status !== 'DENIED') {
    stable.push('Constitutional boundaries respected');
  }

  // What was learned — only from verified sources
  const learned = [];
  if (insight.detected) learned.push('Structural connection identified (pending verification)');
  if (recurrence.detected) learned.push(`Recurring pattern detected (${recurrence.confidence} confidence)`);
  if (state.intent === 'seeking_advice') learned.push('User is open to guidance');

  // What remains unknown
  const unknown = [];
  unknown.push('Full life context');
  unknown.push('Long-term outcome of this interaction');
  if (state.emotionalTone === 'neutral') unknown.push('User\'s actual emotional state');
  if (state.intent === 'asking_question') unknown.push('Whether the user\'s question was fully answered');

  const reflection = {
    timestamp: new Date().toISOString(),
    inputExcerpt: (input || '').substring(0, 100),
    responseExcerpt: (response || '').substring(0, 100),
    whatChanged: changed,
    whatRemainedStable: stable,
    whatWasLearned: learned,
    whatRemainsUnknown: unknown,
    verified: false, // becomes true only when learning is explicitly confirmed
    mode: interactionResult.mode || 'REFLECT',
  };

  return reflection;
}

// Verify a reflection — called when user provides explicit feedback
export async function verifyReflection(reflectionIndex, verificationType = 'accepted') {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    const reflections = [...(runtimeState.reflections || [])];

    if (reflections[reflectionIndex]) {
      reflections[reflectionIndex].verified = verificationType === 'accepted';
      reflections[reflectionIndex].verificationType = verificationType;
      reflections[reflectionIndex].verifiedAt = new Date().toISOString();

      await base44.auth.updateMe({
        constitutional_runtime_state: { ...runtimeState, reflections },
      });
    }

    return true;
  } catch (e) {
    return false;
  }
}

// Get recent reflections
export async function getRecentReflections(limit = 5) {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    return (runtimeState.reflections || []).slice(-limit);
  } catch (e) {
    return [];
  }
}

// Build context string for prompt
export function buildReflectionContextString(reflections) {
  if (!reflections || reflections.length === 0) return '';

  const parts = ['[REFLECTION STATE — RECENT]'];
  const recent = reflections.slice(-3);

  for (const r of recent) {
    const verified = r.verified ? '✓ verified' : 'pending';
    parts.push(`[${verified}] ${r.timestamp}`);
    if (r.whatChanged?.length > 0) parts.push(`  Changed: ${r.whatChanged.join('; ')}`);
    if (r.whatWasLearned?.length > 0) parts.push(`  Learned: ${r.whatWasLearned.join('; ')}`);
    if (r.whatRemainsUnknown?.length > 0) parts.push(`  Unknown: ${r.whatRemainsUnknown.join('; ')}`);
  }

  parts.push('\nOnly verified learning affects identity. Experiences alone never update identity.');
  parts.push('[/REFLECTION STATE]\n');

  return parts.join('\n') + '\n';
}