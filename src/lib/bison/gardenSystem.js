// ═══════════════════════════════════════════════
// GARDEN SYSTEM (Gamification)
// Plant growth, garden expansion, unlocks, seasons,
// wildlife, rare discoveries, collections.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export const GARDEN_TIERS = [
  { threshold: 0,  name: 'Starter Garden',     unlocks: ['fern', 'wildflower'],                      color: 'hsl(120 40% 58%)' },
  { threshold: 5,  name: 'Growing Garden',     unlocks: ['flower', 'herb', 'succulent'],             color: 'hsl(42 63% 55%)' },
  { threshold: 10, name: 'Flourishing Garden', unlocks: ['tree', 'vine', 'bonsai'],                  color: 'hsl(21 73% 69%)' },
  { threshold: 20, name: 'Abundant Garden',    unlocks: ['mushroom', 'orchid', 'crystal'],           color: 'hsl(265 41% 64%)' },
  { threshold: 30, name: 'Master Garden',      unlocks: ['rare_bloom'],                              color: 'hsl(48 67% 74%)' },
];

export const PLANT_TYPES = {
  fern:        { name: 'Fern',         rarity: 'common',    emoji: '🌿', growthTime: 3, color: 'hsl(120 40% 58%)' },
  wildflower:  { name: 'Wildflower',   rarity: 'common',    emoji: '🌼', growthTime: 2, color: 'hsl(42 63% 55%)' },
  flower:      { name: 'Flower',       rarity: 'common',    emoji: '🌸', growthTime: 4, color: 'hsl(21 73% 69%)' },
  herb:        { name: 'Herb',         rarity: 'common',    emoji: '🌱', growthTime: 3, color: 'hsl(120 40% 58%)' },
  succulent:   { name: 'Succulent',    rarity: 'common',    emoji: '🪴', growthTime: 5, color: 'hsl(120 30% 50%)' },
  tree:        { name: 'Tree',         rarity: 'uncommon',  emoji: '🌳', growthTime: 8, color: 'hsl(120 35% 45%)' },
  vine:        { name: 'Vine',         rarity: 'uncommon',  emoji: '🍃', growthTime: 6, color: 'hsl(120 40% 55%)' },
  bonsai:      { name: 'Bonsai',       rarity: 'uncommon',  emoji: '🪵', growthTime: 7, color: 'hsl(30 30% 50%)' },
  mushroom:    { name: 'Mushroom',     rarity: 'rare',      emoji: '🍄', growthTime: 5, color: 'hsl(0 60% 55%)' },
  orchid:      { name: 'Orchid',       rarity: 'rare',      emoji: '🌺', growthTime: 6, color: 'hsl(300 50% 60%)' },
  crystal:     { name: 'Crystal',      rarity: 'rare',      emoji: '💎', growthTime: 10, color: 'hsl(199 56% 64%)' },
  rare_bloom:  { name: 'Rare Bloom',   rarity: 'legendary', emoji: '✨', growthTime: 14, color: 'hsl(48 67% 74%)' },
};

export const GROWTH_STAGES = [
  { stage: 'seed',    label: 'Seed',    emoji: '🌰', threshold: 0 },
  { stage: 'sprout',  label: 'Sprout',  emoji: '🌱', threshold: 1 },
  { stage: 'young',   label: 'Young',   emoji: '🌿', threshold: 3 },
  { stage: 'mature',  label: 'Mature',  emoji: '🌳', threshold: 5 },
  { stage: 'blooming',label: 'Blooming',emoji: '🌸', threshold: 8 },
];

export const WILDLIFE_TYPES = [
  { name: 'Butterfly', emoji: '🦋', chance: 0.15, requiresStage: 'blooming' },
  { name: 'Bee',       emoji: '🐝', chance: 0.12, requiresStage: 'blooming' },
  { name: 'Ladybug',   emoji: '🐞', chance: 0.08, requiresStage: 'mature' },
  { name: 'Bird',      emoji: '🐦', chance: 0.10, requiresStage: 'mature' },
  { name: 'Firefly',   emoji: '✨', chance: 0.05, requiresStage: 'mature', requiresTime: 'night' },
  { name: 'Rabbit',    emoji: '🐰', chance: 0.04, requiresStage: 'blooming' },
];

export function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getGardenTier(plantCount) {
  let currentTier = GARDEN_TIERS[0];
  for (const tier of GARDEN_TIERS) {
    if (plantCount >= tier.threshold) currentTier = tier;
  }
  return currentTier;
}

export function getAvailablePlants(plantCount) {
  const tier = getGardenTier(plantCount);
  const tierIndex = GARDEN_TIERS.indexOf(tier);
  const available = [];
  for (let i = 0; i <= tierIndex; i++) {
    available.push(...GARDEN_TIERS[i].unlocks);
  }
  return available;
}

export function calculateGrowthStage(careActions) {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (careActions >= GROWTH_STAGES[i].threshold) return GROWTH_STAGES[i];
  }
  return GROWTH_STAGES[0];
}

export function checkWildlifeAppearance(plant) {
  const stage = calculateGrowthStage(plant.care_actions || 0);
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour <= 5;

  for (const wildlife of WILDLIFE_TYPES) {
    if (plant.growth_stage !== wildlife.requiresStage && stage.stage !== wildlife.requiresStage) continue;
    if (wildlife.requiresTime === 'night' && !isNight) continue;
    if (Math.random() < wildlife.chance) return wildlife;
  }
  return null;
}

export async function plantSeed(plantType, positionX = null, positionY = null) {
  const config = PLANT_TYPES[plantType];
  if (!config) return null;

  const season = getCurrentSeason();
  const x = positionX ?? Math.random() * 80 + 10;
  const y = positionY ?? Math.random() * 60 + 20;

  const plant = await base44.entities.GardenPlant.create({
    plant_type: plantType,
    growth_stage: 'seed',
    rarity: config.rarity,
    health: 100,
    care_actions: 0,
    position_x: x,
    position_y: y,
    season,
  });

  return plant;
}

export async function careForPlant(plantId) {
  const plant = await base44.entities.GardenPlant.get(plantId);
  if (!plant) return null;

  const newCareCount = (plant.care_actions || 0) + 1;
  const newStage = calculateGrowthStage(newCareCount);
  const wildlife = newCareCount >= 3 ? checkWildlifeAppearance(plant) : null;

  const updates = {
    care_actions: newCareCount,
    growth_stage: newStage.stage,
    health: Math.min(100, (plant.health || 80) + 5),
  };

  if (wildlife) {
    updates.discovered_wildlife = wildlife.name;
  }

  const updated = await base44.entities.GardenPlant.update(plantId, updates);
  return { plant: updated, wildlife };
}

export async function checkForRareDiscovery(plantCount) {
  // Rare plant chance increases with garden size
  const baseChance = 0.02;
  const sizeBonus = Math.min(0.08, plantCount * 0.002);
  if (Math.random() < baseChance + sizeBonus) {
    return PLANT_TYPES.rare_bloom;
  }
  return null;
}

export function getSeasonalModifiers(season) {
  const modifiers = {
    spring: { growthMultiplier: 1.2,  color: 'hsl(120 40% 58%)', wildlifeBonus: 0.05 },
    summer: { growthMultiplier: 1.0,  color: 'hsl(42 63% 55%)',  wildlifeBonus: 0.08 },
    autumn: { growthMultiplier: 0.8,  color: 'hsl(21 73% 69%)',  wildlifeBonus: 0.03 },
    winter: { growthMultiplier: 0.5,  color: 'hsl(199 56% 64%)', wildlifeBonus: 0.01 },
  };
  return modifiers[season] || modifiers.spring;
}