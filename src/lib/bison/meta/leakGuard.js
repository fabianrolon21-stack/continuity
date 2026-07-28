// ═══════════════════════════════════════════════
// LEAK GUARD (Package 42)
// Private thoughts never enter the response prompt, so a leak
// would have to be stylistic rather than substantive. This strips
// interior-monologue framing if it ever surfaces in output.
// ═══════════════════════════════════════════════

const MONOLOGUE_PATTERNS = [
  /^\s*\[?(?:private|internal) (?:thought|note|monologue)\]?\s*:.*$/gim,
  /^\s*\(?(?:note to self|internal reflection)\)?\s*:.*$/gim,
  /^\s*\[?(?:anomaly[_ ]flag|debugging|what[_ ]if)\]?\s*:.*$/gim,
];

export function stripInternalMonologue(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const p of MONOLOGUE_PATTERNS) out = out.replace(p, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}