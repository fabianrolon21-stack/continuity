// ═══════════════════════════════════════════════
// DECISION SIMULATOR
// Simulates outcomes, evaluates priorities,
// recommends actions, and learns from feedback.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const PRIORITY_DIMENSIONS = [
  'user_goals', 'safety', 'privacy', 'time', 'resources',
  'emotional_impact', 'long_term_benefit', 'system_integrity',
];

const SIMULATION_SCHEMA = {
  type: 'object',
  properties: {
    situation_understanding: { type: 'string' },
    benefit_analysis: { type: 'string' },
    benefit_score: { type: 'number' },
    risk_analysis: { type: 'string' },
    risk_score: { type: 'number' },
    alternatives: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          tradeoffs: { type: 'string' },
          score: { type: 'number' },
        },
      },
    },
    long_term_outlook: { type: 'string' },
    priority_weights: {
      type: 'object',
      properties: PRIORITY_DIMENSIONS.reduce((acc, d) => ({ ...acc, [d]: { type: 'number' } }), {}),
    },
    recommended_action: { type: 'string' },
    confidence_score: { type: 'number' },
  },
};

const ACCURACY_SCHEMA = {
  type: 'object',
  properties: {
    predicted_vs_actual: { type: 'string' },
    accuracy_score: { type: 'number' },
    what_was_wrong: { type: 'string' },
    model_adjustment: { type: 'string' },
  },
};

export async function simulateDecision(situation, userContext = {}) {
  const contextStr = userContext.checkins ? `\nRecent check-ins: ${JSON.stringify(userContext.checkins.slice(0, 3))}` : '';
  const goalsStr = userContext.goals ? `\nUser goals: ${JSON.stringify(userContext.goals)}` : '';

  const prompt = `You are a decision simulation engine for a personal AI companion. 
The user faces this situation: "${situation}"
${contextStr}
${goalsStr}

Simulate the decision space:
1. Understand the situation
2. Simulate benefits of acting
3. Simulate risks
4. Generate alternative approaches
5. Consider long-term outcomes
6. Weigh priorities: ${PRIORITY_DIMENSIONS.join(', ')}
7. Recommend the best action
8. Rate your confidence (0-100)

Be practical and specific. Focus on what actually helps this person.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: SIMULATION_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

export async function analyzeDecisionAccuracy(simulation, observedOutcome, userFeedback) {
  const prompt = `Compare the AI's decision simulation with what actually happened.

Simulated recommendation: "${simulation.recommended_action}"
Predicted benefit score: ${simulation.benefit_score}
Predicted risk score: ${simulation.risk_score}
Predicted long-term outlook: "${simulation.long_term_outlook}"

What actually happened: "${observedOutcome}"
User feedback: "${userFeedback}"

Analyze prediction accuracy (0-100), what was wrong, and what model adjustment should be made for future similar decisions.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: ACCURACY_SCHEMA,
    add_context_from_internet: false,
  });

  return result;
}

export function calculatePriorityWeights(userContext) {
  // Default weights, adjustable by user state
  const weights = {
    user_goals: 0.9,
    safety: 1.0,
    privacy: 0.9,
    time: 0.6,
    resources: 0.5,
    emotional_impact: 0.8,
    long_term_benefit: 0.7,
    system_integrity: 0.4,
  };

  // Adjust based on stress level
  if (userContext.stressLevel > 7) {
    weights.emotional_impact = 1.0;
    weights.safety = 1.0;
    weights.time = 0.3;
  }

  // Adjust based on energy
  if (userContext.energy < 4) {
    weights.resources = 0.9;
    weights.emotional_impact = 0.9;
    weights.long_term_benefit = 0.4;
  }

  return weights;
}