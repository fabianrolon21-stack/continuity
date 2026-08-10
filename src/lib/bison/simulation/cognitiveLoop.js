// The shared cognitive loop. Every agent runs exactly this cycle — no exceptions,
// no special-cased AI. Perception → Interpretation → Memory → Needs → Prediction
// → Decision → Action → Learning.

import { perceive } from './perception';
import { interpret } from './interpretation';
import { decayMemories } from './memory';
import { tickNeeds } from './needs';
import { availableActions } from './actions';
import { predictAll } from './prediction';
import { decide } from './decision';
import { act, learn } from './execution';

export function runCognitiveCycle(world, agent, rng) {
  const perception = perceive(world, agent);
  const beliefs = interpret(agent, perception);
  decayMemories(agent);
  tickNeeds(agent);

  const actions = availableActions(world, agent, perception);
  const predictions = predictAll(agent, actions, perception);
  const choice = decide(predictions, rng);
  const outcome = act(world, agent, choice, perception, rng);
  const learning = learn(agent, choice, outcome);

  return {
    agentId: agent.id,
    agentName: agent.name,
    perception,
    beliefCount: beliefs.length,
    predictions,
    choice,
    outcome,
    learning,
  };
}