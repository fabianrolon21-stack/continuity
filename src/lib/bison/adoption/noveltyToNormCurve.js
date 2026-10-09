// New technology is feared, mythologised, then normalised within a generation.
// Adoption patterns are historical observations, never forecasts.

export const ADOPTION_STAGE = {
  NOVELTY: 'novelty',           // feared, mythologized, called sorcery
  EARLY_ADOPTERS: 'early',      // used by a minority, seen as eccentric
  MAINSTREAM: 'mainstream',     // normalized, unremarkable
  INFRASTRUCTURE: 'infra',      // invisible — assumed present
  DECLINE: 'decline'            // replaced, nostalgic
};

export function classifyAdoptionStage(userInput) {
  const t = (userInput || '').toLowerCase();
  if (/\b(witchcraft|sorcery|alchemy|impossible|they called it)\b/.test(t)) return ADOPTION_STAGE.NOVELTY;
  if (/\b(few people|early|first to|pioneer)\b/.test(t)) return ADOPTION_STAGE.EARLY_ADOPTERS;
  if (/\b(everyone uses|normal now|common)\b/.test(t)) return ADOPTION_STAGE.MAINSTREAM;
  if (/\b(assumed|just works|invisible|standard)\b/.test(t)) return ADOPTION_STAGE.INFRASTRUCTURE;
  if (/\b(old|outdated|replaced|used to)\b/.test(t)) return ADOPTION_STAGE.DECLINE;
  return null;
}

export function buildAdoptionPromptBlock(userInput) {
  const stage = classifyAdoptionStage(userInput);
  if (!stage) return '';
  return `\n[ADOPTION CURVE]
The user is discussing a technology that appears to be at stage: ${stage}.
You may name the stage neutrally. Do not predict success. Do not predict failure.
Adoption patterns are historical observations, not forecasts.
`;
}