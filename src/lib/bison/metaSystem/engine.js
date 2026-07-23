// Base 44.3 — Meta-Systemic Intelligence Engine
// Main orchestrator. Runs the 9-step pipeline.
// Integrates human state compatibility (reduce depth when overloaded).

import { performMicroAnalysis } from './microAnalysis';
import { identifyPatterns } from './patternIdentification';
import { expandAcrossScales } from './multiScaleExpansion';
import { analyzeStability } from './stabilityAnalysis';
import { mapUncertainty } from './uncertaintyMap';
import { generateCounterHypotheses } from './counterHypothesis';
import { identifyLeveragePoints } from './leverageAnalysis';
import { generateExperiments } from './experimentGenerator';
import { synthesizeInsight, createLumenToken } from './insightSynthesis';
import { computeMultiTrackConfidence } from './confidenceModel';
import { buildEpistemicFirewallContextString } from './epistemicFirewall';
import { base44 } from '@/api/base44Client';

const META_INSIGHT_TRIGGERS = [
  /what.{0,10}(bigger picture|larger pattern|underlying structure|deeper meaning)/i,
  /why does this (keep|always)/i,
  /what.{0,10}(systemic|structural|pattern)/i,
  /meta.{0,10}(insight|analysis|pattern)/i,
  /connect.{0,10}(the )?(dots|layers|systems)/i,
  /what.{0,10}the .+ (really |actually )?(mean|about)/i,
  /what.{0,10}(patterns exist|is happening|should i change|could i try)/i,
  /what.{0,10}(small change|leverage|intervention|unknown|uncertain|missing)/i,
  /alternative (explanation|interpretation|view)/i,
  /multi.?scale|across (levels|scales)/i,
];

export function detectMetaInsightRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return META_INSIGHT_TRIGGERS.some(p => p.test(input));
}

export function detectBuildingStoryRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return /simulate (building|story|characters)|building story|walk .+ through/i.test(input);
}

// Human state compatibility — reduce analysis depth when overloaded
function determineDepth(humanState) {
  if (!humanState) return 'full';
  const cognitiveLoad = humanState.cognitiveLoad?.level;
  const emotionalLoad = humanState.emotionalLoad;
  const decisionCapacity = humanState.decisionCapacity;
  if (cognitiveLoad === 'OVERLOADED' || (emotionalLoad != null && emotionalLoad > 70))
    return 'summary';
  if (cognitiveLoad === 'HIGH' || (decisionCapacity != null && decisionCapacity < 30))
    return 'reduced';
  return 'full';
}

// Main entry point — runs the full 9-step pipeline
export async function runMetaSystemicInsight(problem, options = {}) {
  const depth = determineDepth(options.humanState);

  // Gather user context
  let userContext = {};
  try {
    const [recentMemories, recentMessages] = await Promise.all([
      base44.entities.SavedMemory.list('-created_date', 10).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 10).catch(() => []),
    ]);
    userContext = { recentMemories: recentMemories || [], recentMessages: recentMessages || [] };
  } catch (e) {}

  // Step 1: Micro Analysis
  const micro = performMicroAnalysis(problem, userContext);

  // Step 2: Pattern Identification — multiple candidates
  const patterns = identifyPatterns(micro);

  // Step 3: Multi-Scale Expansion
  const scales = expandAcrossScales(micro, patterns);

  // Step 4: Stability Analysis
  const stability = analyzeStability(micro, scales);

  // Step 5: Uncertainty Map
  const uncertainty = mapUncertainty(micro, stability);

  // Step 6: Counter-Hypothesis
  const counterHypotheses = generateCounterHypotheses({ micro, stability }, patterns);

  // Step 7: Leverage Analysis
  const leverage = identifyLeveragePoints(micro, stability, scales);

  // Step 8: Experiment Generator
  const experiments = generateExperiments(leverage, uncertainty);

  // Step 9: Insight Synthesis
  const steps = { micro, patterns, scales, stability, uncertainty, counterHypotheses, leverage, experiments };
  const synthesis = synthesizeInsight(steps);

  // LUMEN token for high-coherence insights
  let lumenToken = null;
  const topPatternConfidence = patterns?.[0]?.confidence || 0;
  if (topPatternConfidence > 0.6) {
    try { lumenToken = await createLumenToken(synthesis.insight, steps); } catch (e) {}
  }

  // Multi-track confidence
  const confidence = computeMultiTrackConfidence(steps);

  return {
    ...steps,
    synthesis,
    lumenToken,
    confidence,
    depth,
    provenance: {
      engine: 'meta_systemic_intelligence',
      version: '44.3',
      generatedAt: new Date().toISOString(),
      depth,
    },
  };
}

// Context string builder — adapts to depth
export function buildMetaInsightContextString(result) {
  if (!result) return '';
  const depth = result.depth || 'full';
  const parts = ['[META-SYSTEMIC INTELLIGENCE — STRUCTURAL ANALYSIS]'];

  if (depth === 'summary') {
    // Summary first — allow expansion on request
    parts.push(`SUMMARY: ${result.synthesis?.insight || 'Analysis complete.'}`);
    parts.push(`Confidence: Evidence ${result.confidence?.evidence?.level}, Pattern ${result.confidence?.pattern?.level}`);
    parts.push('Deeper analysis available on request. The user appears overloaded — keep it brief.');
    parts.push('[/META-SYSTEMIC INTELLIGENCE]\n');
    return parts.join('\n') + '\n';
  }

  // Full or reduced depth
  parts.push(`PROBLEM: ${result.micro?.summary || 'Situation under analysis.'}`);

  if (result.patterns?.length > 0) {
    parts.push('CANDIDATE PATTERNS:');
    for (const p of result.patterns.slice(0, depth === 'reduced' ? 2 : 3)) {
      parts.push(`  - ${p.pattern.name} (${Math.round(p.confidence * 100)}%)`);
    }
  }

  if (result.scales?.relevantScales?.length > 0 && depth === 'full') {
    parts.push(`RELEVANT SCALES: ${result.scales.relevantScales.join(' → ')}`);
  }

  if (depth === 'full') {
    parts.push('STABILITY ANALYSIS:');
    parts.push(`  Stability: ${result.stability?.stabilitySources?.[0] || 'None detected.'}`);
    parts.push(`  Instability: ${result.stability?.instabilitySources?.[0] || 'None detected.'}`);
    parts.push(`  Resilience: ${result.stability?.resilienceFactors?.[0] || 'Not clear.'}`);
    parts.push(`  Fragility: ${result.stability?.fragilityFactors?.[0] || 'Not detected.'}`);
  }

  parts.push('UNCERTAINTY MAP:');
  if (result.uncertainty?.known?.length > 0) parts.push(`  Known: ${result.uncertainty.known.slice(0, 2).join('; ')}`);
  if (result.uncertainty?.unknown?.length > 0) parts.push(`  Unknown: ${result.uncertainty.unknown.slice(0, 2).join('; ')}`);
  if (result.uncertainty?.missing?.length > 0 && depth === 'full') parts.push(`  Missing: ${result.uncertainty.missing.slice(0, 2).join('; ')}`);

  parts.push('ALTERNATIVE EXPLANATIONS:');
  for (const h of (result.counterHypotheses || []).slice(0, depth === 'reduced' ? 2 : 3)) {
    parts.push(`  ${h.label}: ${h.explanation}`);
  }

  parts.push('LEVERAGE POINTS:');
  for (const lp of (result.leverage || []).slice(0, depth === 'reduced' ? 1 : 3)) {
    parts.push(`  - ${lp.intervention} (effort: ${lp.effort}, benefit: ${lp.expectedBenefit})`);
  }

  parts.push('SUGGESTED EXPERIMENTS:');
  for (const exp of (result.experiments || []).slice(0, depth === 'reduced' ? 1 : 2)) {
    parts.push(`  - ${exp.description} (reversible: ${exp.reversible})`);
  }

  parts.push(`INSIGHT: ${result.synthesis?.insight || ''}`);

  parts.push('CONFIDENCE (tracked separately):');
  parts.push(`  Evidence: ${result.confidence?.evidence?.level} (${result.confidence?.evidence?.score})`);
  parts.push(`  Pattern: ${result.confidence?.pattern?.level} (${result.confidence?.pattern?.score})`);
  parts.push(`  Forecast: ${result.confidence?.forecast?.level} (${result.confidence?.forecast?.score})`);
  parts.push(`  Recommendation: ${result.confidence?.recommendation?.level} (${result.confidence?.recommendation?.score})`);

  if (result.lumenToken) {
    parts.push(`LUMEN TOKEN: "${result.lumenToken.signature}" — high coherence. Offer gently.`);
  }

  parts.push('INSTRUCTION: Present as structural analysis, not diagnosis.');
  parts.push('Use tentative language. Never claim certainty beyond evidence.');
  parts.push('Never merge observed, inferred, predicted, and unknown.');
  parts.push('[/META-SYSTEMIC INTELLIGENCE]\n');

  return parts.join('\n') + '\n';
}