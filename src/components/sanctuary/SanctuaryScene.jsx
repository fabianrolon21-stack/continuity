import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { computeWorldState } from '@/lib/world/worldStateEngine';
import { getHabitat } from '@/lib/sanctuary/habitats';
import { chooseBehavior, BEHAVIOR_NOTES, BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';
import { pickCareScene } from '@/lib/sanctuary/careScenes';
import { eventBus } from '@/lib/events/eventBus';
import EmoteSticker from '@/components/sanctuary/EmoteSticker';
import { checkAchievements } from '@/lib/bison/achievementEngine';
import SceneBison from '@/components/sanctuary/SceneBison';
import SceneWindow from '@/components/sanctuary/SceneWindow';
import SceneParticles from '@/components/sanctuary/SceneParticles';
import { Sprout, TreePine, Flame, Waves, Snowflake, Gem, BookOpen, Telescope, Lamp, Gamepad2, Zap, Apple, Droplets } from 'lucide-react';

const OBJECT_ICONS = { Sprout, TreePine, Flame, Waves, Snowflake, Gem, BookOpen, Telescope, Lamp };

export default function SanctuaryScene({ config, energy = 80, accountAgeDays = 0 }) {
  const habitat = getHabitat(config?.habitat);
  const [worldState, setWorldState] = useState(() => computeWorldState());
  const [behavior, setBehavior] = useState(BEHAVIORS.IDLE);
  const [emote, setEmote] = useState(null);
  const [careProp, setCareProp] = useState(null);
  const sceneActiveRef = useRef(false);
  const sceneTimersRef = useRef([]);
  const trackedWeather = useRef(false);
  const trackedSleep = useRef(false);

  // World clock — re-evaluates time/weather every minute
  useEffect(() => {
    const t = setInterval(() => setWorldState(computeWorldState()), 60000);
    return () => clearInterval(t);
  }, []);

  // Behavior loop — weighted random, never repeats, energy + weather aware
  useEffect(() => {
    let timer;
    let prev = null;
    const tick = () => {
      const { behavior: b, durationMs } = chooseBehavior({
        energy,
        isNight: worldState.sky.isNight,
        isLateNight: worldState.isLateNight,
        weather: worldState.weather.current,
        prev,
      });
      if (!sceneActiveRef.current) {
        prev = b;
        setBehavior(b);
      }
      timer = setTimeout(tick, durationMs);
    };
    tick();
    return () => clearTimeout(timer);
  }, [energy, worldState.weather.current, worldState.sky.isNight, worldState.isLateNight]);

  // Care scenes — quick actions trigger scripted, unpredictable reactions
  useEffect(() => {
    const unsub = eventBus.subscribe('BISON_CARE_ACTION', (event) => {
      sceneTimersRef.current.forEach(clearTimeout);
      const { prop, steps } = pickCareScene(event.payload?.action);
      sceneActiveRef.current = true;
      setCareProp(prop);
      const timers = [];
      let delay = 400;
      for (const step of steps) {
        timers.push(setTimeout(() => {
          setBehavior(step.motion);
          setEmote(step.emote || null);
        }, delay));
        delay += step.ms;
      }
      timers.push(setTimeout(() => {
        sceneActiveRef.current = false;
        setCareProp(null);
        setEmote(null);
        setBehavior(BEHAVIORS.IDLE);
      }, delay));
      sceneTimersRef.current = timers;
    });
    return () => {
      unsub();
      sceneTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Track weather seen (Window Watcher achievement) — once per visit
  useEffect(() => {
    if (!config || trackedWeather.current) return;
    trackedWeather.current = true;
    const w = worldState.weather.current;
    const seen = config.weather_seen || [];
    if (!seen.includes(w)) {
      const updated = { ...config, weather_seen: [...seen, w] };
      base44.auth.updateMe({ sanctuary_config: updated }).catch(() => {});
      checkAchievements({ weatherTypesSeen: updated.weather_seen.length, accountAgeDays }).catch(() => {});
    } else if (accountAgeDays >= 365) {
      checkAchievements({ accountAgeDays }).catch(() => {});
    }
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track watching Bison fall asleep (Sleep Is Important) — once per visit
  useEffect(() => {
    if (behavior !== BEHAVIORS.SLEEP || trackedSleep.current || !config) return;
    trackedSleep.current = true;
    const count = (config.sleep_watch_count || 0) + 1;
    base44.auth.updateMe({ sanctuary_config: { ...config, sleep_watch_count: count } }).catch(() => {});
    checkAchievements({ sleepWatchCount: count }).catch(() => {});
  }, [behavior, config]); // eslint-disable-line react-hooks/exhaustive-deps

  const ObjectIcon = OBJECT_ICONS[habitat.objectIcon] || Sprout;
  const darkness = Math.max(0, 0.55 - worldState.lighting.level * 0.55);
  const energyColor = energy >= 60 ? 'hsl(120 40% 58%)' : energy >= 30 ? 'hsl(42 63% 55%)' : 'hsl(0 70% 55%)';

  return (
    <div className="glass framed rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={habitat.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="relative h-[420px]"
          style={{ background: habitat.wall, transition: 'background 3s ease-in-out' }}
        >
          {/* Ambient lighting overlay — follows time of day */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `hsl(250 40% 4% / ${darkness})`, transition: 'background 3s ease-in-out' }} />
          {worldState.lighting.isGolden && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, hsl(30 80% 50% / 0.08), transparent 60%)' }} />
          )}

          {/* Storm lightning */}
          {worldState.weather.current === 'storm' && (
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              animate={{ opacity: [0, 0, 0.25, 0, 0.1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 7 }}
            />
          )}

          {/* Space B — Window, centered above the Bison */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <SceneWindow worldState={worldState} />
          </div>

          {/* Floor */}
          <div className="absolute bottom-0 inset-x-0 h-[110px]" style={{ background: habitat.floor, transition: 'background 3s ease-in-out' }} />

          {/* Swaying grass */}
          <div className="absolute bottom-[100px] inset-x-0 h-6">
            {[...Array(26)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 rounded-t-full"
                style={{ left: `${(i * 3.9) % 100}%`, width: 3, height: 12 + (i % 3) * 6, background: habitat.grass, transformOrigin: 'bottom center', transition: 'background 3s ease-in-out' }}
                animate={{ rotate: [i % 2 ? -6 : 4, i % 2 ? 5 : -5] }}
                transition={{ duration: 2.5 + (i % 3), repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Space C — the Bison, always centered */}
          <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2">
            <div className="relative">
              <EmoteSticker emote={emote} />
              <SceneBison behavior={behavior} accent={habitat.accent} />
            </div>
          </div>

          {/* Care prop — drops in near the Bison during scenes */}
          <AnimatePresence>
            {careProp && (
              <motion.div
                key={careProp}
                className="absolute bottom-[74px] left-[calc(50%+95px)]"
                initial={{ y: -120, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {careProp === 'apple' && (
                  <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                    <Apple className="w-5 h-5 text-red-400" />
                  </div>
                )}
                {careProp === 'bucket' && (
                  <div className="w-9 h-9 rounded-b-xl rounded-t-sm bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-sky-400" />
                  </div>
                )}
                {careProp === 'ball' && (
                  <motion.div
                    className="w-8 h-8 rounded-full"
                    style={{ background: 'radial-gradient(circle at 35% 30%, hsl(21 73% 69%), hsl(21 60% 45%))' }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Space D — meaningful object (left) */}
          <div className="absolute bottom-8 left-8 flex flex-col items-center gap-1.5">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center framed"
              style={{ background: `${habitat.accent.replace(')', ' / 0.12)')}` }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ObjectIcon className="w-6 h-6" style={{ color: habitat.accent }} />
            </motion.div>
            <span className="text-[9px] text-white/40">{habitat.objectLabel}</span>
          </div>

          {/* Simple toy (right) */}
          <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1.5">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center framed bg-white/5"
              animate={behavior === BEHAVIORS.PLAY ? { rotate: [0, -10, 10, 0], y: [0, -6, 0] } : {}}
              transition={{ duration: 1.2, repeat: behavior === BEHAVIORS.PLAY ? Infinity : 0 }}
            >
              <Gamepad2 className="w-5 h-5 text-white/50" />
            </motion.div>
            <span className="text-[9px] text-white/40">Toy</span>
          </div>

          {/* Weather particles */}
          <SceneParticles weather={worldState.weather.current} isNight={worldState.sky.isNight} />
        </motion.div>
      </AnimatePresence>

      {/* Status strip */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <span className="font-medium text-foreground/90">{habitat.name}</span>
          <span>·</span>
          <span>{worldState.time.label}</span>
          <span>·</span>
          <span>{worldState.weather.label}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline italic truncate">Bison is {BEHAVIOR_NOTES[behavior]}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3 h-3" style={{ color: energyColor }} />
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, Math.min(100, energy))}%`, background: energyColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}