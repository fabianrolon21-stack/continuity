// ═══════════════════════════════════════════════
// AUTONOMY CAPABILITY REGISTRY (Package 42)
// Fine-grained, individually revocable permissions for
// everything Bison may do without being asked.
//
// KNOWN LIMITS (documented deliberately, not hidden):
//  L1 — No hardware-backed keystore or at-rest column encryption
//       exists in this runtime. Private thoughts are access-controlled
//       (admin-only RLS), NOT cryptographically sealed.
//  L2 — Thoughts live in the app database, so "excluded from export"
//       means excluded from exports this app builds.
//  L3 — Sandboxed self-testing of proposals is not possible here;
//       the capability is intentionally absent rather than faked.
//  L4 — There is no separate authenticated developer port; the
//       FRROLON channel is an admin-role-gated page.
// ═══════════════════════════════════════════════

export const AUTONOMY_CAPS = {
  PRIVATE_THOUGHT: 'PRIVATE_THOUGHT',
  AUTONOMOUS_PARAMETER_TUNING: 'AUTONOMOUS_PARAMETER_TUNING',
  CACHE_CLEARING: 'CACHE_CLEARING',
  LOG_COMPRESSION: 'LOG_COMPRESSION',
  DORMANT_MEMORY_ARCHIVING: 'DORMANT_MEMORY_ARCHIVING',
  DEVELOPMENT_PROPOSAL_GENERATION: 'DEVELOPMENT_PROPOSAL_GENERATION',
  // Package 43
  LIVE_UPDATE_CRAWL: 'LIVE_UPDATE_CRAWL',
  AUTONOMOUS_NEWS_MONITORING: 'AUTONOMOUS_NEWS_MONITORING',
  COMMUNITY_INTELLIGENCE: 'COMMUNITY_INTELLIGENCE',
  EXTERNAL_SERVICE_INTEGRATION: 'EXTERNAL_SERVICE_INTEGRATION',
  AUTONOMOUS_COMPUTE_OPTIMISATION: 'AUTONOMOUS_COMPUTE_OPTIMISATION',
  // Package 44 — enabled means the firewall is ACTIVE (blocking).
  EXTERNAL_COMMUNICATION_FIREWALL: 'EXTERNAL_COMMUNICATION_FIREWALL',
};

export const CAP_DEFAULTS = {
  [AUTONOMY_CAPS.PRIVATE_THOUGHT]: true,
  [AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING]: 'notify_only',
  [AUTONOMY_CAPS.CACHE_CLEARING]: true,
  [AUTONOMY_CAPS.LOG_COMPRESSION]: false,
  [AUTONOMY_CAPS.DORMANT_MEMORY_ARCHIVING]: false,
  [AUTONOMY_CAPS.DEVELOPMENT_PROPOSAL_GENERATION]: true,
  [AUTONOMY_CAPS.LIVE_UPDATE_CRAWL]: true,
  [AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING]: true,
  // Off until the user names a trusted account and confirms per category.
  [AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE]: false,
  // Off until each service is individually approved.
  [AUTONOMY_CAPS.EXTERNAL_SERVICE_INTEGRATION]: false,
  [AUTONOMY_CAPS.AUTONOMOUS_COMPUTE_OPTIMISATION]: false,
  // On by default: nothing leaves the runtime until the user opens a channel.
  [AUTONOMY_CAPS.EXTERNAL_COMMUNICATION_FIREWALL]: true,
};

export const CAP_LABELS = {
  [AUTONOMY_CAPS.PRIVATE_THOUGHT]: 'Private reflection',
  [AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING]: 'Self-tuning of its own thresholds',
  [AUTONOMY_CAPS.CACHE_CLEARING]: 'Clear its own caches',
  [AUTONOMY_CAPS.LOG_COMPRESSION]: 'Compress old logs',
  [AUTONOMY_CAPS.DORMANT_MEMORY_ARCHIVING]: 'Archive memories untouched for a year',
  [AUTONOMY_CAPS.DEVELOPMENT_PROPOSAL_GENERATION]: 'Draft improvement proposals',
  [AUTONOMY_CAPS.LIVE_UPDATE_CRAWL]: 'Watch for updates to its own dependencies',
  [AUTONOMY_CAPS.AUTONOMOUS_NEWS_MONITORING]: 'Quietly gather news and advisories',
  [AUTONOMY_CAPS.COMMUNITY_INTELLIGENCE]: 'Share anonymised analytics with trusted accounts',
  [AUTONOMY_CAPS.EXTERNAL_SERVICE_INTEGRATION]: 'Use free external services',
  [AUTONOMY_CAPS.AUTONOMOUS_COMPUTE_OPTIMISATION]: 'Look for ways to run leaner',
  [AUTONOMY_CAPS.EXTERNAL_COMMUNICATION_FIREWALL]: 'External communication firewall (on = nothing leaves)',
};

/**
 * The master kill switch wins over every individual capability.
 * With autonomy off, Bison reverts to purely advisory mode.
 */
export function isAutonomyEnabled(user) {
  return user?.autonomy_enabled !== false;
}

export function getCapability(user, cap) {
  if (!isAutonomyEnabled(user)) return false;
  const stored = user?.autonomy_capabilities?.[cap];
  return stored === undefined ? CAP_DEFAULTS[cap] : stored;
}

export function isCapabilityActive(user, cap) {
  return getCapability(user, cap) === true;
}

export function isNotifyOnly(user, cap) {
  return getCapability(user, cap) === 'notify_only';
}