// ═══════════════════════════════════════════════
// THE DENDRITIC FRAMEWORK (Package 40)
// Social Reality Mapping & Negotiable Systems Engine
// "You can't negotiate with a tree."
//
// Reality first. Interpretation second. Action last.
// One reasoning system, many consumers.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { classifySystems } from './realityClassifier';
import { scanNegotiability } from './negotiabilityScanner';
import { buildEvidenceLedger } from './evidenceLedger';
import { buildBackground } from './backgroundContextEngine';
import { generateHypotheses } from './hypothesisEngine';
import { generateClarifyingQuestions } from './clarificationLoop';
import { buildDashboard } from './epistemicDashboard';
import { getBehaviorPatterns } from './patternMemory';

export const ARBOREAL_PRINCIPLE = `THE ARBOREAL PRINCIPLE: Before interpreting another person's behavior, determine what parts of the situation belong to reality itself and what parts belong to human interpretation. Some things cannot negotiate: gravity, biology, time, physics. Some things can: expectations, communication, priorities, agreements. Never confuse one for the other. When uncertain, gather information before concluding.`;

const DENDRITIC_REQUEST_PATTERNS = [
  /(scan|analyze|map|break down) (this|the|my) situation/i,
  /what('s| is) really going on (with|between)/i,
  /dendritic/i,
  /help me understand (him|her|them|why (he|she|they))/i,
  /why (would|did|does|is) (he|she|they|my (boss|friend|partner|coworker|landlord|mom|dad|sister|brother))/i,
];

export function detectDendriticRequest(input) {
  return DENDRITIC_REQUEST_PATTERNS.some(p => p.test(input || ''));
}

export async function runDendriticScan(input, { depth = 'standard', somaticLoad, cognitiveLoad } = {}) {
  const classification = classifySystems(input);
  const variables = scanNegotiability(input);
  const ledger = buildEvidenceLedger(input);

  const [background, knownPatterns] = await Promise.all([
    buildBackground({ somaticLoad, cognitiveLoad }),
    getBehaviorPatterns(3),
  ]);

  const hypothesisResult = await generateHypotheses(input, ledger, { depth });
  const questions = depth === 'quick' ? [] : generateClarifyingQuestions(ledger, variables);
  const dashboard = buildDashboard(ledger, hypothesisResult, background);

  let scanId = null;
  try {
    const record = await base44.entities.DendriticScan.create({
      situation: input.slice(0, 500),
      primary_system: classification.primary,
      systems: classification.systems,
      depth,
      hypotheses: JSON.stringify(hypothesisResult.hypotheses),
      dashboard: JSON.stringify(dashboard),
      negotiability: JSON.stringify(variables),
      clarifying_questions: questions,
      fit_feedback: 'pending',
    });
    scanId = record?.id || null;
  } catch (e) {}

  return {
    scanId,
    depth,
    classification,
    variables,
    ledger: {
      observedCount: ledger.observed.length,
      inferredCount: ledger.inferred.length,
      unknownCount: ledger.unknown.length,
      avgWeight: ledger.avgWeight,
      completeness: ledger.completeness,
      observed: ledger.observed.map(c => c.text),
      inferred: ledger.inferred.map(c => c.text),
    },
    background,
    knownPatterns: (knownPatterns || []).map(p => p.text),
    observedGoal: hypothesisResult.observedGoal,
    hypotheses: hypothesisResult.hypotheses,
    unknownRemainder: hypothesisResult.unknownRemainder,
    questions,
    dashboard,
  };
}

export function buildDendriticContextString(scan) {
  if (!scan) return null;
  const parts = ['[DENDRITIC FRAMEWORK SCAN]'];
  parts.push(`Reality classification: primary system is ${scan.classification.primary} (${scan.classification.systems.join(', ')}).`);

  if (scan.variables.length > 0) {
    parts.push('Negotiability scan:');
    for (const v of scan.variables) parts.push(`- ${v.name}: ${v.tag}`);
  }

  parts.push(`Evidence ledger: ${scan.ledger.observedCount} observed, ${scan.ledger.inferredCount} inferred, ${scan.ledger.unknownCount} unknown. Evidence quality: ${scan.dashboard.evidenceQuality}.`);
  if (scan.ledger.inferred.length > 0) {
    parts.push(`The user's inferences (NOT evidence): ${scan.ledger.inferred.join(' | ')}`);
  }

  if (scan.background.factors.length > 0) {
    parts.push(`Background: ${scan.background.factors.join('; ')}. Confidence modifier: ${scan.background.confidenceModifier}.`);
  }

  if (scan.knownPatterns.length > 0) {
    parts.push(`Previously recorded behavior patterns (behavior, not identity): ${scan.knownPatterns.join(' | ')}`);
  }

  parts.push('Possible Incentive Landscape (present ALL, never just one):');
  if (scan.observedGoal) parts.push(`- Observed goal (stated directly): ${scan.observedGoal}`);
  for (const h of scan.hypotheses) {
    parts.push(`- ${h.label} (${h.confidence}%) — evidence: ${h.evidence}; missing: ${h.missing_evidence}`);
  }
  parts.push(`- Unknown: ${scan.unknownRemainder}%`);

  parts.push(`Epistemic dashboard: confidence ${scan.dashboard.confidence}%, completeness ${scan.dashboard.completeness}, ${scan.dashboard.missingVariables} missing variables, stability ${scan.dashboard.stability}.`);

  if (scan.questions.length > 0) {
    parts.push(`Clarifying questions to weave in naturally: ${scan.questions.join(' / ')}`);
  }

  parts.push('RULES: Distinguish non-negotiable reality from negotiable human factors. Present multiple explanations with their confidence — never a single "the reason is". Use behavior-pattern language, never identity labels. If completeness is low, prioritize the clarifying questions over conclusions.');
  parts.push('[/DENDRITIC FRAMEWORK SCAN]\n');
  return parts.join('\n');
}