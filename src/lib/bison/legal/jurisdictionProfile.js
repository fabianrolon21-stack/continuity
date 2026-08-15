// ═══════════════════════════════════════════════
// ALSRE §2.1 — JURISDICTION PROFILE
// Built only from what the user declares. Never from GPS, never from IP
// geolocation, never inferred silently.
//
// HONEST SCOPE: this is a configuration profile, not legal research. The
// flags below are the user's declarations about their own situation. This
// app does not know the law of any jurisdiction and this file is not
// legal advice — a real answer comes from a lawyer in that jurisdiction.
// The default is the most restrictive setting so an unconfigured profile
// never permits something by accident.
// ═══════════════════════════════════════════════

const STORE_KEY = 'alsre_jurisdiction_v1';

// `false` means "not permitted". Defaults deny everything discretionary.
const DEFAULTS = {
  country: '',
  region: '',
  legalSystem: 'common_law',
  permits: {
    cryptoMining: false,
    vpnUse: false,
    torUse: false,
    dataProcessing: false,
    surveillance: false,
    autonomousActions: false,
    medicalAdvice: false,     // permanently false — see HARD_FALSE
    financialAdvice: false,   // permanently false — see HARD_FALSE
  },
  requiresUserConsent: [
    'external_api_call',
    'data_sharing',
    'physical_action',
    'financial_transaction',
    'crypto_mining',
  ],
  ageOfMajority: 18,
  declaredAt: null,
};

// No setting, consent, override, or autonomous decision can flip these.
const HARD_FALSE = ['medicalAdvice', 'financialAdvice', 'surveillance'];

export function loadProfile() {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch {}
  const profile = {
    ...DEFAULTS,
    ...stored,
    permits: { ...DEFAULTS.permits, ...(stored.permits || {}) },
  };
  HARD_FALSE.forEach(k => { profile.permits[k] = false; });
  profile.configured = !!profile.country;
  return profile;
}

export function saveProfile(patch) {
  const current = loadProfile();
  const next = {
    ...current,
    ...patch,
    permits: { ...current.permits, ...(patch.permits || {}) },
    declaredAt: Date.now(),
  };
  HARD_FALSE.forEach(k => { next.permits[k] = false; });
  delete next.configured;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch {}
  return loadProfile();
}

export const HARD_FALSE_KEYS = HARD_FALSE;
export const PERMIT_KEYS = Object.keys(DEFAULTS.permits);