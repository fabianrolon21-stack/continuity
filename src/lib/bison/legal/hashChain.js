// ═══════════════════════════════════════════════
// ALSRE — TAMPER-EVIDENT HASH CHAIN
// Real SHA-256 via Web Crypto. Each entry commits to the previous
// entry's hash, so removing, reordering, or editing any record breaks
// verification for every record after it.
//
// HONEST SCOPE: this is tamper-EVIDENT, not tamper-PROOF. Records live
// in this browser's localStorage, which the device owner can clear. A
// chain proves an intact record was not altered; it cannot resurrect a
// deleted one, and it is not a notarization or a legal signature.
// ═══════════════════════════════════════════════

const GENESIS = '0'.repeat(64);

export async function sha256(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const randomId = () => crypto.randomUUID().slice(0, 8);

/** Hash of an entry's content plus the previous link. */
export async function linkHash(entry, prevHash) {
  const { evidenceHash, prevHash: _p, ...content } = entry;
  return sha256({ content, prevHash: prevHash || GENESIS });
}

export async function appendTo(records, entry) {
  const prevHash = records.length ? records[records.length - 1].evidenceHash : GENESIS;
  const evidenceHash = await linkHash(entry, prevHash);
  return { ...entry, prevHash, evidenceHash };
}

/** Recompute the whole chain and report the first broken link. */
export async function verifyChain(records) {
  let prev = GENESIS;
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const expected = await linkHash(r, prev);
    if (r.prevHash !== prev) return { valid: false, brokenAt: i, reason: 'Chain link does not match the preceding record.' };
    if (r.evidenceHash !== expected) return { valid: false, brokenAt: i, reason: 'Record content does not match its recorded hash.' };
    prev = r.evidenceHash;
  }
  return { valid: true, length: records.length, headHash: prev };
}

export function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

export function writeStore(key, records) {
  try { localStorage.setItem(key, JSON.stringify(records)); } catch {}
}