// ═══════════════════════════════════════════════
// DECORATIVE ELEMENTS (Package A — Background Engine)
// Defines Nintendo-inspired decorative icons rendered at low opacity.
// Icons from lucide-react (already installed).
// ═══════════════════════════════════════════════

import { Star, Sparkles, Leaf, Cloud, Moon, Sun } from 'lucide-react';
import { seededRandom } from './timeOfDay';

export const DECORATIVE_ICONS = {
  star: Star,
  sparkle: Sparkles,
  leaf: Leaf,
  cloud: Cloud,
  moon: Moon,
  sun: Sun,
};

const ICON_SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
};

const ANIMATION_TYPES = ['float', 'twinkle', 'drift'];

// Generate a deterministic layout of decorative icons for a given period
export function generateDecorativeLayout(iconSet, seed = 42, count = 18) {
  const rand = seededRandom(seed);
  const layout = [];

  for (let i = 0; i < count; i++) {
    const iconName = iconSet[Math.floor(rand() * iconSet.length)];
    const sizeKey = ['sm', 'sm', 'sm', 'md', 'md', 'lg'][Math.floor(rand() * 6)];

    layout.push({
      id: `dec_${i}`,
      icon: DECORATIVE_ICONS[iconName] || Sparkles,
      iconName,
      x: rand() * 100,          // percentage across viewport
      y: rand() * 100,          // percentage down viewport
      size: ICON_SIZES[sizeKey],
      opacity: 0.04 + rand() * 0.06,  // 0.04–0.10
      depth: 0.3 + rand() * 0.5,       // parallax depth factor
      animation: ANIMATION_TYPES[Math.floor(rand() * ANIMATION_TYPES.length)],
      animationDelay: rand() * 4,      // 0–4s stagger
      animationDuration: 5 + rand() * 7,  // 5–12s
    });
  }

  return layout;
}