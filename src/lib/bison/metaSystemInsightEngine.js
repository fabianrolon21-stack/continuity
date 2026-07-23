// Base 44.3 — Meta-Systemic Intelligence Engine
// Re-exports from the modular 9-step pipeline implementation.
// The original Package 31/32 five-step engine has been superseded by the full pipeline.
// All existing exports are preserved for backward compatibility.

export {
  runMetaSystemicInsight,
  buildMetaInsightContextString,
  detectMetaInsightRequest,
  detectBuildingStoryRequest,
} from './metaSystem/engine';

export {
  runSelfAnalysis,
  buildSelfAnalysisContextString,
  detectSelfAnalysisRequest,
  recordUserCorrection,
  recordVerifiedOutcome,
} from './metaSystem/selfAnalysis';

export { performMicroAnalysis } from './metaSystem/microAnalysis';
export { identifyPatterns } from './metaSystem/patternIdentification';
export { expandAcrossScales, SCALES } from './metaSystem/multiScaleExpansion';
export { analyzeStability } from './metaSystem/stabilityAnalysis';
export { mapUncertainty, UNCERTAINTY_CATEGORIES } from './metaSystem/uncertaintyMap';
export { generateCounterHypotheses } from './metaSystem/counterHypothesis';
export { identifyLeveragePoints } from './metaSystem/leverageAnalysis';
export { generateExperiments } from './metaSystem/experimentGenerator';
export { synthesizeInsight, createLumenToken } from './metaSystem/insightSynthesis';
export { computeMultiTrackConfidence } from './metaSystem/confidenceModel';
export { EPISTEMIC_TIER, classifyEpistemic, tagEpistemic, enforceFirewall, buildEpistemicFirewallContextString } from './metaSystem/epistemicFirewall';