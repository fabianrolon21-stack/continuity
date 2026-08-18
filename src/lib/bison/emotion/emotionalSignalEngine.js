// ═══════════════════════════════════════════════
// PACKAGE 61 §2 — EMOTIONAL SIGNAL ENGINE
// Feelings are data, not commands. User-stated emotions and
// Bison-inferred emotions never share the same epistemic status.
// ═══════════════════════════════════════════════

const LEXICON = {
  JEALOUSY: ['jealous', 'envious', 'envy'],
  ANGER: ['angry', 'furious', 'mad', 'pissed', 'rage'],
  FEAR: ['afraid', 'scared', 'anxious', 'terrified', 'worried'],
  SADNESS: ['sad', 'depressed', 'heartbroken', 'miserable', 'down'],
  JOY: ['happy', 'glad', 'joyful', 'content'],
  EXCITEMENT: ['excited', 'thrilled', "can't wait", 'pumped'],
  LONELINESS: ['lonely', 'isolated', 'alone'],
  GUILT: ['guilty', 'ashamed', 'regret'],
  FRUSTRATION: ['frustrated', 'annoyed', 'stuck', 'fed up'],
  CURIOSITY: ['curious', 'i wonder', 'intrigued'],
  ATTACHMENT: ['attached', 'miss her', 'miss him', 'miss them', 'need her', 'need him', 'need them'],
  UNCERTAINTY: ['not sure', 'uncertain', 'confused', "don't know what to"],
  MOTIVATION: ['motivated', 'determined', 'driven'],
  RELIEF: ['relieved', 'relief'],
};

const INTENSIFIERS = ['so ', 'very ', 'really ', 'extremely ', 'incredibly ', 'furious', 'terrified', 'rage', '!!'];

function intensityOf(text, keyword) {
  let intensity = 0.5;
  for (const marker of INTENSIFIERS) if (text.includes(marker)) intensity += 0.12;
  if (text.includes('about to') || text.includes('right now')) intensity += 0.15;
  if (keyword.length > 0) intensity += 0.05;
  return Math.min(1, intensity);
}

/** Returns EmotionalObservation[] — stated vs inferred kept distinct. */
export function extractEmotionalSignals(rawText) {
  const text = rawText.toLowerCase();
  const observations = [];
  for (const [signal, keywords] of Object.entries(LEXICON)) {
    const hit = keywords.find(keyword => text.includes(keyword));
    if (!hit) continue;
    // USER SAID "I am/feel jealous" vs BISON INFERRED "this might be jealousy".
    const userStated = new RegExp(`i(?:'m| am| feel| felt| was|’m)[^.!?\\n]{0,24}\\b${hit.split(' ')[0]}`).test(text);
    observations.push({
      signal,
      intensity: intensityOf(text, hit),
      userStated,
      evidence: [`text contains “${hit}”${userStated ? ' in a first-person statement' : ''}`],
      confidence: userStated ? 0.9 : 0.45,
      timestamp: Date.now(),
    });
  }
  return observations;
}

export const dominantSignal = observations =>
  [...observations].sort((a, b) => (b.userStated - a.userStated) || (b.intensity - a.intensity))[0] || null;