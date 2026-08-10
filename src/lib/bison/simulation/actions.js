// Layer 8 — Actions are generic. Simulations choose which are available.

export const ACTIONS = ['move', 'observe', 'speak', 'trade', 'help', 'negotiate', 'acquire', 'repair', 'maintain', 'investigate', 'wait'];

// Which needs each action tends to serve — the basis of predicted benefit.
export const ACTION_NEEDS = {
  move: { exploration: 0.6, curiosity: 0.3, stability: -0.2 },
  observe: { curiosity: 0.5, safety: 0.3 },
  speak: { belonging: 0.7, reputation: 0.3 },
  trade: { resources: 0.8, reputation: 0.2 },
  help: { belonging: 0.6, reputation: 0.6, resources: -0.2 },
  negotiate: { reputation: 0.5, stability: 0.5, belonging: 0.2 },
  acquire: { resources: 0.9, achievement: 0.3 },
  repair: { stability: 0.7, achievement: 0.5 },
  maintain: { stability: 0.8, safety: 0.3 },
  investigate: { curiosity: 0.8, safety: 0.4 },
  wait: { stability: 0.3, safety: 0.2 },
};

export const ACTION_COST = {
  move: 0.25, observe: 0.05, speak: 0.1, trade: 0.35, help: 0.4,
  negotiate: 0.3, acquire: 0.5, repair: 0.45, maintain: 0.3,
  investigate: 0.25, wait: 0.02,
};

export const ACTION_RISK = {
  move: 0.1, observe: 0.02, speak: 0.15, trade: 0.3, help: 0.15,
  negotiate: 0.35, acquire: 0.4, repair: 0.2, maintain: 0.1,
  investigate: 0.25, wait: 0.01,
};

export function availableActions(world, agent, perception) {
  const set = ['observe', 'wait', 'move', 'investigate'];
  if (perception.visibleAgents.length > 0) set.push('speak', 'help', 'negotiate', 'trade');
  if (perception.visibleObjects.length > 0) set.push('acquire', 'repair', 'maintain');
  if ((perception.location?.condition ?? 100) < 70) set.push('repair', 'maintain');
  return [...new Set(set)];
}