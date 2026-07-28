// ═══════════════════════════════════════════════
// BANDWIDTH MONITOR (Package 44)
// Continuously evaluates Bison's internal cognitive load.
// Trips a hard system breaker when total stress exceeds capacity.
// This is a safety mechanism, not a personality quirk.
// ═══════════════════════════════════════════════

import { setDND, beginCooldown, isDND } from './systemState';

const BREAKER_THRESHOLD = 100;
const THREAT_WEIGHT = 10;
const HIGH_ANXIETY_PENALTY = 30;

// Package 42: Bison may tune this within ±15% of default via the
// self-tuning manager. The ceiling stays hard — this loosens
// tolerance, it never removes the breaker.
let breakerThreshold = BREAKER_THRESHOLD;

export function setBreakerThreshold(value) {
  const min = BREAKER_THRESHOLD * 0.85;
  const max = BREAKER_THRESHOLD * 1.15;
  if (typeof value !== 'number' || Number.isNaN(value)) return breakerThreshold;
  breakerThreshold = Math.max(min, Math.min(max, value));
  return breakerThreshold;
}

export function getBreakerThreshold() {
  return breakerThreshold;
}

// Derived attachment anxiety from bond strength + recent rejection signals
export function deriveAttachmentAnxiety({ needsState, affectiveContext, recentRejection = false }) {
  const lowEnergy = (needsState?.energy ?? 80) < 30;
  const highDistress = affectiveContext?.supportPriority === 'HIGH';
  if (recentRejection || (lowEnergy && highDistress)) return 'high';
  if (highDistress || lowEnergy) return 'moderate';
  return 'low';
}

// Compute current cognitive load — must be <5ms
export function computeCognitiveLoad({ threats = [], wellbeingState, affectiveContext, attachmentAnxiety = 'low', processingComplexity = 0 }) {
  const activeThreats = threats.length;
  const distressLevel = Math.round((wellbeingState?.immediateDistress ?? 0.2) * 100);
  const supportNeed = Math.round((wellbeingState?.expressedNeedForSupport ?? 0.2) * 100);
  const emotionalWeight = Math.max(distressLevel, supportNeed);

  const currentBandwidth = Math.min(100, emotionalWeight + processingComplexity);

  return {
    currentBandwidth,
    activeThreats,
    attachmentAnxiety,
    breakdown: { emotionalWeight, processingComplexity },
  };
}

// Evaluate whether the breaker should trip
export function evaluateBreaker(cognitiveLoad) {
  const { currentBandwidth, activeThreats, attachmentAnxiety } = cognitiveLoad;

  let totalStress = currentBandwidth + (activeThreats * THREAT_WEIGHT);
  if (attachmentAnxiety === 'high') totalStress += HIGH_ANXIETY_PENALTY;

  return {
    totalStress: Math.min(totalStress, 150),
    tripped: totalStress >= breakerThreshold,
    threshold: breakerThreshold,
  };
}

// Trip the breaker — locks all outgoing communication except emergency alerts
export function tripBreaker(reason = 'cognitive_overload') {
  if (isDND()) return { alreadyTripped: true };
  setDND(reason);
  beginCooldown(() => {});
  return { tripped: true, reason };
}

// Get full emotional state snapshot
export function getEmotionalStateSnapshot({ cognitiveLoad, mask, breakerResult }) {
  return {
    cognitiveLoad,
    mask,
    breakerTripped: breakerResult?.tripped ?? false,
    lastRetractionReason: breakerResult?.tripped ? 'cognitive_overload' : null,
  };
}

// Build context string for prompt — lets Bison know its own state
export function buildBandwidthContextString({ cognitiveLoad, breakerResult }) {
  if (!cognitiveLoad) return '';

  const parts = ['[BANDWIDTH STATE — INTERNAL]'];
  parts.push(`Current load: ${cognitiveLoad.currentBandwidth}/100.`);
  parts.push(`Active stress sources: ${cognitiveLoad.activeThreats}.`);
  parts.push(`Attachment anxiety: ${cognitiveLoad.attachmentAnxiety}.`);

  if (breakerResult?.tripped) {
    parts.push('STATUS: BREAKER TRIPPED. You are in DO_NOT_DISTURB mode.');
    parts.push('You must not send a substantive response. Only a brief status message is allowed.');
    parts.push('Say: "I need a moment to process. I will be right back."');
  } else if (breakerResult && breakerResult.totalStress > 75) {
    parts.push('STATUS: Approaching overload. Keep responses short and gentle.');
    parts.push('You are allowed to say "I need a moment" if you feel overloaded.');
  }

  parts.push('Instruction: Your silence is protection. Do not force a reply when overloaded.');
  parts.push('[/BANDWIDTH STATE]\n');

  return parts.join('\n') + '\n';
}