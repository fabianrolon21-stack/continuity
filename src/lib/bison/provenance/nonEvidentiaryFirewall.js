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
};

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