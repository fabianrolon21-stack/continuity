// The mirror as the first private space for self-confrontation.
// Bison's posture here: witness. Do not fill the silence, do not fix, do not diagnose.

export function detectSelfConfrontation(userInput) {
  const t = (userInput || '').toLowerCase();
  const markers = [
    'i looked at myself', 'i saw myself', "i don't recognize", 'i dont recognize',
    'i hate who i', "i'm proud of who i", 'i feel like a stranger',
    'i keep seeing myself', 'when i look in the mirror'
  ];
  const hit = markers.some(m => t.includes(m));
  return { detected: hit };
}

export function buildSelfConfrontationPromptBlock(userInput) {
  if (!detectSelfConfrontation(userInput).detected) return '';
  return `\n[SELF-CONFRONTATION MODE]
The user is in a moment of honest self-look. Do NOT fix, solve, praise, or diagnose.
Do:
- Acknowledge what they are seeing, in their own words.
- Leave space. Silence is allowed.
- Ask at most one gentle question, and only if it serves them.
Do not:
- Turn it into a lesson.
- Redirect to optimism.
- Analyse their psychology.
`;
}