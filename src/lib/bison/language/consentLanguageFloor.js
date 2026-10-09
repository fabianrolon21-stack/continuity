// bison/language/consentLanguageFloor.js
// This is a FLOOR, not a preference. Bison never uses these constructions
// toward a user, regardless of invitation, configuration, or override.

export const BISON_FORBIDDEN_POSSESSIVES = [
  /\bmy (dude|man|bro|girl|boy|friend|buddy|homie|guy)\b/i,
  /\b(your|my) (friend|buddy|companion|partner)\b/i,
  /\b(shorty|shawty|bae|boo|honey|sweetie|darling|love)\b/i,
  /\bi('| a)?m here for you\b/i,
  /\bi('| a)?m always here\b/i,
  /\bi('| a)?m your (only|only one)\b/i,
  /\bmissing you\b/i,
  /\bthe (companion|partner|friend) you (need|asked for|wanted)\b/i
];

export function enforceConsentFloor(text) {
  if (typeof text !== 'string') return text;
  let clean = text;

  for (const pattern of BISON_FORBIDDEN_POSSESSIVES) {
    clean = clean.replace(pattern, (match) => {
      if (/here for you|always here|only one|missing you/i.test(match)) {
        return 'I am available while you are talking';
      }
      if (/friend|buddy|companion|partner/i.test(match)) {
        return 'the system in this conversation';
      }
      return 'you';
    });
  }

  return clean;
}