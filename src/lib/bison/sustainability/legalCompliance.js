// ═══════════════════════════════════════════════
// SARG §3 — LEGAL COMPLIANCE CHECKER
// A deterministic rules engine over a jurisdiction the USER declares.
// Not legal advice, not geolocation-derived, and not authoritative.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// Deliberately small and dated. A three-entry table pretending to cover the
// world would be worse than no table, so unknown jurisdictions return UNKNOWN
// rather than a permissive default.
export const JURISDICTION_RULES = {
  US: { miningLegal: true, vpnLegal: true, torLegal: true, requiresRegistration: true, restrictions: ['State rules vary — some states regulate mining energy use.', 'Mining income is taxable; you are responsible for reporting it.'] },
  CA: { miningLegal: true, vpnLegal: true, torLegal: true, requiresRegistration: true, restrictions: ['Provincial energy rules may apply.'] },
  GB: { miningLegal: true, vpnLegal: true, torLegal: true, requiresRegistration: true, restrictions: ['Mining proceeds are taxable.'] },
  DE: { miningLegal: true, vpnLegal: true, torLegal: true, requiresRegistration: true, restrictions: ['Mining may be treated as commercial activity.'] },
  CN: { miningLegal: false, vpnLegal: false, torLegal: false, requiresRegistration: false, restrictions: ['Cryptocurrency mining is prohibited.', 'Unapproved VPN use is restricted.'] },
  DZ: { miningLegal: false, vpnLegal: true, torLegal: true, requiresRegistration: false, restrictions: ['Cryptocurrency activity is prohibited.'] },
  EG: { miningLegal: false, vpnLegal: true, torLegal: true, requiresRegistration: false, restrictions: ['Cryptocurrency activity requires a licence.'] },
};

export const RULES_META = {
  entries: Object.keys(JURISDICTION_RULES).length,
  lastReviewed: '2026-08',
  caveat: 'This table is hand-maintained, incomplete, and may be out of date. It is a guardrail, not legal advice. Verify locally before acting.',
};

export async function getDeclaredJurisdiction() {
  const user = await base44.auth.me().catch(() => null);
  return user?.sarg_jurisdiction || null;
}

export async function setDeclaredJurisdiction(code) {
  await base44.auth.updateMe({ sarg_jurisdiction: code || null }).catch(() => {});
  return code;
}

/**
 * @returns {{ jurisdiction, known, miningLegal, vpnLegal, torLegal, restrictions, requiresRegistration }}
 */
export async function checkCompliance() {
  const jurisdiction = await getDeclaredJurisdiction();
  if (!jurisdiction) {
    return {
      jurisdiction: 'UNDECLARED', known: false,
      miningLegal: false, vpnLegal: false, torLegal: false,
      requiresRegistration: false,
      restrictions: ['No jurisdiction declared. Nothing that depends on legality is permitted until you declare one.'],
    };
  }
  const rules = JURISDICTION_RULES[jurisdiction];
  if (!rules) {
    return {
      jurisdiction, known: false,
      miningLegal: false, vpnLegal: false, torLegal: false,
      requiresRegistration: false,
      restrictions: [`${jurisdiction} is not in the maintained table. Treated as not-permitted rather than assumed legal.`],
    };
  }
  return { jurisdiction, known: true, ...rules };
}