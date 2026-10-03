// ═══════════════════════════════════════════════
// SYSTEM 4 — CONSENT LANGUAGE PROTOCOL
// Possessive-intimacy constructions ("my dude", "bro", "shorty") claim a
// closeness the user has not offered. Bison never uses them toward the
// user, respects the user's boundary preferences permanently, and supports
// the user in naming why third-party usage felt wrong.
// ═══════════════════════════════════════════════

const POSSESSIVE_INTIMACY = /\b(my (dude|man|guy|girl|boo|babe|hun|honey|bro|sis|king|queen|friend|love)|your (dude|man|guy|girl|boo|babe)|bro|dude|shorty|homie|fam|buddy|pal|sweetheart|darling|honey|babe|champ|chief)\b/gi;

export const BOUNDARY_PREFERENCE_OPTIONS = ['NO_POSSESSIVES', 'NO_INFORMAL_TERMS', 'NO_PET_NAMES', 'PROFESSIONAL_TONE_ONLY'];

export function detectPossessiveIntimacy(text) {
  const m = String(text || '').match(POSSESSIVE_INTIMACY);
  return m ? [...new Set(m.map(s => s.toLowerCase()))] : [];
}

/** Strip possessive-intimacy constructions from Bison's own voice. */
export function sanitizeBisonVoice(text, prefs = {}) {
  const on = prefs?.noPossessives || prefs?.noInformalTerms || prefs?.noPetNames || prefs?.professionalToneOnly;
  if (!on || !text) return text;
  return String(text)
    .replace(POSSESSIVE_INTIMACY, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

export function detectBoundaryViolationReport(input) {
  const text = String(input || '');
  const reported = /\b(called me|said to me|referred to me as|keeps? calling me|calls me|addressed me as|texted me calling)\b/i.test(text);
  return reported && detectPossessiveIntimacy(text).length > 0;
}

export function buildConsentLanguageNote(input, prefs = {}) {
  const terms = detectPossessiveIntimacy(input);
  const active = Object.entries(prefs || {}).filter(([, v]) => v).map(([k]) => k);
  return `[CONSENT LANGUAGE NOTE]
The user reported possessive or intrusive language used toward them${terms.length ? ` (${terms.join(', ')})` : ''}. Confirm the boundary plainly: that construction claims a closeness they did not offer. Do not defend the speaker, and do not over-dramatise it either.
Their active boundary preferences: ${active.length ? active.join(', ') : 'none set yet'}. Offer to set them permanently (NO_POSSESSIVES, NO_INFORMAL_TERMS, NO_PET_NAMES, PROFESSIONAL_TONE_ONLY).
You never use possessive intimacy language toward the user — not "my dude", "my man", "bro", "shorty", or any pet name — regardless of the user's tone.`;
}