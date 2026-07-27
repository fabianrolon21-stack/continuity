// ═══════════════════════════════════════════════
// HABITATS (Package 50 — Living Sanctuary)
// Space A definitions. Each habitat reshapes lighting,
// palette, window, and the meaningful object (Space D).
// Unlocked with tokens — never purchasable with money.
// ═══════════════════════════════════════════════

export const HABITATS = {
  prairie: {
    id: 'prairie', name: 'Prairie', cost: 0,
    wall: 'hsl(120 22% 14%)', floor: 'hsl(100 28% 19%)', grass: 'hsl(110 38% 28%)',
    accent: 'hsl(120 40% 58%)', objectIcon: 'Sprout', objectLabel: 'Small plant',
    description: 'A tiny green room. Where it all began.',
  },
  forest: {
    id: 'forest', name: 'Forest', cost: 30,
    wall: 'hsl(140 25% 11%)', floor: 'hsl(130 24% 16%)', grass: 'hsl(135 35% 24%)',
    accent: 'hsl(140 45% 45%)', objectIcon: 'TreePine', objectLabel: 'Young pine',
    description: 'Deep greens and dappled shade.',
  },
  cabin: {
    id: 'cabin', name: 'Cabin', cost: 40,
    wall: 'hsl(25 30% 15%)', floor: 'hsl(20 35% 20%)', grass: 'hsl(28 30% 26%)',
    accent: 'hsl(30 60% 55%)', objectIcon: 'Flame', objectLabel: 'Fireplace',
    description: 'Warm wood and a crackling fire.',
  },
  lakeside: {
    id: 'lakeside', name: 'Lakeside', cost: 50,
    wall: 'hsl(200 30% 14%)', floor: 'hsl(195 28% 19%)', grass: 'hsl(180 30% 26%)',
    accent: 'hsl(199 56% 64%)', objectIcon: 'Waves', objectLabel: 'Still water',
    description: 'Quiet water at the edge of everything.',
  },
  snowfield: {
    id: 'snowfield', name: 'Snowfield', cost: 60,
    wall: 'hsl(210 20% 18%)', floor: 'hsl(210 15% 26%)', grass: 'hsl(210 20% 40%)',
    accent: 'hsl(200 30% 80%)', objectIcon: 'Snowflake', objectLabel: 'Ice crystal',
    description: 'Soft blue silence and footprints.',
  },
  cave: {
    id: 'cave', name: 'Cave', cost: 80,
    wall: 'hsl(265 25% 10%)', floor: 'hsl(260 20% 14%)', grass: 'hsl(265 22% 18%)',
    accent: 'hsl(265 41% 64%)', objectIcon: 'Gem', objectLabel: 'Glowing crystal',
    description: 'Amethyst light in the deep quiet.',
  },
  library: {
    id: 'library', name: 'Library', cost: 100,
    wall: 'hsl(35 25% 13%)', floor: 'hsl(30 30% 18%)', grass: 'hsl(35 25% 24%)',
    accent: 'hsl(48 67% 74%)', objectIcon: 'BookOpen', objectLabel: 'Open book',
    description: 'Paper, lamplight, and long thoughts.',
  },
  observatory: {
    id: 'observatory', name: 'Observatory', cost: 120,
    wall: 'hsl(240 30% 9%)', floor: 'hsl(245 25% 13%)', grass: 'hsl(240 20% 17%)',
    accent: 'hsl(48 67% 74%)', objectIcon: 'Telescope', objectLabel: 'Telescope',
    description: 'A dome open to the stars.',
  },
  castle: {
    id: 'castle', name: 'Castle', cost: 150,
    wall: 'hsl(280 15% 13%)', floor: 'hsl(275 15% 17%)', grass: 'hsl(280 12% 22%)',
    accent: 'hsl(42 63% 55%)', objectIcon: 'Lamp', objectLabel: 'Old lantern',
    description: 'Stone halls that hold their warmth.',
  },
};

export const DEFAULT_SANCTUARY_CONFIG = {
  habitat: 'prairie',
  unlocked_habitats: ['prairie'],
  weather_seen: [],
  sleep_watch_count: 0,
};

export function getHabitat(id) {
  return HABITATS[id] || HABITATS.prairie;
}

export function getSanctuaryConfig(user) {
  return { ...DEFAULT_SANCTUARY_CONFIG, ...(user?.sanctuary_config || {}) };
}