// ═══════════════════════════════════════════════
// AMBIENT COMPANION (Phase 31 — Living World)
// Bison simply exists in the world. He walks, sits, reads,
// waters plants, looks out the window, sleeps at 2AM.
// He is not always the center of the screen.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decideBisonActivity, BISON_ACTIVITIES } from '@/lib/world/bisonPresenceController';

const LOCATION_POSITIONS = {
  bed:       { x: '5%',  y: '70%', scale: 0.7 },
  center:    { x: '40%', y: '55%', scale: 1.0 },
  desk:      { x: '75%', y: '60%', scale: 0.8 },
  bookshelf: { x: '85%', y: '55%', scale: 0.75 },
  garden:    { x: '50%', y: '75%', scale: 0.85 },
  window:    { x: '80%', y: '50%', scale: 0.8 },
  tree:      { x: '20%', y: '65%', scale: 0.8 },
};

export default function AmbientCompanion({ worldState, performanceMode = 'balanced', onInteract }) {
  const [activity, setActivity] = useState(BISON_ACTIVITIES.RESTING);
  const [position, setPosition] = useState(LOCATION_POSITIONS.center);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (!worldState) return;
    const newActivity = decideBisonActivity(worldState);
    setActivity(newActivity);
    const loc = LOCATION_POSITIONS[newActivity.location] || LOCATION_POSITIONS.center;
    setPosition(loc);

    // Occasionally show a bubble (not during quiet hours)
    if (!worldState.isQuietHours && Math.random() < 0.3) {
      const timer = setTimeout(() => setShowBubble(true), 2000);
      const hideTimer = setTimeout(() => setShowBubble(false), 8000);
      return () => { clearTimeout(timer); clearTimeout(hideTimer); };
    }
  }, [worldState?.time?.period, worldState?.weather?.current]);

  const isMinimal = performanceMode === 'minimal' || performanceMode === 'battery_saver';
  const isSleeping = activity === BISON_ACTIVITIES.SLEEPING;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={activity.label}
          className="absolute"
          initial={{ x: position.x, y: position.y, opacity: 0, scale: position.scale * 0.8 }}
          animate={{ x: position.x, y: position.y, opacity: 1, scale: position.scale }}
          exit={{ opacity: 0, scale: position.scale * 0.8 }}
          transition={{ duration: isMinimal ? 0 : 2, ease: 'easeInOut' }}
          style={{ left: 0, top: 0 }}
        >
          {/* Activity label / bubble */}
          <AnimatePresence>
            {showBubble && !isSleeping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap glass rounded-xl px-3 py-1.5 text-xs text-muted-foreground"
              >
                {activity.icon} {activity.label}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Bison */}
          <div
            className="relative pointer-events-auto cursor-pointer"
            onClick={onInteract}
            role="button"
            aria-label={`Bison is ${activity.label.toLowerCase()}`}
          >
            <BisonSprite activity={activity} isMinimal={isMinimal} isSleeping={isSleeping} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Simple SVG Bison sprite that changes pose by activity ──
function BisonSprite({ activity, isMinimal, isSleeping }) {
  const mood = activity.mood;
  const bodyColor = mood === 'joyful' ? 'hsl(42 63% 50%)'
    : mood === 'calm' || mood === 'peaceful' ? 'hsl(265 41% 55%)'
    : mood === 'thoughtful' || mood === 'contemplative' ? 'hsl(260 35% 50%)'
    : 'hsl(42 50% 45%)';

  const breathing = !isMinimal && !isSleeping ? {
    animation: 'breathe 4s ease-in-out infinite',
  } : {};

  const sleepingZ = isSleeping && !isMinimal ? (
    <motion.div
      animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg"
    >
      💤
    </motion.div>
  ) : null;

  return (
    <div className="relative" style={{ width: '60px', height: '50px', ...breathing }}>
      {sleepingZ}
      <svg viewBox="0 0 60 50" className="w-full h-full" style={{ filter: isMinimal ? 'none' : 'drop-shadow(0 4px 8px hsl(0 0% 0% / 0.3))' }}>
        {/* Body */}
        <ellipse cx="30" cy="35" rx="22" ry="12" fill={bodyColor} />
        {/* Hump */}
        <ellipse cx="22" cy="28" rx="10" ry="8" fill={bodyColor} />
        {/* Head */}
        <ellipse cx="46" cy="25" rx="8" ry="7" fill={bodyColor} />
        {/* Horns */}
        <path d="M42,20 Q40,15 42,12" stroke="hsl(25 50% 30%)" strokeWidth="1.5" fill="none" />
        <path d="M50,20 Q52,15 50,12" stroke="hsl(25 50% 30%)" strokeWidth="1.5" fill="none" />
        {/* Eye */}
        {isSleeping ? (
          <path d="M44,24 Q46,25 48,24" stroke="hsl(0 0% 10%)" strokeWidth="1" fill="none" />
        ) : (
          <circle cx="46" cy="24" r="1.5" fill="hsl(0 0% 10%)" />
        )}
        {/* Legs */}
        <rect x="14" y="42" width="3" height="6" fill={bodyColor} />
        <rect x="22" y="42" width="3" height="6" fill={bodyColor} />
        <rect x="36" y="42" width="3" height="6" fill={bodyColor} />
        <rect x="44" y="42" width="3" height="6" fill={bodyColor} />

        {/* Activity-specific props */}
        {activity === BISON_ACTIVITIES.READING && (
          <rect x="38" y="26" width="10" height="6" fill="hsl(0 0% 90%)" rx="1" />
        )}
        {activity === BISON_ACTIVITIES.DRINKING_COFFEE && (
          <rect x="36" y="30" width="5" height="5" fill="hsl(25 60% 40%)" rx="1" />
        )}
        {activity === BISON_ACTIVITIES.WATERING_PLANTS && (
          <rect x="36" y="32" width="4" height="6" fill="hsl(200 50% 50%)" rx="2" />
        )}
      </svg>
    </div>
  );
}