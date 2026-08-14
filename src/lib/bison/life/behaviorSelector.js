// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — WEIGHTED SELECTION (§5, §6)
// probability = base × personality × emotion × environment
//               × recent-history × time-of-day
// The anti-repetition penalty is what produces apparent
// personality without any language model in the loop.
// ═══════════════════════════════════════════════

import { BEHAVIOR_DEFS, RHYTHM, timeOfDay, getDef } from './behaviorRegistry';
import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';

function conditionsMet(def, ctx) {
  const c = def.conditions;
  if (!c) return true;
  const { stats, isNight, weather, isBisonVisible } = ctx;
  if (c.minEnergy !== undefined && stats.energy < c.minEnergy) return false;
  if (c.maxEnergy !== undefined && stats.energy > c.maxEnergy) return false;
  if (c.minHunger !== undefined && stats.hunger < c.minHunger) return false;
  if (c.minThirst !== undefined && stats.thirst < c.minThirst) return false;
  if (c.clearWeather && ['rain', 'storm', 'snow'].includes(weather)) return false;
  if (c.daytime && isNight) return false;
  if (c.requiresScreen && !isBisonVisible) return false;
  return true;
}

// §6 — recent history penalty / novelty bonus.
export function historyModifier(id, history, now = Date.now()) {
  const last = history.find(h => h.behaviorId === id);
  if (!last) return 1.25; // never seen recently — genuinely novel
  const age = now - last.timestamp;
  const index = history.findIndex(h => h.behaviorId === id);
  if (index === 0) return 0.1;  // just did this
  if (index === 1) return 0.4;
  if (age < 300000) return 1;   // seen within 5 minutes — normal
  if (age > 1200000) return 1.25; // unseen for 20 minutes — favored
  return 1;
}

function personalityModifier(def, personality) {
  if (!def.trait) return 1;
  // A trait at 0.5 is neutral; extremes swing the weight up to ±60%.
  return 0.7 + personality[def.trait] * 0.6 + (personality[def.trait] - 0.5) * 0.4;
}

function emotionModifier(id, stats) {
  const B = BEHAVIORS;
  let m = 1;
  if (stats.loneliness > 60 && [B.LOOK_AT_USER, B.WALK].includes(id)) m *= 1.8;
  if (stats.happiness > 75 && [B.PLAY_ALONE, B.DANCE, B.PLAY].includes(id)) m *= 1.5;
  if (stats.happiness < 35 && [B.SIT, B.THINK, B.DOZE].includes(id)) m *= 1.5;
  if (stats.energy < 30 && [B.SLEEP, B.DOZE, B.YAWN, B.SIT].includes(id)) m *= 2;
  if (stats.hunger > 70 && id === B.EAT) m *= 3;
  if (stats.thirst > 70 && id === B.DRINK) m *= 3;
  return m;
}

function environmentModifier(id, ctx) {
  const B = BEHAVIORS;
  let m = 1;
  if (['rain', 'storm', 'snow'].includes(ctx.weather) && [B.WATCH_WINDOW, B.THINK].includes(id)) m *= 2;
  if (ctx.musicPlaying && id === B.DANCE) m *= 6;
  if (!ctx.isBisonVisible && [B.LOOK_AT_USER].includes(id)) m *= 0.2;
  return m;
}

/**
 * Choose the next autonomous behavior.
 * @returns {{ behavior: string, durationMs: number, priority: number, weights: object }}
 */
export function selectBehavior(ctx) {
  const now = ctx.now || Date.now();
  const tod = timeOfDay();
  const rhythm = RHYTHM[tod] || {};
  const weights = {};

  for (const [id, def] of Object.entries(BEHAVIOR_DEFS)) {
    if (!conditionsMet(def, ctx)) continue;
    if ((ctx.cooldowns?.[id] || 0) > now) continue;
    const w = def.weight
      * personalityModifier(def, ctx.personality)
      * emotionModifier(id, ctx.stats)
      * environmentModifier(id, ctx)
      * historyModifier(id, ctx.history || [], now)
      * (rhythm[id] ?? 1);
    if (w > 0) weights[id] = w;
  }

  const entries = Object.entries(weights);
  if (!entries.length) {
    return { behavior: BEHAVIORS.IDLE, durationMs: 8000, priority: 30, weights };
  }

  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  let chosen = entries[0][0];
  for (const [id, w] of entries) { r -= w; if (r <= 0) { chosen = id; break; } }

  const def = getDef(chosen);
  return {
    behavior: chosen,
    durationMs: def.min + Math.random() * (def.max - def.min),
    priority: def.priority,
    weights,
  };
}

// Ranked view of the current decision space — used by the debug overlay.
export function rankedWeights(ctx, limit = 5) {
  const { weights } = selectBehavior({ ...ctx, dryRun: true });
  const total = Object.values(weights).reduce((s, w) => s + w, 0) || 1;
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([id, w]) => ({ id, pct: Math.round((w / total) * 100) }));
}