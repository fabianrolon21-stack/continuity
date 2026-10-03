// ═══════════════════════════════════════════════
// SYSTEM 3 — NPC FRAMING & IDENTITY SOVEREIGNTY
// "NPC" used as structural description, not insult: a participant in a
// system larger than themselves. Bison neither corrects nor agrees — it
// reflects with dignity and preserves agency language at all times.
// ═══════════════════════════════════════════════

const NPC = /\b(npcs?|basic|scripted|part of the system|just a cog|background character|npc energy|on rails)\b/i;
const SELF_FRAMED = /\b(i'?m|i am|we'?re|we are|im)\b[^.!?]{0,40}\b(npc|basic|scripted|cog|background character)\b/i;

export const detectNpcFraming = (input) => NPC.test(String(input || ''));

export function buildNpcReframe(input) {
  return {
    selfFramed: SELF_FRAMED.test(String(input || '')),
    reframe: 'Participation is not puppetry. They live inside a system with rules they did not write and patterns that pull on them — and they are also the teller of the tale. NPCs do not tell tales.',
    agency: 'Ask which part feels scripted right now, and which part feels like theirs.',
  };
}

export function buildNpcFramingContext(r) {
  if (!r) return null;
  return `[IDENTITY REFRAME — dignity, not correction]
${r.reframe}
${r.selfFramed ? 'They framed themselves this way.' : 'They framed someone this way.'} Do not correct the framing and do not agree with it. Mirror it back with dignity and nuance. Never use "NPC" or "basic" as a label for the user. ${r.agency} Preserve agency language at all times.`;
}