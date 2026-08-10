// Layer 8 (apply) + Layer 9 — Action effects, then learning from prediction error.

import { pick } from './rng';
import { satisfy } from './needs';
import { remember, reinforce } from './memory';
import { adjustTrust } from './interpretation';
import { logEvent, buildingsNear } from './world';

export function act(world, agent, choice, perception, rng) {
  const action = choice.action;
  const other = perception.visibleAgents.length ? pick(rng, perception.visibleAgents) : null;
  const object = perception.visibleObjects.length ? pick(rng, perception.visibleObjects) : null;
  let actualUtility = choice.benefit * (0.6 + rng() * 0.7) - choice.cost;
  let summary = action;
  let importance = 0.3;

  switch (action) {
    case 'move': {
      const options = buildingsNear(world, agent).filter(b => b.id !== agent.locationId);
      if (options.length) {
        const dest = pick(rng, options);
        agent.locationId = dest.id;
        summary = `moved to ${dest.name}`;
        satisfy(agent, 'exploration', 12);
        satisfy(agent, 'curiosity', 6);
      }
      break;
    }
    case 'observe':
      satisfy(agent, 'curiosity', 6);
      satisfy(agent, 'safety', 4);
      summary = 'observed surroundings';
      break;
    case 'speak':
      if (other) {
        satisfy(agent, 'belonging', 12);
        adjustTrust(agent, other.id, 0.06, other.name);
        summary = `spoke with ${other.name}`;
        importance = 0.45;
      } else { actualUtility -= 0.3; summary = 'spoke to no one'; }
      break;
    case 'help':
      if (other) {
        satisfy(agent, 'belonging', 14);
        satisfy(agent, 'reputation', 10);
        agent.standing = Math.min(100, agent.standing + 2);
        adjustTrust(agent, other.id, 0.12, other.name);
        const target = world.agents.find(a => a.id === other.id);
        if (target) adjustTrust(target, agent.id, 0.15, agent.name);
        summary = `helped ${other.name}`;
        importance = 0.7;
      } else { actualUtility -= 0.3; }
      break;
    case 'trade':
      if (other) {
        const gain = 4 + Math.floor(rng() * 10);
        agent.resources += gain;
        satisfy(agent, 'resources', 14);
        adjustTrust(agent, other.id, rng() > 0.25 ? 0.08 : -0.12, other.name);
        summary = `traded with ${other.name} (+${gain})`;
        importance = 0.5;
      } else { actualUtility -= 0.3; }
      break;
    case 'negotiate':
      if (other) {
        const success = rng() > 0.35;
        satisfy(agent, 'stability', success ? 14 : 2);
        adjustTrust(agent, other.id, success ? 0.1 : -0.1, other.name);
        if (!success) actualUtility -= 0.4;
        summary = `${success ? 'reached terms with' : 'stalled negotiating with'} ${other.name}`;
        importance = 0.65;
      } else { actualUtility -= 0.3; }
      break;
    case 'acquire': {
      const cost = 6 + Math.floor(rng() * 8);
      agent.resources = Math.max(0, agent.resources - cost);
      satisfy(agent, 'resources', 8);
      satisfy(agent, 'achievement', 8);
      summary = object ? `acquired a ${object.kind}` : 'acquired supplies';
      break;
    }
    case 'repair':
    case 'maintain': {
      const building = world.buildings.find(b => b.id === agent.locationId);
      if (building) building.condition = Math.min(100, building.condition + (action === 'repair' ? 6 : 3));
      if (object) object.condition = Math.min(100, object.condition + 8);
      satisfy(agent, 'stability', 12);
      satisfy(agent, 'achievement', action === 'repair' ? 10 : 5);
      summary = `${action}ed ${object ? object.kind : building?.name || 'the place'}`;
      importance = 0.5;
      break;
    }
    case 'investigate':
      satisfy(agent, 'curiosity', 14);
      satisfy(agent, 'safety', 6);
      if (other) adjustTrust(agent, other.id, 0.02, other.name);
      summary = 'investigated something unclear';
      break;
    default:
      satisfy(agent, 'stability', 4);
      summary = 'waited';
  }

  remember(agent, { tick: world.tick, type: action, subjectId: other?.id, summary, importance });
  if (other) reinforce(agent, other.id, 0.1);
  agent.lastAction = { action, summary, tick: world.tick };
  logEvent(world, { agentId: agent.id, agentName: agent.name, action, summary, locationId: agent.locationId });

  return { actualUtility, summary };
}

// Layer 9 — Learning. Simple weight updates, no neural networks.
export function learn(agent, choice, outcome) {
  const error = outcome.actualUtility - choice.expectedValue;
  agent.samples = agent.samples || {};
  agent.samples[choice.action] = (agent.samples[choice.action] || 0) + 1;
  agent.expectations[choice.action] = (agent.expectations[choice.action] || 0) + error * 0.15;

  // Preferences shift with lived results.
  const drift = Math.max(-0.05, Math.min(0.05, error * 0.05));
  if (choice.action === 'help' || choice.action === 'speak') agent.weights.belonging = Math.max(0.2, agent.weights.belonging + drift);
  if (choice.action === 'trade' || choice.action === 'acquire') agent.weights.resources = Math.max(0.2, agent.weights.resources + drift);

  return { predictionError: error };
}