// ═══════════════════════════════════════════════
// LIVING ROOM (Phase 31 — Living World)
// The Nintendo-style home scene. Contains the window,
// ambient Bison doing his thing, environment info, and
// the memory tree grove. This IS the home — not a chat.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { computeWorldState } from '@/lib/world/worldStateEngine';
import AmbientCompanion from './AmbientCompanion';
import WindowView from './WindowView';
import CompanionBubble from './CompanionBubble';
import MemoryTreeGrove from './MemoryTreeGrove';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Clock, Calendar, PartyPopper } from 'lucide-react';

const WEATHER_ICONS = {
  clear: Sun,
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  fog: CloudFog,
  wind: Wind,
};

export default function LivingRoom({ userBirthday = null }) {
  const [worldState, setWorldState] = useState(() => computeWorldState({ userBirthday }));
  const [performanceMode, setPerformanceMode] = useState('balanced');

  useEffect(() => {
    const update = () => setWorldState(computeWorldState({ userBirthday }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [userBirthday]);

  if (!worldState) return null;

  const { time, weather, season, holiday, isQuietHours } = worldState;
  const WeatherIcon = WEATHER_ICONS[weather.current] || Sun;
  const timeStr = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;

  return (
    <div className="relative">
      {/* The Room Scene */}
      <div className="relative glass rounded-2xl overflow-hidden" style={{ height: '340px' }}>
        {/* Environment info bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-background/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <WeatherIcon className="w-3 h-3" style={{ color: weather.label === 'Sunny' ? 'hsl(45 85% 60%)' : 'hsl(200 40% 60%)' }} />
              {weather.label}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-muted-foreground capitalize">
              <Calendar className="w-3 h-3" />
              {season.label}
            </span>
          </div>
          {holiday && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: holiday.accent }}>
              <PartyPopper className="w-3 h-3" />
              {holiday.name}
            </span>
          )}
        </div>

        {/* The Window — reflects reality */}
        <div className="absolute top-12 right-4 z-10" style={{ width: '140px', height: '100px' }}>
          <WindowView worldState={worldState} performanceMode={performanceMode} />
        </div>

        {/* Floor / ground line */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '30%',
            background: `linear-gradient(180deg, transparent 0%, ${season.vegetationTint}15 50%, ${season.vegetationTint}25 100%)`,
          }}
        />

        {/* Ambient Bison — doing his thing */}
        <AmbientCompanion
          worldState={worldState}
          performanceMode={performanceMode}
          onInteract={() => {}}
        />

        {/* Time period label */}
        <div className="absolute bottom-3 left-4 z-10">
          <p className="text-xs text-muted-foreground/60">{time.label}</p>
          {isQuietHours && (
            <p className="text-[10px] text-muted-foreground/40">Quiet hours</p>
          )}
        </div>
      </div>

      {/* Memory Tree Grove — compact preview */}
      <div className="mt-4 glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm text-leaf">Memory Grove</h3>
          <Link to="/garden" className="text-xs text-muted-foreground hover:text-foreground">Visit garden</Link>
        </div>
        <MemoryTreeGrove compact />
      </div>

      {/* Ambient companion bubbles — appear across the app */}
      <CompanionBubble worldState={worldState} />
    </div>
  );
}