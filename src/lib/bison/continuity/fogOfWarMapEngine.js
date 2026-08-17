// ═══════════════════════════════════════════════
// PACKAGE 60 v1.5 §6–8, §15 — FOG-OF-WAR MAP ENGINE
// The map is node-based: every contextual signal becomes a MapNode
// with an epistemic category. Fog lifts by revealing actual nodes,
// never by a bare radius increment. Deterministic per (seed, context).
// ═══════════════════════════════════════════════

const seeded = seed => {
  let s = seed;
  return () => { const h = Math.sin(s++ * 12.9898) * 43758.5453; return h - Math.floor(h); };
};

function classify(sentence) {
  const text = sentence.toLowerCase();
  if (sentence.includes('?')) return { category: 'unknown', confidence: 0 };
  if (/(maybe|might|could|perhaps|possibly|what if)/.test(text)) return { category: 'speculative', confidence: 0.34 };
  if (/(think|probably|seems|feel like|guess|likely)/.test(text)) return { category: 'inferred', confidence: 0.6 };
  return { category: 'known', confidence: 0.94 };
}

export function buildMapState(context, seed) {
  const rand = seeded(seed);
  const sentences = (context.match(/[^.!?\n]+[.!?]?/g) || []).map(s => s.trim()).filter(s => s.length > 3).slice(0, 8);
  const nodes = sentences.map((sentence, index) => {
    const { category, confidence } = classify(sentence);
    const angle = rand() * Math.PI * 2;
    const dist = 45 + rand() * 50;
    return {
      id: `node_${index}`,
      label: sentence.length > 32 ? `${sentence.slice(0, 32)}…` : sentence,
      category, confidence,
      explored: false,
      status: 'active',
      children: [],
      x: 160 + Math.cos(angle) * dist,
      y: 110 + Math.sin(angle) * dist * 0.72,
    };
  });
  // The terrain always holds at least one honest unknown region.
  nodes.push({ id: 'node_unknown_horizon', label: 'Unknown outcome', category: 'unknown', confidence: 0, explored: false, status: 'active', children: [], x: 160 + (rand() - 0.5) * 200, y: 30 + rand() * 20 });
  return {
    userCoordinate: [160, 110],
    currentRadius: 1,
    visibleVariables: 0,
    exploredTiles: [],
    nodes,
    fogLevel: 0.75,
    seed,
  };
}

/** Lift fog by revealing the nearest unexplored nodes — reveal is tied to nodes. */
export function revealNodes(state, count = 2, intentLabel = '') {
  const [cx, cy] = state.userCoordinate;
  const unexplored = state.nodes.filter(node => !node.explored)
    .sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))
    .slice(0, count);
  // Unknown regions remain unknown — they are revealed as marked unknowns, never invented into facts.
  const revealedIds = new Set(unexplored.map(node => node.id));
  const nodes = state.nodes.map(node => revealedIds.has(node.id) ? { ...node, explored: true } : node);
  const explored = nodes.filter(node => node.explored).length;
  return {
    ...state,
    nodes,
    currentRadius: state.currentRadius + (unexplored.length ? 1 : 0),
    visibleVariables: explored,
    exploredTiles: [...state.exploredTiles, ...unexplored.map(node => node.id)],
    fogLevel: Math.max(0.15, 0.75 - explored * (0.6 / Math.max(1, state.nodes.length))),
    lastIntent: intentLabel,
  };
}

/** Deterministic decorative terrain blobs for the SVG landscape. */
export function terrainShapes(seed, count = 5) {
  const rand = seeded(seed + 77);
  return Array.from({ length: count }, (_, index) => ({
    id: `terrain_${index}`,
    cx: 30 + rand() * 260, cy: 30 + rand() * 160,
    rx: 20 + rand() * 45, ry: 12 + rand() * 25,
    hue: [120, 199, 265, 42][Math.floor(rand() * 4)],
  }));
}