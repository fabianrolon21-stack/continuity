// ═══════════════════════════════════════════════
// CARE SCENES (Living World Polish — Package 17)
// Scripted reaction sequences built on the animation
// arc: anticipation → action → reaction → recovery.
// No emoji reactions — emotion lives in the body.
// The Bison never reacts the same way twice, and
// sometimes hesitates or refuses at first.
// ═══════════════════════════════════════════════

const SCENES = {
  feed: [
    [
      { motion: 'look_around', ms: 1400 },   // anticipation — notices something
      { motion: 'walk', ms: 2200 },          // approach
      { motion: 'sniff', ms: 2000 },         // inspect
      { motion: 'eat', ms: 3200 },           // action
      { motion: 'wag', ms: 1800 },           // reaction — tail wag
      { motion: 'look_at_user', ms: 1600 },  // recovery — acknowledges you
    ],
    [
      { motion: 'sniff', ms: 1600 },
      { motion: 'eat', ms: 3400 },
      { motion: 'stretch', ms: 1800 },
      { motion: 'sit', ms: 2000 },
    ],
    [
      // Hesitates, walks away, curiosity wins
      { motion: 'sniff', ms: 1600 },
      { motion: 'refuse', ms: 1600 },
      { motion: 'walk', ms: 2200 },
      { motion: 'look_around', ms: 1400 },
      { motion: 'sniff', ms: 1400 },
      { motion: 'eat', ms: 3000 },
      { motion: 'wag', ms: 1600 },
    ],
    [
      { motion: 'walk', ms: 1800 },
      { motion: 'sniff', ms: 1800 },
      { motion: 'eat', ms: 3200 },
      { motion: 'celebrate', ms: 1600 },
      { motion: 'look_at_user', ms: 1600 },
    ],
  ],
  water: [
    [
      { motion: 'look_around', ms: 1400 },
      { motion: 'walk', ms: 2000 },
      { motion: 'drink', ms: 3200 },
      { motion: 'wag', ms: 1600 },
      { motion: 'look_at_user', ms: 1400 },
    ],
    [
      { motion: 'sniff', ms: 1600 },
      { motion: 'drink', ms: 3400 },
      { motion: 'stretch', ms: 1800 },
      { motion: 'sit', ms: 1800 },
    ],
    [
      { motion: 'drink', ms: 2600 },
      { motion: 'look_around', ms: 1600 },
      { motion: 'drink', ms: 2400 },
      { motion: 'wag', ms: 1600 },
    ],
  ],
  rest: [
    [
      { motion: 'yawn', ms: 2200 },
      { motion: 'stretch', ms: 2200 },
      { motion: 'sit', ms: 2400 },
      { motion: 'sleep', ms: 5000 },
    ],
    [
      { motion: 'look_at_user', ms: 1800 },
      { motion: 'walk', ms: 1800 },
      { motion: 'sit', ms: 2200 },
      { motion: 'doze', ms: 2400 },
      { motion: 'sleep', ms: 5000 },
    ],
  ],
  play: [
    [
      { motion: 'look_around', ms: 1200 },
      { motion: 'walk', ms: 1600 },
      { motion: 'sniff', ms: 1400 },
      { motion: 'play', ms: 3200 },
      { motion: 'celebrate', ms: 1800 },
      { motion: 'sit', ms: 1800 },
    ],
    [
      { motion: 'sniff', ms: 1600 },
      { motion: 'refuse', ms: 1400 },
      { motion: 'sniff', ms: 1400 },
      { motion: 'play', ms: 3400 },
      { motion: 'wag', ms: 1800 },
    ],
    [
      // Kicks it, wanders off, comes back for more
      { motion: 'play', ms: 2000 },
      { motion: 'walk', ms: 2000 },
      { motion: 'look_around', ms: 1400 },
      { motion: 'play', ms: 2800 },
      { motion: 'celebrate', ms: 1600 },
      { motion: 'look_at_user', ms: 1400 },
    ],
  ],
};

// World props — the chosen item appears as an object in the scene
export const PROP_EMOJI = {
  apple: '🍎',
  watermelon: '🍉',
  carrot: '🥕',
  berries: '🫐',
  bucket: '🪣',
  ball: '⚽',
  stick: '🪵',
  frisbee: '🥏',
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickCareScene(action, prop = null) {
  const variants = SCENES[action] || SCENES.feed;
  let sceneProp = prop;
  if (!sceneProp) {
    if (action === 'feed') sceneProp = pick(Object.keys(PROP_EMOJI).slice(0, 4));
    else if (action === 'water') sceneProp = 'bucket';
    else if (action === 'play') sceneProp = pick(['ball', 'stick', 'frisbee']);
  }
  return { prop: sceneProp, steps: pick(variants) };
}