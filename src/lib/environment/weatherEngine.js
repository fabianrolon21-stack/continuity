// ═══════════════════════════════════════════════
// WEATHER ENGINE (Package 018 — Immersive Environment)
// Optionally uses real local weather via geolocation +
// Open-Meteo API (free, no key, CORS-enabled).
// Falls back to deterministic simulation if permission
// is denied or location is unavailable.
// ═══════════════════════════════════════════════

import { getSimulatedWeather, WEATHER_TYPES } from '@/lib/world/worldStateEngine';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

let cachedWeather = null;
let cachedAt = 0;

// Map Open-Meteo weather codes to our weather types
function mapWeatherCode(code) {
  if (code === 0) return WEATHER_TYPES.SUNNY;
  if (code >= 1 && code <= 3) return WEATHER_TYPES.CLOUDY;
  if (code >= 45 && code <= 48) return WEATHER_TYPES.FOG;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return WEATHER_TYPES.RAIN;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return WEATHER_TYPES.SNOW;
  if (code >= 95) return WEATHER_TYPES.STORM;
  if (code >= 71 && code <= 77) return WEATHER_TYPES.SNOW;
  return WEATHER_TYPES.CLOUDY;
}

// Request geolocation permission
export function requestWeatherPermission() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ granted: false, error: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        resolve({ granted: false, error: error.message });
      },
      { timeout: 10000, maximumAge: CACHE_DURATION }
    );
  });
}

// Fetch real weather from Open-Meteo
async function fetchRealWeather(lat, lon) {
  const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather fetch failed');
  const data = await response.json();
  const current = data.current_weather;
  return {
    condition: mapWeatherCode(current.weathercode),
    temperature: current.temperature,
    windSpeed: current.windspeed,
    isReal: true,
  };
}

// Get weather state — real or simulated
export async function getWeatherState(options = {}) {
  const { useRealWeather = false, lat = null, lon = null } = options;

  // Return cached if fresh
  if (cachedWeather && Date.now() - cachedAt < CACHE_DURATION) {
    return cachedWeather;
  }

  if (useRealWeather && lat != null && lon != null) {
    try {
      const real = await fetchRealWeather(lat, lon);
      cachedWeather = real;
      cachedAt = Date.now();
      return real;
    } catch (e) {
      // Fall through to simulation
    }
  }

  // Simulate
  const simulated = getSimulatedWeather();
  const result = { condition: simulated, temperature: null, windSpeed: null, isReal: false };
  cachedWeather = result;
  cachedAt = Date.now();
  return result;
}

// Clear cache (force re-fetch)
export function clearWeatherCache() {
  cachedWeather = null;
  cachedAt = 0;
}

export { WEATHER_TYPES };