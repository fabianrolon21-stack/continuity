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
  // Pet-like idles — the Bison is alive even when ignored
  YAWN: 'yawn',
  SCRATCH: 'scratch',
  WATCH_BIRDS: 'watch_birds',
  FOLLOW_INSECT: 'follow_insect',
  INSPECT_TOY: 'inspect_toy',
  THINK: 'think',
  DANCE: 'dance',
  DOZE: 'doze',
  PLAY_ALONE: 'play_alone',
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
  yawn: 'yawning',
  scratch: 'having a good scratch',
  watch_birds: 'watching the birds',
  follow_insect: 'following a little bug',
  inspect_toy: 'inspecting the toy',
  think: 'lost in thought',
  dance: 'swaying to the music',
  doze: 'dozing off',
  play_alone: 'playing by itself',
};

// No emoji reactions — emotion is expressed through the body
// (tail wag, ear flicks, blinking, stretching, sniffing).

function pickWeighted(weights, exclude = []) {
  const entries = Object.entries(weights).filter(([k, w]) => w > 0 && !exclude.includes(k));
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0]?.[0] || BEHAVIORS.IDLE;
}

export function chooseBehavior({ energy = 80, isNight = false, isLateNight = false, weather = 'clear', prev = null, recent = null, musicPlaying = false } = {}) {
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
    [BEHAVIORS.YAWN]: 2,
    [BEHAVIORS.SCRATCH]: 2,
    [BEHAVIORS.WATCH_BIRDS]: 2,
    [BEHAVIORS.FOLLOW_INSECT]: 2,
    [BEHAVIORS.INSPECT_TOY]: 2,
    [BEHAVIORS.THINK]: 2,
    [BEHAVIORS.DANCE]: 0,
    [BEHAVIORS.DOZE]: 1,
    [BEHAVIORS.PLAY_ALONE]: 2,
  };

  // Energy shaping
  if (energy >= 70) {
    weights[BEHAVIORS.WALK] += 3;
    weights[BEHAVIORS.PLAY] += 3;
    weights[BEHAVIORS.STRETCH] += 1;
    weights[BEHAVIORS.PLAY_ALONE] += 3;
    weights[BEHAVIORS.FOLLOW_INSECT] += 2;
    weights[BEHAVIORS.INSPECT_TOY] += 1;
    weights[BEHAVIORS.DOZE] = 0;
  } else if (energy < 40) {
    weights[BEHAVIORS.WALK] = 1;
    weights[BEHAVIORS.PLAY] = 0;
    weights[BEHAVIORS.SIT] += 3;
    weights[BEHAVIORS.SLEEP] = 2;
    weights[BEHAVIORS.IDLE] += 2;
    weights[BEHAVIORS.YAWN] += 3;
    weights[BEHAVIORS.DOZE] += 4;
    weights[BEHAVIORS.PLAY_ALONE] = 0;
    weights[BEHAVIORS.FOLLOW_INSECT] = 0;
  }

  // Weather shaping — Bison watches rain, snow, and storms
  if (['rain', 'storm', 'snow'].includes(weather)) {
    weights[BEHAVIORS.WATCH_WINDOW] += 4;
    weights[BEHAVIORS.THINK] += 2;
    weights[BEHAVIORS.FOLLOW_INSECT] = 0;
  } else {
    // Clear skies bring birds and bugs
    weights[BEHAVIORS.WATCH_BIRDS] += 2;
  }

  // Music shaping — the Bison sways when a soundtrack is playing
  if (musicPlaying) {
    weights[BEHAVIORS.DANCE] = 5;
  }

  // Night shaping
  if (isNight) {
    weights[BEHAVIORS.SLEEP] += 4;
    weights[BEHAVIORS.PLAY] = 0;
    weights[BEHAVIORS.PLAY_ALONE] = 0;
    weights[BEHAVIORS.WATCH_WINDOW] += 1;
    weights[BEHAVIORS.WATCH_BIRDS] = 0;
    weights[BEHAVIORS.DOZE] += 2;
    weights[BEHAVIORS.YAWN] += 2;
  }

  // Never repeat the last two behaviors — idle life stays unpredictable
  const exclude = recent && recent.length > 0 ? recent.slice(-2) : (prev ? [prev] : []);
  const behavior = pickWeighted(weights, exclude);
  const durationMs = 7000 + Math.random() * 10000;
  return { behavior, durationMs };
}