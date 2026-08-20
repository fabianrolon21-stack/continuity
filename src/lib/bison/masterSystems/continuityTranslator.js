// ═══════════════════════════════════════════════
// CONTINUITY TRANSLATOR — transmutes adversity into strategy.
// Cognitive reframing exercise only: never a claim that the user is
// invincible or that systemic injustice is imaginary.
// ═══════════════════════════════════════════════

const CAUSE_DETECTORS = [
  { key: 'financial_pressure', pattern: /(rent|bill|penalty|charge|fee|money|afford|broke|debt|paycheck|income)/i, cause: 'Rigid cash-flow constraints vs. fixed obligations' },
  { key: 'relational_friction', pattern: /(ex|partner|family|friend|argument|betray|ignored|disrespect)/i, cause: 'Ego-threat triggered by loss of external control' },
  { key: 'systemic_deduction', pattern: /(system|rigged|tax|government|deduct|garnish|they took|bureaucra|unfair rule|policy)/i, cause: 'Statutory resource extraction parameters' },
  { key: 'health_strain', pattern: /(exhausted|sick|pain|no sleep|burn(ed)? out|tired all)/i, cause: 'Bodily resource depletion exceeding recovery rate' },
  { key: 'creative_block', pattern: /(stuck|block|can'?t focus|overwhelmed|too many things|scattered)/i, cause: 'Cognitive overload from unresolved cross-domain threads' },
];

let systemArchive = [];
let activeFraming = 'CHALLENGE'; // 'CHALLENGE' | 'NEUTRAL_OBSERVATION' | 'OPPORTUNITY'
const MAX_ARCHIVE = 100;

export function transmuteAdversity(eventName, text) {
  const identifiedCauses = CAUSE_DETECTORS.filter(({ pattern }) => pattern.test(text)).map(({ cause }) => cause);
  const result = {
    eventName,
    identifiedCauses: identifiedCauses.length ? identifiedCauses : ['Unclassified pressure — worth naming precisely before acting'],
    framing: activeFraming,
    actionableLeverage: 'Optimize controlled variables; ignore unchangeable fixed metrics.',
    timestamp: Date.now(),
  };
  systemArchive = [...systemArchive, result].slice(-MAX_ARCHIVE);
  return result;
}

export function getRecentTransmutations(limit = 5) { return systemArchive.slice(-limit); }
export function setFraming(framing) { if (['CHALLENGE', 'NEUTRAL_OBSERVATION', 'OPPORTUNITY'].includes(framing)) activeFraming = framing; }