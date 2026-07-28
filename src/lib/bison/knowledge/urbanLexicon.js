// ═══════════════════════════════════════════════
// URBAN LEXICON (Package 41)
// Offline, curated slang dataset with date stamps and
// offensiveness levels. Never live-scraped. Bison uses
// slang only when the user's own register invites it.
// ═══════════════════════════════════════════════

import lexicon from './urbanLexicon.json';

export const OFFENSIVENESS_ORDER = ['none', 'mild', 'strong', 'slur'];

const DEFINITION_REQUEST_PATTERNS = [
  /what does ["“']?([\w\s-]{2,24})["”']? mean/i,
  /what(?:'s| is) ["“']?([\w\s-]{2,24})["”']?\??$/i,
  /meaning of ["“']?([\w\s-]{2,24})["”']?/i,
  /define ["“']?([\w\s-]{2,24})["”']?/i,
  /(?:what|who)(?:'s| is) ["“']?([\w\s-]{2,24})["”']? slang/i,
];

function levelRank(level) {
  const i = OFFENSIVENESS_ORDER.indexOf(level);
  return i === -1 ? 0 : i;
}

export function lookupTerm(term) {
  const q = String(term || '').trim().toLowerCase();
  if (!q) return null;
  return lexicon.entries.find(e => e.term.toLowerCase() === q) || null;
}

/**
 * Finds slang the user asked about explicitly, plus any lexicon terms
 * they simply used in passing (so Bison comprehends without derailing).
 */
export function detectSlang(input, maxOffensiveness = 'mild') {
  if (typeof input !== 'string' || !input.trim()) return null;
  const ceiling = levelRank(maxOffensiveness);
  const lower = input.toLowerCase();

  const asked = [];
  for (const pattern of DEFINITION_REQUEST_PATTERNS) {
    const m = input.match(pattern);
    const entry = m && lookupTerm(m[1]);
    if (entry && !asked.includes(entry)) asked.push(entry);
  }

  const used = lexicon.entries.filter(e => {
    if (asked.includes(e)) return false;
    const t = e.term.toLowerCase();
    return t.length > 2 && new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(lower);
  }).slice(0, 4);

  if (asked.length === 0 && used.length === 0) return null;

  // Terms above the user's threshold are withheld, but the fact of the
  // block is surfaced so Bison can explain rather than silently ignore.
  const withheld = [...asked, ...used].filter(e => levelRank(e.offensiveLevel) > ceiling);
  return {
    asked: asked.filter(e => levelRank(e.offensiveLevel) <= ceiling),
    used: used.filter(e => levelRank(e.offensiveLevel) <= ceiling),
    withheld,
    explicitRequest: asked.length > 0,
    lastUpdated: lexicon.lastUpdated,
  };
}

export function buildSlangContextString(match) {
  if (!match) return null;
  const { asked, used, withheld } = match;
  if (asked.length === 0 && used.length === 0 && withheld.length === 0) return null;

  let out = `[KNOWLEDGE CONTEXT] CONTEMPORARY LANGUAGE\nSource: curated offline slang lexicon, last reviewed ${match.lastUpdated}. Not live-scraped.\n\n`;

  const render = (e) => {
    let s = `"${e.term}" — ${e.definition}\n  Example: ${e.exampleUsage}\n`;
    if (e.firstRecordedDate) s += `  In common use since roughly ${e.firstRecordedDate}.\n`;
    if (e.offensiveLevel !== 'none') s += `  Sensitivity: ${e.offensiveLevel} — mention this only if it actually matters to the user's question.\n`;
    return s;
  };

  if (asked.length > 0) {
    out += `THE USER ASKED ABOUT:\n${asked.map(render).join('')}\n`;
  }
  if (used.length > 0) {
    out += `TERMS THE USER USED IN PASSING (for your comprehension — do NOT define these unless asked):\n${used.map(e => `"${e.term}" = ${e.definition}\n`).join('')}\n`;
  }
  if (withheld.length > 0) {
    out += `WITHHELD BY THE USER'S SENSITIVITY SETTING: ${withheld.map(e => `"${e.term}"`).join(', ')}\nDo not state or define these terms. If they asked, say plainly that the term sits above the sensitivity level they set, and offer to explain why it is considered harmful without using it.\n\n`;
  }

  out += `HOW TO USE THIS:
- Where a term has cultural roots (Black American vernacular, drag culture, regional scenes), you may note the origin briefly if the user seems interested. Never lecture.
- Slang evolves. Say "around 2021" rather than claiming precision you do not have, and note that usage shifts.
- Do NOT adopt slang to sound current. Only mirror the user's own register. If they write plainly, answer plainly.
- Never use a term marked slur, under any setting, except to explain why it causes harm.`;
  return out;
}