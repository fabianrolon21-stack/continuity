import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sprout, Droplets, Sparkles, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/MicroAnimations';
import { StaggeredItem } from '@/components/AnimationEngine';
import GardenCanvas from '@/components/garden/GardenCanvas';
import { PLANT_TYPES, GARDEN_TIERS, getGardenTier, getAvailablePlants, plantSeed, careForPlant, checkForRareDiscovery } from '@/lib/bison/gardenSystem';

export default function Garden() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planting, setPlanting] = useState(null);
  const [caring, setCaring] = useState(null);
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [wildlifeMessage, setWildlifeMessage] = useState(null);
  const [gardenXp, setGardenXp] = useState(0);

  const refresh = useCallback(async () => {
    const data = await base44.entities.GardenPlant.list('-created_date', 100);
    setPlants(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    base44.auth.me().then(u => setGardenXp(u?.garden_xp || 0)).catch(() => {});
  }, []);

  const tier = getGardenTier(plants.length);
  const availablePlants = getAvailablePlants(plants.length);

  const handlePlant = async (plantType) => {
    setPlanting(plantType);
    try {
      await plantSeed(plantType);
      await refresh();
      setGardenXp(x => x + 5);
      setShowPlantPicker(false);

      // Check for rare discovery
      const rare = await checkForRareDiscovery(plants.length + 1);
      if (rare) {
        setWildlifeMessage({ type: 'rare', text: `✨ A ${rare.name} has appeared in your garden!` });
        setTimeout(() => setWildlifeMessage(null), 5000);
      }
    } catch (e) {}
    setPlanting(null);
  };

  const handleCare = async (plantId) => {
    setCaring(plantId);
    try {
      const result = await careForPlant(plantId);
      await refresh();
      if (result?.xpGained) setGardenXp(x => x + result.xpGained);
      if (result?.stageChanged) {
        setWildlifeMessage({ type: 'growth', text: `🌸 Your plant grew to ${result.newStage}! +${result.xpGained} Garden XP` });
        setTimeout(() => setWildlifeMessage(null), 4000);
      } else if (result?.wildlife) {
        setWildlifeMessage({ type: 'wildlife', text: `${result.wildlife.emoji} A ${result.wildlife.name} visited your plant! +${result.xpGained} Garden XP` });
        setTimeout(() => setWildlifeMessage(null), 4000);
      }
    } catch (e) {}
    setCaring(null);
  };

  const nextTier = GARDEN_TIERS.find(t => t.threshold > plants.length);
  const progressToNext = nextTier ? ((plants.length - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100 : 100;

  return (
    <div className="min-h-screen-safe pb-20 lg:pb-10">
      <PageHeader title="Garden" subtitle="Your living sanctuary grows with you" accent={tier.color} />

      <div className="px-6 lg:px-10 pb-4 space-y-4">
        {/* Tier display */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                <Trophy className="w-5 h-5" style={{ color: tier.color }} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm" style={{ color: tier.color }}>{tier.name}</h3>
                <p className="text-xs text-muted-foreground">{plants.length} plants · {gardenXp} Garden XP</p>
              </div>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Next: {nextTier.name}</p>
                <p className="text-[10px] text-muted-foreground">{nextTier.threshold - plants.length} more to unlock</p>
              </div>
            )}
          </div>

          {nextTier && (
            <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressToNext}%`, backgroundColor: tier.color }} />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-3">
            {GARDEN_TIERS.map(t => (
              <span key={t.threshold} className={`text-[9px] px-2 py-0.5 rounded-full ${plants.length >= t.threshold ? '' : 'opacity-30'}`}
                style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* Wildlife notification */}
        {wildlifeMessage && (
          <div className="glass rounded-xl p-3 flex items-center gap-2 animate-pulse-soft border" style={{ borderColor: `${tier.color}40` }}>
            <Sparkles className="w-4 h-4 text-gold animate-sparkle" />
            <p className="text-sm text-gold">{wildlifeMessage.text}</p>
          </div>
        )}

        {/* Garden canvas */}
        <GardenCanvas plants={plants} caringPlantId={caring} onPlantClick={(p) => handleCare(p.id)} onEmptySpotClick={() => setShowPlantPicker(true)} />

        {/* Plant button */}
        <button
          onClick={() => setShowPlantPicker(!showPlantPicker)}
          className="w-full py-2.5 rounded-lg bg-leaf/15 text-leaf text-sm font-medium hover:bg-leaf/25 transition-colors flex items-center justify-center gap-2"
        >
          <Sprout className="w-4 h-4" />
          Plant New Seed
        </button>

        {/* Plant picker */}
        {showPlantPicker && (
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Available plants for your tier:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availablePlants.map(type => {
                const config = PLANT_TYPES[type];
                const isPlanting = planting === type;
                return (
                  <button
                    key={type}
                    onClick={() => handlePlant(type)}
                    disabled={isPlanting}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors disabled:opacity-50"
                  >
                    {isPlanting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-2xl">{config.emoji}</span>}
                    <span className="text-[10px] text-center" style={{ color: config.color }}>{config.name}</span>
                    <span className="text-[8px] text-muted-foreground capitalize">{config.rarity}</span>
                  </button>
                );
              })}
            </div>
            {/* Locked plants */}
            {Object.entries(PLANT_TYPES).filter(([type]) => !availablePlants.includes(type)).length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Locked:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(PLANT_TYPES).filter(([type]) => !availablePlants.includes(type)).map(([type, config]) => (
                    <span key={type} className="text-[9px] px-2 py-0.5 rounded-full opacity-30 bg-secondary/20 text-muted-foreground">
                      {config.emoji} {config.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plant list with care */}
        {plants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">Your Plants</h4>
            {plants.map((plant, i) => {
              const config = PLANT_TYPES[plant.plant_type];
              return (
                <StaggeredItem key={plant.id} index={i}>
                  <div className="glass rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">{config?.emoji || '🌱'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: config?.color }}>{config?.name || plant.plant_type}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize bg-secondary/30 text-muted-foreground">{plant.rarity}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground capitalize">{plant.growth_stage}</span>
                        <span className="text-[10px] text-muted-foreground">{plant.care_actions} care actions</span>
                        {plant.discovered_wildlife && (
                          <span className="text-[10px] text-gold">🦋 {plant.discovered_wildlife}</span>
                        )}
                      </div>
                      {/* Health bar */}
                      <div className="h-1 rounded-full bg-secondary/40 overflow-hidden mt-1.5">
                        <div className="h-full rounded-full" style={{ width: `${plant.health}%`, backgroundColor: 'hsl(120 40% 58%)' }} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleCare(plant.id)}
                      disabled={caring === plant.id}
                      className="p-2 rounded-lg bg-leaf/10 hover:bg-leaf/20 transition-colors disabled:opacity-50"
                    >
                      {caring === plant.id ? <Loader2 className="w-4 h-4 animate-spin text-leaf" /> : <Droplets className="w-4 h-4 text-leaf" />}
                    </button>
                  </div>
                </StaggeredItem>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}