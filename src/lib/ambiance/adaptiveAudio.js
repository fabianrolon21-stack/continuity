// ═══════════════════════════════════════════════
// ADAPTIVE AUDIO (Phase 4 — Living World)
// Maps the world state into musical modulation so the soundtrack
// responds to weather, time of day, and the companion's energy
// instead of looping identically forever.
//
// Returns multipliers consumed by the audio engine:
//   tempo  — chord duration scale (higher = slower)
//   filter — lowpass brightness scale
//   gain   — loudness scale
//   detune — ensemble spread
// ═══════════════════════════════════════════════

const WEATHER_MOOD = {
  clear:  { tempo: 1.0,  filter: 1.15, gain: 1.0,  detune: 1.0 },
  cloudy: { tempo: 1.1,  filter: 0.9,  gain: 0.9,  detune: 1.2 },
  wind:   { tempo: 0.95, filter: 1.0,  gain: 0.95, detune: 1.6 },
  rain:   { tempo: 1.25, filter: 0.65, gain: 0.8,  detune: 1.3 },
  storm:  { tempo: 1.15, filter: 0.5,  gain: 0.85, detune: 2.0 },
  snow:   { tempo: 1.4,  filter: 0.75, gain: 0.75, detune: 0.8 },
  fog:    { tempo: 1.35, filter: 0.55, gain: 0.7,  detune: 1.4 },
};

export function computeAudioMood({ weather = 'clear', isNight = false, isLateNight = false, energy = 80 } = {}) {
  const base = WEATHER_MOOD[weather] || WEATHER_MOOD.clear;
  const mood = { ...base };

  // Night softens and slows everything
  if (isNight) {
    mood.tempo *= 1.2;
    mood.filter *= 0.7;
    mood.gain *= 0.8;
  }
  if (isLateNight) {
    mood.tempo *= 1.15;
    mood.gain *= 0.7;
  }

  // Low energy = a sleepier, darker instrument voice
  const energyRatio = Math.max(0, Math.min(100, energy)) / 100;
  mood.tempo *= 1.3 - energyRatio * 0.3;
  mood.filter *= 0.7 + energyRatio * 0.5;
  mood.gain *= 0.75 + energyRatio * 0.25;

  return mood;
}