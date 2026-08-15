// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — PERSISTED BISON STATE (§2, §14, §15, §27, §28)
// State, personality, needs, and interaction memory.
// Persists state, never rendering details: no frame numbers,
// no animation ids — only what Bison *is*.
// ═══════════════════════════════════════════════

const KEY = 'bison_life_state';
export const STATE_VERSION = 1;

export const DEFAULT_PERSONALITY = {
  curiosity: 0.55,
  playfulness: 0.6,
  sociability: 0.5,
  energy: 0.55,
  affection: 0.6,
  independence: 0.45,
  silliness: 0.4,
};

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const clamp01 = (n) => Math.max(0.05, Math.min(0.95, n));

export function defaultState() {
  const now = Date.now();
  return {
    version: STATE_VERSION,
    personality: { ...DEFAULT_PERSONALITY },
    stats: { happiness: 72, energy: 80, hunger: 30, thirst: 28, affection: 60, loneliness: 20 },
    emotion: 'calm',
    currentEnvironment: 'meadow',
    lastSimulationTimestamp: now,
    interactionMemory: {
      lastFedAt: 0, lastPlayedAt: 0, lastPettedAt: 0, lastSpokenToAt: 0,
      favoriteActivities: [], recentActivities: [],
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return defaultState();
    const base = defaultState();
    return {
      ...base, ...parsed,
      personality: { ...base.personality, ...parsed.personality },
      stats: { ...base.stats, ...parsed.stats },
      emotion: parsed.emotion || base.emotion,
      interactionMemory: { ...base.interactionMemory, ...parsed.interactionMemory },
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

// ─── §12, §28 — elapsed-time simulation ───
// Two hours away is resolved by advancing state, not by rendering
// 7,200 seconds of animation.
export function advanceStats(state, elapsedMs, { isNight = false } = {}) {
  const hours = elapsedMs / 3600000;
  if (hours <= 0) return { stats: state.stats, digest: [] };

  const s = { ...state.stats };
  const digest = [];

  s.hunger = clamp(s.hunger + hours * 6);
  s.thirst = clamp(s.thirst + hours * 7);

  if (isNight || hours > 3) {
    // Bison sleeps through the quiet hours and wakes rested.
    s.energy = clamp(s.energy + hours * 9);
    if (hours > 1) digest.push(`slept for about ${Math.round(hours)}h and woke rested`);
  } else {
    s.energy = clamp(s.energy - hours * 5);
  }

  s.loneliness = clamp(s.loneliness + hours * 4);
  s.affection = clamp(s.affection - hours * 1.5);
  s.happiness = clamp(s.happiness - hours * 2 - (s.hunger > 75 ? hours * 2 : 0));

  if (s.hunger > 70) digest.push('got hungry');
  if (s.thirst > 70) digest.push('got thirsty');
  if (s.loneliness > 65) digest.push('started missing you');

  return { stats: s, digest };
}

// ─── §14 — personality evolves slightly with real interaction ───
export function nudgePersonality(personality, trait, amount = 0.01) {
  if (!(trait in personality)) return personality;
  return { ...personality, [trait]: clamp01(personality[trait] + amount) };
}

// ─── §15 — companion-state memory only. Never sensitive content. ───
export function rememberActivity(memory, activity) {
  const recent = [activity, ...memory.recentActivities].slice(0, 12);
  const counts = {};
  recent.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  const favorites = Object.entries(counts).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).map(([a]) => a).slice(0, 3);
  return { ...memory, recentActivities: recent, favoriteActivities: favorites };
}

export const applyStats = (stats, deltas) => {
  const next = { ...stats };
  for (const [k, v] of Object.entries(deltas)) next[k] = clamp((next[k] ?? 50) + v);
  return next;
};