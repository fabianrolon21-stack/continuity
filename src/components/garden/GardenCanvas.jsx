import { motion } from 'framer-motion';
import GardenWildlife from '@/components/garden/GardenWildlife';
import { getSpecies, getStageEmoji, getIdleAnimation, isGoldenBloom } from '@/lib/garden/plantSpecies';
import { Sun, Cloud, CloudRain, Snowflake, Leaf } from 'lucide-react';

const SEASON_CONFIG = {
  spring: { icon: Leaf,      color: 'hsl(120 40% 58%)', label: 'Spring', bgGradient: 'from-leaf/10 via-transparent to-sky-accent/5', particle: '🌸' },
  summer: { icon: Sun,        color: 'hsl(42 63% 55%)',  label: 'Summer', bgGradient: 'from-gold/10 via-transparent to-peach/5', particle: '✨' },
  autumn: { icon: Cloud,     color: 'hsl(21 73% 69%)',  label: 'Autumn', bgGradient: 'from-peach/10 via-transparent to-gold/5', particle: '🍂' },
  winter: { icon: Snowflake,  color: 'hsl(199 56% 64%)', label: 'Winter', bgGradient: 'from-sky-accent/10 via-transparent to-purple-accent/5', particle: '❄️' },
};

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export default function GardenCanvas({ plants, onPlantClick, onEmptySpotClick, caringPlantId }) {
  const season = getCurrentSeason();
  const config = SEASON_CONFIG[season];
  const SeasonIcon = config.icon;
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  const hasFlowers = plants.some(p => ['blooming', 'mature'].includes(p.growth_stage));

  return (
    <div className={`relative w-full h-[320px] rounded-xl overflow-hidden bg-gradient-to-b ${config.bgGradient} border border-border/50 framed`}>
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(to bottom, ${config.color}10 0%, transparent 50%, hsl(268 14% 10%) 100%)`,
      }} />

      {/* Sun/Moon */}
      <div className="absolute top-6 right-8 w-12 h-12 rounded-full animate-float"
        style={{ backgroundColor: isNight ? 'hsl(48 40% 80%)' : season === 'winter' ? 'hsl(199 56% 64%)' : 'hsl(42 63% 55%)', opacity: 0.3 }}
      />

      {/* Drifting clouds */}
      <motion.div
        className="absolute top-8 w-16 h-5 rounded-full"
        style={{ background: 'hsl(220 15% 45% / 0.25)' }}
        animate={{ x: ['-15%', '115%'] }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-16 w-12 h-4 rounded-full"
        style={{ background: 'hsl(220 15% 50% / 0.18)' }}
        animate={{ x: ['115%', '-15%'] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
      />

      {/* Seasonal drifting particles */}
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={`sp${i}`}
          className="absolute text-xs opacity-40 select-none"
          style={{ left: `${10 + i * 20}%` }}
          animate={{ y: ['-8%', '108%'], x: [0, i % 2 ? 25 : -25], rotate: [0, 180] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, delay: i * 2.5, ease: 'linear' }}
        >
          {config.particle}
        </motion.span>
      ))}

      {/* Season label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full glass z-10">
        <SeasonIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
        <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16" style={{
        background: `linear-gradient(to bottom, transparent, ${config.color}15)`,
      }} />

      {/* Swaying grass */}
      <div className="absolute bottom-0 inset-x-0 h-5">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`g${i}`}
            className="absolute bottom-0 rounded-t-full"
            style={{ left: `${(i * 3.4) % 100}%`, width: 2, height: 8 + (i % 3) * 5, background: `${config.color}50`, transformOrigin: 'bottom center' }}
            animate={{ rotate: [i % 2 ? -7 : 5, i % 2 ? 6 : -6] }}
            transition={{ duration: 2 + (i % 4) * 0.7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Wildlife */}
      <GardenWildlife isNight={isNight} hasFlowers={hasFlowers} />

      {/* Plants — swaying, reacting to care */}
      {plants.map((plant, idx) => {
        const isCaring = caringPlantId === plant.id;
        const species = getSpecies(plant.plant_type);
        const golden = isGoldenBloom(plant);
        const idle = getIdleAnimation(species.animation, idx);
        return (
          <motion.button
            key={plant.id}
            onClick={() => onPlantClick?.(plant)}
            className="absolute hover:scale-110 transition-transform"
            style={{
              left: `${plant.position_x}%`,
              bottom: `${plant.position_y / 4}%`,
              fontSize: `${Math.min(2.4, 1 + (plant.care_actions || 0) * 0.15)}rem`,
              transformOrigin: 'bottom center',
            }}
            animate={isCaring
              ? { rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.15, 1] }
              : idle.animate}
            transition={isCaring ? { duration: 0.7 } : idle.transition}
          >
            {/* Growth animation — the emoji "blooms" in when the stage changes */}
            <motion.span
              key={plant.growth_stage}
              className="block"
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 12 }}
              style={golden ? { filter: 'drop-shadow(0 0 10px hsl(48 80% 65% / 0.9))' } : undefined}
            >
              {getStageEmoji(plant.plant_type, plant.growth_stage)}
            </motion.span>
            {golden && (
              <span className="absolute -top-2 -left-2 text-xs animate-twinkle">✨</span>
            )}
            {/* Care reaction — sparkles + heart rising */}
            {isCaring && [...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs pointer-events-none"
                style={{ left: `${i * 8 - 8}px`, top: 0 }}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], y: -24, scale: [0, 1.2, 0.8] }}
                transition={{ duration: 1, delay: i * 0.12 }}
              >
                {i % 2 ? '✨' : '💚'}
              </motion.span>
            ))}
            {plant.discovered_wildlife && (
              <span className="absolute -top-3 -right-2 text-sm animate-float">
                {getWildlifeEmoji(plant.discovered_wildlife)}
              </span>
            )}
          </motion.button>
        );
      })}

      {/* Empty spot hint */}
      {plants.length === 0 && (
        <button
          onClick={onEmptySpotClick}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              className="text-4xl mb-2 opacity-30"
              animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌱
            </motion.div>
            <p className="text-sm text-muted-foreground">Tap to plant your first seed</p>
          </div>
        </button>
      )}
    </div>
  );
}

function getWildlifeEmoji(name) {
  const map = { Butterfly: '🦋', Bee: '🐝', Ladybug: '🐞', Bird: '🐦', Firefly: '✨', Rabbit: '🐰' };
  return map[name] || '🦋';
}