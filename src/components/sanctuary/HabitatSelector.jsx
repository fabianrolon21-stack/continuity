import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { HABITATS } from '@/lib/sanctuary/habitats';
import { checkAchievements } from '@/lib/bison/achievementEngine';
import { Lock, Check, Coins } from 'lucide-react';

export default function HabitatSelector({ config, tokenBalance, onUpdate }) {
  const [busy, setBusy] = useState(null);
  if (!config) return null;
  const unlocked = config.unlocked_habitats || ['prairie'];

  const select = async (id) => {
    if (config.habitat === id) return;
    const cfg = { ...config, habitat: id };
    onUpdate(cfg, null);
    try { await base44.auth.updateMe({ sanctuary_config: cfg }); } catch (e) {}
  };

  const unlock = async (h) => {
    if (tokenBalance < h.cost || busy) return;
    setBusy(h.id);
    const cfg = { ...config, habitat: h.id, unlocked_habitats: [...unlocked, h.id] };
    const newBalance = tokenBalance - h.cost;
    try {
      await base44.auth.updateMe({ sanctuary_config: cfg, token_balance: newBalance });
      try { await base44.entities.TokenTransaction.create({ amount: -h.cost, type: 'spend', reason: `Unlocked ${h.name} habitat` }); } catch (e) {}
      checkAchievements({ unlockedHabitats: cfg.unlocked_habitats }).catch(() => {});
      onUpdate(cfg, newBalance);
    } catch (e) {}
    setBusy(null);
  };

  return (
    <div className="glass framed rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm text-leaf">Habitats</h3>
        <span className="flex items-center gap-1 text-xs text-gold"><Coins className="w-3 h-3" /> {tokenBalance}</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
        {Object.values(HABITATS).map(h => {
          const isUnlocked = unlocked.includes(h.id);
          const isActive = config.habitat === h.id;
          const canAfford = tokenBalance >= h.cost;
          return (
            <button
              key={h.id}
              onClick={() => isUnlocked ? select(h.id) : unlock(h)}
              disabled={(!isUnlocked && !canAfford) || busy === h.id}
              className={`shrink-0 w-28 rounded-xl p-3 text-left framed transition-all no-tap-highlight ${
                isActive ? 'ring-1 ring-gold/50' : ''
              } ${!isUnlocked && !canAfford ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              style={{ background: h.wall }}
            >
              <div className="w-full h-10 rounded-lg mb-2 relative overflow-hidden" style={{ background: `linear-gradient(to top, ${h.floor}, ${h.wall})` }}>
                <div className="absolute bottom-0 inset-x-0 h-2" style={{ background: h.grass }} />
                {isActive && <Check className="absolute top-1 right-1 w-3 h-3 text-gold" />}
                {!isUnlocked && <Lock className="absolute top-1 right-1 w-3 h-3 text-white/50" />}
              </div>
              <p className="text-[11px] font-medium text-white/85">{h.name}</p>
              <p className="text-[9px] text-white/45 leading-tight mt-0.5 line-clamp-2">{h.description}</p>
              {!isUnlocked && (
                <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: canAfford ? 'hsl(42 63% 55%)' : 'hsl(0 0% 60%)' }}>
                  <Coins className="w-2.5 h-2.5" /> {h.cost}{canAfford ? ' — unlock' : ''}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}