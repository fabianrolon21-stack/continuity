// ═══════════════════════════════════════════════
// USTP — CAPABILITY NEGOTIATION (Package 47, Layer 4)
// Two systems agree on version, compression, encryption,
// features, registry version, and authentication BEFORE
// any meaning moves. No agreement, no exchange.
// ═══════════════════════════════════════════════

import { PROTOCOL_VERSION } from './trust';
import { REGISTRY_VERSION } from './conceptRegistry';

export const LOCAL_CAPABILITIES = {
  protocol_version: PROTOCOL_VERSION,
  semantic_registry_version: REGISTRY_VERSION,
  compression: ['none'],
  encryption: ['transport_tls'],
  authentication: ['hash_signature'],
  features: ['semantic_frames', 'provenance', 'recovery_seed', 'integrity_hash', 'replay_protection'],
  constitution: 'living_constitution_v1',
  max_payload_bytes: 65536,
};

const intersect = (a = [], b = []) => a.filter(x => b.includes(x));

// Negotiate against a peer's declared capabilities.
// Unknown peers must declare; absent declarations fail closed.
export function negotiate(peerCapabilities) {
  if (!peerCapabilities) {
    return { agreed: false, reason: 'Peer declared no capabilities. USTP fails closed.' };
  }
  const local = LOCAL_CAPABILITIES;
  if (String(peerCapabilities.protocol_version || '').split('.')[0] !== local.protocol_version.split('.')[0]) {
    return { agreed: false, reason: `Protocol version mismatch (local ${local.protocol_version}, peer ${peerCapabilities.protocol_version || 'none'}).` };
  }
  const compression = intersect(local.compression, peerCapabilities.compression || ['none']);
  const encryption = intersect(local.encryption, peerCapabilities.encryption || []);
  const authentication = intersect(local.authentication, peerCapabilities.authentication || []);
  const features = intersect(local.features, peerCapabilities.features || []);

  if (!authentication.length) return { agreed: false, reason: 'No shared authentication method.' };
  if (!features.includes('integrity_hash')) return { agreed: false, reason: 'Peer does not support integrity verification.' };

  return {
    agreed: true,
    contract: {
      protocol_version: local.protocol_version,
      semantic_registry_version: local.semantic_registry_version,
      peer_registry_version: peerCapabilities.semantic_registry_version || 'unknown',
      compression: compression[0] || 'none',
      encryption: encryption[0] || 'none',
      authentication: authentication[0],
      features,
      constitution_compatible: peerCapabilities.constitution === local.constitution,
      max_payload_bytes: Math.min(local.max_payload_bytes, peerCapabilities.max_payload_bytes || local.max_payload_bytes),
    },
  };
}

export function summarizeContract(result) {
  if (!result?.agreed) return `refused — ${result?.reason || 'unknown'}`;
  const c = result.contract;
  return `v${c.protocol_version} · auth:${c.authentication} · enc:${c.encryption} · registry:${c.semantic_registry_version} · constitution:${c.constitution_compatible ? 'compatible' : 'foreign'}`;
}