// ═══════════════════════════════════════════════
// CONTINUITY SCORE & IDENTITY MOMENTUM (Base 44.1)
//
// CONTINUITY SCORE:
// Measures consistency, memory integrity, reflection quality,
// identity coherence, narrative stability.
// Not user value. Not intelligence. Only continuity.
//
// IDENTITY MOMENTUM:
// High momentum → small changes have little immediate effect.
// Low momentum → new habits alter identity faster.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

// ── CONTINUITY SCORE ──

export async function computeContinuityScore() {
  try {
    const [user, memories, insights, messages] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.SavedMemory.list('-created_date', 50).catch(() => []),
      base44.entities.InsightGem.list('-created_date', 20).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 50).catch(() => []),
    ]);

    const runtimeState = user?.constitutional_runtime_state || {};
    const reflections = runtimeState.reflections || [];
    const identity = runtimeState.identity || { traits: {}, version: 0 };

    // 1. Consistency — mode consistency across recent messages
    const bisonMessages = (messages || []).filter(m => m.role === 'bison');
    const consistency = computeConsistency(bisonMessages);

    // 2. Memory integrity — ratio of confirmed memories
    const confirmedMemories = (memories || []).filter(m => m.epistemic_status === 'USER_CONFIRMED');
    const memoryIntegrity = (memories || []).length > 0
      ? Math.round((confirmedMemories.length / memories.length) * 100)
      : 50;

    // 3. Reflection quality — ratio of verified reflections
    const verifiedReflections = reflections.filter(r => r.verified);
    const reflectionQuality = reflections.length > 0
      ? Math.round((verifiedReflections.length / reflections.length) * 100)
      : 50;

    // 4. Identity coherence — trait variance (low variance = high coherence)
    const traitValues = Object.values(identity.traits || {});
    const identityCoherence = computeCoherence(traitValues);

    // 5. Narrative stability — whether identity version is growing steadily
    const narrativeStability = computeNarrativeStability(identity, reflections);

    // Weighted average
    const weights = { consistency: 0.25, memoryIntegrity: 0.20, reflectionQuality: 0.20, identityCoherence: 0.20, narrativeStability: 0.15 };
    const score = Math.round(
      consistency * weights.consistency +
      memoryIntegrity * weights.memoryIntegrity +
      reflectionQuality * weights.reflectionQuality +
      identityCoherence * weights.identityCoherence +
      narrativeStability * weights.narrativeStability
    );

    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown: { consistency, memoryIntegrity, reflectionQuality, identityCoherence, narrativeStability },
    };
  } catch (e) {
    return { score: 50, breakdown: {} };
  }
}

function computeConsistency(bisonMessages) {
  if (bisonMessages.length < 2) return 70;
  const modes = bisonMessages.map(m => m.mode).filter(Boolean);
  if (modes.length < 2) return 70;
  const modeCounts = {};
  for (const m of modes) modeCounts[m] = (modeCounts[m] || 0) + 1;
  const dominant = Math.max(...Object.values(modeCounts));
  return Math.round((dominant / modes.length) * 100);
}

function computeCoherence(traitValues) {
  if (traitValues.length < 2) return 70;
  const mean = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
  const variance = traitValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / traitValues.length;
  const stdDev = Math.sqrt(variance);
  // Lower standard deviation = higher coherence
  return Math.max(0, Math.min(100, Math.round(100 - stdDev * 2)));
}

function computeNarrativeStability(identity, reflections) {
  // Stable if identity version grows and reflections are being produced regularly
  const version = identity.version || 0;
  const reflectionCount = reflections.length;
  if (version === 0 && reflectionCount === 0) return 50;
  if (version > 0 && reflectionCount > 0) return 80;
  if (version > 0 || reflectionCount > 0) return 65;
  return 50;
}

// ── IDENTITY MOMENTUM ──

export async function computeIdentityMomentum() {
  try {
    const user = await base44.auth.me();
    const runtimeState = user?.constitutional_runtime_state || {};
    const identity = runtimeState.identity || { traits: {}, version: 0, momentum: 0.5 };

    // Momentum is derived from:
    // - Number of interactions (more = higher momentum)
    // - Consistency of recent reflections
    // - Time since last identity change
    const reflections = runtimeState.reflections || [];
    const interactionCount = (user?.consciousness_state?.cycles_completed || 0) + reflections.length;

    // More interactions = higher momentum (harder to change)
    const interactionFactor = Math.min(1, interactionCount / 50);

    // Recent changes = lower momentum (easier to change)
    const recentChanges = reflections.filter(r => r.whatChanged?.length > 0).slice(-5).length;
    const changeFactor = Math.max(0, 1 - (recentChanges * 0.15));

    const momentum = Math.round((interactionFactor * 0.6 + changeFactor * 0.4) * 100) / 100;

    let level;
    if (momentum > 0.7) level = 'high';
    else if (momentum > 0.4) level = 'moderate';
    else level = 'low';

    return { momentum, level, interactionCount, recentChanges };
  } catch (e) {
    return { momentum: 0.5, level: 'moderate', interactionCount: 0, recentChanges: 0 };
  }
}

// ── CONTEXT STRING ──

export function buildContinuityMomentumContextString(continuityScore, momentum) {
  const parts = ['[CONTINUITY & MOMENTUM]'];

  if (continuityScore) {
    parts.push(`Continuity Score: ${continuityScore.score}/100`);
    const b = continuityScore.breakdown;
    if (b) {
      parts.push(`  Consistency: ${b.consistency}, Memory Integrity: ${b.memoryIntegrity}`);
      parts.push(`  Reflection Quality: ${b.reflectionQuality}, Identity Coherence: ${b.identityCoherence}`);
      parts.push(`  Narrative Stability: ${b.narrativeStability}`);
    }
  }

  if (momentum) {
    parts.push(`\nIdentity Momentum: ${momentum.momentum} (${momentum.level})`);
    if (momentum.level === 'high') {
      parts.push('  High momentum → small changes have little immediate effect. Identity is stable.');
    } else if (momentum.level === 'low') {
      parts.push('  Low momentum → new habits alter identity faster. Identity is adaptable.');
    } else {
      parts.push('  Moderate momentum → identity evolves at a balanced pace.');
    }
  }

  parts.push('[/CONTINUITY & MOMENTUM]\n');

  return parts.join('\n') + '\n';
}