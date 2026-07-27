// ═══════════════════════════════════════════════
// KNOWLEDGE CONFLICT RESOLVER (Package 46.3)
// Detects contradictory memories and presents them
// as conflicts — never silently overwrites one with
// another. Resolution requires an explicit user choice,
// recorded through the verification state machine.
// ═══════════════════════════════════════════════

import { transitionMemoryState, VERIFICATION_STATES } from './memoryVerification';

const NEGATION_MARKERS = /\b(not|never|no longer|don'?t|doesn'?t|didn'?t|can'?t|won'?t|isn'?t|aren'?t|wasn'?t|stopped|quit)\b/i;

const ANTONYM_PAIRS = [
  ['love', 'hate'], ['like', 'dislike'], ['always', 'never'],
  ['trust', 'distrust'], ['happy', 'unhappy'], ['start', 'stop'],
  ['good', 'bad'], ['friend', 'enemy'], ['close', 'distant'],
  ['enjoy', 'avoid'], ['want', 'refuse'],
];

function normalize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(w => w.length > 2);
}

function contentOverlap(wordsA, wordsB) {
  const setB = new Set(wordsB);
  const shared = wordsA.filter(w => setB.has(w));
  return shared.length / Math.max(1, Math.min(wordsA.length, wordsB.length));
}

function findAntonymClash(textA, textB) {
  const a = textA.toLowerCase();
  const b = textB.toLowerCase();
  for (const [w1, w2] of ANTONYM_PAIRS) {
    if ((a.includes(w1) && b.includes(w2)) || (a.includes(w2) && b.includes(w1))) {
      return `"${w1}" vs "${w2}"`;
    }
  }
  return null;
}

// Detect potential contradictions among active (non-archived) memories.
// Returns [{ a, b, reason }] — presented as conflicts, never auto-resolved.
export function detectConflicts(memories) {
  const active = (memories || []).filter(
    m => m.verification_state !== VERIFICATION_STATES.ARCHIVED
      && m.verification_state !== VERIFICATION_STATES.CONTRADICTED
  );
  const conflicts = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const textA = active[i].corrected_text || active[i].text;
      const textB = active[j].corrected_text || active[j].text;
      const wordsA = normalize(textA);
      const wordsB = normalize(textB);
      if (wordsA.length < 3 || wordsB.length < 3) continue;
      const overlap = contentOverlap(wordsA, wordsB);
      if (overlap < 0.5) continue;

      const negA = NEGATION_MARKERS.test(textA);
      const negB = NEGATION_MARKERS.test(textB);
      const antonymClash = findAntonymClash(textA, textB);

      if (negA !== negB) {
        conflicts.push({ a: active[i], b: active[j], reason: 'One statement negates a claim the other asserts.' });
      } else if (antonymClash) {
        conflicts.push({ a: active[i], b: active[j], reason: `Opposing terms detected: ${antonymClash}.` });
      }
    }
  }
  return conflicts;
}

// Explicit resolution: the kept memory is user-confirmed, the other
// is marked CONTRADICTED with full history. Nothing is deleted.
export async function resolveConflict(keepMemory, contradictedMemory) {
  const kept = keepMemory.verification_state === VERIFICATION_STATES.USER_CONFIRMED
    ? keepMemory
    : await transitionMemoryState(keepMemory, VERIFICATION_STATES.USER_CONFIRMED, 'User chose this memory during conflict resolution.');
  const contradicted = await transitionMemoryState(
    contradictedMemory,
    VERIFICATION_STATES.CONTRADICTED,
    `Contradicted by memory ${keepMemory.id} during user conflict resolution.`
  );
  return { kept, contradicted };
}

export function buildConflictContextString(conflicts) {
  if (!conflicts || conflicts.length === 0) return null;
  const parts = ['[KNOWLEDGE CONFLICTS DETECTED]'];
  parts.push('The following memories appear contradictory. Do NOT pick one as true. Present the conflict to the user and ask which reflects their current reality.');
  for (const c of conflicts.slice(0, 3)) {
    parts.push(`  - "${(c.a.corrected_text || c.a.text).substring(0, 100)}"`);
    parts.push(`    vs "${(c.b.corrected_text || c.b.text).substring(0, 100)}"`);
    parts.push(`    Reason: ${c.reason}`);
  }
  parts.push('[/KNOWLEDGE CONFLICTS DETECTED]\n');
  return parts.join('\n');
}