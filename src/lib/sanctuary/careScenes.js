// ═══════════════════════════════════════════════
// CARE SCENES (Living World Update)
// Scripted, randomized reaction sequences for
// feed / water / rest / play. Different foods and
// toys appear each time — the Bison never reacts
// the same way twice, and sometimes ignores things.
// ═══════════════════════════════════════════════

const SCENES = {
  feed: [
    [
      { motion: 'look_around', emote: '❓', ms: 1600 },
      { motion: 'walk', ms: 2200 },
      { motion: 'sniff', emote: '🤔', ms: 2200 },
      { motion: 'eat', emote: '😊', ms: 3200 },
      { motion: 'celebrate', emote: '✨', ms: 2000 },
    ],
    [
      { motion: 'sniff', emote: '😲', ms: 1800 },
      { motion: 'eat', emote: '❤️', ms: 3400 },
      { motion: 'sit', emote: '😊', ms: 2200 },
    ],
    [
      { motion: 'sniff', emote: '🤔', ms: 2000 },
      { motion: 'idle', emote: '💢', ms: 1800 },
      { motion: 'sniff', emote: '💧', ms: 1800 },
      { motion: 'eat', emote: '😅', ms: 3200 },
    ],
    [
      // Ignores it at first, wanders off, comes back
      { motion: 'sniff', emote: '❓', ms: 1600 },
      { motion: 'walk', emote: '💧', ms: 2400 },
      { motion: 'look_around', emote: '🤔', ms: 1800 },
      { motion: 'eat', emote: '😅', ms: 3000 },
    ],
    [
      { motion: 'walk', emote: '✨', ms: 2000 },
      { motion: 'play', emote: '😊', ms: 2400 },
      { motion: 'eat', emote: '❤️', ms: 3200 },
    ],
  ],
  water: [
    [
      { motion: 'look_around', emote: '❓', ms: 1500 },
      { motion: 'walk', ms: 2000 },
      { motion: 'drink', emote: '💧', ms: 3200 },
      { motion: 'celebrate', emote: '✨', ms: 1800 },
    ],
    [
      { motion: 'sniff', emote: '🤔', ms: 1800 },
      { motion: 'drink', emote: '😊', ms: 3400 },
      { motion: 'sit', emote: '❤️', ms: 2200 },
    ],
    [
      { motion: 'drink', emote: '💧', ms: 2800 },
      { motion: 'stretch', emote: '😲', ms: 2000 },
      { motion: 'drink', emote: '😅', ms: 2600 },
    ],
  ],
  rest: [
    [
      { motion: 'stretch', emote: '😴', ms: 2400 },
      { motion: 'sit', emote: '💤', ms: 2600 },
      { motion: 'sleep', emote: '💤', ms: 5000 },
    ],
    [
      { motion: 'look_at_user', emote: '❤️', ms: 1800 },
      { motion: 'sit', emote: '😴', ms: 2400 },
      { motion: 'sleep', emote: '💤', ms: 5000 },
    ],
  ],
  play: [
    [
      { motion: 'look_around', emote: '😲', ms: 1400 },
      { motion: 'play', emote: '✨', ms: 3200 },
      { motion: 'celebrate', emote: '😊', ms: 2200 },
      { motion: 'sit', emote: '😅', ms: 2000 },
    ],
    [
      { motion: 'sniff', emote: '❓', ms: 1800 },
      { motion: 'idle', emote: '🤔', ms: 1600 },
      { motion: 'play', emote: '❤️', ms: 3400 },
      { motion: 'celebrate', emote: '✨', ms: 2200 },
    ],
    [
      // Confused, kicks it, walks away, comes back
      { motion: 'sniff', emote: '❓', ms: 1800 },
      { motion: 'play', emote: '💢', ms: 2000 },
      { motion: 'walk', emote: '😅', ms: 2200 },
      { motion: 'play', emote: '😊', ms: 3000 },
    ],
    [
      { motion: 'play', emote: '💢', ms: 2200 },
      { motion: 'walk', emote: '😅', ms: 2000 },
      { motion: 'play', emote: '😊', ms: 3000 },
    ],
  ],
};

// Prop variety — a random one appears each time
const FOODS = ['apple', 'watermelon', 'carrot', 'berries'];
const TOYS = ['ball', 'stick', 'frisbee', 'butterfly', 'log'];

export const PROP_EMOJI = {
  apple: '🍎',
  watermelon: '🍉',
  carrot: '🥕',
  berries: '🫐',
  bucket: '🪣',
  ball: '⚽',
  stick: '🪵',
  frisbee: '🥏',
  butterfly: '🦋',
  log: '🪵',
};

// Full-screen burst particles per action
export const BURST_EMOJIS = {
  feed: ['🍃', '🍎', '✨', '🌿'],
  water: ['💧', '✨', '💦', '🫧'],
  rest: ['⭐', '🌙', '💤', '☁️'],
  play: ['❤️', '✨', '🎉', '🌸'],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickCareScene(action) {
  const variants = SCENES[action] || SCENES.feed;
  let prop = null;
  if (action === 'feed') prop = pick(FOODS);
  else if (action === 'water') prop = 'bucket';
  else if (action === 'play') prop = pick(TOYS);
  return { prop, steps: pick(variants) };
}