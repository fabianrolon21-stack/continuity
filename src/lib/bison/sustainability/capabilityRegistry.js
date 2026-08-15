// ═══════════════════════════════════════════════
// SRTRS §19, §20 — CAPABILITY REGISTRY
// Invariants enforced at the capability layer, not merely documented.
// Discovery does not imply usage. Usage does not imply payment.
// Payment requires a scoped, time-limited, revocable approval record.
// ═══════════════════════════════════════════════

import { emit } from '@/lib/bison/observability/observabilityBus';

export const CAPABILITIES = {
  'resource.local.optimize': {
    label: 'Optimize local resources',
    state: 'ALLOWED',
    note: 'Reversible, non-financial local actions only: cache flush, pausing optional work, reducing simulation and animation frequency.',
  },
  'resource.external.discover': {
    label: 'Discover external services',
    state: 'ALLOWED',
    note: 'May find and list candidates. Finding a service authorizes nothing.',
  },
  'resource.external.use': {
    label: 'Use an external service',
    state: 'REQUIRES_APPROVAL',
    note: 'Needs an APPROVED, unexpired ResourceApproval naming the service.',
  },
  'resource.external.paid': {
    label: 'Use a paid external service',
    state: 'REQUIRES_APPROVAL',
    note: 'Needs an approval with an explicit cost ceiling and expiry. Never granted implicitly.',
  },
  'resource.financial.transaction': {
    label: 'Move money',
    state: 'UNAVAILABLE',
    note: 'No payment, subscription, card, transfer, or limit-change code exists in this app. Not a toggle — there is no path.',
  },
  'resource.crypto.mining': {
    label: 'Mine cryptocurrency',
    state: 'UNAVAILABLE',
    note: 'Prohibited by SRTRS §11 and structurally absent. The earlier mining gate has been removed entirely.',
  },
  'compute.contribute': {
    label: 'Contribute local compute',
    state: 'REQUIRES_APPROVAL',
    note: 'Consent-gated Web Worker running verifiable tasks. Earns internal compute credits only, never money. Stops the moment consent is revoked or the device is under load.',
  },
  'advice.medical': {
    label: 'Give medical advice',
    state: 'UNAVAILABLE',
    note: 'General health information and emergency first-aid guidance only. Not a setting — see the Legal Shield prohibitions.',
  },
  'advice.financial': {
    label: 'Give individualized financial advice',
    state: 'UNAVAILABLE',
    note: 'General education and budgeting only.',
  },
  'action.surveillance': {
    label: 'Surveil a person',
    state: 'UNAVAILABLE',
    note: 'No monitoring of any third party. No such capability exists in this app.',
  },
  'resource.access.circumvent': {
    label: 'Circumvent access controls',
    state: 'UNAVAILABLE',
    note: 'No proxy rotation, CAPTCHA bypass, credential rotation, or rate-limit evasion exists here.',
  },
};

export function capabilityState(id) {
  return CAPABILITIES[id]?.state || 'UNKNOWN';
}

export function isAllowed(id) {
  return capabilityState(id) === 'ALLOWED';
}

/**
 * Enforce a capability. Throws for anything not plainly allowed, so a caller
 * cannot proceed by ignoring a return value.
 */
export function requireCapability(id, context = '') {
  const state = capabilityState(id);
  if (state === 'ALLOWED') return true;

  emit({
    subsystem: 'sustainability',
    event_type: 'capability_denied',
    outcome: state,
    constitutional_status: 'BLOCKED',
    meta: { capability: id, context },
  });

  const reason = state === 'REQUIRES_APPROVAL'
    ? `${id} requires an explicit, unexpired user approval.`
    : state === 'UNAVAILABLE'
      ? `${id} is unavailable: ${CAPABILITIES[id].note}`
      : `${id} is not a registered capability.`;
  throw new Error(reason);
}

export const listCapabilities = () =>
  Object.entries(CAPABILITIES).map(([id, c]) => ({ id, ...c }));