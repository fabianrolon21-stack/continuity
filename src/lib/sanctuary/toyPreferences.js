// ═══════════════════════════════════════════════
// TOY & FOOD PREFERENCES (Phase 5 + 7 — personality drift)
// The companion slowly forms favourites from lived experience:
// repeated items become loved, over-used ones lose novelty.
// Stored on the user's companion_state — never inferred silently
// beyond what the user actually did.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const MAX_AFFINITY = 10;

export function affinityFor(prefs, itemId) {
  return prefs?.[itemId]?.affinity ?? 0;
}

// 'loved' | 'liked' | 'neutral' | 'bored'
export function reactionFor(prefs, itemId) {
  const entry = prefs?.[itemId];
  if (!entry) return 'neutral';
  if (entry.recent >= 4) return 'bored';
  if (entry.affinity >= 6) return 'loved';
  if (entry.affinity >= 3) return 'liked';
  return 'neutral';
}

export function favouriteOf(prefs, itemIds = []) {
  let best = null;
  for (const id of itemIds) {
    const a = affinityFor(prefs, id);
    if (a >= 3 && (!best || a > affinityFor(prefs, best))) best = id;
  }
  return best;
}

export async function loadPreferences() {
  try {
    const user = await base44.auth.me();
    return user?.companion_state?.preferences || {};
  } catch (e) {
    return {};
  }
}

// Records a use and drifts affinity. Returns the updated preference map.
export async function recordUse(itemId) {
  if (!itemId) return {};
  try {
    const user = await base44.auth.me();
    const state = user?.companion_state || {};
    const prefs = { ...(state.preferences || {}) };

    const entry = prefs[itemId] || { affinity: 0, uses: 0, recent: 0 };
    entry.uses += 1;
    entry.recent += 1;
    // Novelty wears off if the same item is used again and again
    entry.affinity = Math.min(MAX_AFFINITY, entry.affinity + (entry.recent > 3 ? 0 : 1));
    prefs[itemId] = entry;

    // Everything else recovers its novelty a little
    for (const key of Object.keys(prefs)) {
      if (key === itemId) continue;
      prefs[key] = { ...prefs[key], recent: Math.max(0, (prefs[key].recent || 0) - 1) };
    }

    await base44.auth.updateMe({ companion_state: { ...state, preferences: prefs } });
    return prefs;
  } catch (e) {
    return {};
  }
}