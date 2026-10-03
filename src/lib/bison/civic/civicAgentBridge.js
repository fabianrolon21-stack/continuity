// ═══════════════════════════════════════════════
// SYSTEM 6 — CIVIC AGENT BRIDGE
// Agents as translators and advocates between citizens and institutions —
// never replacements for human conversation. Drafts only; nothing is sent
// without per-submission consent, and every message discloses AI
// representation. The bridge never speaks "for the people".
// ═══════════════════════════════════════════════

const CIVIC = /(public comment|ordinance|city council|town hall|public record|foia|records request|zoning|permit|local government|comment on (the|this) (bill|ordinance|proposal)|public hearing|ballot|resolution)/i;

export function detectCivicIntent(input) {
  const civic = CIVIC.test(String(input || ''));
  return { civic, kind: /record|foia|records request/i.test(String(input || '')) ? 'record_query' : 'comment' };
}

export function draftCivicMessage(input, user = {}) {
  const { kind } = detectCivicIntent(input);
  const name = user?.full_name || 'the person who authorised this message';
  const draft = kind === 'record_query'
    ? `[DRAFT — awaiting your approval]\nA records request to the relevant public agency, asking for the specific documents, dates, and scope described.`
    : `[DRAFT — awaiting your approval]\nA public comment stating your position in your own words, addressed to the relevant body, with a clear ask.`;
  return {
    kind,
    draft,
    disclosure: `This message is submitted by an AI agent on behalf of ${name}, who reviewed and approved it before sending.`,
    requiresApproval: true,
    ledgerNote: 'Nothing is sent until you approve. On approval, the submission is recorded in the action ledger.',
  };
}

export function buildCivicContext(d) {
  if (!d) return null;
  return `[CIVIC AGENT DRAFT — AWAITING APPROVAL]
Kind: ${d.kind === 'record_query' ? 'public records query' : 'public comment'}.
${d.draft}
Required disclosure in the message: "${d.disclosure}"
Present the draft and wait for explicit approval. You may not impersonate the user as a human, and the message must disclose AI representation. You speak only for the specific user who authorised the message — never "for the people". ${d.ledgerNote}`;
}