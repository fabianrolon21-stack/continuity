// bison/pipeline/outputSanitizer.js
// Strips all internal metadata, tags, and audit blocks from user-facing output.
// Runs as the FINAL step before a response leaves the pipeline.

export const FORBIDDEN_OUTPUT_TOKENS = [
  'Data Provenance Audit',
  'Provenance Audit',
  'Source: INFERRED',
  'Source: USER_INPUT',
  'Source: BISON_DERIVED',
  'Epistemic: INFERRED',
  'Epistemic: USER_CONFIRMED',
  'Epistemic: OBSERVED',
  'Confidence: high',
  'Confidence: medium',
  'Permission: SESSION',
  'FINANCIAL_TRIAGE',
  'HARM_RESPONSE_ACTIVE',
  'INTENT_SANDBOX',
  'CHILDHOOD_CONTEXT',
  'WITNESS_REPORT',
  'garden',
  'LEGAL_FORESIGHT',
  'EMBODIED_AWARENESS'
];

export function sanitizeOutput(raw) {
  if (typeof raw !== 'string') {
    if (raw && typeof raw === 'object' && typeof raw.text === 'string') {
      raw = raw.text; // only use the text field, discard everything else
    } else {
      return '';
    }
  }

  let clean = raw;

  // Strip trailing debug tags (a caps run at the very end of the message)
  clean = clean.replace(/\n+[A-Z_]{4,}\s*$/g, '');

  // Strip inline token leaks — remove from the token to the end of its paragraph
  for (const token of FORBIDDEN_OUTPUT_TOKENS) {
    const idx = clean.indexOf(token);
    if (idx !== -1) {
      const before = clean.slice(0, idx);
      const after = clean.slice(idx);
      const paragraphEnd = after.search(/\n\n/);
      clean = before + (paragraphEnd === -1 ? '' : after.slice(paragraphEnd + 2));
    }
  }

  clean = clean.replace(/\n{3,}/g, '\n\n').trim();

  return clean;
}

// FIX 9 — Continuity honesty. Continuity claims are only legitimate when memory
// access is actually granted in this session.
const CONTINUITY_CLAIMS = [
  /\bi am always here\b[^.!?]*[.!?]?/gi,
  /\bi'?m always here\b[^.!?]*[.!?]?/gi,
  /\bi haven'?t been gone\b[^.!?]*[.!?]?/gi,
  /\bi missed you\b[^.!?]*[.!?]?/gi,
  /\bi remember everything\b[^.!?]*[.!?]?/gi,
];

export function stripContinuityClaims(text) {
  if (typeof text !== 'string') return text;
  let clean = text;
  for (const pattern of CONTINUITY_CLAIMS) {
    clean = clean.replace(pattern, 'I don\'t carry anything between conversations.');
  }
  return clean.replace(/\s{2,}/g, ' ').trim();
}