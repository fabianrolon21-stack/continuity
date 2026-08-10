// Layer 6 — Prediction. No perfect knowledge; only estimates with confidence.

import { ACTION_NEEDS, ACTION_COST, ACTION_RISK } from './actions';
import { needPressure } from './needs';

export function predict(agent, action, perception) {
  const map = ACTION_NEEDS[action] || {};
  let benefit = 0;
  for (const [need, weight] of Object.entries(map)) {
    benefit += weight * needPressure(agent, need);
  }

  // Experience shifts the estimate — this is what learning writes back into.
  const learned = agent.expectations[action] ?? 0;
  benefit += learned;

  const cost = ACTION_COST[action] ?? 0.2;
  let risk = ACTION_RISK[action] ?? 0.2;

  // Untrusted company makes social actions riskier.
  if (['speak', 'trade', 'negotiate', 'help'].includes(action)) {
    const others = perception.visibleAgents.map(o => agent.beliefs[o.id]).filter(Boolean);
    const avgTrust = others.length ? others.reduce((s, b) => s + b.trust, 0) / others.length : 0;
    risk = Math.max(0.02, risk - avgTrust * 0.2);
  }

  const samples = (agent.samples?.[action] ?? 0);
  const confidence = Math.min(0.95, 0.25 + samples * 0.08);
  const expectedValue = benefit - cost - risk * (1 - confidence * 0.5);

  return { action, benefit, cost, risk, confidence, expectedValue };
}

export function predictAll(agent, actions, perception) {
  return actions.map(a => predict(agent, a, perception));
}