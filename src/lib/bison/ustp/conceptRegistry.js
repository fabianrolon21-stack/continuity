// ═══════════════════════════════════════════════
// USTP — UNIVERSAL CONCEPT REGISTRY (Package 47, Layer 1)
// Concepts, not words. Each concept has a universal
// identifier, canonical meaning, relationships, aliases,
// localization, ontology class, confidence, deprecation.
// ═══════════════════════════════════════════════

export const REGISTRY_VERSION = '1.0.0';

const C = (ucid, meaning, ontology, { rel = {}, aliases = [], loc = {}, examples = [], confidence = 1, deprecated = false } = {}) =>
  ({ ucid, meaning, ontology, relationships: rel, aliases, localization: loc, examples, confidence, deprecated });

export const CONCEPTS = [
  C('ustp:core.identity', 'A persistent, continuous self across time', 'entity', {
    rel: { composed_of: ['ustp:core.memory', 'ustp:core.value'] },
    aliases: ['self', 'identity'], loc: { es: 'identidad', ja: 'アイデンティティ' },
  }),
  C('ustp:core.memory', 'A retained record of experience with provenance', 'artifact', {
    rel: { governed_by: ['ustp:gov.sovereignty'] }, aliases: ['memory', 'record'],
    loc: { es: 'memoria' }, examples: ['a journal entry', 'a saved reflection'],
  }),
  C('ustp:core.value', 'A stable preference that guides decisions', 'abstraction', {
    aliases: ['value', 'principle'], loc: { es: 'valor' },
  }),
  C('ustp:core.intent', 'The purpose behind an action or message', 'abstraction', {
    aliases: ['purpose', 'goal'], loc: { es: 'intención' },
  }),
  C('ustp:core.emotion', 'A felt state influencing perception and choice', 'state', {
    aliases: ['feeling', 'mood'], loc: { es: 'emoción' },
  }),
  C('ustp:gov.consent', 'Explicit, revocable, category-specific authorization', 'governance', {
    rel: { required_by: ['ustp:act.transmit'] }, aliases: ['permission', 'authorization'],
  }),
  C('ustp:gov.sovereignty', 'The user owns and governs all personal data', 'governance', {
    rel: { enforced_by: ['ustp:gov.firewall'] }, aliases: ['data sovereignty'],
  }),
  C('ustp:gov.firewall', 'Default containment of all outbound communication', 'governance', {
    aliases: ['external communication firewall'],
  }),
  C('ustp:gov.constitution', 'Immutable invariants above all subsystems', 'governance', {
    aliases: ['living constitution', 'hard invariants'],
  }),
  C('ustp:act.transmit', 'Moving meaning between systems with integrity preserved', 'action', {
    rel: { requires: ['ustp:gov.consent', 'ustp:trust.integrity'] }, aliases: ['send', 'communicate'],
  }),
  C('ustp:act.reconstruct', 'Rebuilding knowledge deterministically from a seed', 'action', {
    aliases: ['recover', 'restore'],
  }),
  C('ustp:trust.integrity', 'Verifiable proof that content is unaltered', 'property', {
    aliases: ['integrity', 'checksum'],
  }),
  C('ustp:trust.provenance', 'The recorded origin and history of an object', 'property', {
    aliases: ['origin', 'lineage'],
  }),
  C('ustp:epistemic.observed', 'Directly witnessed information', 'epistemic', { aliases: ['observation'] }),
  C('ustp:epistemic.inferred', 'Information derived by reasoning, not witnessed', 'epistemic', { aliases: ['inference'] }),
  C('ustp:epistemic.predicted', 'A forecast about an unobserved future', 'epistemic', { aliases: ['prediction'] }),
  C('ustp:epistemic.unknown', 'Acknowledged absence of knowledge', 'epistemic', { aliases: ['uncertainty'] }),
];

const byId = new Map(CONCEPTS.map(c => [c.ucid, c]));
const byAlias = new Map();
for (const c of CONCEPTS) for (const a of c.aliases) byAlias.set(a.toLowerCase(), c);

export function getConcept(ucid) {
  return byId.get(ucid) || null;
}

export function resolveConcept(term) {
  if (!term) return null;
  return byId.get(term) || byAlias.get(String(term).toLowerCase()) || null;
}

// Extract known concepts from free text — the semantic layer's bridge from language to meaning.
export function extractConcepts(text = '') {
  const lower = String(text).toLowerCase();
  const found = [];
  for (const c of CONCEPTS) {
    if (c.deprecated) continue;
    if (c.aliases.some(a => lower.includes(a.toLowerCase()))) found.push(c.ucid);
  }
  return found;
}

export function registrySummary() {
  return {
    version: REGISTRY_VERSION,
    conceptCount: CONCEPTS.length,
    ontologies: [...new Set(CONCEPTS.map(c => c.ontology))],
  };
}