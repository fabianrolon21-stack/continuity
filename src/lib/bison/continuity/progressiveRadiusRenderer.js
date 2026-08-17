// ═══════════════════════════════════════════════
// PACKAGE 60 §2.2 — PROGRESSIVE RADIUS RENDERER
// Each locked decision lifts fog of war: the visible radius
// expands and more conceptual variables become understandable.
// ═══════════════════════════════════════════════

export function initialMapState() {
  return { userCoordinate: [0, 0], currentRadius: 1, visibleVariables: 2, exploredTiles: [] };
}

function visibleTiles(state, radius) {
  const tiles = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= radius) {
        tiles.push(`tile_${state.userCoordinate[0] + dx}_${state.userCoordinate[1] + dy}`);
      }
    }
  }
  return tiles;
}

export function renderMapRadius(state, decisionLabel) {
  const currentRadius = state.currentRadius + 1;
  const next = {
    ...state,
    currentRadius,
    visibleVariables: currentRadius * 2,
    exploredTiles: [...new Set([...state.exploredTiles, ...visibleTiles(state, currentRadius)])],
    lastIntent: decisionLabel,
  };
  return next;
}