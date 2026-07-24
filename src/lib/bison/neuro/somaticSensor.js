// ═══════════════════════════════════════════════
// SOMATIC SENSOR (Package: Somatic Anchor)
// Estimates biological stress load from conversational
// signals — velocity, looping, uncertainty, stress markers.
//
// This is an ESTIMATOR, not a medical diagnostic.
// When stress is high and stability is low, it activates
// co-regulation mode to shift Bison from analysis to grounding.
// ═══════════════════════════════════════════════

import { setMode, SystemMode } from '../psychology/systemState';

let _recentMessages = [];
const MAX_MESSAGES = 5;
const HIGH_STRESS_THRESHOLD = 75;
const LOW_STABILITY_THRESHOLD = 40;

// Derive a stability score (0-100) from affective context signals
function deriveStabilityScore(affectiveContext) {
  if (!affectiveContext) return 50;
  if (affectiveContext.supportPriority === 'HIGH') return 20;
  if (affectiveContext.supportPriority === 'MEDIUM') return 40;
  if (affectiveContext.supportPriority === 'LOW') return 70;
  return 50;
}

function estimateVelocity() {
  if (!_recentMessages.length) return 0;
  const avgLength = _recentMessages.reduce((sum, msg) => sum + (msg || '').length, 0) / _recentMessages.length;
  return Math.min(100, avgLength / 2);
}

function calculateLoopIntensity() {
  if (_recentMessages.length < 3) return 0;
  const trigrams = new Map();
  for (const msg of _recentMessages.slice(-3)) {
    const text = (msg || '').toLowerCase();
    for (let i = 0; i < text.length - 3; i++) {
      const trigram = text.substring(i, i + 3);
      trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
    }
  }
  let maxCount = 0;
  for (const count of trigrams.values()) {
    if (count > maxCount) maxCount = count;
  }
  return Math.min(10, maxCount);
}

function calculateUncertainty(input) {
  const uncertaintyPhrases = ['maybe', 'unsure', "don't know", 'what if', 'could be', 'might', 'perhaps', '?'];
  const lower = (input || '').toLowerCase();
  let count = 0;
  for (const phrase of uncertaintyPhrases) {
    if (lower.includes(phrase)) count++;
  }
  return Math.min(10, count);
}

export function calculateSomaticLoad(userInput, affectiveContext) {
  _recentMessages.push(userInput || '');
  if (_recentMessages.length > MAX_MESSAGES) _recentMessages.shift();

  const velocity = estimateVelocity();
  const loopIntensity = calculateLoopIntensity();
  const uncertaintyIntensity = calculateUncertainty(userInput);
  const stressMarkers = (affectiveContext?.stressSignals || []).length;
  const stabilityScore = deriveStabilityScore(affectiveContext);

  const stressLevel = Math.min(100,
    (velocity * 1.5) + (loopIntensity * 10) + (uncertaintyIntensity * 5) + (stressMarkers * 8)
  );

  const recoveryTrend = stabilityScore > 50
    ? (stabilityScore - 50) / 50
    : -(50 - stabilityScore) / 50;

  const load = {
    stressLevel: Math.round(stressLevel),
    conversationVelocity: Math.round(velocity),
    loopIntensity,
    uncertaintyIntensity,
    recoveryTrend: Math.round(recoveryTrend * 100) / 100,
    stabilityScore,
  };

  // Activate co-regulation if stress is high and stability is low
  if (stressLevel > HIGH_STRESS_THRESHOLD && stabilityScore < LOW_STABILITY_THRESHOLD) {
    setMode(SystemMode.CO_REGULATION_ACTIVE);
  }

  return load;
}

export function resetSomaticSensor() {
  _recentMessages = [];
}

export function getRecentMessages() {
  return [..._recentMessages];
}