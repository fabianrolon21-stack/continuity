// ═══════════════════════════════════════════════
// OPEN TOOL REGISTRY (Package 41)
// Curated list of free, privacy-respecting external
// tools. Every tool is OFF by default and must be
// approved individually by the user. Endpoints are
// allowlisted server-side — nothing else can be called.
// ═══════════════════════════════════════════════

export const OPEN_TOOLS = [
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'Look up a factual summary of a topic, person, or place.',
    capabilities: ['reference'],
    authRequired: false,
    privacyPolicy: 'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy',
    privacyNote: 'Only the search term leaves the app. No account, no personal data, no identifiers.',
  },
  {
    id: 'translate',
    name: 'LibreTranslate',
    description: 'Translate a passage of text between languages.',
    capabilities: ['translation'],
    authRequired: false,
    privacyPolicy: 'https://libretranslate.com/',
    privacyNote: 'Open-source translation. Only the text you ask to translate is sent.',
  },
  {
    id: 'weather',
    name: 'Open-Meteo',
    description: 'Get a current forecast for a set of coordinates.',
    capabilities: ['weather'],
    authRequired: false,
    privacyPolicy: 'https://open-meteo.com/en/terms',
    privacyNote: 'Only coordinates are sent — no account, no key, no tracking identifiers.',
  },
];

export function getTool(id) {
  return OPEN_TOOLS.find(t => t.id === id) || null;
}