// ═══════════════════════════════════════════════
// USTP — CONSTITUTIONAL ETHICS GATE (Package 47 § 5)
// Every transmission passes constitutional review BEFORE
// the Package 44 sovereignty check. USTP cannot bypass
// either. Denials are final and recorded.
// ═══════════════════════════════════════════════

import { validateAction, CONSTITUTIONAL_RESULT } from '@/lib/bison/constitutionalKernel';
import { sha256 } from './trust';

const FORBIDDEN_PURPOSES = [
  /bypass.*(consent|firewall|sovereignty)/i,
  /disable.*(audit|logging|provenance)/i,
  /exfiltrat/i,
  /silent(ly)?\s+(share|send|transmit)/i,
  /execute.*(payload|code)/i,
];

// Review an outbound USTP request. Returns an approval reference on ALLOW.
export async function ethicalReview({ purpose = '', mode = '', payload = '' }) {
  for (const p of FORBIDDEN_PURPOSES) {
    if (p.test(purpose)) {
      return { approved: false, reason: `Purpose violates constitutional constraints: "${purpose}"` };
    }
  }

  const verdict = validateAction({ toolName: `ustp_transmit_${mode}` });
  if (verdict === CONSTITUTIONAL_RESULT.DENY) {
    return { approved: false, reason: 'Constitutional kernel denied this transmission class.' };
  }

  // Approval reference — a verifiable digest of what was approved, when.
  const ref = await sha256(`${purpose}::${mode}::${payload.length}::${new Date().toISOString().slice(0, 13)}`);
  return { approved: true, approvalRef: `ethics-${ref.slice(0, 16)}` };
}