// ═══════════════════════════════════════════════
// USTP — SEMANTIC ENCODING LAYER (Package 47, Layer 2)
// Maps meaning into transferable frames and back.
// Loss of meaning is measured, not ignored: every
// round-trip reports semantic fidelity.
// ═══════════════════════════════════════════════

import { extractConcepts, getConcept, REGISTRY_VERSION } from './conceptRegistry';

// Encode a message into a semantic frame set:
// the concepts it carries, epistemic status, and the surface text.
export function encodeSemantic(text, { epistemic = 'ustp:epistemic.observed', intent = '' } = {}) {
  const conceptIds = extractConcepts(text);
  return {
    registry_version: REGISTRY_VERSION,
    frames: [
      {
        surface: String(text),
        concepts: conceptIds,
        epistemic,
        intent,
      },
    ],
  };
}

// Reconstruct meaning on the receiving side.
export function decodeSemantic(encoded) {
  if (!encoded?.frames?.length) return { text: '', concepts: [], fidelity: 0 };
  const frame = encoded.frames[0];
  const resolved = (frame.concepts || []).map(getConcept).filter(Boolean);
  const fidelity = frame.concepts?.length
    ? resolved.length / frame.concepts.length
    : 1; // no concepts claimed → nothing to lose
  return {
    text: frame.surface,
    concepts: resolved,
    epistemic: frame.epistemic,
    intent: frame.intent,
    fidelity,
  };
}

// Serialize for transport — format-agnostic JSON is the v1 wire form.
export function serialize(envelope) {
  return JSON.stringify(envelope);
}

export function deserialize(wire) {
  try {
    return { ok: true, envelope: JSON.parse(wire) };
  } catch (e) {
    return { ok: false, error: 'Malformed wire payload — semantic reconstruction impossible.' };
  }
}