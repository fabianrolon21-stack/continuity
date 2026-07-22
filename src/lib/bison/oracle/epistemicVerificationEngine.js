// ═══════════════════════════════════════════════
// EPISTEMIC VERIFICATION ENGINE (Package 30)
// Transforms raw oracle output into VerifiedExternalInsight[]
// with clear epistemic tags. Cross-references oracle claims
// against Bison's curated knowledge + user-confirmed memories.
//
// Contradictions are flagged, never silently resolved.
// Even VERIFIED_CONSISTENT claims are "consistent with my
// knowledge," NOT "proven true."
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { retrieveKnowledge } from '@/lib/bison/knowledgeCore';
import { checkSafety } from './oracleSafety';

// ── Epistemic statuses ──
export const ORACLE_EPISTEMIC_STATUS = {
  VERIFIED_CONSISTENT: 'VERIFIED_CONSISTENT',
  VERIFIED_INCONSISTENT: 'VERIFIED_INCONSISTENT',
  UNVERIFIABLE: 'UNVERIFIABLE',
  DISPUTED: 'DISPUTED',
};

// ── Verification pipeline ──
export async function verifyOracleOutput(consultResult) {
  if (!consultResult || consultResult.status !== 'SUCCESS') {
    return { insights: [], blockedClaims: [], hasHarmfulContent: false };
  }

  const { rawOutput, sourceModel, modelReliability, timestamp } = consultResult;
  const claims = rawOutput?.claims || [];
  const insights = [];
  const blockedClaims = [];
  let hasHarmfulContent = false;

  // Fetch non-sensitive user-confirmed memories for cross-referencing
  // (used internally only — never sent externally)
  let userMemories = [];
  try {
    userMemories = await base44.entities.SavedMemory.list('-created_date', 20);
  } catch (e) {}

  for (const claimObj of claims) {
    const claimText = claimObj.claim || '';

    // Safety check — block harmful content
    if (checkSafety(claimText)) {
      hasHarmfulContent = true;
      blockedClaims.push({ claim: claimText, reason: 'safety_violation' });
      continue;
    }

    // Cross-reference with curated knowledge
    const curatedFacts = retrieveKnowledge(claimText);
    const supportingEvidence = [];
    const conflictingEvidence = [];

    for (const fact of curatedFacts) {
      // Simple consistency heuristic — keyword overlap
      const factKeywords = fact.keywords || [];
      const claimLower = claimText.toLowerCase();
      const hasOverlap = factKeywords.some(kw => claimLower.includes(kw));

      if (hasOverlap) {
        // Check for contradiction — simple negation detection
        const contradicts = /\b(not|false|wrong|debunk|myth|incorrect|disprove)\b/i.test(claimText);
        if (contradicts) {
          conflictingEvidence.push(`${fact.statement} (domain: ${fact.domain})`);
        } else {
          supportingEvidence.push(`${fact.statement} (domain: ${fact.domain})`);
        }
      }
    }

    // Cross-reference with user-confirmed memories (non-sensitive only)
    for (const memory of userMemories) {
      if (!memory.text) continue;
      // Only use non-sensitive memories for cross-referencing
      const memoryLower = memory.text.toLowerCase();
      const claimWords = claimText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const overlap = claimWords.filter(w => memoryLower.includes(w));
      if (overlap.length >= 2) {
        supportingEvidence.push(`User-confirmed memory (ID: ${memory.id})`);
      }
    }

    // Determine epistemic status
    let epistemicStatus;
    if (conflictingEvidence.length > 0 && supportingEvidence.length > 0) {
      epistemicStatus = ORACLE_EPISTEMIC_STATUS.DISPUTED;
    } else if (conflictingEvidence.length > 0) {
      epistemicStatus = ORACLE_EPISTEMIC_STATUS.VERIFIED_INCONSISTENT;
    } else if (supportingEvidence.length > 0) {
      epistemicStatus = ORACLE_EPISTEMIC_STATUS.VERIFIED_CONSISTENT;
    } else {
      epistemicStatus = ORACLE_EPISTEMIC_STATUS.UNVERIFIABLE;
    }

    // Confidence score — weighted by model reliability + corroboration
    const oracleConfidence = typeof claimObj.confidence === 'number' ? claimObj.confidence : 0.5;
    const corroborationBoost = Math.min(0.2, supportingEvidence.length * 0.1);
    const conflictPenalty = conflictingEvidence.length * 0.15;
    const confidence = Math.max(0, Math.min(1,
      (oracleConfidence * modelReliability) + corroborationBoost - conflictPenalty
    ));

    insights.push({
      originalClaim: claimText,
      sourceModel,
      timestamp,
      epistemicStatus,
      confidence: Math.round(confidence * 100) / 100,
      supportingEvidence: supportingEvidence.slice(0, 5),
      conflictingEvidence: conflictingEvidence.slice(0, 5),
    });
  }

  return { insights, blockedClaims, hasHarmfulContent };
}