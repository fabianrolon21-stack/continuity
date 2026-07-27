// ═══════════════════════════════════════════════
// CARE SCENES (Living World Update)
// Scripted, randomized reaction sequences for
// feed / water / rest / play. The Bison never
// reacts the same way twice.
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
      { motion: 'play', emote: '💢', ms: 2200 },
      { motion: 'walk', emote: '😅', ms: 2000 },
      { motion: 'play', emote: '😊', ms: 3000 },
    ],
  ],
};

export const CARE_PROPS = { feed: 'apple', water: 'bucket', rest: null, play: 'ball' };

// Full-screen burst particles per action
export const BURST_EMOJIS = {
  feed: ['🍃', '🍎', '✨', '🌿'],
  water: ['💧', '✨', '💦', '🫧'],
  rest: ['⭐', '🌙', '💤', '☁️'],
  play: ['❤️', '✨', '🎉', '🌸'],
};

export function pickCareScene(action) {
  const variants = SCENES[action] || SCENES.feed;
  return {
    prop: CARE_PROPS[action] || null,
    steps: variants[Math.floor(Math.random() * variants.length)],
  };
}