// Layer 2 — Perception. Facts only. No emotion, no judgement.

import { agentsAt } from './world';

export function perceive(world, agent) {
  const location = world.buildings.find(b => b.id === agent.locationId) || null;
  const visibleAgents = agentsAt(world, agent.locationId, agent.id).map(a => ({ id: a.id, name: a.name, orgId: a.orgId }));
  const visibleObjects = world.objects.filter(o => o.locationId === agent.locationId);
  const recentEvents = world.events.filter(e => e.locationId === agent.locationId && e.tick >= world.tick - 2);

  return {
    tick: world.tick,
    location,
    visibleAgents,
    visibleObjects,
    conversations: recentEvents.filter(e => e.action === 'speak' || e.action === 'negotiate'),
    sounds: recentEvents.filter(e => e.action === 'repair' || e.action === 'trade').map(e => e.action),
    environment: {
      buildingCondition: location?.condition ?? null,
      economyIndex: world.economy.index,
    },
    internalState: { ...agent.needs, resources: agent.resources, standing: agent.standing },
  };
}