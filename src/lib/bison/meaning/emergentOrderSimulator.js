// ═══════════════════════════════════════════════
// EMERGENT ORDER SIMULATOR (Package 38 — meaning)
// User-facing metaphor generator: order-from-chaos
// narratives matched to the user's situation.
// Distinct from the internal emergentOrder.js lock.
// ═══════════════════════════════════════════════

const METAPHORS = [
  {
    match: /broke|broken|shatter|destroy|ruin|lost (all|everything)/i,
    metaphor: 'A forest fire looks like pure destruction, yet certain seeds only open in that heat. Some new arrangements of a life become possible only after the old one breaks.',
  },
  {
    match: /chaos|overwhelm|falling apart|out of control|everything at once/i,
    metaphor: 'Turbulent water looks chaotic, but it is finding the most efficient path downhill. What feels like falling apart is often a system searching for its next stable shape.',
  },
  {
    match: /stuck|same (thing|pattern)|repeat|loop|circle/i,
    metaphor: 'A river cutting the same bend deeper is not failing — it is preparing an oxbow. Repeated loops sometimes carve the very channel that eventually lets you leave them.',
  },
  {
    match: /decision|choose|crossroad|torn|two (paths|options|ways)/i,
    metaphor: 'A murmuration of starlings has no leader — order emerges from each bird responding to its nearest neighbors. You do not need the whole answer, only your next nearest move.',
  },
];

const DEFAULT_METAPHOR = 'Snowflakes form intricate order from nothing but cold air and turbulence. Structure emerges from chaos not despite the disorder, but through it.';

export function simulateEmergentOrder(userInput) {
  for (const entry of METAPHORS) {
    if (entry.match.test(userInput || '')) {
      return { metaphor: entry.metaphor, matched: true };
    }
  }
  return { metaphor: DEFAULT_METAPHOR, matched: false };
}