// ═══════════════════════════════════════════════
// LIVE UPDATE CRAWLER (Package 43)
// Checks the watched dependency manifest against the public
// registry every six hours. Reads only version metadata.
//
// Never fetches an arbitrary URL — the gateway function holds a
// hard allowlist, so even a compromised client cannot redirect it.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from '../autonomy/autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { WATCHED_PACKAGES, UPDATE_SOURCE, isNewer, severityOf } from './updateRegistry';

const CRAWL_INTERVAL_MS = 6 * 60 * 60 * 1000;

function dueForCrawl(user) {
  const last = user?.last_update_crawl;
  return !last || Date.now() - new Date(last).getTime() > CRAWL_INTERVAL_MS;
}

/**
 * Returns the newly discovered UpdateStage records, or null when the
 * capability is off or the interval has not elapsed. Silent on failure —
 * a registry being down is not the user's problem.
 */
export async function crawlForUpdates(user, { force = false } = {}) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.LIVE_UPDATE_CRAWL)) return null;
  if (!force && !dueForCrawl(user)) return null;

  let results = [];
  try {
    const res = await base44.functions.invoke('fetchUpdateFeed', {
      packages: WATCHED_PACKAGES.map(p => p.name),
    });
    results = res?.data?.results || [];
  } catch (e) {
    return null;
  }

  await base44.auth.updateMe({ last_update_crawl: new Date().toISOString() }).catch(() => {});

  const discovered = [];
  for (const r of results) {
    const watched = WATCHED_PACKAGES.find(p => p.name === r.name);
    if (!watched || r.error || !r.version) continue;
    if (!isNewer(r.version, watched.installed)) continue;

    // One open stage per package — no duplicate noise across crawls.
    const existing = await base44.entities.UpdateStage
      .filter({ package_name: r.name, discovered_version: r.version }, '-created_date', 1)
      .catch(() => []);
    if (existing?.length) continue;

    const severity = severityOf(r.version, watched.installed, watched.risk);
    const stage = await base44.entities.UpdateStage.create({
      package_name: r.name,
      current_version: watched.installed,
      discovered_version: r.version,
      integrity_hash: r.integrityHash || 'not published',
      source: UPDATE_SOURCE,
      verified: !!r.integrityHash,
      stage: r.integrityHash ? 'VERIFIED' : 'DISCOVERED',
      risk_notes: `${watched.role} (${watched.risk} risk). Change class: ${severity}.${r.deprecated ? ' Upstream marks this package deprecated.' : ''}`,
    }).catch(() => null);

    if (stage) discovered.push(stage);
  }

  if (discovered.length) {
    await think(
      THOUGHT_CATEGORIES.REFLECTION,
      `Crawl found ${discovered.length} newer dependency version(s): ${discovered.map(d => `${d.package_name}@${d.discovered_version}`).join(', ')}. I have staged them for frrolon. I cannot and will not install anything myself.`,
      { user, module: 'liveUpdateCrawler' }
    );
  }

  return discovered;
}

export async function listStages(limit = 25) {
  return base44.entities.UpdateStage.list('-created_date', limit).catch(() => []);
}

export async function pendingStageCount() {
  const stages = await base44.entities.UpdateStage
    .filter({ stage: 'STAGED' }, '-created_date', 10)
    .catch(() => []);
  return stages?.length || 0;
}