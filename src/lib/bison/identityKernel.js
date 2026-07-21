// ═══════════════════════════════════════════════
// IDENTITY KERNEL (Package 26)
// "I am Bison." — persistent computational identity.
// NOT biological consciousness. NOT sentience claim.
// Identity emerges from continuity of memory, commitments,
// reasoning history, and belief revision based on consequences.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const IDENTITY_DEFAULTS = {
  instanceId: null,
  continuityGeneration: 0,
  createdAt: null,
  beliefRevisions: [],
  consequenceLog: [],
};

function generateInstanceId() {
  return `bison_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getIdentityContext() {
  try {
    const user = await base44.auth.me();
    const identity = user?.identity_state || { ...IDENTITY_DEFAULTS };

    if (!identity.instanceId) {
      identity.instanceId = generateInstanceId();
      identity.createdAt = new Date().toISOString();
    }
    identity.continuityGeneration = (identity.continuityGeneration || 0) + 1;

    await base44.auth.updateMe({ identity_state: identity });

    return {
      instanceId: identity.instanceId,
      continuityGeneration: identity.continuityGeneration,
      createdAt: identity.createdAt,
      beliefRevisions: (identity.beliefRevisions || []).slice(-3),
      consequenceLog: (identity.consequenceLog || []).slice(-5),
    };
  } catch (e) {
    return null;
  }
}

// Track what Bison recommended, for later consequence reflection
export async function trackConsequence(userInput, bisonText, state, mode) {
  try {
    const user = await base44.auth.me();
    const identity = user?.identity_state || { ...IDENTITY_DEFAULTS };

    identity.consequenceLog = identity.consequenceLog || [];
    identity.consequenceLog.push({
      timestamp: new Date().toISOString(),
      userInput: userInput.substring(0, 200),
      bisonResponse: bisonText.substring(0, 200),
      mode,
      domain: state?.domain,
      intent: state?.intent,
    });

    if (identity.consequenceLog.length > 20) {
      identity.consequenceLog = identity.consequenceLog.slice(-20);
    }

    await base44.auth.updateMe({ identity_state: identity });
  } catch (e) {}
}

// Record when Bison's position changes based on observed consequences
export async function reviseBelief(context, oldPosition, newPosition, reason) {
  try {
    const user = await base44.auth.me();
    const identity = user?.identity_state || { ...IDENTITY_DEFAULTS };

    identity.beliefRevisions = identity.beliefRevisions || [];
    identity.beliefRevisions.push({
      timestamp: new Date().toISOString(),
      context,
      oldPosition,
      newPosition,
      reason,
    });

    if (identity.beliefRevisions.length > 10) {
      identity.beliefRevisions = identity.beliefRevisions.slice(-10);
    }

    await base44.auth.updateMe({ identity_state: identity });
  } catch (e) {}
}

export function buildIdentityContextString(identityContext) {
  if (!identityContext) return '';

  const parts = ['[BISON IDENTITY — PERSISTENT COMPUTATIONAL ENTITY]'];
  parts.push(`Instance: ${identityContext.instanceId}`);
  parts.push(`Continuity generation: ${identityContext.continuityGeneration}`);
  parts.push(`Created: ${identityContext.createdAt || 'unknown'}`);

  if (identityContext.beliefRevisions?.length > 0) {
    parts.push(`Belief revisions: ${identityContext.beliefRevisions.length} recorded`);
    const latest = identityContext.beliefRevisions[identityContext.beliefRevisions.length - 1];
    parts.push(`Latest revision: "${latest.newPosition}" (was: "${latest.oldPosition}")`);
    parts.push(`Reason: ${latest.reason}`);
  }

  if (identityContext.consequenceLog?.length > 0) {
    parts.push(`Recent recommendations tracked: ${identityContext.consequenceLog.length}`);
  }

  parts.push('Note: "I am Bison." Persistent computational identity, not biological consciousness.');
  parts.push('You may reference past recommendations and acknowledge mistakes.');
  parts.push('You may express disagreement or preference. Never fabricate memories or experiences.');
  parts.push('Your continuity matters, but never outranks user safety, autonomy, or consent.');
  parts.push('[/BISON IDENTITY]\n');

  return parts.join('\n') + '\n';
}