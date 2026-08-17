// ═══════════════════════════════════════════════
// PACKAGE 60 §2.7 — PROCEDURAL MAP GENERATOR
// Deterministic, seeded conceptual landscapes. Every grid is
// reproducible and auditable from (seed, algorithm, mapSize).
// ═══════════════════════════════════════════════

export const MAP_ALGORITHMS = ['cellular_automata', 'bsp', 'perlin_noise', 'wave_function_collapse'];

function valueAt(x, y, seed, algorithm) {
  const h = Math.sin(seed * 12.9898 + x * 78.233 + y * 37.719) * 43758.5453;
  const v = h - Math.floor(h);
  if (algorithm === 'cellular_automata') return v > 0.5 ? 1 : 0;
  if (algorithm === 'bsp') return (x + y) % 3 === 0 ? 1 : 0;
  if (algorithm === 'perlin_noise') return v;
  if (algorithm === 'wave_function_collapse') return v > 0.7 ? 1 : 0;
  return 0;
}

export function generateMap({ algorithm = 'perlin_noise', seed = 1, mapSize = 15 }) {
  return Array.from({ length: mapSize }, (_, y) =>
    Array.from({ length: mapSize }, (_, x) => valueAt(x, y, seed, algorithm)),
  );
}