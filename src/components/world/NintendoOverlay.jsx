// ═══════════════════════════════════════════════
// NINTENDO-STYLE OVERLAY (Phase 31 — Living World)
// Decorative logo watermark + repeating pattern
// with soft glow, sitting on top of the sky gradient.
// Inspired by Nintendo's playful, glowing design language.
// ═══════════════════════════════════════════════

import { motion } from 'framer-motion';

export default function NintendoOverlay({ performanceMode = 'balanced' }) {
  const isMinimal = performanceMode === 'minimal' || performanceMode === 'battery_saver';
  if (isMinimal) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Central logo watermark with glow */}
      <motion.div
        className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            filter: [
              'drop-shadow(0 0 20px hsl(42 63% 55% / 0.3))',
              'drop-shadow(0 0 40px hsl(42 63% 55% / 0.5))',
              'drop-shadow(0 0 20px hsl(42 63% 55% / 0.3))',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LogoMark />
        </motion.div>
      </motion.div>

      {/* Repeating dot pattern — subtle texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(40 20% 92% / 0.03) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating star sparkles */}
      {!isMinimal && (
        <div className="absolute inset-0">
          {STAR_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              animate={{
                opacity: [0, pos.peak, 0],
                scale: [0.5, 1.2, 0.5],
                y: [0, -12, 0],
              }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: pos.delay,
                ease: 'easeInOut',
              }}
            >
              <StarSparkle color={pos.color} size={pos.size} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Corner glow auras */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(42 63% 55% / 0.06) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(265 41% 64% / 0.05) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// LOGO MARK — the "Continuity" seal
// A circular emblem with concentric rings + center diamond
// ═══════════════════════════════════════════════

function LogoMark() {
  return (
    <svg width="280" height="280" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="90" stroke="hsl(42 63% 55%)" strokeWidth="2" opacity="0.5" />
      {/* Inner ring */}
      <circle cx="100" cy="100" r="72" stroke="hsl(42 63% 55%)" strokeWidth="1.5" opacity="0.4" />
      {/* Diamond shape */}
      <path
        d="M100 50 L130 100 L100 150 L70 100 Z"
        stroke="hsl(42 63% 55%)"
        strokeWidth="2"
        fill="hsl(42 63% 55% / 0.1)"
        opacity="0.6"
      />
      {/* Center dot */}
      <circle cx="100" cy="100" r="8" fill="hsl(42 63% 55%)" opacity="0.5" />
      {/* Radiating lines */}
      <line x1="100" y1="10" x2="100" y2="25" stroke="hsl(42 63% 55%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="100" y1="175" x2="100" y2="190" stroke="hsl(42 63% 55%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="10" y1="100" x2="25" y2="100" stroke="hsl(42 63% 55%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="175" y1="100" x2="190" y2="100" stroke="hsl(42 63% 55%)" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// ═══════════════════════════════════════════════
// STAR SPARKLE — small twinkling accent
// ═══════════════════════════════════════════════

function StarSparkle({ color, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 L13.5 9 L21 10.5 L13.5 12 L12 19 L10.5 12 L3 10.5 L10.5 9 Z"
        fill={color}
        opacity="0.6"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════
// STAR POSITIONS — pre-computed for stable layout
// ═══════════════════════════════════════════════

const STAR_COLORS = [
  'hsl(42 63% 55%)',
  'hsl(48 67% 74%)',
  'hsl(265 41% 64%)',
  'hsl(199 56% 64%)',
  'hsl(120 40% 58%)',
];

const STAR_POSITIONS = [
  { x: 15, y: 20, size: 10, color: STAR_COLORS[0], duration: 4, delay: 0, peak: 0.5 },
  { x: 82, y: 15, size: 14, color: STAR_COLORS[1], duration: 5, delay: 1.2, peak: 0.4 },
  { x: 25, y: 70, size: 8, color: STAR_COLORS[2], duration: 3.5, delay: 0.8, peak: 0.6 },
  { x: 70, y: 60, size: 12, color: STAR_COLORS[3], duration: 4.5, delay: 2, peak: 0.45 },
  { x: 50, y: 85, size: 10, color: STAR_COLORS[4], duration: 5.5, delay: 1.5, peak: 0.4 },
  { x: 90, y: 75, size: 8, color: STAR_COLORS[0], duration: 4, delay: 2.5, peak: 0.5 },
  { x: 8, y: 45, size: 12, color: STAR_COLORS[1], duration: 5, delay: 0.3, peak: 0.45 },
  { x: 60, y: 30, size: 9, color: STAR_COLORS[2], duration: 3.8, delay: 1.8, peak: 0.55 },
  { x: 40, y: 55, size: 11, color: STAR_COLORS[3], duration: 4.2, delay: 2.8, peak: 0.4 },
  { x: 78, y: 40, size: 8, color: STAR_COLORS[4], duration: 4.8, delay: 0.6, peak: 0.5 },
];