// Layer 5 — Universal needs. Every agent has all of them.
// Agent types differ only in how they weight them.

export const NEEDS = [
  'safety', 'resources', 'belonging', 'reputation',
  'achievement', 'curiosity', 'stability', 'exploration',
];

export const NEED_LABELS = {
  safety: 'Safety',
  resources: 'Resources',
  belonging: 'Belonging',
  reputation: 'Reputation',
  achievement: 'Achievement',
  curiosity: 'Curiosity',
  stability: 'Stability',
  exploration: 'Exploration',
};

// Weight profiles — the only thing that separates a shopkeeper from a rival faction.
export const NEED_PROFILES = {
  resident: { safety: 1.2, resources: 0.9, belonging: 1.1, reputation: 0.7, achievement: 0.6, curiosity: 0.7, stability: 1.2, exploration: 0.5 },
  merchant: { safety: 0.8, resources: 1.5, belonging: 0.7, reputation: 1.2, achievement: 1.0, curiosity: 0.6, stability: 0.9, exploration: 0.6 },
  organizer: { safety: 0.9, resources: 0.7, belonging: 1.4, reputation: 1.3, achievement: 1.0, curiosity: 0.8, stability: 0.8, exploration: 0.7 },
  caretaker: { safety: 1.1, resources: 0.8, belonging: 1.2, reputation: 0.6, achievement: 0.9, curiosity: 0.7, stability: 1.3, exploration: 0.4 },
  wanderer: { safety: 0.7, resources: 0.8, belonging: 0.6, reputation: 0.5, achievement: 0.7, curiosity: 1.5, stability: 0.4, exploration: 1.6 },
};

export function initialNeeds(rng) {
  const needs = {};
  for (const n of NEEDS) needs[n] = 35 + Math.floor(rng() * 30);
  return needs;
}

// Needs drift each tick — unmet needs grow louder.
export function tickNeeds(agent) {
  for (const n of NEEDS) {
    const drift = 0.6 * (agent.weights[n] || 1);
    agent.needs[n] = Math.max(0, Math.min(100, agent.needs[n] + drift));
  }
}

export function satisfy(agent, need, amount) {
  agent.needs[need] = Math.max(0, Math.min(100, agent.needs[need] - amount));
}

// Pressure = how loudly a need is asking, scaled by this agent's weighting.
export function needPressure(agent, need) {
  return (agent.needs[need] / 100) * (agent.weights[need] || 1);
}