// ═══════════════════════════════════════════════
// ENVIRONMENT DEFINITIONS (Package 018 — Background Store)
// Purchasable background environments with unique
// particle effects and ambient sounds.
//
// These are distinct from themes — environments layer
// ON TOP of the active theme to add atmospheric particles.
// ═══════════════════════════════════════════════

export const ENVIRONMENTS = {
  forest: {
    id: 'forest',
    name: 'Forest',
    desc: 'Drifting leaves and singing birds',
    cost: 20,
    color: 'hsl(120 40% 58%)',
    particleType: 'leaf',
    particleColor: 'hsl(120 40% 45%)',
    particleDensity: 0.6,
    ambientSound: 'forest',
    icon: 'tree',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    desc: 'Floating bubbles and gentle waves',
    cost: 20,
    color: 'hsl(199 56% 64%)',
    particleType: 'bubble',
    particleColor: 'hsl(199 56% 70%)',
    particleDensity: 0.5,
    ambientSound: 'water',
    icon: 'cloud',
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain',
    desc: 'Drifting clouds over peaks',
    cost: 20,
    color: 'hsl(0 0% 70%)',
    particleType: 'cloud',
    particleColor: 'hsl(0 0% 85%)',
    particleDensity: 0.4,
    ambientSound: 'wind',
    icon: 'mountain',
  },
  winter: {
    id: 'winter',
    name: 'Winter',
    desc: 'Soft falling snow',
    cost: 25,
    color: 'hsl(200 30% 80%)',
    particleType: 'snow',
    particleColor: 'hsl(0 0% 100%)',
    particleDensity: 0.7,
    ambientSound: 'wind',
    icon: 'snowflake',
  },
  rainy_day: {
    id: 'rainy_day',
    name: 'Rainy Day',
    desc: 'Gentle raindrops and distant rain',
    cost: 25,
    color: 'hsl(210 20% 50%)',
    particleType: 'rain',
    particleColor: 'hsl(210 30% 70%)',
    particleDensity: 0.8,
    ambientSound: 'rain',
    icon: 'cloud',
  },
  night_sky: {
    id: 'night_sky',
    name: 'Night Sky',
    desc: 'Twinkling stars and shooting stars',
    cost: 25,
    color: 'hsl(250 40% 50%)',
    particleType: 'star',
    particleColor: 'hsl(48 67% 74%)',
    particleDensity: 0.6,
    ambientSound: 'crickets',
    icon: 'star',
  },
  cherry_blossom: {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    desc: 'Drifting pink petals',
    cost: 30,
    color: 'hsl(330 50% 70%)',
    particleType: 'petal',
    particleColor: 'hsl(330 50% 75%)',
    particleDensity: 0.5,
    ambientSound: 'birds',
    icon: 'flower',
  },
};

export function getEnvironment(envId) {
  return ENVIRONMENTS[envId] || null;
}

export function getActiveEnvironment(user) {
  if (!user?.active_environment) return null;
  return ENVIRONMENTS[user.active_environment] || null;
}