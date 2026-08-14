// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — BEHAVIOR REGISTRY (§4, §9, §13, §20)
// Every behavior declares its own weight, duration, conditions,
// cooldown, priority, and — critically — a return path back into
// normal life, so nothing can play once and get stuck.
// Ids match the existing BEHAVIORS so all current animation work
// keeps rendering unchanged.
// ═══════════════════════════════════════════════

import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';

export const PRIORITY = {
  EMERGENCY: 100,
  EMOTIONAL_EVENT: 90,
  USER_INTERACTION: 80,
  CONSUMING: 70,
  PLAYING: 60,
  MOVEMENT: 50,
  CURIOSITY: 40,
  IDLE: 30,
  MICRO: 20,
  BREATHING: 10,
};

// §5 — configurable base weights. Roughly the distribution in the directive.
const B = BEHAVIORS;
export const BEHAVIOR_DEFS = {
  [B.LOOK_AROUND]: { weight: 18, min: 4000, max: 9000, cooldown: 12000, priority: PRIORITY.IDLE, trait: 'curiosity', returnState: B.IDLE },
  [B.WALK]: { weight: 15, min: 9000, max: 16000, cooldown: 25000, priority: PRIORITY.MOVEMENT, trait: 'independence', conditions: { minEnergy: 30 }, returnState: B.IDLE },
  [B.STRETCH]: { weight: 12, min: 3000, max: 5000, cooldown: 40000, priority: PRIORITY.IDLE, returnState: B.IDLE },
  [B.SIT]: { weight: 10, min: 8000, max: 18000, cooldown: 30000, priority: PRIORITY.IDLE, returnState: B.IDLE },
  [B.THINK]: { weight: 8, min: 7000, max: 14000, cooldown: 50000, priority: PRIORITY.IDLE, trait: 'curiosity', returnState: B.IDLE },
  [B.PLAY_ALONE]: { weight: 8, min: 6000, max: 12000, cooldown: 45000, priority: PRIORITY.PLAYING, trait: 'playfulness', conditions: { minEnergy: 45 }, returnState: B.IDLE },
  [B.SLEEP]: { weight: 5, min: 20000, max: 45000, cooldown: 60000, priority: PRIORITY.IDLE, conditions: { maxEnergy: 35 }, returnState: B.STRETCH },
  [B.EAT]: { weight: 4, min: 5000, max: 8000, cooldown: 60000, priority: PRIORITY.CONSUMING, conditions: { minHunger: 45 }, returnState: B.IDLE },
  [B.DRINK]: { weight: 4, min: 4000, max: 7000, cooldown: 60000, priority: PRIORITY.CONSUMING, conditions: { minThirst: 45 }, returnState: B.IDLE },
  [B.LOOK_AT_USER]: { weight: 6, min: 3000, max: 6000, cooldown: 35000, priority: PRIORITY.CURIOSITY, trait: 'sociability', conditions: { requiresScreen: true }, returnState: B.IDLE },
  [B.FOLLOW_INSECT]: { weight: 5, min: 8000, max: 14000, cooldown: 55000, priority: PRIORITY.CURIOSITY, trait: 'curiosity', conditions: { minEnergy: 40, clearWeather: true }, returnState: B.IDLE },
  [B.WATCH_WINDOW]: { weight: 6, min: 7000, max: 15000, cooldown: 40000, priority: PRIORITY.CURIOSITY, returnState: B.IDLE },
  [B.WATCH_BIRDS]: { weight: 4, min: 6000, max: 11000, cooldown: 50000, priority: PRIORITY.CURIOSITY, conditions: { clearWeather: true, daytime: true }, returnState: B.IDLE },
  [B.INSPECT_TOY]: { weight: 4, min: 6000, max: 11000, cooldown: 60000, priority: PRIORITY.CURIOSITY, trait: 'curiosity', returnState: B.IDLE },
  [B.YAWN]: { weight: 4, min: 2500, max: 4000, cooldown: 45000, priority: PRIORITY.IDLE, conditions: { maxEnergy: 60 }, returnState: B.IDLE },
  [B.SCRATCH]: { weight: 4, min: 2500, max: 4500, cooldown: 60000, priority: PRIORITY.IDLE, returnState: B.IDLE },
  [B.DOZE]: { weight: 4, min: 10000, max: 20000, cooldown: 45000, priority: PRIORITY.IDLE, conditions: { maxEnergy: 50 }, returnState: B.IDLE },
  [B.IDLE]: { weight: 6, min: 5000, max: 10000, cooldown: 8000, priority: PRIORITY.IDLE, returnState: B.IDLE },
  // Rare and silly — the "what the hell is he doing?" moments.
  [B.DANCE]: { weight: 2, min: 5000, max: 9000, cooldown: 90000, priority: PRIORITY.PLAYING, trait: 'silliness', conditions: { minEnergy: 50 }, returnState: B.IDLE },
  [B.PLAY]: { weight: 3, min: 6000, max: 11000, cooldown: 70000, priority: PRIORITY.PLAYING, trait: 'playfulness', conditions: { minEnergy: 50 }, returnState: B.IDLE },
};

// §7 — micro-behaviors. Tiny signs of life, layered under everything.
export const MICRO_BEHAVIORS = ['blink', 'look_left', 'look_right', 'ear_flick', 'weight_shift', 'glance_at_user'];

export const getDef = (id) => BEHAVIOR_DEFS[id];

// §13 — daily rhythm shaping.
export function timeOfDay(hour = new Date().getHours()) {
  if (hour < 6) return 'NIGHT';
  if (hour < 12) return 'MORNING';
  if (hour < 18) return 'AFTERNOON';
  if (hour < 22) return 'EVENING';
  return 'NIGHT';
}

export const RHYTHM = {
  MORNING: { [B.STRETCH]: 2.2, [B.YAWN]: 1.6, [B.LOOK_AROUND]: 1.4, [B.EAT]: 1.8, [B.WALK]: 1.3, [B.SLEEP]: 0.2, [B.DOZE]: 0.3 },
  AFTERNOON: { [B.WALK]: 1.5, [B.PLAY_ALONE]: 1.6, [B.FOLLOW_INSECT]: 1.5, [B.INSPECT_TOY]: 1.4, [B.SLEEP]: 0.2 },
  EVENING: { [B.SIT]: 1.7, [B.THINK]: 1.6, [B.WATCH_WINDOW]: 1.4, [B.WALK]: 0.7, [B.PLAY_ALONE]: 0.6, [B.DOZE]: 1.3 },
  NIGHT: { [B.SLEEP]: 3.5, [B.DOZE]: 2.2, [B.YAWN]: 2, [B.SIT]: 1.3, [B.PLAY_ALONE]: 0.15, [B.WALK]: 0.3, [B.WATCH_BIRDS]: 0, [B.DANCE]: 0.1 },
};