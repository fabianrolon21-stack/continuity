// ═══════════════════════════════════════════════
// TOKEN SHOP (Package 018 — Background Store)
// Spend tokens on real environments with unique
// particle effects and ambient sounds. Previewable
// before purchase. Environments layer on top of
// the active theme.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Check, Lock, Cloud, Eye } from 'lucide-react';
import { ENVIRONMENTS } from '@/lib/environment/environmentDefinitions';

export default function TokenShop() {
  const [balance, setBalance] = useState(0);
  const [owned, setOwned] = useState([]);
  const [activeEnv, setActiveEnv] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      setBalance(user?.token_balance || 0);
      setOwned(user?.owned_environments || []);
      setActiveEnv(user?.active_environment || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePurchase = async (env) => {
    if (balance < env.cost || owned.includes(env.id)) return;
    setPurchasing(env.id);
    try {
      await base44.entities.TokenTransaction.create({
        amount: env.cost,
        type: 'spend',
        reason: `Purchased ${env.name} environment`,
      });
      const newOwned = [...owned, env.id];
      await base44.auth.updateMe({
        token_balance: balance - env.cost,
        owned_environments: newOwned,
        active_environment: env.id,
      });
      setBalance(balance - env.cost);
      setOwned(newOwned);
      setActiveEnv(env.id);
    } catch (e) {}
    setPurchasing(null);
  };

  const handleActivate = async (envId) => {
    if (!owned.includes(envId)) return;
    try {
      await base44.auth.updateMe({ active_environment: envId });
      setActiveEnv(envId);
    } catch (e) {}
  };

  if (loading) return null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gold" />
          <h3 className="font-heading font-semibold text-sm text-gold">Environments</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10">
          <span className="text-xs font-bold text-gold">{balance}</span>
          <span className="text-[10px] text-gold/70">tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(ENVIRONMENTS).map(env => {
          const isOwned = owned.includes(env.id);
          const isActive = activeEnv === env.id;
          const canAfford = balance >= env.cost;
          const isPurchasing = purchasing === env.id;
          return (
            <div
              key={env.id}
              className={`rounded-lg p-4 border transition-all cursor-pointer flex flex-col ${isActive ? 'border-2' : 'border border-border/50'}`}
              style={isActive ? { borderColor: env.color } : {}}
              onClick={() => isOwned && handleActivate(env.id)}
            >
              {/* Preview swatch */}
              <div
                className="w-full h-16 rounded-lg mb-3 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${env.color}30, ${env.color}10)` }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, ${env.particleColor}40 2px, transparent 3px), radial-gradient(circle at 70% 60%, ${env.particleColor}30 1px, transparent 2px), radial-gradient(circle at 50% 20%, ${env.particleColor}20 2px, transparent 3px)`,
                  }}
                />
                {isActive && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `${env.color}30`, color: env.color }}>
                    Active
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium" style={{ color: env.color }}>{env.name}</p>
                <span className="text-xs font-bold text-gold">{env.cost}🪙</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">{env.desc}</p>

              {isOwned ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleActivate(env.id); }}
                  disabled={isActive}
                  className={`mt-auto py-2 text-center text-xs font-medium rounded-lg transition-colors ${isActive ? 'bg-leaf/10 text-leaf' : 'bg-secondary/40 text-foreground hover:bg-secondary/60'}`}
                >
                  {isActive ? '✓ Active' : 'Activate'}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePurchase(env); }}
                  disabled={!canAfford || isPurchasing}
                  className={`mt-auto py-2 text-center text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${canAfford && !isPurchasing ? 'bg-gold/15 text-gold hover:bg-gold/25' : 'bg-secondary/30 text-muted-foreground cursor-not-allowed'}`}
                >
                  {isPurchasing ? '...' : canAfford ? <><Lock className="w-3 h-3" /> Unlock</> : `Need ${env.cost - balance} more`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">Environments add atmospheric particles and sounds on top of your active theme. Preview live after activation.</p>
    </div>
  );
}