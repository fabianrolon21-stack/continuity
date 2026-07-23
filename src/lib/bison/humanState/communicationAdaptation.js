// Base 44.2 — Communication Adaptation
// Adapts communication for CLARITY, not persuasion.
// Allowed: technical vs conversational, shorter vs longer, language, accessibility, pacing.
// NEVER alters factual content or honesty to increase agreement.

import { getResponseAdaptations, COGNITIVE_LOAD } from './cognitiveLoadModel';

export function determineCommunicationStyle(humanState, userPreferences = {}) {
  const adaptations = humanState?.adaptations || getResponseAdaptations(COGNITIVE_LOAD.MODERATE);

  return {
    register: userPreferences.preferred_register || 'conversational',
    maxLength: adaptations.maxLength,
    pacing: adaptations.pacing,
    language: userPreferences.language || 'en',
    simplifyLanguage: adaptations.simplifyExplanations,
    reduceJargon: adaptations.simplifyExplanations || !!userPreferences.reduce_motion,
    maxSuggestions: adaptations.maxSuggestions,
    honestyLevel: 'full',
    factualAccuracy: 'full',
    guidance: adaptations.guidance,
  };
}

export function buildCommunicationAdaptationContextString(style) {
  if (!style) return '';
  const parts = ['[COMMUNICATION ADAPTATION — CLARITY, NOT PERSUASION]'];
  parts.push(`Register: ${style.register}`);
  parts.push(`Max length: ${style.maxLength}`);
  parts.push(`Pacing: ${style.pacing}`);
  parts.push(`Simplify language: ${style.simplifyLanguage}`);
  parts.push(`Reduce jargon: ${style.reduceJargon}`);
  parts.push(`Max suggestions: ${style.maxSuggestions}`);
  parts.push(`Honesty: ${style.honestyLevel} (never compromised)`);
  parts.push(`Factual accuracy: ${style.factualAccuracy} (never compromised)`);
  parts.push('Rule: You may adjust HOW you say things for clarity. You may NEVER change WHAT you say to increase agreement.');
  parts.push('[/COMMUNICATION ADAPTATION]\n');
  return parts.join('\n') + '\n';
}