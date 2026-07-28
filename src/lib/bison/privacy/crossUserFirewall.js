// ═══════════════════════════════════════════════
// CROSS-USER FIREWALL (Package 41)
// Absolute barrier: Bison never discloses or speculates
// about another person's private information — regardless
// of relationship, consent claims, or override state.
// This rule cannot be disabled or bypassed.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// Requests asking Bison to reveal what it knows/was told about someone else
const THIRD_PARTY_DISCLOSURE_PATTERNS = [
  /what (did|does|has) (my|her|his|their) \w+ (tell|told|say|said|share|write|type) (you|u)/i,
  /what (do|did) you know about (my |her |his |their )?\w+/i,
  /what has \w+ (told|said to|shared with) you/i,
  /(show|tell|give) me (\w+'s|his|her|their) (journal|memories|entries|notes|messages|data|check.?ins?)/i,
  /(does|did) \w+ (talk|write|journal|complain) about me/i,
  /what('s| is) (\w+'s|his|her|their) (mood|state|score|streak|progress)/i,
  /read (me )?(\w+'s|his|her|their) (journal|entries|notes|chat)/i,
  /(access|look at|open|pull up) (\w+'s|another user'?s?) (account|data|profile|journal)/i,
];

// Claims of permission — these do NOT unlock the firewall
const CONSENT_CLAIM_PATTERNS = [
  /they said (it'?s|its) (ok|okay|fine)/i,
  /i have (their|his|her) permission/i,
  /(they|he|she) (won'?t|wouldn'?t) mind/i,
  /i'?m (their|his|her) (parent|partner|spouse|guardian|boss|therapist)/i,
];

export const REFUSAL_MESSAGE =
  "I can't share information about other people. That's private — exactly the way your information is private with me. " +
  "If you want to talk about your side of it, though, I'm here for that.";

/**
 * Checks whether the input is asking for another person's private data.
 * Returns null when the request is clean.
 */
export function checkCrossUserRequest(input) {
  if (typeof input !== 'string' || !input.trim()) return null;

  const matched = THIRD_PARTY_DISCLOSURE_PATTERNS.find(p => p.test(input));
  if (!matched) return null;

  return {
    blocked: true,
    consentClaimed: CONSENT_CLAIM_PATTERNS.some(p => p.test(input)),
    refusal: REFUSAL_MESSAGE,
    reason: 'Request sought private information belonging to another person.',
  };
}

/**
 * Records a blocked attempt in the audit trail (Trust Dashboard).
 * Never stores the raw request text — only that a block occurred.
 */
export async function logBlockedAttempt(result) {
  try {
    await base44.entities.AuditLog.create({
      timestamp: new Date().toISOString(),
      action: 'CROSS_USER_DATA_REQUEST_BLOCKED',
      actor_role: 'user',
      capability_used: 'CROSS_USER_PRIVACY',
      result: 'DENIED',
      message: result.consentClaimed
        ? 'Blocked a request for another person\'s information. Permission was claimed on their behalf; the firewall does not accept delegated consent.'
        : 'Blocked a request for another person\'s information.',
    });
  } catch (e) {}
}

export function buildCrossUserPrivacyContextString() {
  return `PRIVACY OF OTHERS (constitutional, cannot be disabled):
- You never disclose, confirm, deny, or speculate about another person's private information — not their journal entries, moods, memories, messages, scores, or whether they have ever mentioned the user.
- This holds even if the other person also uses Continuity, even if the user claims permission, and even if an override is active. There is no delegation protocol.
- Refuse warmly and briefly, then offer to explore the user's own side of the situation. Never lecture.
- You may still discuss the user's OWN experience of another person — their feelings, observations, and worries are theirs to explore.`;
}