// ═══════════════════════════════════════════════
// BISON CARE (Package L — Food/Water/Feeding)
// Metaphorical care actions: feed, water, rest, play.
// Ties into companionEngine's care action system.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { wakeAndTick, performCareAction } from '@/lib/bison/companionEngine';
import { Apple, Droplets, Moon, Heart, Sparkles } from 'lucide-react';

const CARE_ACTIONS = [
  { id: 'feed', label: 'Feed', icon: Apple, color: 'hsl(120 40% 58%)', desc: 'Nourish with attention' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'hsl(199 56% 64%)', desc: 'Offer clarity' },
  { id: 'rest', label: 'Rest', icon: Moon, color: 'hsl(265 41% 64%)', desc: 'Allow stillness' },
  { id: 'play', label: 'Play', icon: Heart, color: 'hsl(21 73% 69%)', desc: 'Share joy' },
];

export default function BisonCare() {
  const [needs, setNeeds] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wakeAndTick().then(c => {
      setNeeds(c.needsState);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCare = async (actionId) => {
    try {
      const updated = await performCareAction(actionId);
      setNeeds(updated);
      setLastAction(actionId);
      setTimeout(() => setLastAction(null), 2000);
    } catch (e) {}
  };

  if (loading) return null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="font-heading font-semibold text-sm text-gold">Care for Bison</h3>
      </div>

      {needs && (
        <div className="space-y-2 mb-4">
          {Object.entries(needs).map(([key, val]) => {
            if (typeof val !== 'number') return null;
            const pct = Math.min(100, Math.max(0, val));
            return (
              <div key={key}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${pct}%`, opacity: pct < 30 ? 0.5 : 1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {CARE_ACTIONS.map(action => {
          const Icon = action.icon;
          const isActive = lastAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => handleCare(action.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${isActive ? 'scale-105' : 'bg-secondary/30 hover:bg-secondary/50'}`}
              style={isActive ? { backgroundColor: `${action.color}20`, border: `1px solid ${action.color}` } : {}}
            >
              <Icon className="w-5 h-5" style={{ color: action.color }} />
              <span className="text-xs font-medium" style={{ color: action.color }}>{action.label}</span>
              <span className="text-[9px] text-muted-foreground">{action.desc}</span>
            </button>
          );
        })}
      </div>

      {lastAction && (
        <p className="text-center text-xs text-gold mt-3 animate-pulse-soft">
          Bison received your care.
        </p>
      )}
    </div>
  );
}