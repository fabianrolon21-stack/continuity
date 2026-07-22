import { useState } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, Leaf } from 'lucide-react';

const SEASON_CONFIG = {
  spring: { icon: Leaf,      color: 'hsl(120 40% 58%)', label: 'Spring', bgGradient: 'from-leaf/10 via-transparent to-sky-accent/5' },
  summer: { icon: Sun,        color: 'hsl(42 63% 55%)',  label: 'Summer', bgGradient: 'from-gold/10 via-transparent to-peach/5' },
  autumn: { icon: Cloud,     color: 'hsl(21 73% 69%)',  label: 'Autumn', bgGradient: 'from-peach/10 via-transparent to-gold/5' },
  winter: { icon: Snowflake,  color: 'hsl(199 56% 64%)', label: 'Winter', bgGradient: 'from-sky-accent/10 via-transparent to-purple-accent/5' },
};

export default function GardenCanvas({ plants, onPlantClick, onEmptySpotClick }) {
  const season = getCurrentSeason();
  const config = SEASON_CONFIG[season];
  const SeasonIcon = config.icon;

  function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  return (
    <div className={`relative w-full h-[320px] rounded-xl overflow-hidden bg-gradient-to-b ${config.bgGradient} border border-border/50`}>
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(to bottom, ${config.color}10 0%, transparent 50%, hsl(268 14% 10%) 100%)`,
      }} />

      {/* Sun/Moon */}
      <div className="absolute top-6 right-8 w-12 h-12 rounded-full animate-float"
        style={{ backgroundColor: season === 'winter' ? 'hsl(199 56% 64%)' : 'hsl(42 63% 55%)', opacity: 0.3 }}
      />

      {/* Season label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full glass">
        <SeasonIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
        <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16" style={{
        background: `linear-gradient(to bottom, transparent, ${config.color}15)`,
      }} />

      {/* Plants */}
      {plants.map(plant => {
        const stageEmoji = getStageEmoji(plant.growth_stage);
        return (
          <button
            key={plant.id}
            onClick={() => onPlantClick?.(plant)}
            className="absolute transition-transform hover:scale-110 animate-breathe"
            style={{
              left: `${plant.position_x}%`,
              bottom: `${plant.position_y / 4}%`,
              fontSize: `${1 + (plant.care_actions || 0) * 0.15}rem`,
            }}
          >
            <span className="block">{stageEmoji}</span>
            {plant.discovered_wildlife && (
              <span className="absolute -top-3 -right-2 text-sm animate-float">
                {getWildlifeEmoji(plant.discovered_wildlife)}
              </span>
            )}
          </button>
        );
      })}

      {/* Empty spot hint */}
      {plants.length === 0 && (
        <button
          onClick={onEmptySpotClick}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-30">🌱</div>
            <p className="text-sm text-muted-foreground">Tap to plant your first seed</p>
          </div>
        </button>
      )}
    </div>
  );
}

function getStageEmoji(stage) {
  const stages = { seed: '🌰', sprout: '🌱', young: '🌿', mature: '🌳', blooming: '🌸' };
  return stages[stage] || '🌱';
}

function getWildlifeEmoji(name) {
  const map = { Butterfly: '🦋', Bee: '🐝', Ladybug: '🐞', Bird: '🐦', Firefly: '✨', Rabbit: '🐰' };
  return map[name] || '🦋';
}