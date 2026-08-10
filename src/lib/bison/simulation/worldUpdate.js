// Layer 10 — World Update. Buildings age, economies drift, organizations shift.

export function updateWorld(world, rng) {
  for (const b of world.buildings) {
    b.condition = Math.max(5, b.condition - (rng() > 0.7 ? 1 : 0));
  }
  for (const o of world.objects) {
    o.condition = Math.max(0, o.condition - (rng() > 0.8 ? 1 : 0));
  }

  world.economy.trend = world.economy.trend * 0.8 + (rng() - 0.5) * 0.1;
  world.economy.index = Math.max(0.5, Math.min(1.6, world.economy.index + world.economy.trend * 0.05));

  for (const org of world.organizations) {
    const members = world.agents.filter(a => a.orgId === org.id);
    org.size = members.length;
    const avgStanding = members.length
      ? members.reduce((s, a) => s + a.standing, 0) / members.length
      : org.influence;
    org.influence = Math.max(5, Math.min(100, org.influence * 0.9 + avgStanding * 0.1));
  }

  // People relocate when stability is chronically unmet.
  for (const agent of world.agents) {
    if (agent.needs.stability > 92 && rng() > 0.85) {
      const options = world.buildings.filter(b => b.type === 'house' && b.id !== agent.homeId);
      if (options.length) {
        agent.homeId = options[Math.floor(rng() * options.length)].id;
        agent.needs.stability = 45;
      }
    }
    agent.resources = Math.max(0, agent.resources - 1 + (world.economy.index > 1 ? 1 : 0));
  }
}