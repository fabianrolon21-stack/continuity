// ═══════════════════════════════════════════════
// WORLD STATE ENGINE (Phase 31 — Living World)
// The brain of the living environment. Combines time,
// season, weather, holidays, and user state into a
// single unified world state that drives all visuals.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { detectHoliday, getSeasonalDecoration } from './holidayEngine';

export const TIME_PERIODS = {
  DAWN: 'dawn',           // 5-6
  MORNING: 'morning',     // 7-11
  AFTERNOON: 'afternoon', // 12-16
  GOLDEN_HOUR: 'golden_hour', // 17-18
  EVENING: 'evening',     // 19-20
  DUSK: 'dusk',           // 21
  NIGHT: 'night',         // 22-0
  LATE_NIGHT: 'late_night', // 1-4
};

export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
};

export const WEATHER_TYPES = {
  CLEAR: 'clear',
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  SNOW: 'snow',
  STORM: 'storm',
  FOG: 'fog',
  WIND: 'wind',
};

// ── Time period configs ──
const TIME_CONFIGS = {
  [TIME_PERIODS.DAWN]: {
    label: 'Dawn',
    sky: { top: 'hsl(250 30% 12%)', mid: 'hsl(280 35% 18%)', bottom: 'hsl(30 50% 25%)' },
    sunColor: 'hsl(25 80% 60%)',
    sunPosition: { x: '15%', y: '75%' },
    lightLevel: 0.3,
    isNight: false,
    particleType: 'dew',
    ambience: 'morning_birds',
  },
  [TIME_PERIODS.MORNING]: {
    label: 'Morning',
    sky: { top: 'hsl(210 40% 25%)', mid: 'hsl(200 45% 35%)', bottom: 'hsl(40 60% 50%)' },
    sunColor: 'hsl(45 85% 60%)',
    sunPosition: { x: '30%', y: '25%' },
    lightLevel: 0.6,
    isNight: false,
    particleType: 'dust',
    ambience: 'morning_piano',
  },
  [TIME_PERIODS.AFTERNOON]: {
    label: 'Afternoon',
    sky: { top: 'hsl(205 50% 35%)', mid: 'hsl(200 50% 45%)', bottom: 'hsl(190 40% 55%)' },
    sunColor: 'hsl(50 90% 65%)',
    sunPosition: { x: '50%', y: '15%' },
    lightLevel: 0.8,
    isNight: false,
    particleType: 'butterflies',
    ambience: 'afternoon_active',
  },
  [TIME_PERIODS.GOLDEN_HOUR]: {
    label: 'Golden Hour',
    sky: { top: 'hsl(15 55% 35%)', mid: 'hsl(25 70% 45%)', bottom: 'hsl(35 80% 50%)' },
    sunColor: 'hsl(30 90% 55%)',
    sunPosition: { x: '70%', y: '60%' },
    lightLevel: 0.5,
    isNight: false,
    particleType: 'golden_dust',
    ambience: 'golden_hour',
  },
  [TIME_PERIODS.EVENING]: {
    label: 'Evening',
    sky: { top: 'hsl(260 35% 20%)', mid: 'hsl(290 40% 25%)', bottom: 'hsl(20 60% 35%)' },
    sunColor: 'hsl(20 85% 50%)',
    sunPosition: { x: '85%', y: '75%' },
    lightLevel: 0.35,
    isNight: false,
    particleType: 'fireflies',
    ambience: 'evening_calm',
  },
  [TIME_PERIODS.DUSK]: {
    label: 'Dusk',
    sky: { top: 'hsl(250 40% 12%)', mid: 'hsl(275 35% 18%)', bottom: 'hsl(310 30% 22%)' },
    sunColor: 'hsl(15 70% 40%)',
    sunPosition: { x: '90%', y: '85%' },
    lightLevel: 0.2,
    isNight: false,
    particleType: 'fireflies',
    ambience: 'dusk_cricket',
  },
  [TIME_PERIODS.NIGHT]: {
    label: 'Night',
    sky: { top: 'hsl(240 45% 5%)', mid: 'hsl(250 40% 8%)', bottom: 'hsl(260 35% 10%)' },
    sunColor: 'hsl(220 30% 80%)',
    sunPosition: { x: '75%', y: '20%' },
    lightLevel: 0.1,
    isNight: true,
    particleType: 'stars',
    ambience: 'night_crickets',
  },
  [TIME_PERIODS.LATE_NIGHT]: {
    label: 'Late Night',
    sky: { top: 'hsl(240 50% 3%)', mid: 'hsl(250 45% 5%)', bottom: 'hsl(255 40% 7%)' },
    sunColor: 'hsl(220 25% 60%)',
    sunPosition: { x: '60%', y: '30%' },
    lightLevel: 0.05,
    isNight: true,
    particleType: 'stars',
    ambience: 'deep_night_silence',
  },
};

// ── Season configs ──
const SEASON_CONFIGS = {
  [SEASONS.SPRING]: { label: 'Spring', accentColor: 'hsl(330 50% 70%)', vegetationTint: 'hsl(120 50% 45%)', particleBonus: 'blossoms' },
  [SEASONS.SUMMER]: { label: 'Summer', accentColor: 'hsl(60 70% 60%)', vegetationTint: 'hsl(130 55% 35%)', particleBonus: 'fireflies' },
  [SEASONS.AUTUMN]: { label: 'Autumn', accentColor: 'hsl(30 70% 50%)', vegetationTint: 'hsl(30 60% 40%)', particleBonus: 'falling_leaves' },
  [SEASONS.WINTER]: { label: 'Winter', accentColor: 'hsl(200 30% 80%)', vegetationTint: 'hsl(150 30% 30%)', particleBonus: 'snowflakes' },
};

// ── Weather configs ──
const WEATHER_CONFIGS = {
  [WEATHER_TYPES.CLEAR]:  { label: 'Clear',  particleType: null,         skyModifier: 0,    lightModifier: 0,    soundProfile: 'silent' },
  [WEATHER_TYPES.SUNNY]:  { label: 'Sunny',  particleType: 'butterflies', skyModifier: 5,    lightModifier: 0.1, soundProfile: 'birds' },
  [WEATHER_TYPES.CLOUDY]: { label: 'Cloudy', particleType: null,         skyModifier: -5,   lightModifier: -0.1, soundProfile: 'wind_soft' },
  [WEATHER_TYPES.RAIN]:   { label: 'Rain',   particleType: 'rain',        skyModifier: -15, lightModifier: -0.2, soundProfile: 'rain' },
  [WEATHER_TYPES.SNOW]:   { label: 'Snow',   particleType: 'snow',        skyModifier: -10, lightModifier: -0.05, soundProfile: 'wind_cold' },
  [WEATHER_TYPES.STORM]:  { label: 'Storm',  particleType: 'rain',        skyModifier: -25, lightModifier: -0.3, soundProfile: 'storm' },
  [WEATHER_TYPES.FOG]:    { label: 'Fog',    particleType: 'mist',        skyModifier: -8,   lightModifier: -0.15, soundProfile: 'fog' },
  [WEATHER_TYPES.WIND]:   { label: 'Windy',  particleType: 'leaves',      skyModifier: -3,   lightModifier: 0,    soundProfile: 'wind_strong' },
};

// ── Time period detection ──
export function getTimePeriod(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 7) return TIME_PERIODS.DAWN;
  if (hour >= 7 && hour <= 11) return TIME_PERIODS.MORNING;
  if (hour >= 12 && hour <= 16) return TIME_PERIODS.AFTERNOON;
  if (hour >= 17 && hour <= 18) return TIME_PERIODS.GOLDEN_HOUR;
  if (hour >= 19 && hour <= 20) return TIME_PERIODS.EVENING;
  if (hour === 21) return TIME_PERIODS.DUSK;
  if (hour >= 22 || hour === 0) return TIME_PERIODS.NIGHT;
  return TIME_PERIODS.LATE_NIGHT; // 1-4
}

// ── Season detection (Northern Hemisphere) ──
export function getSeason(date = new Date()) {
  const month = date.getMonth();
  const day = date.getDate();
  if (month >= 2 && month <= 4) return month === 2 && day < 20 ? SEASONS.WINTER : SEASONS.SPRING;
  if (month >= 5 && month <= 7) return month === 5 && day < 21 ? SEASONS.SPRING : SEASONS.SUMMER;
  if (month >= 8 && month <= 10) return month === 8 && day < 22 ? SEASONS.SUMMER : SEASONS.AUTUMN;
  return month === 11 && day < 21 ? SEASONS.AUTUMN : SEASONS.WINTER;
}

// ── Weather simulation ──
// Since we can't call real weather APIs without a connector, we simulate
// weather with a daily seed + some variation. This gives consistent-but-changing
// weather each day. When a real weather connector is added, replace this.
const WEATHER_CYCLE = [
  WEATHER_TYPES.SUNNY, WEATHER_TYPES.CLEAR, WEATHER_TYPES.CLOUDY,
  WEATHER_TYPES.SUNNY, WEATHER_TYPES.CLEAR, WEATHER_TYPES.RAIN,
  WEATHER_TYPES.CLOUDY, WEATHER_TYPES.SUNNY,
];

export function getSimulatedWeather(date = new Date(), season = null) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const baseWeather = WEATHER_CYCLE[dayOfYear % WEATHER_CYCLE.length];

  // Seasonal adjustments
  if (season === SEASONS.WINTER && baseWeather === WEATHER_TYPES.RAIN) return WEATHER_TYPES.SNOW;
  if (season === SEASONS.WINTER && Math.random() < 0.3) return WEATHER_TYPES.SNOW;
  if (season === SEASONS.AUTUMN && baseWeather === WEATHER_TYPES.CLEAR) return WEATHER_TYPES.WIND;
  if (season === SEASONS.SPRING && baseWeather === WEATHER_TYPES.SUNNY) return WEATHER_TYPES.CLEAR;
  if (baseWeather === WEATHER_TYPES.RAIN && Math.random() < 0.15) return WEATHER_TYPES.STORM;
  if (baseWeather === WEATHER_TYPES.CLOUDY && Math.random() < 0.2) return WEATHER_TYPES.FOG;

  return baseWeather;
}

// ── The master function: compute unified world state ──
export function computeWorldState(inputs = {}) {
  const {
    date = new Date(),
    weatherOverride = null,
    userMood = null,
    userBirthday = null,
    location = null,
    calendarEvents = [],
    goalProgress = null,
  } = inputs;

  const timePeriod = getTimePeriod(date);
  const season = getSeason(date);
  const weather = weatherOverride || getSimulatedWeather(date, season);
  const holiday = detectHoliday(date, userBirthday);
  const seasonalDeco = getSeasonalDecoration(season);

  const timeConfig = TIME_CONFIGS[timePeriod];
  const seasonConfig = SEASON_CONFIGS[season];
  const weatherConfig = WEATHER_CONFIGS[weather];

  // Compute effective sky colors (weather modifies lightness)
  const skyShift = weatherConfig.skyModifier;
  const sky = {
    top: shiftLightness(timeConfig.sky.top, skyShift),
    mid: shiftLightness(timeConfig.sky.mid, skyShift),
    bottom: shiftLightness(timeConfig.sky.bottom, skyShift),
  };

  // Effective light level
  const lightLevel = Math.max(0, Math.min(1, timeConfig.lightLevel + weatherConfig.lightModifier));

  // Active particle types (time + weather + season)
  const particleTypes = new Set();
  if (weatherConfig.particleType) particleTypes.add(weatherConfig.particleType);
  if (timeConfig.particleType && timeConfig.isNight) particleTypes.add(timeConfig.particleType);
  if (seasonConfig.particleBonus) particleTypes.add(seasonConfig.particleBonus);
  if (seasonalDeco?.decoration) particleTypes.add(seasonalDeco.decoration);
  if (holiday?.decoration) particleTypes.add(holiday.decoration);

  // Determine if Bison should be sleeping
  const isLateNight = timePeriod === TIME_PERIODS.LATE_NIGHT;

  // Quiet hours — notifications become minimal
  const isQuietHours = timePeriod === TIME_PERIODS.LATE_NIGHT || (timePeriod === TIME_PERIODS.NIGHT && date.getHours() >= 23);

  return {
    time: {
      period: timePeriod,
      label: timeConfig.label,
      hour: date.getHours(),
      minute: date.getMinutes(),
      date,
    },
    season: {
      current: season,
      ...seasonConfig,
    },
    weather: {
      current: weather,
      ...weatherConfig,
    },
    sky: {
      ...sky,
      sunColor: timeConfig.sunColor,
      sunPosition: timeConfig.sunPosition,
      isNight: timeConfig.isNight,
    },
    lighting: {
      level: lightLevel,
      isNight: timeConfig.isNight,
      isGolden: timePeriod === TIME_PERIODS.GOLDEN_HOUR,
    },
    holiday,
    particles: Array.from(particleTypes),
    ambience: weatherConfig.soundProfile !== 'silent' ? weatherConfig.soundProfile : timeConfig.ambience,
    isLateNight,
    isQuietHours,
    userMood,
    calendarEvents,
    goalProgress,
    seasonalDeco,
  };
}

// Helper: shift HSL lightness by a percentage delta
function shiftLightness(hslStr, delta) {
  const match = hslStr.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) return hslStr;
  const [_, h, s, l] = match;
  const newL = Math.max(0, Math.min(100, parseInt(l) + delta));
  return `hsl(${h} ${s}% ${newL}%)`;
}

// React hook for live world state
export function useWorldState(options = {}) {
  const [worldState, setWorldState] = useState(() => computeWorldState(options));

  useEffect(() => {
    setWorldState(computeWorldState(options));
    const interval = setInterval(() => {
      setWorldState(computeWorldState(options));
    }, 60000); // re-check every minute
    return () => clearInterval(interval);
  }, []);

  return worldState;
}