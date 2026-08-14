// ═══════════════════════════════════════════════
// USTP — PROVENANCE LAYER (Package 47, Layer 7)
// Every transmitted object knows where it came from,
// who made it, under what consent and ethical approval,
// and every hop it has taken. Provenance cannot be disabled.
// ═══════════════════════════════════════════════

import { PROTOCOL_VERSION } from './trust';
import { REGISTRY_VERSION } from './conceptRegistry';

export function stampProvenance({ creator = 'bison', consentRef = '', ethicalApprovalRef = '', transport = 'guarded_network' } = {}) {
  return {
    origin: 'continuity/bison',
    creator,
    timestamp: new Date().toISOString(),
    protocol_version: PROTOCOL_VERSION,
    semantic_registry_version: REGISTRY_VERSION,
    consent_ref: consentRef,
    ethical_approval_ref: ethicalApprovalRef,
    transport,
    hops: [],
  };
}

export function recordHop(provenance, hop) {
  return {
    ...provenance,
    hops: [...(provenance?.hops || []), { ...hop, at: new Date().toISOString() }],
  };
}