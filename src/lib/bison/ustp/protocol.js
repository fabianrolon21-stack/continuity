// ═══════════════════════════════════════════════
// USTP — TRANSMISSION PIPELINE (Package 47 § 5)
//
//   request → ethics (P46) → sovereignty (P44) →
//   negotiation → semantic encoding → transmission →
//   verification → semantic reconstruction → response
//
// Every stage can refuse. Every outcome is written down.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { requestExternal } from '@/lib/bison/privacy/dataSovereigntyGuard';
import { ethicalReview } from './ethicsGate';
import { negotiate, summarizeContract, LOCAL_CAPABILITIES } from './negotiation';
import { encodeSemantic, decodeSemantic, serialize, deserialize } from './encoding';
import { sha256, sign, newTransmissionId, validateInbound, PROTOCOL_VERSION } from './trust';
import { stampProvenance, recordHop } from './provenance';

// Which Package 44 channel each communication mode travels through.
const MODE_CHANNEL = {
  human: 'tools',
  ai: 'external_ai',
  machine: 'custom_api',
  distributed_agent: 'custom_api',
  emergency_recovery: 'sync',
  knowledge_sync: 'sync',
  software_update: 'updates',
  developer_diagnostics: 'tools',
};

async function record(entry) {
  try { await base44.entities.UstpTransmission.create(entry); } catch (e) {}
}

/**
 * Transmit meaning to a peer through the full USTP pipeline.
 *
 * @param {object} req
 * @param {string} req.mode       one of the communication modes
 * @param {string} req.peer       human-readable peer name
 * @param {string} req.purpose    why this transmission exists
 * @param {string} req.text       the meaning being sent (surface form)
 * @param {object} req.peerCapabilities  the peer's declared capabilities (loopback default)
 * @param {string[]} req.consentCategories  Package 44 consent categories
 * @param {(wire: string) => Promise<string>} req.deliver  transport function; loopback echo by default
 */
export async function transmit(req) {
  const {
    mode = 'ai', peer = 'unknown', purpose = '', text = '',
    peerCapabilities = LOCAL_CAPABILITIES,
    consentCategories = ['current_question'],
    deliver = async (wire) => wire, // loopback transport
  } = req;

  const transmissionId = newTransmissionId();
  const base = { transmission_id: transmissionId, mode, peer, protocol_version: PROTOCOL_VERSION };
  const refuse = async (status, reason) => {
    await record({ ...base, status, block_reason: reason });
    return { ok: false, status, reason, transmissionId };
  };

  // 1 · Ethical approval (Package 46 / constitutional kernel)
  const ethics = await ethicalReview({ purpose, mode, payload: text });
  if (!ethics.approved) return refuse('BLOCKED_ETHICS', ethics.reason);

  // 2 · Capability negotiation — before any data moves
  const negotiation = negotiate(peerCapabilities);
  if (!negotiation.agreed) return refuse('NEGOTIATION_FAILED', negotiation.reason);

  // 3 · Semantic encoding + provenance + trust envelope
  const encoded = encodeSemantic(text, { intent: purpose });
  const integrityHash = await sha256(JSON.stringify(encoded.frames));
  const envelope = {
    transmission_id: transmissionId,
    protocol_version: PROTOCOL_VERSION,
    negotiated: negotiation.contract,
    ...encoded,
    integrity_hash: integrityHash,
    signature: await sign(JSON.stringify(encoded.frames), transmissionId),
    provenance: recordHop(
      stampProvenance({ consentRef: consentCategories.join(','), ethicalApprovalRef: ethics.approvalRef, transport: MODE_CHANNEL[mode] }),
      { peer, direction: 'outbound' },
    ),
  };

  // 4 · Sovereignty validation + transmission (Package 44 is the only door)
  const wire = serialize(envelope);
  const guarded = await requestExternal({
    channel: MODE_CHANNEL[mode] || 'custom_api',
    destination: peer,
    purpose: `USTP ${mode}: ${purpose}`,
    payload: wire,
    consentCategories,
    execute: (cleanWire) => deliver(cleanWire),
  });
  if (guarded.blocked) return refuse('BLOCKED_SOVEREIGNTY', guarded.reason);
  if (guarded.status === 'FAILED') return refuse('FAILED', guarded.reason || 'transport failure');

  // 5 · Verification + semantic reconstruction of the response
  const parsed = deserialize(typeof guarded.data === 'string' ? guarded.data : serialize(guarded.data));
  let reconstruction = null;
  let fidelity = null;
  if (parsed.ok && parsed.envelope?.frames) {
    const inbound = await validateInbound(parsed.envelope);
    if (!inbound.trusted && parsed.envelope.transmission_id !== transmissionId) {
      await record({ ...base, direction: 'inbound', status: 'QUARANTINED', block_reason: inbound.failures.join(', ') });
      return { ok: false, status: 'QUARANTINED', reason: inbound.failures.join(', '), transmissionId };
    }
    reconstruction = decodeSemantic(parsed.envelope);
    fidelity = reconstruction.fidelity;
  }

  await record({
    ...base,
    direction: peer === 'loopback' ? 'loopback' : 'outbound',
    transport: MODE_CHANNEL[mode],
    concept_ids: encoded.frames[0].concepts,
    payload_summary: text.slice(0, 140),
    payload_bytes: new Blob([wire]).size,
    integrity_hash: integrityHash,
    signature: envelope.signature,
    negotiation_summary: summarizeContract(negotiation),
    ethical_approval_ref: ethics.approvalRef,
    consent_ref: consentCategories.join(', '),
    provenance: JSON.stringify(envelope.provenance),
    status: 'COMPLETED',
    semantic_fidelity: fidelity ?? undefined,
  });

  return { ok: true, status: 'COMPLETED', transmissionId, envelope, reconstruction, fidelity };
}

// Receive an inbound wire payload — validate, quarantine if untrusted, reconstruct meaning.
export async function receive(wire, { peer = 'unknown' } = {}) {
  const parsed = deserialize(wire);
  if (!parsed.ok) {
    await record({ transmission_id: newTransmissionId(), direction: 'inbound', peer, status: 'FAILED', block_reason: parsed.error });
    return { ok: false, reason: parsed.error };
  }
  const inbound = await validateInbound(parsed.envelope);
  if (!inbound.trusted) {
    await record({ transmission_id: parsed.envelope.transmission_id || newTransmissionId(), direction: 'inbound', peer, status: 'QUARANTINED', block_reason: inbound.failures.join(', ') });
    return { ok: false, quarantined: true, reason: inbound.failures.join(', ') };
  }
  const meaning = decodeSemantic(parsed.envelope);
  await record({
    transmission_id: parsed.envelope.transmission_id,
    direction: 'inbound', peer,
    protocol_version: parsed.envelope.protocol_version,
    concept_ids: parsed.envelope.frames?.[0]?.concepts || [],
    payload_summary: meaning.text.slice(0, 140),
    integrity_hash: parsed.envelope.integrity_hash,
    status: 'COMPLETED',
    semantic_fidelity: meaning.fidelity,
  });
  return { ok: true, meaning };
}