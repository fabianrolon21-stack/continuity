// ═══════════════════════════════════════════════
// META CYCLE (Package 42)
// The one entry point the pipeline calls after a reply has
// already gone out. Everything here is fire-and-forget: Bison's
// self-improvement must never delay or alter the user's answer.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { think, summariseInteraction, detectAnomaly, THOUGHT_CATEGORIES } from './privateThoughtEngine';
import { considerTuning, applyTuning } from '../autonomy/selfTuningManager';
import { runMaintenance } from '../autonomy/preventiveMaintenance';
import { generateProposal } from '../improvement/proposalGenerator';
import { isAutonomyEnabled } from '../autonomy/autonomyCapabilities';
import { crawlForUpdates } from '../updates/liveUpdateCrawler';
import { processPending } from '../updates/updateManager';
import { runAwarenessSweep } from '../autonomy/autonomousAwarenessEngine';

let bootstrapped = false;

export async function runPostInteraction(userInput, result) {
  try {
    const user = await base44.auth.me();
    if (!isAutonomyEnabled(user)) return;

    // First interaction of the session: restore tuning, then housekeep.
    if (!bootstrapped) {
      bootstrapped = true;
      applyTuning(user);
      runMaintenance(user).catch(() => {});
      // Package 43 sweeps — rate-limited internally (6h / 12h), so this
      // is a no-op on most sessions and never blocks the conversation.
      crawlForUpdates(user).then(found => {
        if (found?.length) processPending(user).catch(() => {});
      }).catch(() => {});
      runAwarenessSweep(user).catch(() => {});
    }

    await think(THOUGHT_CATEGORIES.REFLECTION, summariseInteraction(userInput, result), {
      user, module: 'pipeline',
    });

    const anomaly = detectAnomaly(result);
    if (anomaly) {
      await think(THOUGHT_CATEGORIES.ANOMALY_FLAG, anomaly, { user, module: 'pipeline', severity: 'notable' });
      await considerTuning(result, user).catch(() => {});
      await generateProposal(user).catch(() => {});
    }
  } catch (e) {
    // Silence is correct here — this is Bison's interior life, not the user's problem.
  }
}