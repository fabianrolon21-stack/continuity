import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader } from '@/components/MicroAnimations';
import StoreGrid from '@/components/store/StoreGrid';
import { CARE_ITEMS, PLAY_ITEMS } from '@/lib/sanctuary/storeCatalog';
import { spendTokens } from '@/lib/tokens';
import { Coins } from 'lucide-react';

const TABS = [
  { id: 'care', label: 'Care Store', accent: 'hsl(120 40% 58%)', items: CARE_ITEMS },
  { id: 'play', label: 'Play Store', accent: 'hsl(21 73% 69%)', items: PLAY_ITEMS },
];

export default function Store() {
  const [tab, setTab] = useState('care');
  const [owned, setOwned] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setOwned(u?.owned_items || []);
      setBalance(u?.token_balance || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const buy = async (item) => {
    const res = await spendTokens(item.price, `Purchased ${item.label}`);
    if (!res.ok) return;
    const updated = [...owned, item.id];
    setOwned(updated);
    setBalance(res.balance);
    await base44.auth.updateMe({ owned_items: updated });
  };

  const active = TABS.find(t => t.id === tab);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-muted/30 border-t-muted rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Stores" subtitle="Goods for the sanctuary" accent="hsl(42 63% 55%)" />
      <div className="px-6 lg:px-10 pb-8 space-y-4">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Coins className="w-5 h-5 text-gold" />
          <p className="text-lg font-bold text-gold">{balance}</p>
          <p className="text-xs text-muted-foreground">tokens available</p>
        </div>

        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 text-sm px-3 py-2 rounded-lg transition-all ${tab === t.id ? 'bg-secondary' : 'bg-secondary/30 text-muted-foreground'}`}
              style={tab === t.id ? { color: t.accent } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <StoreGrid items={active.items} owned={owned} balance={balance} onBuy={buy} accent={active.accent} />
      </div>
    </div>
  );
}