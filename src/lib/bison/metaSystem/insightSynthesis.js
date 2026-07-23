// Step 9 — Insight Synthesis
// Combine findings into a concise explanation.
// Warm, understandable, grounded, transparent. Never claim certainty beyond evidence.

import { base44 } from '@/api/base44Client';

export function synthesizeInsight(steps) {
  const { micro, patterns, scales, stability, uncertainty, counterHypotheses, leverage, experiments } = steps;

  const parts = [];

  // Problem summary
  parts.push(`PROBLEM: ${micro?.summary || 'Situation under analysis.'}`);

  // Top pattern
  if (patterns?.length > 0 && patterns[0].confidence > 0.1) {
    parts.push(`PATTERN: ${patterns[0].pattern.name} — ${patterns[0].pattern.description}`);
  }

  // Relevant scales
  if (scales?.relevantScales?.length > 0) {
    parts.push(`SCALES: ${scales.relevantScales.join(' → ')}`);
  }

  // Stability snapshot
  if (stability?.stabilitySources?.length > 0) {
    parts.push(`STABILITY: ${stability.stabilitySources[0]}`);
  }
  if (stability?.instabilitySources?.length > 0) {
    parts.push(`INSTABILITY: ${stability.instabilitySources[0]}`);
  }

  // Key uncertainty
  if (uncertainty?.unknown?.length > 0) {
    parts.push(`UNKNOWN: ${uncertainty.unknown[0]}`);
  }

  // Alternative explanation
  if (counterHypotheses?.length > 1) {
    parts.push(`ALTERNATIVE: ${counterHypotheses[1].explanation}`);
  }

  // Top leverage point
  if (leverage?.length > 0) {
    parts.push(`LEVERAGE: ${leverage[0].intervention}`);
  }

  // Top experiment
  if (experiments?.length > 0) {
    parts.push(`EXPERIMENT: ${experiments[0].description}`);
  }

  const insight = parts.join('\n');

  return {
    insight,
    warm: true,
    grounded: true,
    transparent: true,
    claimsCertainty: false,
  };
}

// Create a LUMEN token for high-coherence insights
export async function createLumenToken(insight, steps) {
  const patternName = steps.patterns?.[0]?.pattern?.name || 'this pattern';
  const topElement = steps.micro?.objects?.[0]?.text || 'this moment';
  const signature = `The grove remembers ${topElement} walking through ${patternName.toLowerCase()}.`;

  try {
    const memory = await base44.entities.SavedMemory.create({
      text: `${insight}\n\n[LUMEN: ${signature}]`,
      source: 'lumen_token',
      tags: ['lumen', 'meta_systemic', steps.patterns?.[0]?.pattern?.id || 'unknown'],
      epistemic_status: 'INFERRED',
    });
    try {
      await base44.entities.AuditLog.create({
        timestamp: new Date().toISOString(),
        action: 'LUMEN_TOKEN_CREATED',
        actor_role: 'user',
        result: 'SUCCESS',
        message: JSON.stringify({ patternId: steps.patterns?.[0]?.pattern?.id, signature }),
      });
    } catch (e) {}
    return { id: memory.id, signature };
  } catch (e) {
    return { signature };
  }
}