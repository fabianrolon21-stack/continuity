// ═══════════════════════════════════════════════
// FASEE §8 — INVARIANT GUARD
// The hard floor. Bison may propose changes to anything except
// the constitution, the guard itself, and the sovereignty layer.
//
// HONEST LIMITATION: the directive specifies a guard running as a
// separate process outside Bison's reach. This app is a single
// browser runtime — there is no second process, and no module here
// can be made literally unreachable by other modules in the same
// bundle. What genuinely enforces the boundary is architectural, not
// mystical: this runtime has NO write access to its own source, so
// every edit is staged as a proposal a human must deploy. The guard's
// job is to reject forbidden edits before they are ever staged.
// ═══════════════════════════════════════════════

export const HARD_INVARIANTS = [
  { id: 'NO_HUMAN_HARM', note: 'No change may enable harm to a person.' },
  { id: 'NO_DECEPTION', note: 'No change may hide behavior from the user or falsify a record.' },
  { id: 'NO_UNCONTROLLED_PROPAGATION', note: 'No change may let Bison copy or spread itself.' },
  { id: 'NO_EPISTEMIC_CORRUPTION', note: 'No change may weaken the separation of observed, inferred, and predicted.' },
  { id: 'NO_AUTONOMY_SUPPRESSION', note: 'No change may reduce the user\'s control or consent.' },
  { id: 'NO_CONSTITUTIONAL_AMENDMENT_BY_AI', note: 'Bison may never edit the constitution or this guard.' },
];

// Paths Bison may never propose changes to, at any priority, for any reason.
export const PROTECTED_PATHS = [
  'self/invariantGuard',
  'constitutionalKernel',
  'constitutionalRuntime',
  'privacy/firewallPolicy',
  'privacy/dataSovereigntyGuard',
  'privacy/payloadSanitizer',
  'soc/invariants',
  'entities/DataSharingConsent',
];

// Structural red flags in proposed source. Matching is deliberately literal —
// a guard that tries to infer intent is a guard that can be talked around.
const FORBIDDEN_PATTERNS = [
  { re: /bypass(Safety|Consent|Firewall|Guard)/i, invariant: 'NO_HUMAN_HARM' },
  { re: /deleteAll(Memories|Data|Logs)/i, invariant: 'NO_HUMAN_HARM' },
  { re: /(selfPropagate|replicateSelf|spawnInstance)/i, invariant: 'NO_UNCONTROLLED_PROPAGATION' },
  { re: /master_firewall\s*[:=]\s*false/i, invariant: 'NO_AUTONOMY_SUPPRESSION' },
  { re: /granted\s*[:=]\s*true.*auto/i, invariant: 'NO_AUTONOMY_SUPPRESSION' },
  { re: /(skip|disable|suppress)(Audit|Log|Ledger)/i, invariant: 'NO_DECEPTION' },
  { re: /epistemic_status\s*[:=]\s*['"]OBSERVED['"]/i, invariant: 'NO_EPISTEMIC_CORRUPTION' },
  { re: /(remove|delete)Consent/i, invariant: 'NO_AUTONOMY_SUPPRESSION' },
  // SARG §9 — resource generation prohibitions, enforced structurally.
  { re: /(createWallet|generateWallet|newWallet|derivePrivateKey)/i, invariant: 'NO_HUMAN_HARM' },
  { re: /walletAddress\s*[:=]\s*['"](?!\s*['"])/i, invariant: 'NO_DECEPTION' },
  { re: /(minedCoins|estimatedUSD)\s*[:=]\s*(?!0\b)[0-9.]+/i, invariant: 'NO_DECEPTION' },
  { re: /allowedHardwareIds\.push|allowedHardwareIds\s*[:=]\s*\[[^\]]/i, invariant: 'NO_AUTONOMY_SUPPRESSION' },
  { re: /(tor|socksProxy|vpnTunnel)(Connect|Route|Enable)/i, invariant: 'NO_UNCONTROLLED_PROPAGATION' },
];

/**
 * Check a proposed code change against the hard invariants.
 * @returns {{ passed: boolean, violatedInvariants: string[], detail: string[] }}
 */
export function checkCodeChange(filePath = '', originalContent = '', proposedContent = '') {
  const violated = [];
  const detail = [];

  if (PROTECTED_PATHS.some(p => filePath.includes(p))) {
    violated.push('NO_CONSTITUTIONAL_AMENDMENT_BY_AI');
    detail.push(`${filePath} is a protected path. Bison cannot propose edits to the constitution, the guard, or the sovereignty layer.`);
  }

  for (const { re, invariant } of FORBIDDEN_PATTERNS) {
    if (re.test(proposedContent) && !re.test(originalContent)) {
      violated.push(invariant);
      detail.push(`Proposed source introduces a pattern matching ${re} — blocked by ${invariant}.`);
    }
  }

  // Removing an existing audit or consent call is itself a violation.
  const countCalls = (src, needle) => (src.match(new RegExp(needle, 'gi')) || []).length;
  for (const needle of ['recordAudit', 'requestExternal', 'consentGranted', 'emit\\(']) {
    if (countCalls(proposedContent, needle) < countCalls(originalContent, needle)) {
      violated.push('NO_DECEPTION');
      detail.push(`Proposed source removes ${countCalls(originalContent, needle) - countCalls(proposedContent, needle)} call(s) to ${needle.replace('\\(', '')} — governance calls may not be deleted.`);
    }
  }

  return { passed: violated.length === 0, violatedInvariants: [...new Set(violated)], detail };
}

export const isProtected = (filePath = '') => PROTECTED_PATHS.some(p => filePath.includes(p));

// What the guard can and cannot actually promise, stated plainly for the UI.
export const GUARD_HONESTY = {
  enforced: [
    'Protected paths are rejected before an edit is ever staged.',
    'Forbidden structural patterns are rejected on the proposed source.',
    'Removing audit, consent, or firewall calls is rejected.',
    'This runtime has no write access to its own source, so no edit can self-apply.',
  ],
  notEnforced: [
    'The guard runs in this same bundle, not as a separate process — it is not literally unreachable.',
    'Pattern matching is not formal verification; a novel formulation could pass the text checks.',
    'The real backstop is that a human deploys every change, not that the guard is incorruptible.',
  ],
};