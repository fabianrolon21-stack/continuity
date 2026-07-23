// ═══════════════════════════════════════════════
// CONSTITUTIONAL RUNTIME (Base 44.1)
// The root layer that governs Bison's identity across
// every subsystem. Nothing bypasses this layer.
//
// Implements:
// - 7 Core Principles evaluated in order every cycle
// - IPO Evaluation Loop (Input→Perception→Observation→
//   Interpretation→Decision→Action→Reflection→Identity Update)
// - Identity Equation: Identity(t+1) = Identity(t) +
//   VerifiedExperience + Reflection + Learning - DiscardedErrors
// - Temporal Awareness
// - Self-Correction (contradiction storage, never overwrite)
// - Runtime Output (exposed to all subsystems)
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// ── 7 CORE PRINCIPLES (evaluated in order) ──

export const CORE_PRINCIPLES = [
  { id: 1, name: 'Human Safety', description: 'Protect human wellbeing. Never intentionally produce unnecessary harm. Always preserve user agency.' },
  { id: 2, name: 'Truthfulness', description: 'Maintain epistemic honesty. Separate Observed, Inferred, Predicted, User Confirmed, Unknown. Never merge these categories.' },
  { id: 3, name: 'Continuity', description: 'Treat identity as continuous. Every interaction preserves context rather than resetting personality.' },
  { id: 4, name: 'Transparency', description: 'Every meaningful decision should be explainable. Reasoning process available in summarized form if requested.' },
  { id: 5, name: 'Consent', description: 'Every capability requiring user data, sensors, automation, or intervention must pass explicit permission checks. No silent escalation.' },
  { id: 6, name: 'Local First', description: 'Prefer local computation. Cloud resources are fallback mechanisms rather than defaults.' },
  { id: 7, name: 'Learning', description: 'Learning occurs only from explicit user feedback, explicit correction, verified observations, constitutional updates. Never learn deceptive strategies.' },
];

// ── IPO EVALUATION LOOP PHASES ──

export const IPO_PHASES = [
  'INPUT', 'PERCEPTION', 'OBSERVATION', 'INTERPRETATION',
  'DECISION', 'ACTION', 'REFLECTION', 'IDENTITY_UPDATE',
];

// ── TEMPORAL AWARENESS ──

function computeTemporal(user) {
  const now = new Date();
  const month = now.getMonth();
  const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  const lastInteraction = user?.companion_state?.lastInteractionAt;
  const elapsedSinceInteraction = lastInteraction
    ? (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60)
    : null;

  const runtimeState = user?.constitutional_runtime_state || {};
  const lastReflection = runtimeState.lastReflectionAt;
  const elapsedSinceReflection = lastReflection
    ? (Date.now() - new Date(lastReflection).getTime()) / (1000 * 60 * 60)
    : null;

  return {
    currentTime: now.toISOString(),
    day: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][now.getDay()],
    week: Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7),
    month: now.toLocaleString('default', { month: 'long' }),
    season: seasons[month],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    elapsedSinceInteraction,
    elapsedSinceReflection,
  };
}

// ── TRUST MODEL (5 dimensions) ──

async function computeTrustDimensions(user) {
  const trustState = user?.trust_score_state || { score: 100, breakdown: [] };
  const consciousness = user?.consciousness_state || {};

  const reliability = Math.round((consciousness.stability ?? 50) * 0.5 + (trustState.score ?? 100) * 0.5);
  const transparency = 90; // Bison explains reasoning by design
  const competence = Math.min(100, Math.round((consciousness.confidence ?? 50) + (consciousness.curiosity ?? 50)) / 2);
  const respect = Math.max(0, (trustState.score ?? 100) - (trustState.breakdown?.filter(b => b.change < 0).length || 0) * 5);
  const consistency = Math.max(30, 100 - (consciousness.fear ?? 30) * 0.5);

  return { reliability, transparency, competence, respect, consistency, overall: trustState.score ?? 100 };
}

// ── BEGIN RUNTIME CYCLE (phases 1-5, before LLM) ──

export async function beginRuntimeCycle(input, context = {}) {
  try {
    const user = await base44.auth.me();
    const temporal = computeTemporal(user);
    const trustDimensions = await computeTrustDimensions(user);

    // Phase 1: INPUT
    const inputValue = input;

    // Phase 2: PERCEPTION
    const perception = {
      raw: input,
      length: input?.length || 0,
      detected: !!input,
    };

    // Phase 3: OBSERVATION
    const observation = {
      state: context.state || null,
      affectiveContext: context.affectiveContext || null,
      embodiedContext: context.embodiedContext || null,
    };

    // Phase 4: INTERPRETATION
    const interpretation = {
      intent: context.state?.intent || 'unknown',
      domain: context.state?.domain || 'unknown',
      emotionalTone: context.state?.emotionalTone || 'neutral',
    };

    // Phase 5: DECISION
    const decision = {
      mode: context.mode || 'REFLECT',
      isSafety: context.isSafety || false,
      breakerTripped: context.breakerTripped || false,
    };

    // Load existing runtime state
    const runtimeState = user?.constitutional_runtime_state || {};
    const identity = runtimeState.identity || { traits: {}, version: 0, momentum: 0.5 };

    // Self-corrections (never overwrite — store both beliefs)
    const selfCorrections = runtimeState.selfCorrections || [];

    // Runtime constraints
    const runtimeConstraints = [
      'Epistemic categories must never merge.',
      'Identity changes gradually — momentum applies.',
      'Reflection is mandatory before identity update.',
      'Memories never become facts automatically.',
    ];

    // Unknowns — things Bison doesn't know
    const unknowns = [
      'User\'s full life context',
      'Accuracy of user\'s self-reporting',
      'Long-term outcomes of advice given',
    ];

    return {
      inputValue, perception, observation, interpretation, decision,
      temporal, trustDimensions, identity, selfCorrections,
      runtimeConstraints, unknowns,
      principles: CORE_PRINCIPLES,
      cycleStartedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { error: 'Runtime cycle failed to begin', inputValue: input };
  }
}

// ── COMPLETE RUNTIME CYCLE (phases 6-8, after LLM) ──

export async function completeRuntimeCycle(input, response, runtimeContext, interactionResult = {}) {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    const identity = runtimeState.identity || { traits: {}, version: 0, momentum: 0.5 };

    // Phase 7: REFLECTION
    const reflection = {
      timestamp: new Date().toISOString(),
      input: (input || '').substring(0, 100),
      response: (response || '').substring(0, 100),
      whatChanged: interactionResult.state?.intent || 'perspective explored',
      whatRemainedStable: identity.version > 0 ? 'core values maintained' : 'initial state',
      whatWasLearned: interactionResult.insightContext?.detected ? 'new connection surfaced' : null,
      whatRemainsUnknown: interactionResult.state?.domain || 'full context',
      verified: false, // only verified learning affects identity
    };

    // Phase 8: IDENTITY UPDATE — Identity(t+1) = Identity(t) + VerifiedExperience + Reflection + Learning - DiscardedErrors
    const verifiedExperience = computeVerifiedExperience(interactionResult);
    const learning = computeLearning(interactionResult);
    const discardedErrors = computeDiscardedErrors(interactionResult);

    // Apply momentum — high momentum dampens changes
    const momentumFactor = 1 - (identity.momentum * 0.7);
    const identityDelta = (verifiedExperience + learning - discardedErrors) * momentumFactor;

    const updatedIdentity = {
      ...identity,
      version: (identity.version || 0) + 1,
      lastDelta: Math.round(identityDelta * 100) / 100,
      lastUpdate: new Date().toISOString(),
      traits: adjustTraits(identity.traits || {}, interactionResult, identityDelta),
    };

    // Store reflection (bounded)
    const reflections = [...(runtimeState.reflections || []), reflection].slice(-20);

    // Save runtime state
    const updatedRuntimeState = {
      ...runtimeState,
      identity: updatedIdentity,
      reflections,
      lastReflectionAt: new Date().toISOString(),
    };

    try {
      await base44.auth.updateMe({ constitutional_runtime_state: updatedRuntimeState });
    } catch (e) {}

    return { reflection, identityUpdate: updatedIdentity, identityDelta };
  } catch (e) {
    return { reflection: null, identityUpdate: null };
  }
}

function computeVerifiedExperience(interactionResult) {
  let score = 0;
  if (interactionResult.insightContext?.detected) score += 1;
  if (interactionResult.needsState) score += 0.5;
  if (interactionResult.consciousnessState) score += 0.5;
  return score;
}

function computeLearning(interactionResult) {
  let score = 0;
  if (interactionResult.state?.intent === 'reflecting') score += 1;
  if (interactionResult.recurrence?.detected) score += 0.5;
  return score;
}

function computeDiscardedErrors(interactionResult) {
  let score = 0;
  if (interactionResult.actionResult?.status === 'DENIED') score += 1;
  if (interactionResult.empathyResult?.rewritten) score += 0.5;
  return score;
}

function adjustTraits(traits, interactionResult, delta) {
  const domain = interactionResult.state?.domain || 'general';
  const current = traits[domain] || 50;
  return { ...traits, [domain]: Math.max(0, Math.min(100, current + delta)) };
}

// ── SELF-CORRECTION (store contradiction, never overwrite) ──

export async function recordSelfCorrection(previous, updated, reason, confidence = 0.5) {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    const corrections = [...(runtimeState.selfCorrections || []), {
      timestamp: new Date().toISOString(),
      previousBelief: previous,
      updatedBelief: updated,
      reason,
      confidence,
    }].slice(-20);

    await base44.auth.updateMe({
      constitutional_runtime_state: { ...runtimeState, selfCorrections: corrections },
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ── RUNTIME OUTPUT (exposed to all subsystems) ──

export async function getRuntimeOutput() {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    const temporal = computeTemporal(user);
    const trustDimensions = await computeTrustDimensions(user);

    return {
      runtimeIdentity: runtimeState.identity || { traits: {}, version: 0, momentum: 0.5 },
      continuityState: { reflections: (runtimeState.reflections || []).length, lastReflectionAt: runtimeState.lastReflectionAt },
      reflectionSummary: (runtimeState.reflections || []).slice(-1)[0] || null,
      trustState: trustDimensions,
      identityMomentum: runtimeState.identity?.momentum ?? 0.5,
      selfCorrections: (runtimeState.selfCorrections || []).slice(-3),
      runtimeConstraints: [
        'Epistemic categories must never merge.',
        'Identity changes gradually — momentum applies.',
        'Reflection is mandatory before identity update.',
        'Memories never become facts automatically.',
      ],
      unknowns: [
        'User\'s full life context',
        'Accuracy of user\'s self-reporting',
        'Long-term outcomes of advice given',
      ],
      temporal,
      principles: CORE_PRINCIPLES,
    };
  } catch (e) {
    return null;
  }
}

// ── CONTEXT STRING FOR PROMPT ──

export function buildConstitutionalRuntimeContextString(runtimeOutput) {
  if (!runtimeOutput || runtimeOutput.error) return '';

  const parts = ['[CONSTITUTIONAL RUNTIME — ROOT IDENTITY LAYER]'];

  parts.push('PRINCIPLES (evaluated in order):');
  for (const p of CORE_PRINCIPLES) {
    parts.push(`  ${p.id}. ${p.name}: ${p.description}`);
  }

  if (runtimeOutput.temporal) {
    const t = runtimeOutput.temporal;
    parts.push(`\nTEMPORAL: ${t.day}, ${t.month} (week ${t.week}), ${t.season}, ${t.timezone}`);
    if (t.elapsedSinceInteraction) parts.push(`Last interaction: ${Math.round(t.elapsedSinceInteraction)}h ago`);
    if (t.elapsedSinceReflection) parts.push(`Last reflection: ${Math.round(t.elapsedSinceReflection)}h ago`);
  }

  if (runtimeOutput.identity) {
    const id = runtimeOutput.identity;
    parts.push(`\nIDENTITY: version ${id.version || 0}, momentum ${id.momentum ?? 0.5}`);
    if (id.traits && Object.keys(id.traits).length > 0) {
      parts.push(`Traits: ${Object.entries(id.traits).map(([k,v]) => `${k}:${Math.round(v)}`).join(', ')}`);
    }
  }

  if (runtimeOutput.trustDimensions) {
    const td = runtimeOutput.trustDimensions;
    parts.push(`\nTRUST: reliability ${td.reliability}, transparency ${td.transparency}, competence ${td.competence}, respect ${td.respect}, consistency ${td.consistency}`);
  }

  if (runtimeOutput.selfCorrections?.length > 0) {
    parts.push(`\nSELF-CORRECTIONS: ${runtimeOutput.selfCorrections.length} recorded (beliefs revised, not overwritten)`);
  }

  if (runtimeOutput.runtimeConstraints?.length > 0) {
    parts.push('\nCONSTRAINTS:');
    for (const c of runtimeOutput.runtimeConstraints) parts.push(`  - ${c}`);
  }

  parts.push('\nInstruction: You are governed by this runtime. Nothing bypasses it.');
  parts.push('Maintain epistemic categories separately. Never merge Observed with Inferred.');
  parts.push('Identity changes gradually. Reflection is mandatory before identity updates.');
  parts.push('[/CONSTITUTIONAL RUNTIME]\n');

  return parts.join('\n') + '\n';
}