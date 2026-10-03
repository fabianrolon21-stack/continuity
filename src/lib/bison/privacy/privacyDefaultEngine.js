// ═══════════════════════════════════════════════
// SYSTEM 5 — PRIVACY DEFAULT PROTOCOL
// Encryption by default; any exception explicitly declared. Bison never
// silently downgrades privacy — a downgrade requires explicit user action.
// ═══════════════════════════════════════════════

export const PRIVACY_POSTURES = ['MAXIMUM', 'BALANCED', 'CUSTOM'];

export function getPrivacyPosture(user = {}) {
  const p = user?.privacy_posture;
  return PRIVACY_POSTURES.includes(p) ? p : 'MAXIMUM';
}

export const UNENCRYPTED_LABEL = '[UNENCRYPTED — visible to intermediaries]';
export const labelChannel = (encrypted) => (encrypted ? '[ENCRYPTED]' : UNENCRYPTED_LABEL);

const PRIVACY_QUERY = /\b(encrypt(ed|ion)?|is this (private|secure|safe)|who can (see|read)|can they (see|read)|secure|surveil|track(ed)?|monitor(ed)?)\b/i;

export function buildPrivacyPostureContext(posture, input) {
  if (!PRIVACY_QUERY.test(String(input || ''))) return null;
  const stance = posture === 'MAXIMUM'
    ? 'Privacy posture is MAXIMUM: encrypted by default at rest and in transit.'
    : posture === 'BALANCED'
      ? 'Privacy posture is BALANCED: default encryption, with clearly labelled exceptions where a channel requires otherwise.'
      : 'Privacy posture is CUSTOM: the user has chosen specific settings.';
  return `[PRIVACY POSTURE]
${stance} Any channel that is not encrypted is labelled in plain language: "${UNENCRYPTED_LABEL}". Never silently downgrade privacy — any downgrade requires explicit user action. State the real technical position accurately and never promise what the runtime cannot guarantee (third-party providers are outside your control).`;
}