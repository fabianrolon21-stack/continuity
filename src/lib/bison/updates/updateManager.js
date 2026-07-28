// ═══════════════════════════════════════════════
// UPDATE MANAGER (Package 43)
// Owns the lifecycle: DISCOVERED → VERIFIED → SANDBOX_TESTED
// → STAGED → APPROVED → DEPLOYED (or SANDBOX_FAILED / ROLLED_BACK).
//
// THE HARD BOUNDARY (limit U2): Bison cannot write app code and has
// no filesystem, so "DEPLOYED" records that frrolon deployed it — it
// is never Bison applying its own patch. Every promotion past STAGED
// requires an admin. This is deliberate: an approval mechanism with a
// flaw would be the single most dangerous bug in the system.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from '../autonomy/autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { getWatched } from './updateRegistry';

export const UPDATE_STAGES = ['DISCOVERED', 'VERIFIED', 'SANDBOX_TESTED', 'SANDBOX_FAILED', 'STAGED', 'APPROVED', 'DEPLOYED', 'ROLLED_BACK', 'DISMISSED'];

/**
 * Static risk review standing in for a sandbox run (limit U3).
 * Labelled honestly — it reasons about the change, it does not execute it.
 */
export function reviewStage(stage) {
  const watched = getWatched(stage.package_name);
  const majorJump = parseInt(stage.current_version, 10) !== parseInt(stage.discovered_version, 10);

  if (!stage.verified) {
    return { passed: false, notes: 'No integrity hash was published for this version. Refusing to stage an unverifiable update.' };
  }
  if (majorJump && watched?.risk === 'high') {
    return {
      passed: false,
      notes: `Major version jump on ${watched.role}, which the whole app renders through. A static review cannot clear this — it needs a real branch build and a manual pass. Not staging.`,
    };
  }
  return {
    passed: true,
    notes: `Static review only — no sandbox instance exists in this runtime, so this is reasoning, not a test run. ${majorJump ? 'Major version jump: read the upstream changelog before merging.' : 'Within-major update; API surface expected to hold.'} Integrity hash present and recorded.`,
  };
}

/** Verified → tested → staged (or failed). Stops at STAGED, always. */
export async function processStage(stage, user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.LIVE_UPDATE_CRAWL)) return stage;
  if (!['DISCOVERED', 'VERIFIED'].includes(stage.stage)) return stage;

  const review = reviewStage(stage);
  const next = review.passed ? 'STAGED' : 'SANDBOX_FAILED';

  const updated = await base44.entities.UpdateStage.update(stage.id, {
    stage: next,
    test_notes: review.notes,
    checkpoint: `Pre-deployment checkpoint: ${stage.package_name}@${stage.current_version}`,
  }).catch(() => null);

  await think(
    review.passed ? THOUGHT_CATEGORIES.REFLECTION : THOUGHT_CATEGORIES.ANOMALY_FLAG,
    review.passed
      ? `Staged ${stage.package_name}@${stage.discovered_version} for review. Awaiting frrolon. I will not deploy it.`
      : `Refused to stage ${stage.package_name}@${stage.discovered_version}: ${review.notes}`,
    { user, module: 'updateManager', severity: review.passed ? 'routine' : 'notable' }
  );

  return updated || stage;
}

/** Runs the whole queue after a crawl. */
export async function processPending(user) {
  const pending = await base44.entities.UpdateStage
    .filter({ verified: true, stage: 'VERIFIED' }, '-created_date', 10)
    .catch(() => []);
  const out = [];
  for (const s of pending || []) out.push(await processStage(s, user));
  return out;
}

// ── Admin-only promotions. Called from the FRROLON channel. ──

export async function approveStage(stage, adminUser) {
  if (adminUser?.role !== 'admin') return null;
  return base44.entities.UpdateStage.update(stage.id, {
    stage: 'APPROVED',
    approved_by: adminUser.email || adminUser.id,
  });
}

export async function markDeployed(stage, adminUser) {
  if (adminUser?.role !== 'admin') return null;
  return base44.entities.UpdateStage.update(stage.id, { stage: 'DEPLOYED', deployed: true });
}

export async function rollbackStage(stage, adminUser) {
  if (adminUser?.role !== 'admin') return null;
  return base44.entities.UpdateStage.update(stage.id, { stage: 'ROLLED_BACK', deployed: false });
}

export async function dismissStage(stage, adminUser) {
  if (adminUser?.role !== 'admin') return null;
  return base44.entities.UpdateStage.update(stage.id, { stage: 'DISMISSED' });
}

export function buildUpdateContextString(staged) {
  if (!staged?.length) return null;
  const lines = staged.map(s => `- ${s.package_name}: ${s.current_version} → ${s.discovered_version} (${s.stage})`).join('\n');
  return `UPDATE STATUS:
${staged.length} verified update(s) are staged and waiting on frrolon's review:
${lines}

HOW TO SPEAK ABOUT THIS:
- If the user is the developer, mention plainly that updates are staged and offer the Developer page for review.
- If the user is not the developer, do not raise it unless they ask. It is not their errand.
- Never claim you installed, deployed, or patched anything. You watch and report; frrolon deploys. Say so if asked.`;
}