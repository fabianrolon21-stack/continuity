// ═══════════════════════════════════════════════
// BISON BEHAVIOR ENGINE (Package 50)
// Weighted-random idle behaviors driven by energy,
// time of day, and weather. Prevents repetitive loops
// by never repeating the previous behavior.
// ═══════════════════════════════════════════════

export const BEHAVIORS = {
  IDLE: 'idle',
  LOOK_AROUND: 'look_around',
  STRETCH: 'stretch',
  WALK: 'walk',
  PLAY: 'play',
  WATCH_WINDOW: 'watch_window',
  EAT: 'eat',
  DRINK: 'drink',
  SLEEP: 'sleep',
  SIT: 'sit',
  LOOK_AT_USER: 'look_at_user',
};

export const BEHAVIOR_NOTES = {
  idle: 'resting quietly',
  look_around: 'looking around',
  stretch: 'stretching',
  walk: 'wandering the room',
  play: 'playing with the toy',
  watch_window: 'watching the window',
  eat: 'having a snack',
  drink: 'drinking water',
  sleep: 'fast asleep',
  sit: 'sitting peacefully',
  look_at_user: 'looking at you',
};

function pickWeighted(weights, exclude) {
  const entries = Object.entries(weights).filter(([k, w]) => w > 0 && k !== exclude);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0]?.[0] || BEHAVIORS.IDLE;
}

export function chooseBehavior({ energy = 80, isNight = false, isLateNight = false, weather = 'clear', prev = null } = {}) {
  // Critical energy or deep night → natural sleep
  if (energy < 15 || isLateNight) {
    return { behavior: BEHAVIORS.SLEEP, durationMs: 20000 };
  }

  const weights = {
    [BEHAVIORS.IDLE]: 3,
    [BEHAVIORS.LOOK_AROUND]: 3,
    [BEHAVIORS.STRETCH]: 2,
    [BEHAVIORS.WALK]: 2,
    [BEHAVIORS.PLAY]: 1,
    [BEHAVIORS.WATCH_WINDOW]: 2,
    [BEHAVIORS.EAT]: 1,
    [BEHAVIORS.DRINK]: 1,
    [BEHAVIORS.SLEEP]: 0,
    [BEHAVIORS.SIT]: 2,
    [BEHAVIORS.LOOK_AT_USER]: 2,
  };

  // Energy shaping
  if (energy >= 70) {
    weights[BEHAVIORS.WALK] += 3;
    weights[BEHAVIORS.PLAY] += 3;
    weights[BEHAVIORS.STRETCH] += 1;
  } else if (energy < 40) {
    weights[BEHAVIORS.WALK] = 1;
    weights[BEHAVIORS.PLAY] = 0;
    weights[BEHAVIORS.SIT] += 3;
    weights[BEHAVIORS.SLEEP] = 2;
    weights[BEHAVIORS.IDLE] += 2;
  }

  // Weather shaping — Bison watches rain, snow, and storms
  if (['rain', 'storm', 'snow'].includes(weather)) {
    weights[BEHAVIORS.WATCH_WINDOW] += 4;
  }

  // Night shaping
  if (isNight) {
    weights[BEHAVIORS.SLEEP] += 4;
    weights[BEHAVIORS.PLAY] = 0;
    weights[BEHAVIORS.WATCH_WINDOW] += 1;
  }

  const behavior = pickWeighted(weights, prev);
  const durationMs = 8000 + Math.random() * 8000;
  return { behavior, durationMs };
}