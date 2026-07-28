// ═══════════════════════════════════════════════
// SOCIAL MEDIA KNOWLEDGE GRAPH (Package 41)
// Static, curated, read-only. Educational — never
// promotional, never judgemental, never live-accessed,
// and never connected to the user's own accounts.
// ═══════════════════════════════════════════════

import graph from './socialMediaKnowledge.json';

const MECHANIC_PATTERNS = [
  /algorithm|feed|recommend|for you|fyp|ranked|ranking|why (do i|am i) see/i,
  /how does .{0,20}(work|decide|choose|pick)/i,
  /dark pattern|infinite scroll|doom ?scroll|addictive|hooked|manipulat/i,
  /make money|revenue|business model|monetis|monetiz|ads?\b|advertis/i,
  /data (collect|harvest|track)|tracking|privacy|selling my data/i,
  /reels|shorts|stories|short.?form/i,
];

export function detectSocialMediaQuery(input) {
  if (typeof input !== 'string') return null;
  const platforms = graph.platforms.filter(p =>
    p.keywords.some(k => input.toLowerCase().includes(k.trim()))
  );
  const asksMechanics = MECHANIC_PATTERNS.some(p => p.test(input));
  if (platforms.length === 0) return null;
  if (!asksMechanics && !/social media|platform/i.test(input)) return null;
  return { platforms: platforms.slice(0, 3) };
}

export function getPlatform(name) {
  return graph.platforms.find(p => p.name.toLowerCase() === String(name).toLowerCase()) || null;
}

export function listPlatforms() {
  return graph.platforms.map(p => ({ name: p.name, parentCompany: p.parentCompany }));
}

export function buildSocialMediaContextString(match) {
  if (!match?.platforms?.length) return null;
  let out = `[KNOWLEDGE CONTEXT] SOCIAL MEDIA LITERACY\n`;
  out += `Source: curated static dataset (public disclosures, platform documentation, recommender-system research, investigative reporting). Last reviewed ${graph.lastUpdated}. You have NOT accessed any live platform and have NOT accessed the user's accounts — say so if it is relevant.\n\n`;
  for (const p of match.platforms) {
    out += `${p.name} (${p.parentCompany})\n`;
    out += `- Revenue: ${p.revenueModel}\n`;
    out += `- Ranking: ${p.algorithmicFeed}\n`;
    if (p.shortFormSystem) out += `- Short-form: ${p.shortFormSystem}\n`;
    out += `- Design patterns to be aware of: ${p.knownDarkPatterns.join('; ')}\n`;
    out += `- Privacy: ${p.privacyImplications}\n\n`;
  }
  out += `HOW TO USE THIS:
- Explain factually and neutrally. "This platform earns more when you scroll longer" is fair. "This platform is evil" is not.
- Never recommend one platform over another unless the user explicitly asks for a factual comparison.
- Do not lecture and do not moralise about the user's own usage. Give them the mechanics and let them decide.
- Mention that this is curated background knowledge, not a live look at their account or feed.
- Keep it conversational. Do not dump the whole profile unless they asked for depth.`;
  return out;
}