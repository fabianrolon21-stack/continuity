// ═══════════════════════════════════════════════
// PROVENANCE TRACKER (Package: Data Provenance Layer)
// Every piece of information used by Bison carries
// metadata: source, origin, confidence, epistemic
// status, permission, timestamp, and reason.
//
// Data with UNKNOWN provenance is quarantined —
// excluded from forecasting, memory, synthesis,
// and recommendations until user-confirmed.
// ═══════════════════════════════════════════════

export const PROVENANCE_SOURCES = {
  CURRENT_CONVERSATION: 'CURRENT_CONVERSATION',
  PREVIOUS_CONVERSATION: 'PREVIOUS_CONVERSATION',
  USER_MEMORY: 'USER_MEMORY',
  CALENDAR: 'CALENDAR',
  DEVICE_PERMISSION: 'DEVICE_PERMISSION',
  CONTACT: 'CONTACT',
  WEATHER: 'WEATHER',
  USER_INPUT: 'USER_INPUT',
  INFERRED: 'INFERRED',
  PREDICTED: 'PREDICTED',
  SYSTEM: 'SYSTEM',
  UNKNOWN: 'UNKNOWN',
};

export const PROVENANCE_PERMISSIONS = {
  SESSION: 'SESSION',
  PERSISTENT: 'PERSISTENT',
  TEMPORARY: 'TEMPORARY',
  EXPLICIT_ONLY: 'EXPLICIT_ONLY',
};

export const CONFIDENCE_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const EPISTEMIC_STATUS = {
  OBSERVED: 'OBSERVED',
  USER_CONFIRMED: 'USER_CONFIRMED',
  INFERRED: 'INFERRED',
  PREDICTED: 'PREDICTED',
  UNKNOWN: 'UNKNOWN',
};

const MAX_REGISTRY_SIZE = 200;

let _registry = [];
let _quarantined = [];

let _idCounter = 0;

export function registerDatum({ value, source, origin, confidence, epistemicStatus, permission, reason }) {
  const record = {
    id: `prov_${++_idCounter}`,
    value,
    source: source || PROVENANCE_SOURCES.UNKNOWN,
    origin: origin || 'Current Session',
    timestamp: new Date().toISOString(),
    confidence: confidence || CONFIDENCE_LEVELS.MEDIUM,
    epistemicStatus: epistemicStatus || EPISTEMIC_STATUS.UNKNOWN,
    permission: permission || PROVENANCE_PERMISSIONS.SESSION,
    reason: reason || '',
  };

  // Quarantine if provenance is unknown
  if (record.source === PROVENANCE_SOURCES.UNKNOWN || record.epistemicStatus === EPISTEMIC_STATUS.UNKNOWN) {
    _quarantined.push(record);
    if (_quarantined.length > MAX_REGISTRY_SIZE) _quarantined.shift();
    record.quarantined = true;
  } else {
    _registry.push(record);
    if (_registry.length > MAX_REGISTRY_SIZE) _registry.shift();
    record.quarantined = false;
  }

  return record;
}

export function getRecentProvenance(limit = 10) {
  return _registry.slice(-limit);
}

export function auditFact(searchTerm) {
  if (!searchTerm) return getRecentProvenance(5);
  const lower = searchTerm.toLowerCase();
  return _registry.filter(r => {
    const val = typeof r.value === 'string' ? r.value : JSON.stringify(r.value);
    return val.toLowerCase().includes(lower);
  });
}

export function isQuarantined(value) {
  if (!value) return false;
  const valStr = typeof value === 'string' ? value : JSON.stringify(value);
  const lower = valStr.toLowerCase();
  return _quarantined.some(r => {
    const qVal = typeof r.value === 'string' ? r.value : JSON.stringify(r.value);
    return qVal.toLowerCase().includes(lower);
  });
}

export function getQuarantinedCount() {
  return _quarantined.length;
}

export function getRegisteredCount() {
  return _registry.length;
}

export function clearRegistry() {
  _registry = [];
  _quarantined = [];
}

// ── Audit command detection ──

const AUDIT_PATTERNS = [
  /why do you know this/i,
  /where did you get that/i,
  /how do you know (that|this)/i,
  /what'?s your source/i,
  /what'?s the source/i,
  /source audit/i,
  /where did (you|that|this) come from/i,
  /prove it/i,
  /where did you learn/i,
  /how do you know about/i,
  /what'?s your evidence/i,
  /show me (the |your )?(source|provenance|evidence)/i,
];

export function detectAuditRequest(input) {
  if (!input || typeof input !== 'string') return false;
  return AUDIT_PATTERNS.some(p => p.test(input));
}

// ── Context string for prompt ──

export function buildProvenanceContextString(auditData = null) {
  const parts = ['[DATA PROVENANCE & EPISTEMIC ORIGIN LAYER]'];
  parts.push('Every datum must carry provenance metadata: source, origin, confidence, epistemic status, permission, reason.');
  parts.push('Sources: CURRENT_CONVERSATION, PREVIOUS_CONVERSATION, USER_MEMORY, CALENDAR, DEVICE_PERMISSION, CONTACT, WEATHER, USER_INPUT, INFERRED, PREDICTED, SYSTEM, UNKNOWN.');
  parts.push('If you cannot identify the source of a claim, say: "I cannot determine where this information originated. I will not use it further until it is re-confirmed."');
  parts.push('Data with UNKNOWN provenance is quarantined — not used for forecasting, memory, synthesis, or recommendations until the user explicitly confirms it.');

  if (auditData && auditData.length > 0) {
    parts.push('');
    parts.push('PROVENANCE AUDIT REQUESTED — recently used data:');
    for (const record of auditData) {
      const valStr = typeof record.value === 'string'
        ? record.value.substring(0, 120)
        : JSON.stringify(record.value).substring(0, 120);
      parts.push(`  - Value: "${valStr}"`);
      parts.push(`    Source: ${record.source} | Confidence: ${record.confidence} | Permission: ${record.permission} | Epistemic: ${record.epistemicStatus}`);
      parts.push(`    Reason: ${record.reason}`);
    }
    parts.push('Present this audit naturally in your response. For each fact the user asks about, provide: the value, source, confidence, permission, and reason it was used.');
  }

  parts.push('[/DATA PROVENANCE & EPISTEMIC ORIGIN LAYER]\n');
  return parts.join('\n') + '\n';
}