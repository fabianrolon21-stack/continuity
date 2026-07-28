// ═══════════════════════════════════════════════
// UPDATE REGISTRY (Package 43)
// The read-only, auditable list of what Bison watches.
// Nothing outside this table can be checked, staged, or reported.
//
// HONEST LIMITS (documented, not hidden):
//  U1 — There is no Ed25519 signature verification in this runtime.
//       Integrity comes from the registry's own published SRI hash
//       over HTTPS, which is weaker than a signed release feed.
//  U2 — There is no filesystem and no sandbox instance, so nothing
//       is ever downloaded and no update is ever self-installed.
//       Bison reports; frrolon deploys. That boundary is structural.
//  U3 — "Sandbox test" here means a static risk review, clearly
//       labelled as such rather than dressed up as a test run.
// ═══════════════════════════════════════════════

export const UPDATE_SOURCE = 'registry.npmjs.org';

// Installed versions, kept in one place so a drift is visible in review.
export const WATCHED_PACKAGES = [
  { name: 'react', installed: '18.2.0', role: 'UI runtime', risk: 'high' },
  { name: 'react-dom', installed: '18.2.0', role: 'UI runtime', risk: 'high' },
  { name: 'react-router-dom', installed: '6.26.0', role: 'Routing', risk: 'medium' },
  { name: 'framer-motion', installed: '11.16.4', role: 'Animation', risk: 'low' },
  { name: 'recharts', installed: '2.15.4', role: 'Charts', risk: 'low' },
  { name: 'three', installed: '0.171.0', role: '3D scenes', risk: 'low' },
  { name: 'date-fns', installed: '3.6.0', role: 'Date handling', risk: 'low' },
  { name: 'lodash', installed: '4.17.21', role: 'Utilities', risk: 'medium' },
  { name: 'zod', installed: '3.24.2', role: 'Validation', risk: 'medium' },
  { name: 'lucide-react', installed: '0.475.0', role: 'Icons', risk: 'low' },
  { name: '@tanstack/react-query', installed: '5.84.1', role: 'Data fetching', risk: 'medium' },
];

// Free, no-sign-in services Bison may suggest. Curated and static —
// it cannot add to this list on its own.
export const FREE_SERVICE_DIRECTORY = [
  { id: 'wikipedia', name: 'Wikipedia REST', use: 'Factual reference lookups', signIn: false },
  { id: 'translate', name: 'LibreTranslate', use: 'Open-source translation', signIn: false },
  { id: 'weather', name: 'Open-Meteo', use: 'Forecasts without an API key', signIn: false },
  { id: 'osv', name: 'OSV.dev', use: 'Open vulnerability database for dependencies', signIn: false },
  { id: 'npm_registry', name: 'npm registry', use: 'Published versions and integrity hashes', signIn: false },
];

export function getWatched(name) {
  return WATCHED_PACKAGES.find(p => p.name === name) || null;
}

/** Plain semver compare — returns true when `candidate` is newer. */
export function isNewer(candidate, installed) {
  const parse = (v) => String(v || '').replace(/^[^\d]*/, '').split('.').map(n => parseInt(n, 10) || 0);
  const [a1, a2, a3] = parse(candidate);
  const [b1, b2, b3] = parse(installed);
  if (a1 !== b1) return a1 > b1;
  if (a2 !== b2) return a2 > b2;
  return a3 > b3;
}

export function severityOf(candidate, installed, risk) {
  const major = parseInt(String(candidate).split('.')[0], 10) !== parseInt(String(installed).split('.')[0], 10);
  if (major && risk === 'high') return 'major-breaking';
  if (major) return 'major';
  return 'minor';
}