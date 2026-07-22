// ═══════════════════════════════════════════════
// DECORATIVE ICON (Package A — Background Engine)
// A single low-opacity animated decorative icon.
// Supports float, twinkle, and drift animations.
// All animations respect prefers-reduced-motion.
// ═══════════════════════════════════════════════

import { motion } from 'framer-motion';

const ANIMATION_VARIANTS = {
  float: {
    animate: { y: [0, -8, 0] },
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
  twinkle: {
    animate: { opacity: [0.04, 0.12, 0.04], scale: [1, 1.2, 1] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  drift: {
    animate: { x: [0, 12, 0] },
    transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function DecorativeIcon({ icon: Icon, x, y, size, opacity, depth, animation, animationDelay, animationDuration, parallax, reducedMotion }) {
  const variant = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.float;

  // Parallax offset based on depth — closer icons move more
  const parallaxX = reducedMotion ? 0 : parallax.x * depth;
  const parallaxY = reducedMotion ? 0 : parallax.y * depth;

  const motionProps = reducedMotion
    ? {}
    : {
        animate: variant.animate,
        transition: { ...variant.transition, duration: animationDuration, delay: animationDelay },
      };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        willChange: 'transform',
      }}
      {...motionProps}
    >
      <Icon
        style={{
          width: size,
          height: size,
          opacity,
          filter: 'blur(0.5px)',
        }}
      />
    </motion.div>
  );
}