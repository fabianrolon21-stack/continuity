// ═══════════════════════════════════════════════
// TIME OF DAY SYSTEM (Package A — Background Engine)
// Detects current time period and maps to a visual config.
// Each period changes: gradient, glow, highlights, greeting, icon set.
// ═══════════════════════════════════════════════

export const TIME_PERIODS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
};

const PERIOD_CONFIGS = {
  [TIME_PERIODS.MORNING]: {
    period: TIME_PERIODS.MORNING,
    gradient: { from: 'hsl(268 16% 10%)', to: 'hsl(280 20% 8%)' },
    glowColor: 'hsl(42 70% 60%)',
    glowPosition: { x: '25%', y: '20%' },
    highlightColor: 'hsl(42 70% 60%)',
    greeting: 'Good morning',
    iconSet: ['sun', 'cloud', 'sparkle', 'leaf'],
    blur: '0px',
  },
  [TIME_PERIODS.AFTERNOON]: {
    period: TIME_PERIODS.AFTERNOON,
    gradient: { from: 'hsl(268 16% 10%)', to: 'hsl(260 18% 9%)' },
    glowColor: 'hsl(120 40% 58%)',
    glowPosition: { x: '50%', y: '15%' },
    highlightColor: 'hsl(120 40% 58%)',
    greeting: 'Good afternoon',
    iconSet: ['sun', 'cloud', 'leaf', 'sparkle'],
    blur: '0px',
  },
  [TIME_PERIODS.EVENING]: {
    period: TIME_PERIODS.EVENING,
    gradient: { from: 'hsl(268 16% 10%)', to: 'hsl(290 22% 8%)' },
    glowColor: 'hsl(21 73% 69%)',
    glowPosition: { x: '75%', y: '25%' },
    highlightColor: 'hsl(21 73% 69%)',
    greeting: 'Good evening',
    iconSet: ['moon', 'star', 'sparkle', 'cloud'],
    blur: '0px',
  },
  [TIME_PERIODS.NIGHT]: {
    period: TIME_PERIODS.NIGHT,
    gradient: { from: 'hsl(268 20% 8%)', to: 'hsl(250 24% 5%)' },
    glowColor: 'hsl(265 41% 64%)',
    glowPosition: { x: '80%', y: '18%' },
    highlightColor: 'hsl(265 41% 64%)',
    greeting: 'Good night',
    iconSet: ['star', 'moon', 'sparkle'],
    blur: '2px',
  },
};

export function getTimePeriod(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 11) return TIME_PERIODS.MORNING;
  if (hour >= 12 && hour <= 16) return TIME_PERIODS.AFTERNOON;
  if (hour >= 17 && hour <= 20) return TIME_PERIODS.EVENING;
  return TIME_PERIODS.NIGHT;
}

export function getTimeOfDayConfig(date = new Date()) {
  const period = getTimePeriod(date);
  return PERIOD_CONFIGS[period];
}

// Seeded pseudo-random for deterministic layouts
export function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}