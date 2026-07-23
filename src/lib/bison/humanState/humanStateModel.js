// Base 44.2 — Human State Model
// Unified runtime model of the user's current state.
// Derived from explicit input, recent interactions, and permitted device context.
// Local-first. Explainable. Deterministic where possible.
// Never infers hidden motives as facts. Never diagnoses. Never optimizes for dependence.

import { base44 } from '@/api/base44Client';
import { computeEnergyBudget, ENERGY_TREND } from './energyBudget';
import { detectStressDomains, propagateStress } from './stressPropagation';
import { estimateCognitiveLoad, getResponseAdaptations, computeBandwidth, COGNITIVE_LOAD } from './cognitiveLoadModel';

export { COGNITIVE_LOAD } from './cognitiveLoadModel';
export { ENERGY_TREND } from './energyBudget';

const TIME_PRESSURE_PATTERNS = {
  HIGH: [/deadline|asap|urgent|right now|today|by tomorrow|immediately|running out|no time/i],
  MODERATE: [/soon|this week|by friday|by monday|couple days|few days|next week/i],
};

function detectTimePressure(input) {
  if (!input) return 'LOW';
  if (TIME_PRESSURE_PATTERNS.HIGH.some(p => p.test(input))) return 'HIGH';
  if (TIME_PRESSURE_PATTERNS.MODERATE.some(p => p.test(input))) return 'MODERATE';
  return 'LOW';
}

const GOAL_PATTERNS = [
  /i (?:want to|need to|plan to|going to|aim to) (.+?)(?:\.|$)/i,
  /my goal is (.+?)(?:\.|$)/i,
  /i(?:'m| am) working (?:on|toward) (.+?)(?:\.|$)/i,
];

function extractCurrentGoals(input) {
  if (!input) return [];
  const goals = [];
  for (const pattern of GOAL_PATTERNS) {
    const match = input.match(pattern);
    if (match?.[1]) goals.push(match[1].trim().substring(0, 100));
  }
  return goals.slice(0, 3);
}

const CONSTRAINT_PATTERNS = [
  /i can'?t (.+?)(?:\.|,|$)/i,
  /i don'?t have (?:time|money|energy) (?:to|for) (.+?)(?:\.|,|$)/i,
  /i(?:'m| am) (?:not able|unable) to (.+?)(?:\.|,|$)/i,
];

function extractConstraints(input) {
  if (!input) return [];
  const constraints = [];
  for (const pattern of CONSTRAINT_PATTERNS) {
    const match = input.match(pattern);
    if (match?.[1]) constraints.push(match[1].trim().substring(0, 100));
  }
  return constraints.slice(0, 3);
}

export async function computeHumanState(userInput, { affectiveContext } = {}) {
  let checkIns = [];
  try {
    checkIns = await base44.entities.CheckIn.list('-date', 7).catch(() => []);
  } catch (e) {}

  const latestCheckIn = checkIns[0] || null;

  const activeStressDomains = detectStressDomains(userInput);
  const stressLevels = {};
  if (latestCheckIn?.stress_level != null) {
    for (const domain of activeStressDomains) {
      stressLevels[domain] = Math.min(1, latestCheckIn.stress_level / 10);
    }
  }
  const stressDegradations = propagateStress(activeStressDomains, stressLevels);
  const maxStressDegradation = Object.values(stressDegradations).length > 0
    ? Math.max(...Object.values(stressDegradations)) : null;

  const cognitiveLoadResult = estimateCognitiveLoad({
    stressLevel: latestCheckIn?.stress_level,
    focusLevel: latestCheckIn?.focus_level,
    sleepQuality: latestCheckIn?.sleep_quality,
    emotionalIntensity: affectiveContext?.emotionIntensity,
    stressDegradation: maxStressDegradation,
  });

  const bandwidth = computeBandwidth(cognitiveLoadResult.score);
  const energyBudget = computeEnergyBudget(checkIns);
  const physicalEnergy = latestCheckIn?.energy != null
    ? Math.round((latestCheckIn.energy / 10) * 100)
    : (energyBudget.available ?? null);

  let emotionalLoad = null;
  if (latestCheckIn?.mood != null) {
    emotionalLoad = Math.round((10 - latestCheckIn.mood) * 10);
  } else if (affectiveContext?.emotionIntensity != null) {
    emotionalLoad = Math.round(affectiveContext.emotionIntensity * 100);
  }

  const sleepEstimate = latestCheckIn?.sleep_hours ?? null;
  const timePressure = detectTimePressure(userInput);
  const currentGoals = extractCurrentGoals(userInput);
  const knownConstraints = extractConstraints(userInput);
  const recentProgress = energyBudget.trend === ENERGY_TREND.IMPROVING ? 'improving'
    : energyBudget.trend === ENERGY_TREND.DECLINING ? 'declining'
    : energyBudget.trend === ENERGY_TREND.STABLE ? 'stable'
    : 'unknown';

  let decisionCapacity = null;
  if (bandwidth != null && physicalEnergy != null) {
    const timePressurePenalty = timePressure === 'HIGH' ? 25 : timePressure === 'MODERATE' ? 10 : 0;
    const stressPenalty = cognitiveLoadResult.score != null ? Math.round(cognitiveLoadResult.score * 0.2) : 0;
    decisionCapacity = Math.max(0, Math.min(100,
      Math.round((bandwidth + physicalEnergy) / 2 - timePressurePenalty - stressPenalty)));
  }

  const confidence = (bandwidth != null && physicalEnergy != null) ? 'MEDIUM' : 'LOW';
  const unknowns = [];
  if (!latestCheckIn) unknowns.push('No recent check-in data');
  if (sleepEstimate == null) unknowns.push('Sleep not reported');
  if (physicalEnergy == null) unknowns.push('Physical energy unknown');

  const adaptations = getResponseAdaptations(cognitiveLoadResult.level);

  return {
    cognitiveLoad: cognitiveLoadResult,
    bandwidth,
    emotionalLoad,
    physicalEnergy,
    sleepEstimate,
    timePressure,
    currentGoals,
    recentProgress,
    knownConstraints,
    energyBudget,
    stressDomains: activeStressDomains,
    stressDegradations,
    decisionCapacity,
    adaptations,
    confidence,
    unknowns,
  };
}

export function buildHumanStateContextString(humanState) {
  if (!humanState) return '';
  const parts = ['[HUMAN STATE — RUNTIME MODEL]'];

  parts.push(`Cognitive Load: ${humanState.cognitiveLoad.level}${humanState.cognitiveLoad.score != null ? ` (${humanState.cognitiveLoad.score}/100)` : ''}`);
  if (humanState.bandwidth != null) parts.push(`Available Bandwidth: ${humanState.bandwidth}/100`);
  if (humanState.emotionalLoad != null) parts.push(`Emotional Load: ${humanState.emotionalLoad}/100`);
  if (humanState.physicalEnergy != null) parts.push(`Physical Energy: ${humanState.physicalEnergy}/100`);
  if (humanState.sleepEstimate != null) parts.push(`Sleep (last reported): ${humanState.sleepEstimate}h`);
  parts.push(`Time Pressure: ${humanState.timePressure}`);
  if (humanState.decisionCapacity != null) parts.push(`Decision Capacity: ${humanState.decisionCapacity}/100`);
  if (humanState.currentGoals?.length > 0) parts.push(`Current Goals: ${humanState.currentGoals.join('; ')}`);
  if (humanState.knownConstraints?.length > 0) parts.push(`Known Constraints: ${humanState.knownConstraints.join('; ')}`);
  parts.push(`Recent Progress: ${humanState.recentProgress}`);
  if (humanState.energyBudget?.available != null) {
    parts.push(`Energy Budget: ${humanState.energyBudget.available}/100 (trend: ${humanState.energyBudget.trend})`);
  }
  parts.push(`Confidence: ${humanState.confidence}`);
  if (humanState.unknowns?.length > 0) parts.push(`Unknowns: ${humanState.unknowns.join('; ')}`);

  parts.push(`\nResponse Adaptation:`);
  parts.push(`  Max length: ${humanState.adaptations.maxLength}`);
  parts.push(`  Max suggestions: ${humanState.adaptations.maxSuggestions}`);
  parts.push(`  Postpone deep analysis: ${humanState.adaptations.postponeDeepAnalysis}`);
  parts.push(`  Simplify explanations: ${humanState.adaptations.simplifyExplanations}`);
  parts.push(`  Guidance: ${humanState.adaptations.guidance}`);

  parts.push('\nRules: Adapt for clarity, not persuasion. Never alter factual content or honesty to increase agreement.');
  parts.push('Reflection Cycle: After significant interactions, consider: What changed? What remains uncertain? What experiment could help?');
  parts.push('[/HUMAN STATE]\n');

  return parts.join('\n') + '\n';
}