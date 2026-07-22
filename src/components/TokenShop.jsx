// ═══════════════════════════════════════════════
// TOKEN SHOP (Package S — Token/Background Shop)
// Spend tokens on backgrounds, themes, and
// cosmetic enhancements.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Check, Lock } from 'lucide-react';

const SHOP_ITEMS = [
  { id: 'bg_aurora', name: 'Aurora Background', desc: 'Shifting northern lights', cost: 15, type: 'background', color: 'hsl(120 40% 58%)' },
  { id: 'bg_sunset', name: 'Sunset Background', desc: 'Warm golden hour glow', cost: 15, type: 'background', color: 'hsl(21 73% 69%)' },
  { id: 'bg_ocean', name: 'Ocean Background', desc: 'Deep calming waves', cost: 15, type: 'background', color: 'hsl(199 56% 64%)' },
  { id: 'bg_forest', name: 'Forest Background', desc: 'Misty woodland paths', cost: 20, type: 'background', color: 'hsl(120 40% 58%)' },
  { id: 'bg_cosmic', name: 'Cosmic Background', desc: 'Starfield nebula', cost: 25, type: 'background', color: 'hsl(265 41% 64%)' },
  { id: 'theme_crystal', name: 'Crystal Theme', desc: 'Translucent glass aesthetic', cost: 30, type: 'theme', color: 'hsl(48 67% 74%)' },
  { id: 'theme_ember', name: 'Ember Theme', desc: 'Warm firelit tones', cost: 30, type: 'theme', color: 'hsl(21 73% 69%)' },
  { id: 'theme_depth', name: 'Depth Theme', desc: 'Deep ocean blues', cost: 30, type: 'theme', color: 'hsl(199 56% 64%)' },
];

export default function TokenShop() {
  const [balance, setBalance] = useState(0);
  const [owned, setOwned] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      setBalance(user?.token_balance || 0);
      setOwned(user?.owned_shop_items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePurchase = async (item) => {
    if (balance < item.cost || owned.includes(item.id)) return;
    setPurchasing(item.id);
    try {
      await base44.entities.TokenTransaction.create({
        amount: item.cost,
        type: 'spend',
        reason: `Purchased ${item.name}`,
      });
      const newOwned = [...owned, item.id];
      await base44.auth.updateMe({
        token_balance: balance - item.cost,
        owned_shop_items: newOwned,
      });
      setBalance(balance - item.cost);
      setOwned(newOwned);
    } catch (e) {}
    setPurchasing(null);
  };

  if (loading) return null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gold" />
          <h3 className="font-heading font-semibold text-sm text-gold">Shop</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10">
          <span className="text-xs font-bold text-gold">{balance}</span>
          <span className="text-[10px] text-gold/70">tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SHOP_ITEMS.map(item => {
          const isOwned = owned.includes(item.id);
          const canAfford = balance >= item.cost;
          const isPurchasing = purchasing === item.id;
          return (
            <div
              key={item.id}
              className="rounded-lg p-4 bg-secondary/20 border border-border/50 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  {isOwned ? (
                    <Check className="w-4 h-4" style={{ color: item.color }} />
                  ) : !canAfford ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  )}
                </div>
                <span className="text-xs font-bold text-gold">{item.cost}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: item.color }}>{item.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">{item.desc}</p>

              {isOwned ? (
                <div className="mt-auto py-2 text-center text-xs font-medium text-leaf rounded-lg bg-leaf/10">
                  Owned
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || isPurchasing}
                  className={`mt-auto py-2 text-center text-xs font-medium rounded-lg transition-colors ${
                    canAfford && !isPurchasing
                      ? 'bg-gold/15 text-gold hover:bg-gold/25'
                      : 'bg-secondary/30 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isPurchasing ? '...' : canAfford ? 'Purchase' : `Need ${item.cost - balance} more`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}