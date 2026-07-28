// ═══════════════════════════════════════════════
// REALITY CLASSIFIER (Patch 40.2)
// "You can't negotiate with a tree."
// Before analyzing people, determine what kind of
// system the situation belongs to.
// ═══════════════════════════════════════════════

const SYSTEM_PATTERNS = {
  physics: [/weather|storm|rain|snow|broke|broken|damage|distance|gravity|power outage|flood/i],
  biology: [/sick|illness|sleep|tired|exhausted|health|pain|injury|aging|body|hormone|energy crash/i],
  psychology: [/feel|feeling|anxious|mood|motivation|fear|habit|stress|overwhelm|confidence|avoid/i],
  economics: [/money|rent|price|salary|raise|inflation|budget|debt|afford|cost|market|bills|paycheck/i],
  social: [/friend|boss|partner|family|coworker|colleague|argument|relationship|team|neighbor|landlord|he |she |they /i],
  legal: [/law|legal|lease|contract|court|visa|regulation|policy|rights|eviction|agreement/i],
  digital: [/app|account|email|online|password|algorithm|platform|website|phone|notification/i],
};

export function classifySystems(input) {
  const text = input || '';
  const matched = [];
  for (const [system, patterns] of Object.entries(SYSTEM_PATTERNS)) {
    let hits = 0;
    for (const p of patterns) {
      const m = text.match(new RegExp(p.source, 'gi'));
      if (m) hits += m.length;
    }
    if (hits > 0) matched.push({ system, hits });
  }
  matched.sort((a, b) => b.hits - a.hits);
  return {
    primary: matched[0]?.system || 'unknown',
    systems: matched.length > 0 ? matched.map(m => m.system) : ['unknown'],
  };
}