// ═══════════════════════════════════════════════
// HOLIDAY ENGINE (Phase 31 — Living World)
// Detects holidays, seasonal events, and user-specific
// celebrations to drive ambient decorations.
// ═══════════════════════════════════════════════

export const HOLIDAYS = {
  new_year:        { name: 'New Year',          decoration: 'fireworks',   accent: 'hsl(48 80% 65%)',   scope: 'global' },
  valentines:     { name: "Valentine's Day",   decoration: 'hearts',      accent: 'hsl(340 70% 65%)',  scope: 'global' },
  st_patricks:    { name: "St. Patrick's Day", decoration: 'clovers',     accent: 'hsl(140 60% 50%)',  scope: 'global' },
  easter:         { name: 'Easter',            decoration: 'eggs',        accent: 'hsl(280 50% 70%)',  scope: 'global' },
  fourth_july:    { name: 'Independence Day',  decoration: 'fireworks',   accent: 'hsl(0 70% 55%)',    scope: 'us' },
  halloween:      { name: 'Halloween',          decoration: 'pumpkins',    accent: 'hsl(25 85% 50%)',   scope: 'global' },
  thanksgiving:   { name: 'Thanksgiving',      decoration: 'leaves',       accent: 'hsl(30 70% 50%)',   scope: 'us' },
  christmas:      { name: 'Christmas',          decoration: 'lights',      accent: 'hsl(150 60% 50%)',  scope: 'global' },
  hanukkah:       { name: 'Hanukkah',           decoration: 'menorah',     accent: 'hsl(45 80% 60%)',   scope: 'global' },
  mothers_day:    { name: "Mother's Day",       decoration: 'flowers',      accent: 'hsl(330 60% 65%)',  scope: 'us' },
  fathers_day:    { name: "Father's Day",       decoration: 'flowers',      accent: 'hsl(210 60% 55%)',  scope: 'us' },
};

// Easter calculation (Computus — Meeus/Jones/Butcher algorithm)
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// US Mother's Day: 2nd Sunday of May
function calculateMothersDay(year) {
  const may1 = new Date(year, 4, 1);
  const dayOfWeek = may1.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 4, firstSunday + 7);
}

// US Father's Day: 3rd Sunday of June
function calculateFathersDay(year) {
  const jun1 = new Date(year, 5, 1);
  const dayOfWeek = jun1.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 5, firstSunday + 14);
}

function isSameDay(a, b) {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function detectHoliday(date = new Date(), userBirthday = null) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Fixed-date holidays
  if (month === 0 && day === 1) return { ...HOLIDAYS.new_year, key: 'new_year' };
  if (month === 1 && day === 14) return { ...HOLIDAYS.valentines, key: 'valentines' };
  if (month === 2 && day === 17) return { ...HOLIDAYS.st_patricks, key: 'st_patricks' };
  if (month === 6 && day === 4) return { ...HOLIDAYS.fourth_july, key: 'fourth_july' };
  if (month === 9 && day === 31) return { ...HOLIDAYS.halloween, key: 'halloween' };
  if (month === 10 && day >= 22 && day <= 28 && date.getDay() === 4)
    return { ...HOLIDAYS.thanksgiving, key: 'thanksgiving' };
  if (month === 11 && day === 25) return { ...HOLIDAYS.christmas, key: 'christmas' };
  if (month === 11 && day >= 12 && day <= 19) return { ...HOLIDAYS.hanukkah, key: 'hanukkah' };

  // Variable-date holidays
  const easter = calculateEaster(year);
  if (isSameDay(date, easter)) return { ...HOLIDAYS.easter, key: 'easter' };
  if (isSameDay(date, calculateMothersDay(year))) return { ...HOLIDAYS.mothers_day, key: 'mothers_day' };
  if (isSameDay(date, calculateFathersDay(year))) return { ...HOLIDAYS.fathers_day, key: 'fathers_day' };

  // User birthday
  if (userBirthday) {
    const [bm, bd] = userBirthday.split('-').map(Number);
    if (month === bm - 1 && day === bd) {
      return { name: 'Your Birthday', decoration: 'birthday', accent: 'hsl(48 80% 65%)', scope: 'user', key: 'birthday' };
    }
  }

  return null;
}

// Season-adjacent decorations (not holidays, but seasonal atmosphere)
export function getSeasonalDecoration(season) {
  switch (season) {
    case 'spring': return { decoration: 'blossoms', accent: 'hsl(330 50% 70%)' };
    case 'summer': return { decoration: 'fireflies', accent: 'hsl(60 70% 60%)' };
    case 'autumn': return { decoration: 'falling_leaves', accent: 'hsl(30 70% 50%)' };
    case 'winter': return { decoration: 'snowflakes', accent: 'hsl(200 30% 80%)' };
    default: return null;
  }
}