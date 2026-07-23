// ═══════════════════════════════════════════════
// AMBIENT LIGHTING LAYER (Package 018 — Layer 3)
// Time-of-day lighting overlays + weather tints.
// Morning: warm gold. Afternoon: bright neutral.
// Evening: orange warmth. Night: blue moonlight.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { getThemeProperties } from '@/lib/environment/themeProperties';
import { getTimePeriod, TIME_PERIODS } from '@/lib/ambiance/timeOfDay';
import { WEATHER_TYPES } from '@/lib/world/worldStateEngine';

const WEATHER_TINTS = {
  [WEATHER_TYPES.SUNNY]:  { color: 'hsl(45 80% 60%)',  opacity: 0.05 },
  [WEATHER_TYPES.CLOUDY]: { color: 'hsl(210 10% 50%)', opacity: 0.08 },
  [WEATHER_TYPES.RAIN]:   { color: 'hsl(210 30% 40%)', opacity: 0.10 },
  [WEATHER_TYPES.SNOW]:   { color: 'hsl(200 20% 80%)', opacity: 0.06 },
  [WEATHER_TYPES.STORM]:  { color: 'hsl(240 30% 20%)', opacity: 0.15 },
  [WEATHER_TYPES.FOG]:    { color: 'hsl(0 0% 60%)',    opacity: 0.10 },
  [WEATHER_TYPES.WIND]:   { color: 'hsl(60 20% 50%)',  opacity: 0.05 },
};

export default function AmbientLightingLayer({
  themeId = 'classic',
  weatherCondition = null,
  staticBackground = false,
}) {
  const [period, setPeriod] = useState(() => getTimePeriod());

  useEffect(() => {
    if (staticBackground) return;
    const update = () => setPeriod(getTimePeriod());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [staticBackground]);

  if (staticBackground) return null;

  const props = getThemeProperties(themeId);
  const lighting = props.lighting[period] || props.lighting.night;
  const weatherTint = weatherCondition ? WEATHER_TINTS[weatherCondition] : null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -7 }} aria-hidden="true">
      {/* Time-of-day glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at ${lighting.x} ${lighting.y}, ${lighting.color}${Math.round(lighting.intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          transition: 'background 3s ease-in-out',
        }}
      />

      {/* Weather tint overlay */}
      {weatherTint && (
        <div
          className="absolute inset-0"
          style={{
            background: weatherTint.color,
            opacity: weatherTint.opacity,
            transition: 'opacity 3s ease-in-out',
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsl(0 0% 0% / 0.15) 100%)',
        }}
      />
    </div>
  );
}