// ═══════════════════════════════════════════════
// DECORATIVE PATTERN LAYER (Package 018 — Layer 2)
// Floating Nintendo-inspired motifs. Extremely low opacity,
// randomized spacing, varied size, gentle float animation,
// optional parallax. Icons appear to float above the background.
// ═══════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DECORATIVE_ICONS, getThemeProperties } from '@/lib/environment/themeProperties';

const ICON_COUNTS = { high: 28, balanced: 18, battery_saver: 6, minimal: 0 };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateLayout(iconNames, count, seed = 42) {
  if (!iconNames?.length || count === 0) return [];
  const rand = mulberry32(seed);
  const layout = [];
  for (let i = 0; i < count; i++) {
    const name = iconNames[Math.floor(rand() * iconNames.length)];
    const size = 14 + Math.floor(rand() * 18);
    layout.push({
      id: `motif_${i}`,
      iconName: name,
      x: rand() * 100,
      y: rand() * 100,
      size,
      opacity: 0.03 + rand() * 0.08,
      depth: 0.3 + rand() * 0.5,
      delay: rand() * 5,
      duration: 5 + rand() * 7,
    });
  }
  return layout;
}

export default function DecorativePatternLayer({
  themeId = 'classic',
  performanceMode = 'balanced',
  disableDecorativePatterns = false,
  reduceMotion = false,
}) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const props = getThemeProperties(themeId);
  const count = disableDecorativePatterns ? 0 : (ICON_COUNTS[performanceMode] ?? 18);
  const layout = useMemo(
    () => generateLayout(props.decorativeIcons, count, themeId.charCodeAt(0) * 1000 + count),
    [themeId, count]
  );

  useEffect(() => {
    if (reduceMotion || disableDecorativePatterns) return;
    if (performanceMode === 'minimal' || performanceMode === 'battery_saver') return;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return;
    let rafId = null;
    const handleMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x: x * 10, y: y * 7 });
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => { window.removeEventListener('mousemove', handleMove); if (rafId) cancelAnimationFrame(rafId); };
  }, [reduceMotion, disableDecorativePatterns, performanceMode]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -8 }} aria-hidden="true">
      {layout.map((item) => {
        const Icon = DECORATIVE_ICONS[item.iconName] || DECORATIVE_ICONS.sparkle;
        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(${parallax.x * item.depth}px, ${parallax.y * item.depth}px)`,
              transition: 'transform 0.4s ease-out',
              opacity: item.opacity,
            }}
          >
            <motion.div
              animate={reduceMotion ? {} : { y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{
                y: { duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
                rotate: { duration: item.duration * 1.3, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
              }}
            >
              <Icon style={{ width: item.size, height: item.size, color: props.particleColor }} strokeWidth={1.5} />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}