import { BISON_CHARACTER_CONFIG } from './BisonCharacterConfig';

const LIVE_BEHAVIORS = new Set(['idle', 'look_around', 'stretch', 'walk', 'play', 'watch_window', 'eat', 'drink', 'sleep', 'sit', 'look_at_user', 'yawn', 'scratch', 'watch_birds', 'follow_insect', 'inspect_toy', 'think', 'dance', 'doze', 'play_alone', 'sniff', 'celebrate', 'wag', 'refuse']);
const categoryFor = (animation) => Object.entries(BISON_CHARACTER_CONFIG)
  .find(([, values]) => Array.isArray(values) && values.includes(animation))?.[0];

export function resolveBisonAnimation(requested) {
  if (LIVE_BEHAVIORS.has(requested) || categoryFor(requested)) return requested;
  if (requested?.includes('sleep')) return 'sleep_idle';
  if (requested?.includes('walk') || requested === 'wander') return 'walk_01';
  if (requested?.includes('eat')) return 'eat';
  if (requested?.includes('drink')) return 'drink';
  if (requested?.includes('play')) return 'play_loop';
  return 'idle_neutral_01';
}