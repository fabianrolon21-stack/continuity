import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';

const B = BEHAVIORS;
const SEQUENCES = {
  play: [B.LOOK_AT_USER, B.WALK, B.PLAY, B.DANCE, B.SIT],
  feed: [B.LOOK_AROUND, B.WALK, B.EAT, B.LOOK_AT_USER],
  water: [B.LOOK_AROUND, B.WALK, B.DRINK, B.LOOK_AT_USER],
  pet: [B.LOOK_AT_USER, B.SIT, B.LOOK_AT_USER],
  talk: [B.LOOK_AT_USER, B.THINK],
  rest: [B.YAWN, B.STRETCH, B.SLEEP],
};

export function interactionSequence(action, fallback) {
  return SEQUENCES[action] || [fallback || B.IDLE];
}