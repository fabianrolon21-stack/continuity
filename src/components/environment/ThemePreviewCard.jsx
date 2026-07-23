// ═══════════════════════════════════════════════
// THEME PREVIEW CARD (Package 018 — Sections 2/3)
// Mini preview of a theme or environment showing
// gradient, decorative icons, and particle hints.
// Used by ThemeShop and TokenShop for previewing
// before purchase.
// ═══════════════════════════════════════════════

import { DECORATIVE_ICONS, getThemeProperties } from '@/lib/environment/themeProperties';
import { THEMES } from '@/lib/ambiance/themeEngine';

export default function ThemePreviewCard({
  themeId,
  environmentId = null,
  isActive = false,
  isOwned = false,
  cost = 0,
  label,
  color,
  onClick,
}) {
  const props = getThemeProperties(themeId);
  const theme = THEMES[themeId];
  const previewIcons = props.decorativeIcons.slice(0, 4);

  const bgFrom = theme?.tokens?.['--background'] || '268 16% 10%';
  const bgTo = theme?.tokens?.['--card'] || '268 14% 14%';

  return (
    <div
      className="relative rounded-xl overflow-hidden border transition-all cursor-pointer h-28"
      style={{
        borderColor: isActive ? color : 'hsl(268 10% 22%)',
        borderWidth: isActive ? 2 : 1,
      }}
      onClick={onClick}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(${bgFrom}), hsl(${bgTo}))`,
        }}
      />

      {/* Decorative icons preview */}
      <div className="absolute inset-0">
        {previewIcons.map((iconName, i) => {
          const Icon = DECORATIVE_ICONS[iconName] || DECORATIVE_ICONS.sparkle;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 22}%`,
                top: `${20 + (i % 2) * 40}%`,
                opacity: 0.12,
              }}
            >
              <Icon style={{ width: 20, height: 20, color }} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Particle hint */}
      {props.particleType && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: props.particleColor, opacity: 0.5, boxShadow: `0 0 6px ${props.particleColor}` }}
        />
      )}

      {/* Label and cost */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between" style={{ background: 'hsl(0 0% 0% / 0.4)', backdropFilter: 'blur(4px)' }}>
        <span className="text-xs font-medium truncate" style={{ color: 'hsl(40 20% 92%)' }}>{label}</span>
        {isOwned ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}30`, color }}>✓</span>
        ) : (
          <span className="text-[10px] font-medium" style={{ color: 'hsl(42 63% 55%)' }}>{cost}🪙</span>
        )}
      </div>
    </div>
  );
}