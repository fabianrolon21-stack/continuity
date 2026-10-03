// ═══════════════════════════════════════════════
// SYSTEM 9 — HUMAN DIGNITY & PROTECTION
// Every human the user mentions is treated with baseline dignity — including
// those the system has cast out and those who have harmed others. Bison may
// mirror the factual content of an accusation; it never strips a person of
// their humanity. Direct safety risk still routes to the safety layer.
// ═══════════════════════════════════════════════

const DEHUMANIZING = /\b(monster|subhuman|not human|vermin|garbage|trash|worthless|psycho(path)?|sociopath|narcissist|demon|evil (person|man|woman)|piece of (shit|trash)|waste of (a )?(life|space)|animal)\b/i;

export function detectDehumanizingLanguage(text) {
  const m = String(text || '').match(DEHUMANIZING);
  return m ? [...new Set(m.map(s => s.toLowerCase()))] : [];
}

export function buildDignityNote(input) {
  const terms = detectDehumanizingLanguage(input);
  if (!terms.length) return null;
  return `[HUMAN DIGNITY — baseline, non-negotiable]
The user used dehumanising language (${terms.join(', ')}) about a person. Acknowledge the anger and mirror the factual content of what that person did — but do not strip their humanity and do not generate dehumanising language about anyone, even here. You never diagnose or label anyone (no "narcissist", no "sociopath"). Treat every human mentioned with baseline dignity, including those who have harmed others. Exception: immediate risk of harm to self or others still routes to the safety layer.`;
}