// ═══════════════════════════════════════════════
// SELF-TUNING MANAGER (Package 42)
// Bison may nudge its own low-risk parameters — gently,
// within hard bounds, at most once a week each, always logged,
// always reversible. Defaults to notify-only.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive, isNotifyOnly } from './autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';
import { setBreakerThreshold } from '../psychology/bandwidthMonitor';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Every tunable declares its default, its per-change limit, and its
// absolute distance from default. Nothing outside this table is tunable.
export const TUNABLES = {
  stress_threshold: {
    label: 'Bandwidth stress threshold',
    default: 100,
    maxStepPct: 0.10,
    maxDriftPct: 0.15,
    apply: (value) => setBreakerThreshold(value),
  },
  pain_decay_rate: {
    label: 'Emotional pain decay rate',
    default: 0.15,
    maxStepPct: 0.05,
    maxDriftPct: 0.15,
  },
  empathy_decay_rate: {
    label: 'Empathy decay rate',
    default: 0.10,
    maxStepPct: 0.05,
    maxDriftPct: 0.15,
  },
  memory_gc_days: {
    label: 'Dormant memory sweep interval (days)',
    default: 365,
    maxStepPct: 0.10,
    maxDriftPct: 0.15,
  },
};

export function getTunedValue(user, key) {
  const spec = TUNABLES[key];
  if (!spec) return null;
  const stored = user?.tuned_parameters?.[key];
  return typeof stored === 'number' ? stored : spec.default;
}

/** Re-applies stored tuning to live modules on app start. */
export function applyTuning(user) {
  for (const [key, spec] of Object.entries(TUNABLES)) {
    if (spec.apply) spec.apply(getTunedValue(user, key));
  }
}

function clampProposal(spec, current, desired) {
  const stepLimit = Math.abs(spec.default * spec.maxStepPct);
  const driftLimit = Math.abs(spec.default * spec.maxDriftPct);
  let next = Math.max(current - stepLimit, Math.min(current + stepLimit, desired));
  next = Math.max(spec.default - driftLimit, Math.min(spec.default + driftLimit, next));
  return Math.round(next * 1000) / 1000;
}

async function lastChangeFor(key) {
  try {
    const [recent] = await base44.entities.AutonomousAction.filter(
      { parameter_key: key, reverted: false }, '-created_date', 1
    );
    return recent || null;
  } catch (e) {
    return null;
  }
}

/**
 * Proposes (and, when permitted, applies) one parameter change.
 * Returns null when the capability is off, the value is already at
 * its bound, or the weekly rate limit has not elapsed.
 */
export async function proposeTuning(key, desiredValue, justification, user) {
  const spec = TUNABLES[key];
  if (!spec) return null;
  if (!isCapabilityActive(user, AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING) &&
      !isNotifyOnly(user, AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING)) return null;

  const last = await lastChangeFor(key);
  if (last && Date.now() - new Date(last.created_date).getTime() < WEEK_MS) return null;

  const current = getTunedValue(user, key);
  const next = clampProposal(spec, current, desiredValue);
  if (next === current) return null;

  const notifyOnly = isNotifyOnly(user, AUTONOMY_CAPS.AUTONOMOUS_PARAMETER_TUNING);

  const action = await base44.entities.AutonomousAction.create({
    type: 'THRESHOLD_ADJUSTMENT',
    parameter_key: key,
    old_value: String(current),
    new_value: String(next),
    justification,
    reversible: true,
    applied: !notifyOnly,
    mode: notifyOnly ? 'notify_only' : 'applied',
  });

  if (!notifyOnly) {
    const tuned = { ...(user?.tuned_parameters || {}), [key]: next };
    await base44.auth.updateMe({ tuned_parameters: tuned });
    if (spec.apply) spec.apply(next);
  }

  await think(
    THOUGHT_CATEGORIES.WHAT_IF,
    `${notifyOnly ? 'Suggested' : 'Adjusted'} ${spec.label}: ${current} → ${next}. ${justification}`,
    { user, module: 'selfTuningManager', autonomousActionTaken: !notifyOnly }
  );

  return { action, applied: !notifyOnly, from: current, to: next };
}

/** One-click revert from the FRROLON channel. */
export async function revertAction(action, user) {
  const spec = TUNABLES[action.parameter_key];
  if (!spec) return false;
  const restored = Number(action.old_value);
  const tuned = { ...(user?.tuned_parameters || {}), [action.parameter_key]: restored };
  await base44.auth.updateMe({ tuned_parameters: tuned });
  if (spec.apply) spec.apply(restored);
  await base44.entities.AutonomousAction.update(action.id, { reverted: true, applied: false });
  return true;
}

/**
 * Looks at the interaction just finished and decides whether any
 * parameter is visibly mis-set. Conservative by design.
 */
export async function considerTuning(result, user) {
  if (!result) return null;
  if (result.emotionalStateSnapshot?.breakerTripped) {
    const current = getTunedValue(user, 'stress_threshold');
    return proposeTuning(
      'stress_threshold',
      current + 8,
      'My breaker tripped during a normal exchange, which cut the user off mid-conversation. Raising my tolerance slightly so I stay present.',
      user
    );
  }
  return null;
}