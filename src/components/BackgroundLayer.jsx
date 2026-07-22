// ═══════════════════════════════════════════════
// BACKGROUND LAYER (Package A — Background Engine)
// Fixed full-screen background rendered behind all content.
// Renders 3 layers: gradient, decorative icons, time-of-day glow.
// ═══════════════════════════════════════════════

import { useBackgroundEngine } from '@/lib/ambiance/backgroundEngine';
import DecorativeIcon from '@/components/DecorativeIcon';

export default function BackgroundLayer() {
  const { config, decorations, parallax, reducedMotion } = useBackgroundEngine();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Layer 1: Dark gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${config.gradient.from} 0%, ${config.gradient.to} 100%)`,
          transition: 'background 2s ease-in-out',
        }}
      />

      {/* Layer 2: Decorative icons with parallax */}
      <div
        className="absolute inset-0"
        style={{
          filter: config.blur !== '0px' ? `blur(${config.blur})` : 'none',
          transition: 'filter 2s ease-in-out',
        }}
      >
        {decorations.map(dec => (
          <DecorativeIcon
            key={dec.id}
            icon={dec.icon}
            x={dec.x}
            y={dec.y}
            size={dec.size}
            opacity={dec.opacity}
            depth={dec.depth}
            animation={dec.animation}
            animationDelay={dec.animationDelay}
            animationDuration={dec.animationDuration}
            parallax={parallax}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Layer 3: Time-of-day ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${config.glowPosition.x} ${config.glowPosition.y}, ${config.glowColor}12 0%, transparent 50%)`,
          transition: 'background 2s ease-in-out',
        }}
      />

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(268 20% 5% / 0.4) 100%)',
        }}
      />
    </div>
  );
}