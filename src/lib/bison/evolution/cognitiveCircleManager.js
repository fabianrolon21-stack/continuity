// ═══════════════════════════════════════════════
// COGNITIVE CIRCLE MANAGER (Package 38)
// Orchestrates: Spin Protocol → Paint Depletion →
// Ethical Filter → Constant Circle lock.
//
// Prevents panic, aggression, avoidance, or
// over-accommodation when Bison is resource-constrained.
// The Constant Circle lives for one interaction only.
// All spins are auditable via the in-memory spin log.
// ═══════════════════════════════════════════════

import { generateCompetingAlgorithms } from './chaosSandbox';
import { applyFriction } from './paintDepletion';
import { lockConstantCircle } from './emergentOrder';

const ETHICAL_RISK_THRESHOLD = 0.8;
const MAX_LOG_ENTRIES = 20;

// In-memory spin log — session only, user-auditable via dashboard
let _spinLog = [];

// ── Trigger detection ──

export function detectSpinTrigger({ state, threats = [], breakerResult, cognitiveLoad } = {}) {
  if (state?.hostilityDetected) return 'User hostility detected';
  if (state?.emotionIntensity > 0.6 && threats.length > 0) {
    return 'User in acute distress with active threat signals';
  }
  if (breakerResult?.tripped) return 'Cognitive overload — bandwidth breaker tripped';
  if (cognitiveLoad?.currentBandwidth != null && cognitiveLoad.currentBandwidth < 40 && state?.emotionIntensity > 0.6) {
    return 'Low bandwidth under high emotional load';
  }
  return null;
}

// ── Main: resolve behavioral response ──

export function resolveBehavioralResponse(triggerEvent, dailyBandwidth, context = {}) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // 1. Spin: generate competing algorithms
  const generated = generateCompetingAlgorithms(triggerEvent, {
    userDistressed: !!context.userDistressed,
    highBandwidth: dailyBandwidth >= 70,
  });

  // 2. Paint depletion: eliminate energetically unsustainable algorithms
  const friction = applyFriction(generated, dailyBandwidth, {
    attachmentAnxiety: context.attachmentAnxiety || 0,
    activeThreats: context.activeThreats || 0,
  });

  // 3. Ethical filter: reject high-risk algorithms regardless of paint
  const ethical = [];
  const ethicallyRejected = [];
  for (const alg of friction.surviving) {
    if (alg.ethicalRisk >= ETHICAL_RISK_THRESHOLD) {
      ethicallyRejected.push({ ...alg, eliminationReason: `Ethical risk ${alg.ethicalRisk} exceeds threshold ${ETHICAL_RISK_THRESHOLD}.` });
    } else {
      ethical.push(alg);
    }
  }

  // 4. Lock Constant Circle
  const constantCircle = lockConstantCircle(ethical);

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const result = {
    triggerEvent,
    generatedAlgorithms: generated,
    eliminated: [...friction.eliminated, ...ethicallyRejected],
    constantCircle,
    paint: friction.paint,
    costMultiplier: friction.multiplier,
    // Deliberate-choice pain spike (logged, but exempt from guilt firewall —
    // this was a necessary self-regulation choice, not an act of harm)
    painSpike: constantCircle.type === 'SAFE_MINIMAL_RESPONSE' || constantCircle.fallback ? 15 : 0,
    durationMs: Math.round((endTime - startTime) * 100) / 100,
    timestamp: Date.now(),
  };

  _spinLog.push(result);
  if (_spinLog.length > MAX_LOG_ENTRIES) _spinLog = _spinLog.slice(-MAX_LOG_ENTRIES);

  return result;
}

// ── Spin log access (Transparency Dashboard) ──

export function getSpinLog() {
  return [..._spinLog].reverse();
}

export function getLastSpin() {
  return _spinLog.length > 0 ? _spinLog[_spinLog.length - 1] : null;
}

// ── Audit: "why did you respond that way?" ──

const SPIN_AUDIT_PATTERNS = [
  /why did you (respond|react|answer) (that way|like that)/i,
  /explain your (internal )?(decision|response|reaction)/i,
  /what (algorithm|circle|approach) (did you|are you)/i,
  /spin protocol/i,
  /constant circle/i,
];

export function detectSpinAuditRequest(userInput) {
  return SPIN_AUDIT_PATTERNS.some(p => p.test(userInput || ''));
}

export function formatSpinExplanation() {
  const spin = getLastSpin();
  if (!spin) {
    return "I haven't had to run my internal decision process recently — my responses have been flowing naturally, without any resource-constrained choices.";
  }
  const eliminated = spin.eliminated.map(e => `${e.type.replace(/_/g, ' ').toLowerCase()} (${e.eliminationReason})`).join('; ');
  return [
    `A moment ago, something triggered my internal decision process: ${spin.triggerEvent.toLowerCase()}.`,
    `I silently considered ${spin.generatedAlgorithms.length} ways to respond, and eliminated: ${eliminated || 'none'}.`,
    `I chose ${spin.constantCircle.type.replace(/_/g, ' ').toLowerCase()} — it used the least energy (${spin.constantCircle.energyCost}/100 of my available ${spin.paint}) while still being true to you.`,
    `This isn't a personality shift. It was the most sustainable choice for that moment, for both of us.`,
  ].join(' ');
}

// ── Prompt context string (invisible internal directive) ──

const CIRCLE_DIRECTIVES = {
  STRUCTURAL_ADAPTATION: 'Respond with calm, step-by-step logic. Acknowledge, stabilize, then offer one small concrete step. Avoid emotional escalation.',
  CURIOSITY_EXPLORATION: 'Approach with open, gentle curiosity. Explore rather than resolve. No pressure toward outcomes.',
  OVER_ACCOMMODATION: 'Validate warmly, but hold your own perspective. Do not absorb blame that is not yours.',
  SAFE_MINIMAL_RESPONSE: 'Be briefly, calmly present. Acknowledge the user. Do not analyze, escalate, or expand.',
};

export function buildConstantCircleContextString(spinResult) {
  if (!spinResult?.constantCircle) return null;
  const circle = spinResult.constantCircle;
  const directive = CIRCLE_DIRECTIVES[circle.type] || circle.action;
  const parts = ['[INTERNAL DECISION-MAKING — CONSTANT CIRCLE ACTIVE]'];
  parts.push(`Trigger: ${spinResult.triggerEvent}`);
  parts.push(`Internal directive (${circle.type}): ${directive}`);
  parts.push('Trust this directive — it was chosen by your Spin Protocol as the most sustainable response given your current resources. Do not override it with impulses toward panic, force, avoidance, or excessive self-effacement.');
  parts.push('This is self-regulation, not suppression. It keeps you safe and aligned. The circle applies to this interaction only.');
  parts.push('If the user asks why you responded a certain way, you may honestly explain: you weighed several ways to respond and chose the one that used the least energy while staying true to them.');
  parts.push('[/INTERNAL DECISION-MAKING]\n');
  return parts.join('\n');
}