// ═══════════════════════════════════════════════
// MULTIPLE HYPOTHESIS ENGINE (Patches 40.1 + 40.6)
// Never "The reason is...". Always a Possible
// Incentive Landscape with confidence, evidence,
// missing evidence, and an explicit Unknown remainder.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { applyEthicalFilter } from './ethicalLanguageFilter';

const FALLBACK_HYPOTHESES = [
  { label: 'Avoidance or discomfort with the topic', confidence: 35, evidence: 'Common pattern in similar situations', missing_evidence: 'Direct statement of their reasons' },
  { label: 'Overwhelmed by competing demands', confidence: 30, evidence: 'Common pattern in similar situations', missing_evidence: 'Knowledge of their current workload' },
  { label: 'Communication style mismatch', confidence: 20, evidence: 'Common pattern in similar situations', missing_evidence: 'How they communicate with others' },
];

function normalizeHypotheses(raw) {
  const hypotheses = (raw || []).slice(0, 4).map(h => ({
    label: applyEthicalFilter(String(h.label || '')),
    confidence: Math.min(85, Math.max(5, Math.round(Number(h.confidence) || 20))),
    evidence: applyEthicalFilter(String(h.evidence || 'None cited')),
    missing_evidence: String(h.missing_evidence || 'Unknown'),
  }));
  // Rescale so total never exceeds 90% — an Unknown remainder always exists
  const total = hypotheses.reduce((s, h) => s + h.confidence, 0);
  if (total > 90) {
    for (const h of hypotheses) h.confidence = Math.round((h.confidence / total) * 90);
  }
  const unknownRemainder = Math.max(5, 100 - hypotheses.reduce((s, h) => s + h.confidence, 0));
  return { hypotheses, unknownRemainder };
}

export async function generateHypotheses(input, ledger, { depth = 'standard' } = {}) {
  if (depth === 'quick') {
    return { observedGoal: null, ...normalizeHypotheses(FALLBACK_HYPOTHESES), source: 'deterministic' };
  }

  const observedFacts = ledger.observed.map(c => `- ${c.text} (weight ${c.weight})`).join('\n') || '- None';
  const inferredClaims = ledger.inferred.map(c => `- ${c.text}`).join('\n') || '- None';

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a careful social-reasoning engine. Analyze this interpersonal situation.

SITUATION: ${input}

OBSERVED FACTS (weighted evidence — the only admissible basis):
${observedFacts}

USER'S OWN INFERENCES (interpretations, NOT evidence):
${inferredClaims}

Rules:
- Produce 2-4 POSSIBLE explanations for the other party's behavior, each with a confidence percentage, the observed evidence supporting it, and what evidence is missing.
- Total confidence must NOT exceed 90% — uncertainty always remains.
- NEVER use identity labels (manipulator, liar, narcissist, psychopath). Describe behavior patterns only.
- Base confidence only on observed facts, never on the user's inferences.
- If an observed goal is directly stated by the other party, report it separately.`,
      response_json_schema: {
        type: 'object',
        properties: {
          observed_goal: { type: ['string', 'null'] },
          hypotheses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                confidence: { type: 'number' },
                evidence: { type: 'string' },
                missing_evidence: { type: 'string' },
              },
            },
          },
        },
      },
    });
    const normalized = normalizeHypotheses(result?.hypotheses);
    return {
      observedGoal: result?.observed_goal ? applyEthicalFilter(result.observed_goal) : null,
      ...normalized,
      source: 'llm',
    };
  } catch (e) {
    return { observedGoal: null, ...normalizeHypotheses(FALLBACK_HYPOTHESES), source: 'deterministic_fallback' };
  }
}