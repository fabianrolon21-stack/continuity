// ═══════════════════════════════════════════════
// STORES (Phase 7) — two separate storefronts.
// Care goods feed and soothe; Play goods invite motion.
// Starter items are always owned; the rest are bought
// with tokens earned inside the world.
// ═══════════════════════════════════════════════

export const CARE_ITEMS = [
  { id: 'apple', label: 'Apple', emoji: '🍎', price: 0, note: 'A dependable favourite.' },
  { id: 'watermelon', label: 'Watermelon', emoji: '🍉', price: 0, note: 'Cool and messy.' },
  { id: 'carrot', label: 'Carrot', emoji: '🥕', price: 0, note: 'Crunchy, earthy.' },
  { id: 'berries', label: 'Berries', emoji: '🫐', price: 0, note: 'Small and sweet.' },
  { id: 'honeycomb', label: 'Honeycomb', emoji: '🍯', price: 40, note: 'Rare and slow to eat.' },
  { id: 'pumpkin', label: 'Pumpkin', emoji: '🎃', price: 55, note: 'A whole autumn meal.' },
  { id: 'herb_bundle', label: 'Herb Bundle', emoji: '🌿', price: 35, note: 'Calming before rest.' },
  { id: 'warm_bread', label: 'Warm Bread', emoji: '🍞', price: 30, note: 'Comfort on cold days.' },
];

export const PLAY_ITEMS = [
  { id: 'ball', label: 'Ball', emoji: '⚽', price: 0, note: 'Endlessly kickable.' },
  { id: 'stick', label: 'Stick', emoji: '🪵', price: 0, note: 'Found, not bought.' },
  { id: 'frisbee', label: 'Frisbee', emoji: '🥏', price: 0, note: 'Wide arcs across the floor.' },
  { id: 'kite', label: 'Kite', emoji: '🪁', price: 50, note: 'Best on windy days.' },
  { id: 'bubbles', label: 'Bubbles', emoji: '🫧', price: 30, note: 'Chased, never caught.' },
  { id: 'drum', label: 'Little Drum', emoji: '🥁', price: 45, note: 'Loud. Very loud.' },
  { id: 'lantern', label: 'Paper Lantern', emoji: '🏮', price: 60, note: 'A quiet night toy.' },
];

export const STARTER_IDS = [...CARE_ITEMS, ...PLAY_ITEMS].filter(i => i.price === 0).map(i => i.id);

export function isOwned(ownedIds, id) {
  return ownedIds?.includes(id) || STARTER_IDS.includes(id);
}

export function availableItems(items, ownedIds) {
  return items.filter(i => isOwned(ownedIds, i.id));
}