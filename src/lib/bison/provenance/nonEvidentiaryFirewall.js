// ═══════════════════════════════════════════════
// NON-EVIDENTIARY DATA FIREWALL (Package: Data Provenance Layer)
// Developer examples, documentation, sample conversations,
// and tutorial text are permanently classified as
// NON-EVIDENTIARY DATA and excluded from runtime memory.
//
// The runtime must never load these into:
// - memory
// - conversation context
// - forecasting
// - continuity
// - personality
// ═══════════════════════════════════════════════

export const NON_EVIDENTIARY_TYPES = {
  EXAMPLE_ONLY: 'EXAMPLE_ONLY',
  DOCUMENTATION: 'DOCUMENTATION',
  DEVELOPER_PROMPT: 'DEVELOPER_PROMPT',
  SAMPLE_CONVERSATION: 'SAMPLE_CONVERSATION',
  TUTORIAL_TEXT: 'TUTORIAL_TEXT',
  TEST_FIXTURE: 'TEST_FIXTURE',
};

// ── Pattern-based detection (Package 46.5) ──
// Text that looks like examples, fixtures, or documentation
// is flagged so it never enters semantic memory or reasoning.

const NON_EVIDENTIARY_TEXT_PATTERNS = [
  { pattern: /lorem ipsum/i, type: 'TEST_FIXTURE' },
  { pattern: /\btest fixture\b|\bunit test\b|\bmock data\b/i, type: 'TEST_FIXTURE' },
  { pattern: /\bjohn doe\b|\bjane doe\b/i, type: 'TEST_FIXTURE' },
  { pattern: /^example:|\bsample conversation\b/i, type: 'SAMPLE_CONVERSATION' },
  { pattern: /this is (just )?(an? )?(example|test|sample|demo|placeholder)/i, type: 'EXAMPLE_ONLY' },
  { pattern: /\bdeveloper prompt\b|\bsystem prompt\b/i, type: 'DEVELOPER_PROMPT' },
  { pattern: /\btutorial\b.*\bstep \d/i, type: 'TUTORIAL_TEXT' },
];

// Returns the matched non-evidentiary type, or null if the text is clean.
export function detectNonEvidentiaryText(text) {
  if (!text || typeof text !== 'string') return null;
  for (const { pattern, type } of NON_EVIDENTIARY_TEXT_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  return null;
}

// Guard for evidence boundaries (memory creation, compression, synthesis).
export function assertEvidentiary(text) {
  const type = detectNonEvidentiaryText(text);
  if (type) {
    return { allowed: false, reason: `Classified as ${type} — non-evidentiary data cannot become evidence about the user.` };
  }
  return { allowed: true, reason: null };
}

const NON_EVIDENTIARY_FLAG = '_classification';

export function isNonEvidentiary(data) {
  if (!data || typeof data !== 'object') return false;
  return Object.values(NON_EVIDENTIARY_TYPES).includes(data[NON_EVIDENTIARY_FLAG]);
}

export function markAsNonEvidentiary(data, type = NON_EVIDENTIARY_TYPES.EXAMPLE_ONLY) {
  if (!data || typeof data !== 'object') return data;
  return { ...data, [NON_EVIDENTIARY_FLAG]: type };
}

export function filterNonEvidentiary(records) {
  if (!records || !Array.isArray(records)) return [];
  return records.filter(r => !isNonEvidentiary(r));
}

export function buildNonEvidentiaryFirewallContextString() {
  const parts = ['[NON-EVIDENTIARY DATA FIREWALL]'];
  parts.push('Developer examples, documentation, sample conversations, and tutorial text are NON-EVIDENTIARY DATA.');
  parts.push('These are permanently excluded from: runtime memory, conversation context, forecasting, continuity, and personality.');
  parts.push('Never use non-evidentiary data as evidence about the user.');
  parts.push('If a claim is based solely on examples or documentation, it has no evidentiary weight.');
  parts.push('[/NON-EVIDENTIARY DATA FIREWALL]\n');
  return parts.join('\n') + '\n';
}