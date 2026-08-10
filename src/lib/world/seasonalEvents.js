// ═══════════════════════════════════════════════
// SEASONAL EVENTS (Phase 8) — long-term rhythms.
// The world remembers the calendar: seasons turn,
// and a handful of gentle events arrive and pass.
// Nothing demands attention; the world simply changes.
// ═══════════════════════════════════════════════

export function currentSeason(date = new Date()) {
  const m = date.getMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

const EVENTS = [
  { id: 'first_light', label: 'First Light', note: 'The year turns over.', month: 0, days: [1, 3], tint: 'hsl(48 67% 74%)' },
  { id: 'thaw', label: 'The Thaw', note: 'Meltwater and new green.', month: 2, days: [18, 25], tint: 'hsl(120 40% 58%)' },
  { id: 'bloom', label: 'Bloom Days', note: 'Everything opens at once.', month: 4, days: [5, 14], tint: 'hsl(21 73% 69%)' },
  { id: 'long_sun', label: 'The Long Sun', note: 'The light stays late.', month: 5, days: [19, 24], tint: 'hsl(42 63% 55%)' },
  { id: 'harvest', label: 'Harvest', note: 'The air smells of dry grass.', month: 8, days: [20, 30], tint: 'hsl(30 60% 55%)' },
  { id: 'lantern_nights', label: 'Lantern Nights', note: 'Small lights against long dark.', month: 9, days: [25, 31], tint: 'hsl(265 41% 64%)' },
  { id: 'stillness', label: 'Stillness', note: 'The quietest week of the year.', month: 11, days: [20, 28], tint: 'hsl(199 56% 64%)' },
];

export function activeEvent(date = new Date()) {
  const m = date.getMonth();
  const d = date.getDate();
  return EVENTS.find(e => e.month === m && d >= e.days[0] && d <= e.days[1]) || null;
}

export function nextEvent(date = new Date()) {
  const m = date.getMonth();
  const d = date.getDate();
  return EVENTS.find(e => e.month > m || (e.month === m && e.days[0] > d)) || EVENTS[0];
}

export const SEASON_LABEL = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};