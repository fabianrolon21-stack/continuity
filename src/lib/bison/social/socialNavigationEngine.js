// ═══════════════════════════════════════════════
// SOCIAL NAVIGATION ENGINE (Package 34)
// Coordinator that runs all four social-tactical
// modules and assembles their context into a single
// prompt block.
//
// All output is ADVISORY. Bison never takes autonomous
// social action (no sending messages, no posting).
// ═══════════════════════════════════════════════

import { assessSocialThreat, buildTacticalMaskingContextString } from './tacticalMaskingEngine';
import { detectConflictContext, generateShieldScripts, buildEmpathyShieldContextString } from './empathyShield';
import { analyzeAllianceLandscape, suggestMicroGestures, buildAllianceBuilderContextString } from './allianceBuilder';
import { assessEmotionalBandwidth, buildBandwidthFirewallContextString } from '../survival/bandwidthFirewall';

const SOCIAL_ADVICE_PATTERNS = [
  /how (do|should) i (handle|deal with|talk to|approach)/i,
  /what (should|do) i (say|do) to/i,
  /i need to (protect|prepare|confront)/i,
  /i'?m about to (call|meet|talk|see)/i,
  /(help me|how do i) (navigate|handle|manage)/i,
  /(difficult|toxic|manipulative) (relative|person|boss|coworker|family|in.?law)/i,
  /i (have to|need to) (have a conversation|talk|meet) with/i,
  /(fragile|tense|awkward) (situation|conversation|relationship)/i,
  /what do i (tell|say)/i,
];

export function detectSocialAdviceRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return SOCIAL_ADVICE_PATTERNS.some(p => p.test(input));
}

export async function runSocialNavigation({ userInput, state, affectiveContext, cognitiveLoad, relationships = [] }) {
  const threatAssessment = assessSocialThreat({ userInput, affectiveContext, state });

  const conflictContext = detectConflictContext(userInput, state);
  const shieldScripts = generateShieldScripts(conflictContext);

  const hostCapacity = 100 - (cognitiveLoad?.currentBandwidth || 0);
  const bandwidth = assessEmotionalBandwidth({ userInput, hostCapacity });

  const allianceLandscape = analyzeAllianceLandscape({ userInput, relationships });
  const microGestures = suggestMicroGestures({ userInput, landscape: allianceLandscape, relationships });

  const contextString = [
    buildTacticalMaskingContextString(threatAssessment),
    buildEmpathyShieldContextString(conflictContext, shieldScripts),
    buildBandwidthFirewallContextString(bandwidth),
    buildAllianceBuilderContextString(allianceLandscape, microGestures),
  ].filter(Boolean).join('');

  const adviceTypes = [];
  if (threatAssessment.environmentHostility > 25) adviceTypes.push('persona');
  if (conflictContext.conflictDetected) adviceTypes.push('shield');
  if (bandwidth.pivotSuggested) adviceTypes.push('pivot');
  if (microGestures.length > 0) adviceTypes.push('gesture');

  return {
    threatAssessment,
    conflictContext,
    shieldScripts,
    bandwidth,
    allianceLandscape,
    microGestures,
    contextString,
    adviceTypes,
  };
}