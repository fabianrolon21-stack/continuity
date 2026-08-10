// Layer 1 — World. Deterministic: regions → blocks → buildings → rooms → agents/objects.

import { makeRng, pick, hashSeed } from './rng';
import { NEED_PROFILES, initialNeeds } from './needs';

const REGION_NAMES = ['Northside', 'Riverbend', 'Old Quarter'];
const BLOCK_NAMES = ['Ash Street', 'Kiln Row', 'Market Lane', 'Willow Walk', 'Foundry Way', 'Quiet End'];
const BUILDING_TYPES = ['house', 'business', 'public', 'workshop'];
const FIRST = ['Mara', 'Ollie', 'Bex', 'Ivan', 'Sena', 'Tomas', 'Rue', 'Nadia', 'Piet', 'Juna', 'Cal', 'Dara', 'Hal', 'Wren', 'Oskar', 'Lia'];
const LAST = ['Vance', 'Okoye', 'Brandt', 'Sol', 'Marsh', 'Reyes', 'Kaur', 'Nilsen'];
const ORG_NAMES = ['Ash Street Association', 'Riverbend Traders', 'The Kiln Collective', 'Old Quarter Watch'];
const OBJECT_KINDS = ['toolbox', 'notice board', 'cart', 'bench', 'ledger', 'water pump'];

export function createWorld(seedInput = 'continuity') {
  const seed = typeof seedInput === 'number' ? seedInput : hashSeed(seedInput);
  const rng = makeRng(seed);
  const world = {
    seed, tick: 0,
    regions: [], blocks: [], buildings: [], rooms: [],
    organizations: [], households: [], agents: [], objects: [], events: [],
    economy: { index: 1, trend: 0 },
  };

  REGION_NAMES.forEach((name, ri) => {
    const region = { id: `r${ri}`, name };
    world.regions.push(region);
    for (let bi = 0; bi < 2; bi++) {
      const block = { id: `${region.id}-b${bi}`, regionId: region.id, name: pick(rng, BLOCK_NAMES) };
      world.blocks.push(block);
      for (let ui = 0; ui < 3; ui++) {
        const type = ui === 0 ? 'house' : pick(rng, BUILDING_TYPES);
        const building = {
          id: `${block.id}-u${ui}`, blockId: block.id, regionId: region.id,
          name: `${block.name} ${10 + ui * 4}`,
          type, condition: 60 + Math.floor(rng() * 35),
        };
        world.buildings.push(building);
        for (let ro = 0; ro < 2; ro++) {
          world.rooms.push({ id: `${building.id}-rm${ro}`, buildingId: building.id, name: ro === 0 ? 'main' : 'back' });
        }
        if (rng() > 0.4) {
          world.objects.push({
            id: `obj-${building.id}`, kind: pick(rng, OBJECT_KINDS),
            locationId: building.id, condition: 50 + Math.floor(rng() * 50),
          });
        }
      }
    }
  });

  ORG_NAMES.forEach((name, oi) => {
    world.organizations.push({
      id: `org${oi}`, name, regionId: pick(rng, world.regions).id,
      size: 2 + Math.floor(rng() * 4), influence: 30 + Math.floor(rng() * 40),
    });
  });

  const profileKeys = Object.keys(NEED_PROFILES);
  const homes = world.buildings.filter(b => b.type === 'house');
  for (let i = 0; i < 14; i++) {
    const home = homes[i % homes.length];
    const type = profileKeys[i % profileKeys.length];
    const household = world.households.find(h => h.buildingId === home.id)
      || (() => { const h = { id: `hh-${home.id}`, buildingId: home.id, members: [] }; world.households.push(h); return h; })();
    const agent = {
      id: `a${i}`,
      name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      type,
      orgId: rng() > 0.45 ? pick(rng, world.organizations).id : null,
      householdId: household.id,
      homeId: home.id,
      locationId: home.id,
      needs: initialNeeds(rng),
      weights: { ...NEED_PROFILES[type] },
      beliefs: {},
      memories: [],
      expectations: {},
      lastAction: null,
      resources: 40 + Math.floor(rng() * 40),
      standing: 50,
    };
    household.members.push(agent.id);
    world.agents.push(agent);
  }

  return world;
}

export function agentsAt(world, locationId, exceptId) {
  return world.agents.filter(a => a.locationId === locationId && a.id !== exceptId);
}

export function buildingsNear(world, agent) {
  const home = world.buildings.find(b => b.id === agent.homeId);
  return world.buildings.filter(b => b.regionId === home?.regionId);
}

export function logEvent(world, event) {
  world.events.push({ tick: world.tick, ...event });
  if (world.events.length > 300) world.events.splice(0, world.events.length - 300);
}