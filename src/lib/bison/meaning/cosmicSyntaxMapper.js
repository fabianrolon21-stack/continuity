// ═══════════════════════════════════════════════
// COSMIC SYNTAX MAPPER (Package 38 — meaning)
// Temporal/seasonal/lunar pattern notes from pure
// date math. POETIC FRAMING ONLY — never causal claims.
// ═══════════════════════════════════════════════

// Approximate lunar phase from date (synodic month ≈ 29.53 days)
function getLunarPhase(date = new Date()) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodic = 29.530588853 * 24 * 60 * 60 * 1000;
  const phase = ((date.getTime() - knownNewMoon) % synodic) / synodic;
  if (phase < 0.03 || phase > 0.97) return 'new moon';
  if (phase < 0.22) return 'waxing crescent';
  if (phase < 0.28) return 'first quarter';
  if (phase < 0.47) return 'waxing gibbous';
  if (phase < 0.53) return 'full moon';
  if (phase < 0.72) return 'waning gibbous';
  if (phase < 0.78) return 'last quarter';
  return 'waning crescent';
}

function getSeason(date = new Date()) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function mapCosmicSyntax(date = new Date()) {
  const hour = date.getHours();
  let timeOfDay = 'daytime';
  if (hour < 5) timeOfDay = 'deep night';
  else if (hour < 9) timeOfDay = 'early morning';
  else if (hour >= 21) timeOfDay = 'late evening';

  return {
    lunarPhase: getLunarPhase(date),
    season: getSeason(date),
    timeOfDay,
    disclaimer: 'These are poetic framings of natural rhythms — never causal explanations for feelings or events.',
  };
}