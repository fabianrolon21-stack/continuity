// ═══════════════════════════════════════════════
// PRIVACY ISOLATION ENGINE
// PII detection, data classification, access control,
// session cache management, authorized processing.
// ═══════════════════════════════════════════════

export const DATA_CLASSIFICATIONS = {
  public:     { level: 0, label: 'Public',     color: 'hsl(120 40% 58%)', cacheTTL: Infinity,  encrypt: false },
  personal:   { level: 1, label: 'Personal',   color: 'hsl(199 56% 64%)', cacheTTL: 300000,    encrypt: false },
  sensitive:  { level: 2, label: 'Sensitive',  color: 'hsl(42 63% 55%)',  cacheTTL: 120000,    encrypt: true },
  restricted: { level: 3, label: 'Restricted', color: 'hsl(0 70% 50%)',   cacheTTL: 60000,     encrypt: true },
};

// PII detection patterns
const PII_PATTERNS = [
  { type: 'email',     pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, classification: 'personal' },
  { type: 'phone',     pattern: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, classification: 'sensitive' },
  { type: 'ssn',       pattern: /\b\d{3}-\d{2}-\d{4}\b/g, classification: 'restricted' },
  { type: 'credit_card', pattern: /\b(?:\d[ -]*?){13,16}\b/g, classification: 'restricted' },
  { type: 'address',   pattern: /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/g, classification: 'sensitive' },
  { type: 'password',  pattern: /\b(password|passwd|pwd)\s*[:=]\s*\S+/gi, classification: 'restricted' },
  { type: 'api_key',   pattern: /\b(api[_-]?key|secret|token)\s*[:=]\s*\S+/gi, classification: 'restricted' },
];

const SENSITIVE_KEYWORDS = [
  'health', 'medical', 'diagnosis', 'medication', 'therapy', 'mental health',
  'financial', 'salary', 'income', 'debt', 'bank account', 'credit score',
  'relationship', 'family secret', 'personal conflict', 'trauma', 'abuse',
  'legal', 'court', 'lawsuit', 'criminal', 'arrest',
];

const RESTRICTED_KEYWORDS = [
  'ssn', 'social security', 'passport', 'visa number',
  'medical record', 'hipaa', 'bank routing', 'pin code',
];

// Detect PII in text
export function detectPII(text) {
  if (!text) return { hasPII: false, types: [], classifications: [] };

  const found = [];
  const classifications = new Set();

  for (const { type, pattern, classification } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      found.push(type);
      classifications.add(classification);
    }
  }

  const lowerText = text.toLowerCase();
  if (SENSITIVE_KEYWORDS.some(kw => lowerText.includes(kw))) {
    classifications.add('sensitive');
  }
  if (RESTRICTED_KEYWORDS.some(kw => lowerText.includes(kw))) {
    classifications.add('restricted');
  }

  return {
    hasPII: found.length > 0 || classifications.size > 0,
    types: found,
    classifications: Array.from(classifications),
    highestLevel: getHighestClassification(Array.from(classifications)),
  };
}

export function getHighestClassification(classifications) {
  if (classifications.length === 0) return 'public';
  let highest = 'public';
  for (const c of classifications) {
    if (DATA_CLASSIFICATIONS[c]?.level > DATA_CLASSIFICATIONS[highest]?.level) {
      highest = c;
    }
  }
  return highest;
}

// Classify a data field or content
export function classifyData(content, context = {}) {
  const pii = detectPII(content);

  if (pii.highestLevel !== 'public') {
    return {
      classification: pii.highestLevel,
      piiDetected: pii.types,
      requiresEncryption: DATA_CLASSIFICATIONS[pii.highestLevel]?.encrypt || false,
      cacheTTL: DATA_CLASSIFICATIONS[pii.highestLevel]?.cacheTTL || 300000,
      authorizedProcessingOnly: pii.highestLevel === 'restricted',
    };
  }

  // Context-based classification
  if (context.isJournalEntry || context.isPrivate) {
    return {
      classification: 'sensitive',
      piiDetected: [],
      requiresEncryption: true,
      cacheTTL: DATA_CLASSIFICATIONS.sensitive.cacheTTL,
      authorizedProcessingOnly: false,
    };
  }

  if (context.isPersonalNote) {
    return {
      classification: 'personal',
      piiDetected: [],
      requiresEncryption: false,
      cacheTTL: DATA_CLASSIFICATIONS.personal.cacheTTL,
      authorizedProcessingOnly: false,
    };
  }

  return {
    classification: 'public',
    piiDetected: [],
    requiresEncryption: false,
    cacheTTL: DATA_CLASSIFICATIONS.public.cacheTTL,
    authorizedProcessingOnly: false,
  };
}

// Session cache with automatic expiration
const sessionCache = new Map();

export function cacheSet(key, value, ttl) {
  const expiry = Date.now() + (ttl || 300000);
  sessionCache.set(key, { value, expiry });
}

export function cacheGet(key) {
  const entry = sessionCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    sessionCache.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheClear() {
  sessionCache.clear();
}

export function cacheCleanup() {
  const now = Date.now();
  for (const [key, entry] of sessionCache) {
    if (now > entry.expiry) sessionCache.delete(key);
  }
}

// Authorized processing check
export function isAuthorizedForProcessing(classification, userRole = 'user') {
  if (classification === 'restricted') return userRole === 'admin';
  if (classification === 'sensitive') return true; // user can process their own sensitive data
  return true;
}

// Strip personal data aggressively before sending to an external oracle.
// More aggressive than redactPII — uses 'restricted' level (highest strip).
// Also strips relationship names from SavedMemory to avoid leaking the
// user's social graph to external models.
export async function stripForExternalTransmission(text) {
  if (!text) return { cleanedQuery: text, redactionReport: { typesStripped: [], count: 0 } };

  const strippedTypes = [];

  // 1. Redact all PII at the highest level
  let cleaned = redactPII(text, 'restricted');

  if (cleaned !== text) {
    strippedTypes.push('pii');
  }

  // 2. Strip relationship names from the user's social graph
  let relationshipNames = [];
  try {
    const { base44 } = await import('@/api/base44Client');
    const relationships = await base44.entities.Relationship.list('-created_date', 50).catch(() => []);
    relationshipNames = relationships
      .map(r => r.name)
      .filter(name => name && name.length > 2);

    for (const name of relationshipNames) {
      const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (nameRegex.test(cleaned)) {
        cleaned = cleaned.replace(nameRegex, '[PERSON]');
        strippedTypes.push('relationship_name');
      }
    }
  } catch (e) {}

  // 3. Strip any remaining email-like patterns (belt and suspenders)
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailPattern.test(cleaned)) {
    cleaned = cleaned.replace(emailPattern, '[EMAIL]');
    strippedTypes.push('email');
  }

  // Deduplicate stripped types
  const uniqueTypes = [...new Set(strippedTypes)];

  return {
    cleanedQuery: cleaned,
    redactionReport: {
      typesStripped: uniqueTypes,
      count: uniqueTypes.length,
    },
  };
}

// Redact PII from text for safe display/processing
export function redactPII(text, classification = 'sensitive') {
  if (!text) return text;
  let redacted = text;
  const level = DATA_CLASSIFICATIONS[classification]?.level || 0;

  if (level >= 1) {
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'email')?.pattern || '', '[EMAIL]');
  }
  if (level >= 2) {
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'phone')?.pattern || '', '[PHONE]');
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'address')?.pattern || '', '[ADDRESS]');
  }
  if (level >= 3) {
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'ssn')?.pattern || '', '[SSN]');
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'credit_card')?.pattern || '', '[CARD]');
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'password')?.pattern || '', '[REDACTED]');
    redacted = redacted.replace(PII_PATTERNS.find(p => p.type === 'api_key')?.pattern || '', '[REDACTED]');
  }

  return redacted;
}