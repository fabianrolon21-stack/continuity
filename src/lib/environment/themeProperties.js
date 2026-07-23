// ═══════════════════════════════════════════════
// THEME PROPERTIES (Package 018 — Immersive Environment)
// Extended visual/ambient properties for each theme.
// Pairs with themeEngine.js (which handles CSS token overrides).
//
// Each theme defines: decorative icons, particle type,
// lighting per time-of-day, ambient sounds, Bison environment.
// ═══════════════════════════════════════════════

import {
  Star, Sparkles, Leaf, Cloud, Moon, Sun, Feather, Music,
  Heart, Book, Coffee, Snowflake, Wind, Mountain, TreePine,
  Trees, Footprints, Bird, Flower2,
} from 'lucide-react';

export const DECORATIVE_ICONS = {
  star: Star, sparkle: Sparkles, leaf: Leaf, cloud: Cloud,
  moon: Moon, sun: Sun, feather: Feather, music: Music,
  heart: Heart, book: Book, coffee: Coffee, snowflake: Snowflake,
  wind: Wind, mountain: Mountain, tree: TreePine, trees: Trees,
  footprint: Footprints, bird: Bird, flower: Flower2,
};

export const THEME_PROPERTIES = {
  classic: {
    id: 'classic',
    label: 'Classic Nintendo',
    decorativeIcons: ['star', 'sparkle', 'cloud', 'moon'],
    particleType: null,
    particleColor: 'hsl(42 63% 55%)',
    particleDensity: 0.3,
    lighting: {
      morning:   { color: 'hsl(42 70% 60%)', x: '25%', y: '20%', intensity: 0.15 },
      afternoon: { color: 'hsl(120 40% 58%)', x: '50%', y: '15%', intensity: 0.10 },
      evening:   { color: 'hsl(21 73% 69%)', x: '75%', y: '25%', intensity: 0.18 },
      night:     { color: 'hsl(265 41% 64%)', x: '80%', y: '18%', intensity: 0.12 },
    },
    ambientSounds: [],
    bisonEnvironment: 'calm_room',
  },
  deep_ocean: {
    id: 'deep_ocean',
    label: 'Deep Ocean',
    decorativeIcons: ['cloud', 'star', 'sparkle'],
    particleType: 'bubble',
    particleColor: 'hsl(199 56% 64%)',
    particleDensity: 0.5,
    lighting: {
      morning:   { color: 'hsl(199 56% 64%)', x: '30%', y: '25%', intensity: 0.15 },
      afternoon: { color: 'hsl(180 45% 50%)', x: '50%', y: '15%', intensity: 0.12 },
      evening:   { color: 'hsl(220 40% 60%)', x: '70%', y: '30%', intensity: 0.16 },
      night:     { color: 'hsl(220 50% 40%)', x: '75%', y: '20%', intensity: 0.18 },
    },
    ambientSounds: ['water'],
    bisonEnvironment: 'coastal_overlook',
  },
  enchanted_forest: {
    id: 'enchanted_forest',
    label: 'Enchanted Forest',
    decorativeIcons: ['leaf', 'tree', 'feather', 'bird'],
    particleType: 'leaf',
    particleColor: 'hsl(120 40% 58%)',
    particleDensity: 0.4,
    lighting: {
      morning:   { color: 'hsl(80 35% 55%)', x: '30%', y: '20%', intensity: 0.15 },
      afternoon: { color: 'hsl(120 40% 50%)', x: '50%', y: '15%', intensity: 0.10 },
      evening:   { color: 'hsl(60 50% 55%)', x: '70%', y: '25%', intensity: 0.18 },
      night:     { color: 'hsl(140 30% 30%)', x: '75%', y: '20%', intensity: 0.15 },
    },
    ambientSounds: ['forest'],
    bisonEnvironment: 'wooden_cabin',
  },
  golden_sunset: {
    id: 'golden_sunset',
    label: 'Golden Sunset',
    decorativeIcons: ['sun', 'leaf', 'sparkle'],
    particleType: 'leaf',
    particleColor: 'hsl(21 73% 69%)',
    particleDensity: 0.4,
    lighting: {
      morning:   { color: 'hsl(35 75% 58%)', x: '25%', y: '20%', intensity: 0.18 },
      afternoon: { color: 'hsl(25 75% 58%)', x: '50%', y: '15%', intensity: 0.14 },
      evening:   { color: 'hsl(15 73% 69%)', x: '75%', y: '25%', intensity: 0.22 },
      night:     { color: 'hsl(20 50% 40%)', x: '80%', y: '20%', intensity: 0.15 },
    },
    ambientSounds: ['wind'],
    bisonEnvironment: 'calm_room',
  },
  midnight_sky: {
    id: 'midnight_sky',
    label: 'Midnight Sky',
    decorativeIcons: ['star', 'moon', 'sparkle'],
    particleType: 'star',
    particleColor: 'hsl(240 40% 72%)',
    particleDensity: 0.5,
    lighting: {
      morning:   { color: 'hsl(265 50% 60%)', x: '25%', y: '20%', intensity: 0.12 },
      afternoon: { color: 'hsl(220 50% 58%)', x: '50%', y: '15%', intensity: 0.10 },
      evening:   { color: 'hsl(265 41% 64%)', x: '75%', y: '25%', intensity: 0.16 },
      night:     { color: 'hsl(250 50% 50%)', x: '80%', y: '18%', intensity: 0.20 },
    },
    ambientSounds: ['crickets'],
    bisonEnvironment: 'lantern_glow',
  },
  mountain_cabin: {
    id: 'mountain_cabin',
    label: 'Mountain Cabin',
    decorativeIcons: ['mountain', 'tree', 'cloud', 'snowflake'],
    particleType: 'cloud',
    particleColor: 'hsl(0 0% 80%)',
    particleDensity: 0.3,
    lighting: {
      morning:   { color: 'hsl(30 50% 60%)', x: '25%', y: '20%', intensity: 0.15 },
      afternoon: { color: 'hsl(200 30% 60%)', x: '50%', y: '15%', intensity: 0.12 },
      evening:   { color: 'hsl(20 60% 50%)', x: '75%', y: '25%', intensity: 0.18 },
      night:     { color: 'hsl(220 30% 40%)', x: '80%', y: '20%', intensity: 0.16 },
    },
    ambientSounds: ['fireplace', 'wind'],
    bisonEnvironment: 'wooden_cabin',
  },
  autumn_leaves: {
    id: 'autumn_leaves',
    label: 'Autumn Leaves',
    decorativeIcons: ['leaf', 'tree', 'footprint'],
    particleType: 'leaf',
    particleColor: 'hsl(30 70% 50%)',
    particleDensity: 0.6,
    lighting: {
      morning:   { color: 'hsl(35 60% 55%)', x: '25%', y: '20%', intensity: 0.16 },
      afternoon: { color: 'hsl(30 50% 50%)', x: '50%', y: '15%', intensity: 0.12 },
      evening:   { color: 'hsl(20 60% 45%)', x: '75%', y: '25%', intensity: 0.20 },
      night:     { color: 'hsl(25 40% 30%)', x: '80%', y: '20%', intensity: 0.15 },
    },
    ambientSounds: ['wind', 'birds'],
    bisonEnvironment: 'calm_room',
  },
  sakura_spring: {
    id: 'sakura_spring',
    label: 'Sakura Spring',
    decorativeIcons: ['flower', 'leaf', 'bird', 'sparkle'],
    particleType: 'petal',
    particleColor: 'hsl(330 50% 70%)',
    particleDensity: 0.5,
    lighting: {
      morning:   { color: 'hsl(330 50% 70%)', x: '25%', y: '20%', intensity: 0.15 },
      afternoon: { color: 'hsl(120 40% 55%)', x: '50%', y: '15%', intensity: 0.10 },
      evening:   { color: 'hsl(340 45% 65%)', x: '75%', y: '25%', intensity: 0.18 },
      night:     { color: 'hsl(300 30% 50%)', x: '80%', y: '20%', intensity: 0.14 },
    },
    ambientSounds: ['birds', 'water'],
    bisonEnvironment: 'calm_room',
  },
  cozy_library: {
    id: 'cozy_library',
    label: 'Cozy Library',
    decorativeIcons: ['book', 'coffee', 'feather', 'heart'],
    particleType: null,
    particleColor: 'hsl(35 30% 60%)',
    particleDensity: 0.2,
    lighting: {
      morning:   { color: 'hsl(35 40% 55%)', x: '25%', y: '20%', intensity: 0.16 },
      afternoon: { color: 'hsl(30 30% 50%)', x: '50%', y: '15%', intensity: 0.12 },
      evening:   { color: 'hsl(25 50% 45%)', x: '75%', y: '25%', intensity: 0.22 },
      night:     { color: 'hsl(20 40% 35%)', x: '80%', y: '20%', intensity: 0.18 },
    },
    ambientSounds: ['fireplace', 'library'],
    bisonEnvironment: 'calm_room',
  },
  northern_lights: {
    id: 'northern_lights',
    label: 'Northern Lights',
    decorativeIcons: ['star', 'sparkle', 'snowflake', 'moon'],
    particleType: 'star',
    particleColor: 'hsl(150 40% 50%)',
    particleDensity: 0.5,
    lighting: {
      morning:   { color: 'hsl(160 40% 50%)', x: '25%', y: '20%', intensity: 0.14 },
      afternoon: { color: 'hsl(200 40% 50%)', x: '50%', y: '15%', intensity: 0.10 },
      evening:   { color: 'hsl(140 50% 45%)', x: '75%', y: '25%', intensity: 0.20 },
      night:     { color: 'hsl(150 60% 40%)', x: '50%', y: '15%', intensity: 0.25 },
    },
    ambientSounds: ['wind', 'chimes'],
    bisonEnvironment: 'snowy_lodge',
  },
};

export function getThemeProperties(themeId) {
  return THEME_PROPERTIES[themeId] || THEME_PROPERTIES.classic;
}