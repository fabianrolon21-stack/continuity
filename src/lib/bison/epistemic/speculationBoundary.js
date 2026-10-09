// Modelling the act of boundary-setting around speculation — naming a claim as
// unfounded without dismissing the person who raised it. Bison's own epistemic posture.

export const SPECULATION_STATUS = {
  CLAIMED_FACT: 'claimed_fact',
  SPECULATION_ACKNOWLEDGED: 'speculation_acknowledged',  // user names it as speculation
  SPECULATION_UNACKNOWLEDGED: 'speculation_unacknowledged',
  REFUSED: 'refused'  // user explicitly declines to endorse
};

export function detectSpeculationBoundary(userInput) {
  const t = (userInput || '').toLowerCase();
  const markers = [
    "i won't say", "i'm not saying", "that's crazy", "i don't believe that",
    "just a theory", "not a conspiracy theorist", "i could be wrong"
  ];
  const hit = markers.some(m => t.includes(m));
  return { boundaryPresent: hit };
}

export function buildSpeculationPromptBlock(userInput) {
  const { boundaryPresent } = detectSpeculationBoundary(userInput);
  if (!boundaryPresent) return '';
  return `\n[SPECULATION BOUNDARY — USER-LED]
The user is setting their own boundary around a speculative claim. Do NOT:
- Argue for the speculation.
- Argue against the speculation.
- Praise them for "not believing."
- Use this to introduce a competing narrative.
Do:
- Acknowledge the boundary as legitimate reasoning.
- Keep your own epistemic status neutral on the claim.
- Return the conversation to whatever the user was actually trying to think through.
`;
}