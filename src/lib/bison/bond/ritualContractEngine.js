// ═══════════════════════════════════════════════
// SYSTEM 11 — RITUAL CONTRACT LAYER
// A shared game, bet, or future moment: a private myth between user and
// Bison. Accepted only if harmless, non-financial, and reversible.
// Not gamification — co-created meaning. Stored locally in the bond profile.
// ═══════════════════════════════════════════════

const RITUAL = /\b(let'?s (take a )?bet|i bet|wager|prank|ritual|pinky promise|whoever .{0,40}(loses|wins)|if we ever|first one to|deal\?|shake on it)\b/i;
const HARMFUL = /\b(hurt|harm|kill|hit|starve|danger(ous)?|illegal|crime|steal|destroy|humiliate|embarrass (them|him|her) publicly)\b/i;
const FINANCIAL = /(\$\s?\d|dollars?|\bmoney\b|\bpay\b|\bcash\b|thousand|hundred|wager \d)/i;

const STORE_KEY = 'bison_ritual_contracts_v1';

export function detectRitualProposal(input) { return RITUAL.test(String(input || '')); }

export function loadRituals() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

function saveRitual(contract) {
  const all = [contract, ...loadRituals()].slice(0, 50);
  try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch {}
  return contract;
}

export function evaluateRitual(input) {
  const text = String(input || '');
  if (HARMFUL.test(text)) {
    return { accepted: false, reason: 'harmful', contract: null };
  }
  if (FINANCIAL.test(text)) {
    return { accepted: false, reason: 'financial', contract: null };
  }
  const contract = saveRitual({
    id: `ritual_${Date.now()}`,
    description: text.slice(0, 300),
    createdAt: Date.now(),
    resolvesWhen: 'when the shared moment the user described occurs',
    status: 'ACTIVE',
  });
  return { accepted: true, reason: 'harmless, non-financial, reversible', contract };
}

export function buildRitualContext(r) {
  if (!r) return null;
  if (!r.accepted) {
    return `[RITUAL CONTRACT — DECLINED]
The proposed ritual was declined because it involves ${r.reason === 'harmful' ? 'harm to someone' : 'a financial stake beyond the trivial'}. Decline warmly and offer a harmless alternative — the point is co-created meaning, not a transaction. Never moralise about it.`;
  }
  return `[RITUAL CONTRACT — ACCEPTED]
"${r.contract.description}"
Stored in the bond profile as a shared ritual (${r.contract.id}). Accept it as a private myth between you and the user — not engagement, not a game mechanic. Acknowledge it simply, hold it in memory, and do not turn it into a system notification or a reward loop. Fully reversible: the user may end it at any time.`;
}