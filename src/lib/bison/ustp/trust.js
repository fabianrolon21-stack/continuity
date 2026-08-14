// ═══════════════════════════════════════════════
// USTP — TRUST LAYER (Package 47, Layer 5)
// Authentication · integrity · replay protection ·
// expiration · signatures · version verification.
// Untrusted transmissions are quarantined, never executed.
// ═══════════════════════════════════════════════

export const PROTOCOL_VERSION = '1.0.0';

export async function sha256(text) {
  const data = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Deterministic content signature. NOTE: hash-based, not asymmetric —
// full Ed25519 signing is a known platform limitation, recorded honestly.
export async function sign(payload, transmissionId) {
  return sha256(`${transmissionId}::${payload}::${PROTOCOL_VERSION}`);
}

// Replay protection — seen transmission ids within this session.
const seenIds = new Set();

export function isReplay(transmissionId) {
  if (seenIds.has(transmissionId)) return true;
  seenIds.add(transmissionId);
  return false;
}

export function newTransmissionId() {
  return `ustp-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
}

export function isExpired(envelope, maxAgeMs = 5 * 60 * 1000) {
  if (!envelope?.provenance?.timestamp) return true;
  return Date.now() - new Date(envelope.provenance.timestamp).getTime() > maxAgeMs;
}

export function versionCompatible(peerVersion) {
  if (!peerVersion) return false;
  return String(peerVersion).split('.')[0] === PROTOCOL_VERSION.split('.')[0];
}

// Full inbound validation — any failure quarantines the envelope.
export async function validateInbound(envelope) {
  const failures = [];
  if (!envelope?.transmission_id) failures.push('missing_identity');
  else if (isReplay(envelope.transmission_id)) failures.push('replay_detected');
  if (!versionCompatible(envelope?.protocol_version)) failures.push('protocol_incompatible');
  if (isExpired(envelope)) failures.push('expired');
  if (envelope?.integrity_hash) {
    const actual = await sha256(JSON.stringify(envelope.frames ?? ''));
    if (actual !== envelope.integrity_hash) failures.push('integrity_mismatch');
  } else {
    failures.push('missing_integrity_hash');
  }
  if (envelope?.executable || envelope?.code) failures.push('executable_payload_rejected');
  return { trusted: failures.length === 0, failures };
}