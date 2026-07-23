// ═══════════════════════════════════════════════
// UNIFIED TEMPORAL CLOCK (Base 44.4)
// Every subsystem uses the same runtime clock.
// Tracks: time, timezone, date, week, month, season,
// weather timestamp, user active time, idle duration,
// last interaction.
// ═══════════════════════════════════════════════

const temporalState = {
  currentTime: null,
  timezone: null,
  date: null,
  dayOfWeek: null,
  dayName: null,
  week: null,
  month: null,
  monthName: null,
  year: null,
  season: null,
  isWeekend: false,
  isDaytime: true,
  weatherTimestamp: null,
  userActiveSince: null,
  idleDurationMs: 0,
  lastInteraction: null,
  uptime: 0,
  startedAt: null,
};

export function initClock(user) {
  temporalState.startedAt = Date.now();
  temporalState.userActiveSince = Date.now();
  temporalState.lastInteraction = Date.now();
  temporalState.timezone =
    user?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC';
  tick();
}

export function tick() {
  const now = new Date();
  temporalState.currentTime = now;
  temporalState.date = now.toISOString().split('T')[0];
  temporalState.dayOfWeek = now.getDay();
  temporalState.dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  temporalState.isWeekend = temporalState.dayOfWeek === 0 || temporalState.dayOfWeek === 6;
  temporalState.week = getISOWeek(now);
  temporalState.month = now.getMonth() + 1;
  temporalState.monthName = now.toLocaleDateString('en-US', { month: 'long' });
  temporalState.year = now.getFullYear();
  temporalState.season = getSeason(now);
  temporalState.isDaytime = now.getHours() >= 6 && now.getHours() < 19;
  temporalState.uptime = Date.now() - temporalState.startedAt;
  temporalState.idleDurationMs = Date.now() - temporalState.lastInteraction;
}

export function recordUserInteraction() {
  temporalState.lastInteraction = Date.now();
  temporalState.idleDurationMs = 0;
}

export function setWeatherTimestamp(ts) {
  temporalState.weatherTimestamp = ts;
}

export function getTemporalState() {
  return { ...temporalState };
}

export function getIdleDurationMs() {
  return Date.now() - temporalState.lastInteraction;
}

export function isUserIdle(thresholdMs = 300000) {
  return getIdleDurationMs() > thresholdMs;
}

export function getUptimeMs() {
  return temporalState.startedAt ? Date.now() - temporalState.startedAt : 0;
}

export function buildTemporalContextString() {
  const t = temporalState;
  if (!t.currentTime) return '';
  const idleMin = Math.floor(t.idleDurationMs / 60000);
  const uptimeMin = Math.floor(t.uptime / 60000);
  return `\nRUNTIME CLOCK:\n- Time: ${t.currentTime.toISOString()}\n- Local: ${t.dayName}, ${t.monthName} ${t.date}\n- Season: ${t.season} | Week: ${t.week} | Weekend: ${t.isWeekend}\n- Daytime: ${t.isDaytime} | Timezone: ${t.timezone}\n- Idle: ${idleMin}m | Uptime: ${uptimeMin}m\n`;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getSeason(date) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}