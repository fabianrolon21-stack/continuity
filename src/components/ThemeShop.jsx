// ═══════════════════════════════════════════════
// THEME SHOP (Package C — Theme Engine)
// UI component for browsing and purchasing themes.
// Can be embedded in Settings or shown as a modal.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { THEMES, setActiveTheme, purchaseTheme } from '@/lib/ambiance/themeEngine';
import { Palette, Coins, Check, Lock } from 'lucide-react';

export default function ThemeShop({ onPurchase }) {
  const [activeTheme, setActiveThemeState] = useState('classic');
  const [purchasedThemes, setPurchasedThemes] = useState(['classic']);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setActiveThemeState(u?.active_theme || 'classic');
      setPurchasedThemes(u?.purchased_themes || ['classic']);
      setTokenBalance(u?.token_balance || 0);
    }).catch(() => {});
  }, []);

  const handleSelect = async (themeId) => {
    if (!purchasedThemes.includes(themeId)) return;
    await setActiveTheme(themeId);
    setActiveThemeState(themeId);
  };

  const handlePurchase = async (themeId) => {
    setPurchasing(themeId);
    const result = await purchaseTheme(themeId);
    if (result.success) {
      setPurchasedThemes(prev => [...prev, themeId]);
      setActiveThemeState(themeId);
      setTokenBalance(result.newBalance);
      onPurchase?.(result);
    }
    setPurchasing(null);
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-purple-accent" />
        <h3 className="font-heading font-semibold text-sm text-purple-accent">Themes</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(THEMES).map(theme => {
          const owned = purchasedThemes.includes(theme.id);
          const isActive = activeTheme === theme.id;
          const canAfford = tokenBalance >= theme.cost;

          return (
            <div
              key={theme.id}
              className={`rounded-lg p-4 border transition-all cursor-pointer ${
                isActive ? 'border-2' : 'border border-border'
              }`}
              style={isActive ? { borderColor: theme.color } : {}}
              onClick={() => handleSelect(theme.id)}
            >
              {/* Theme preview swatch */}
              <div className="flex gap-1.5 mb-3">
                {Object.values(theme.tokens).slice(0, 5).map((val, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ background: `hsl(${val})` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={isActive ? { color: theme.color } : {}}>{theme.label}</p>
                  {owned ? (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {isActive ? <Check className="w-3 h-3 text-leaf" /> : null}
                      {isActive ? 'Active' : 'Owned'}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Coins className="w-3 h-3 text-gold" />
                      {theme.cost} tokens
                    </p>
                  )}
                </div>
                {!owned && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePurchase(theme.id); }}
                    disabled={!canAfford || purchasing === theme.id}
                    className={`text-[10px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      canAfford
                        ? 'bg-gold/15 text-gold hover:bg-gold/25'
                        : 'bg-secondary/30 text-muted-foreground/50'
                    }`}
                  >
                    {purchasing === theme.id ? '...' : (<><Lock className="w-3 h-3" /> Unlock</>)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">Themes are purchased with interaction tokens. No fiat currency — only your journey.</p>
    </div>
  );
}