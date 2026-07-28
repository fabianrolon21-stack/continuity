// ═══════════════════════════════════════════════
// PLANT SPECIES CATALOG (Living World Update)
// Each species has unique stage visuals, an idle
// animation style, and rarity. Golden Bloom is the
// final earned state for well-cared blooming plants.
// ═══════════════════════════════════════════════

export const PLANT_SPECIES = {
  // Original types
  fern:       { label: 'Fern',        stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌿', blooming: '🌿' }, animation: 'sway',    rarity: 'common' },
  flower:     { label: 'Flower',      stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌺', blooming: '🌺' }, animation: 'sway',    rarity: 'common' },
  tree:       { label: 'Tree',        stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌳', blooming: '🌳' }, animation: 'sway',    rarity: 'common' },
  mushroom:   { label: 'Mushroom',    stages: { seed: '🌰', sprout: '🌱', young: '🍄', mature: '🍄', blooming: '🍄' }, animation: 'bounce',  rarity: 'uncommon' },
  crystal:    { label: 'Crystal',     stages: { seed: '🌰', sprout: '💠', young: '💠', mature: '🔮', blooming: '🔮' }, animation: 'shimmer', rarity: 'rare' },
  vine:       { label: 'Vine',        stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🍃', blooming: '🍃' }, animation: 'stretch', rarity: 'common' },
  succulent:  { label: 'Succulent',   stages: { seed: '🌰', sprout: '🌱', young: '🌵', mature: '🌵', blooming: '🌵' }, animation: 'bounce',  rarity: 'common' },
  herb:       { label: 'Herb',        stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🪴', blooming: '🪴' }, animation: 'sway',    rarity: 'common' },
  bonsai:     { label: 'Bonsai',      stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🎍', blooming: '🎍' }, animation: 'sway',    rarity: 'uncommon' },
  orchid:     { label: 'Orchid',      stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌸', blooming: '🪷' }, animation: 'sway',    rarity: 'rare' },
  wildflower: { label: 'Wildflower',  stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌼', blooming: '💐' }, animation: 'bounce',  rarity: 'common' },
  rare_bloom: { label: 'Rare Bloom',  stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌺', blooming: '🏵️' }, animation: 'glow',    rarity: 'legendary' },
  // New flower species
  sunflower:      { label: 'Sunflower',      stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌻', blooming: '🌻' }, animation: 'bounce',  rarity: 'common' },
  daisy:          { label: 'Daisy',          stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌼', blooming: '🌼' }, animation: 'sway',    rarity: 'common' },
  lavender:       { label: 'Lavender',       stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '💜', blooming: '🪻' }, animation: 'sway',    rarity: 'uncommon' },
  rose:           { label: 'Rose',           stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌹', blooming: '🌹' }, animation: 'sway',    rarity: 'uncommon' },
  tulip:          { label: 'Tulip',          stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌷', blooming: '🌷' }, animation: 'bounce',  rarity: 'common' },
  bluebell:       { label: 'Bluebell',       stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🔔', blooming: '🪻' }, animation: 'sway',    rarity: 'uncommon' },
  lily:           { label: 'Lily',           stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '⚜️', blooming: '🪷' }, animation: 'sway',    rarity: 'rare' },
  cherry_blossom: { label: 'Cherry Blossom', stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌸', blooming: '🌸' }, animation: 'drift',   rarity: 'rare' },
  dandelion:      { label: 'Dandelion',      stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌼', blooming: '🍀' }, animation: 'drift',   rarity: 'common' },
  glowing_bloom:  { label: 'Glowing Bloom',  stages: { seed: '🌰', sprout: '✨', young: '🌟', mature: '🌟', blooming: '💫' }, animation: 'glow',    rarity: 'legendary' },
  moonflower:     { label: 'Moonflower',     stages: { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌙', blooming: '🌕' }, animation: 'shimmer', rarity: 'legendary' },
};

export function getSpecies(plantType) {
  return PLANT_SPECIES[plantType] || PLANT_SPECIES.flower;
}

export function getStageEmoji(plantType, stage) {
  const species = getSpecies(plantType);
  return species.stages[stage] || species.stages.sprout;
}

// Golden Bloom — the earned final state
export function isGoldenBloom(plant) {
  return plant.growth_stage === 'blooming' && (plant.care_actions || 0) >= 10;
}

// Idle animation params per style (framer-motion)
export function getIdleAnimation(style, idx) {
  switch (style) {
    case 'bounce':
      return { animate: { y: [0, -3, 0] }, transition: { duration: 2 + (idx % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' } };
    case 'shimmer':
      return { animate: { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] }, transition: { duration: 3 + (idx % 2), repeat: Infinity, ease: 'easeInOut' } };
    case 'glow':
      return { animate: { filter: ['drop-shadow(0 0 2px hsl(48 80% 70% / 0.4))', 'drop-shadow(0 0 10px hsl(48 80% 70% / 0.9))', 'drop-shadow(0 0 2px hsl(48 80% 70% / 0.4))'] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } };
    case 'stretch':
      return { animate: { scaleY: [1, 1.06, 1] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } };
    case 'drift':
      return { animate: { rotate: [-4, 4, -4], y: [0, -2, 0] }, transition: { duration: 4 + (idx % 2), repeat: Infinity, ease: 'easeInOut' } };
    case 'sway':
    default:
      return { animate: { rotate: [idx % 2 ? -3 : 2, idx % 2 ? 3 : -3] }, transition: { duration: 2.5 + (idx % 3), repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } };
  }
}