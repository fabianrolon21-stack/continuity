// Simulation engine — drives the shared loop for every agent, then updates the world.
// Deterministic: same seed + same tick count always replays identically.

import { makeRng } from './rng';
import { createWorld } from './world';
import { runCognitiveCycle } from './cognitiveLoop';
import { updateWorld } from './worldUpdate';

export function newSimulation(seed = 'continuity') {
  const world = createWorld(seed);
  return { world, traces: [] };
}

export function stepSimulation(sim) {
  const { world } = sim;
  world.tick += 1;
  // RNG is derived from seed + tick, so replay is exact.
  const rng = makeRng(world.seed + world.tick * 7919);

  const traces = [];
  for (const agent of world.agents) {
    traces.push(runCognitiveCycle(world, agent, rng));
  }
  updateWorld(world, rng);

  sim.traces = traces;
  return sim;
}

export function runTicks(sim, count = 1) {
  for (let i = 0; i < count; i++) stepSimulation(sim);
  return sim;
}

export function worldSummary(world) {
  const avgCondition = world.buildings.reduce((s, b) => s + b.condition, 0) / world.buildings.length;
  const avgTrust = world.agents.reduce((s, a) => {
    const beliefs = Object.values(a.beliefs);
    return s + (beliefs.length ? beliefs.reduce((t, b) => t + b.trust, 0) / beliefs.length : 0);
  }, 0) / world.agents.length;
  return {
    tick: world.tick,
    agents: world.agents.length,
    organizations: world.organizations.length,
    buildings: world.buildings.length,
    avgCondition: Math.round(avgCondition),
    economyIndex: world.economy.index.toFixed(2),
    avgTrust: avgTrust.toFixed(2),
  };
}