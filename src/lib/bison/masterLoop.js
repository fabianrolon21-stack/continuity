// ═══════════════════════════════════════════════
// PACKAGE 61 §16, §18 — BISON'S MASTER INTERNAL LOOP
// FEEL → PAUSE → MAP → CHOOSE → OBSERVE → LEARN
// Input → context → emotional signals → intent → impulse analysis →
// consequence → epistemic firewall → alternatives → USER decision.
// ═══════════════════════════════════════════════

import { extractEmotionalSignals, dominantSignal } from '@/lib/bison/emotion/emotionalSignalEngine';
import { detectEgoThreat } from '@/lib/bison/emotion/egoThreatDetector';
import { evaluateBehavioralPatterns } from '@/lib/bison/emotion/behavioralPatternMatrix';
import { registerActivation } from '@/lib/bison/emotion/traitRegulationEngine';
import { extractImpulse, buildEmotionActionGap } from '@/lib/bison/introspection/emotionActionGap';
import { computeImpulseLatency, estimateConsequenceMagnitude } from '@/lib/bison/introspection/impulseLatencyEngine';
import { assessTrying } from '@/lib/bison/introspection/groundedTrying';
import { interpretSocialEvent, buildPeripheral } from '@/lib/bison/social/socialSignalEngine';

export function processInput(text, reversibility = 'medium') {
  const signals = extractEmotionalSignals(text);
  const dominant = dominantSignal(signals);
  const impulse = extractImpulse(text);
  const intensity = dominant?.intensity ?? 0.3;
  const uncertainty = signals.some(signal => signal.signal === 'UNCERTAINTY') ? 0.8 : 0.5;

  // Regulation: detection raises awareness; nothing is expressed automatically.
  let traitStates = null;
  if (dominant) traitStates = registerActivation(dominant.signal, dominant.intensity);

  const egoThreat = detectEgoThreat(text);
  const patterns = evaluateBehavioralPatterns(text);
  const gap = buildEmotionActionGap({ emotion: dominant?.signal, intensity, impulse, reversibility, uncertainty });
  const latency = computeImpulseLatency({
    emotionalIntensity: intensity,
    consequenceMagnitude: estimateConsequenceMagnitude(impulse || text),
    reversibility,
    hasImpulse: !!impulse || egoThreat.threatDetected,
  });
  const trying = impulse || egoThreat.threatDetected ? assessTrying(text, impulse) : null;

  return {
    signals,
    dominant,
    impulse,
    egoThreat,
    patterns,
    gap,
    latency,
    trying,
    social: interpretSocialEvent(text),
    peripheral: buildPeripheral(text),
    traitStates,
    timestamp: Date.now(),
  };
}