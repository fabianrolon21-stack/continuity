// ═══════════════════════════════════════════════
// BISON PRESENCE CONTROLLER (Phase 31 — Living World)
// Decides what Bison is doing based on world state and
// time. He simply lives — walking, reading, sleeping,
// watering plants, watching the rain...
// ═══════════════════════════════════════════════

import { TIME_PERIODS, WEATHER_TYPES } from './worldStateEngine';

export const BISON_ACTIVITIES = {
  SLEEPING:        { label: 'Sleeping',          icon: '💤', location: 'bed',     energyCost: -3, mood: 'calm' },
  STRETCHING:      { label: 'Stretching',        icon: '🤸', location: 'center',  energyCost: 2,  mood: 'energetic' },
  DRINKING_COFFEE: { label: 'Drinking Coffee',   icon: '☕', location: 'desk',    energyCost: -1, mood: 'content' },
  READING:         { label: 'Reading',            icon: '📖', location: 'bookshelf', energyCost: 1, mood: 'thoughtful' },
  WRITING:         { label: 'Writing',            icon: '✍️', location: 'desk',    energyCost: 2,  mood: 'focused' },
  WALKING:         { label: 'Walking',            icon: '🚶', location: 'garden',  energyCost: 2,  mood: 'calm' },
  WATERING_PLANTS: { label: 'Watering Plants',    icon: '🌱', location: 'garden',  energyCost: 1,  mood: 'content' },
  LOOKING_OUT_WINDOW: { label: 'Looking Out Window', icon: '🪟', location: 'window', energyCost: 0, mood: 'contemplative' },
  WATCHING_RAIN:   { label: 'Watching the Rain',  icon: '🌧️', location: 'window',  energyCost: 0,  mood: 'calm' },
  WATCHING_SNOW:   { label: 'Watching the Snow',  icon: '❄️', location: 'window',  energyCost: 0,  mood: 'peaceful' },
  OBSERVING_BIRDS: { label: 'Watching Birds',    icon: '🐦', location: 'window',  energyCost: 0,  mood: 'content' },
  WATCHING_BUTTERFLIES: { label: 'Watching Butterflies', icon: '🦋', location: 'garden', energyCost: 1, mood: 'delighted' },
  THINKING:        { label: 'Thinking',           icon: '🤔', location: 'tree',    energyCost: 1,  mood: 'contemplative' },
  RESTING:         { label: 'Resting',             icon: '😌', location: 'tree',    energyCost: -2, mood: 'calm' },
  CELEBRATING:     { label: 'Celebrating',         icon: '🎉', location: 'center',  energyCost: 3,  mood: 'joyful' },
  WAVING:          { label: 'Waving',               icon: '👋', location: 'center',  energyCost: 1,  mood: 'friendly' },
};

// ── Decide Bison's activity from world state ──
export function decideBisonActivity(worldState, context = {}) {
  const { time, weather, isLateNight, holiday } = worldState;
  const hour = time.hour;

  // Late night (1-5 AM) — always sleeping
  if (time.period === TIME_PERIODS.LATE_NIGHT) {
    return BISON_ACTIVITIES.SLEEPING;
  }

  // Night (after 11 PM) — mostly sleeping
  if (time.period === TIME_PERIODS.NIGHT && hour >= 23) {
    return Math.random() < 0.8 ? BISON_ACTIVITIES.SLEEPING : BISON_ACTIVITIES.RESTING;
  }

  // Holiday celebration
  if (holiday && context.justAchieved) {
    return BISON_ACTIVITIES.CELEBRATING;
  }

  // Weather-driven activities
  if (weather.current === WEATHER_TYPES.RAIN || weather.current === WEATHER_TYPES.STORM) {
    return BISON_ACTIVITIES.WATCHING_RAIN;
  }
  if (weather.current === WEATHER_TYPES.SNOW) {
    return BISON_ACTIVITIES.WATCHING_SNOW;
  }
  if (weather.current === WEATHER_TYPES.FOG) {
    return BISON_ACTIVITIES.LOOKING_OUT_WINDOW;
  }

  // Time-driven activities
  switch (time.period) {
    case TIME_PERIODS.DAWN:
      return Math.random() < 0.6 ? BISON_ACTIVITIES.STRETCHING : BISON_ACTIVITIES.DRINKING_COFFEE;

    case TIME_PERIODS.MORNING:
      if (Math.random() < 0.4) return BISON_ACTIVITIES.DRINKING_COFFEE;
      if (Math.random() < 0.5) return BISON_ACTIVITIES.READING;
      return BISON_ACTIVITIES.WRITING;

    case TIME_PERIODS.AFTERNOON:
      if (weather.current === WEATHER_TYPES.SUNNY && Math.random() < 0.3) return BISON_ACTIVITIES.WATCHING_BUTTERFLIES;
      if (Math.random() < 0.35) return BISON_ACTIVITIES.WATERING_PLANTS;
      if (Math.random() < 0.3) return BISON_ACTIVITIES.WALKING;
      return BISON_ACTIVITIES.OBSERVING_BIRDS;

    case TIME_PERIODS.GOLDEN_HOUR:
      return Math.random() < 0.5 ? BISON_ACTIVITIES.LOOKING_OUT_WINDOW : BISON_ACTIVITIES.THINKING;

    case TIME_PERIODS.EVENING:
      return Math.random() < 0.5 ? BISON_ACTIVITIES.READING : BISON_ACTIVITIES.THINKING;

    case TIME_PERIODS.DUSK:
      return BISON_ACTIVITIES.RESTING;

    case TIME_PERIODS.NIGHT:
      return Math.random() < 0.6 ? BISON_ACTIVITIES.READING : BISON_ACTIVITIES.RESTING;

    default:
      return BISON_ACTIVITIES.RESTING;
  }
}

// ── Ambient companion lines ──
// Bison occasionally initiates harmless, optional activities.
// Never manipulative. Always gentle.
export function generateAmbientLine(worldState, context = {}) {
  const { time, weather, season, holiday } = worldState;
  const lines = [];

  // Weather observations
  if (weather.current === WEATHER_TYPES.RAIN) {
    lines.push("It's raining. Perfect time to stay in.");
    lines.push("I love the sound of rain on the window.");
  }
  if (weather.current === WEATHER_TYPES.SNOW) {
    lines.push("It's snowing. The garden looks different already.");
    lines.push("Snow makes everything quieter.");
  }
  if (weather.current === WEATHER_TYPES.STORM) {
    lines.push("Quite the storm out there.");
  }
  if (weather.current === WEATHER_TYPES.SUNNY) {
    lines.push("The light is beautiful today.");
  }

  // Time observations
  if (time.period === TIME_PERIODS.GOLDEN_HOUR) {
    lines.push("The sunset is beautiful today.");
    lines.push("Golden hour. My favorite light.");
  }
  if (time.period === TIME_PERIODS.DAWN) {
    lines.push("Good morning. The world is still waking up.");
  }
  if (time.period === TIME_PERIODS.LATE_NIGHT) {
    lines.push("It's late. We should both be resting.");
  }

  // Season observations
  if (season.current === 'spring') lines.push("The flowers are starting to bloom.");
  if (season.current === 'autumn') lines.push("The leaves are turning.");
  if (season.current === 'winter') lines.push("Everything is still under the snow.");

  // Holiday
  if (holiday) {
    lines.push(`Happy ${holiday.name}.`);
  }

  // Context — streaks, patterns
  if (context.streakDays >= 7) {
    lines.push(`You've kept your streak for ${context.streakDays} days. That's real.`);
  }
  if (context.usualStudyTime) {
    lines.push("It's your usual study time.");
  }
  if (context.goalCompleted) {
    lines.push("I noticed you finished something important.");
  }

  if (lines.length === 0) return null;
  return lines[Math.floor(Math.random() * lines.length)];
}

// ── Activity duration ──
export function getActivityDuration(activity) {
  if (activity === BISON_ACTIVITIES.SLEEPING) return 0; // until morning
  if (activity === BISON_ACTIVITIES.RESTING) return 120000; // 2 min
  if (activity === BISON_ACTIVITIES.READING) return 90000;
  return 60000; // 1 min default
}