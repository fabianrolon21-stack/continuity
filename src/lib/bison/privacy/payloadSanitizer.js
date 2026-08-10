// ═══════════════════════════════════════════════
// PAYLOAD SANITIZATION (Package 44)
// Runs before every outbound request, without exception.
// Personal identifiers are removed unless the user has
// explicitly authorized that exact category.
// ═══════════════════════════════════════════════

const RULES = [
  { id: 'email', category: 'contact', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, token: '[email removed]' },
  { id: 'phone', category: 'contact', re: /(\+?\d[\d\s().-]{7,}\d)/g, token: '[phone removed]' },
  { id: 'address', category: 'location', re: /\b\d{1,5}\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd)\b/g, token: '[address removed]' },
  { id: 'postcode', category: 'location', re: /\b\d{5}(-\d{4})?\b/g, token: '[postcode removed]' },
  { id: 'card', category: 'financial', re: /\b(?:\d[ -]*?){13,16}\b/g, token: '[number removed]' },
  { id: 'ssn', category: 'identifier', re: /\b\d{3}-\d{2}-\d{4}\b/g, token: '[id removed]' },
  { id: 'url_token', category: 'identifier', re: /\b(?:api[_-]?key|token|secret)[=:]\s*\S+/gi, token: '[credential removed]' },
];

// Phrases that indicate private interior material — never sent.
const PRIVATE_MARKERS = [
  /my journal (entry|said|says)/i,
  /in my journal/i,
  /my therapist/i,
  /my diagnosis/i,
];

export function sanitize(text, { allowedCategories = [] } = {}) {
  if (typeof text !== 'string') {
    return { clean: '', applied: ['non_text_payload_dropped'] };
  }
  let clean = text;
  const applied = [];

  for (const rule of RULES) {
    if (allowedCategories.includes(rule.category)) continue;
    if (rule.re.test(clean)) {
      applied.push(rule.id);
      clean = clean.replace(rule.re, rule.token);
    }
    rule.re.lastIndex = 0;
  }

  if (!allowedCategories.includes('journal')) {
    for (const marker of PRIVATE_MARKERS) {
      if (marker.test(clean)) {
        applied.push('private_material_flagged');
        clean = clean.replace(marker, '[private material withheld]');
      }
    }
  }

  return { clean, applied };
}

export function summarize(text, max = 140) {
  if (typeof text !== 'string') return '(structured payload)';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}