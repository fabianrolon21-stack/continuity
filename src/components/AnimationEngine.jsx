// ═══════════════════════════════════════════════
// ANIMATION ENGINE (Package T — Animations)
// Reusable animation presets and enhanced
// micro-interactions for the Continuity app.
// ═══════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════
// PAGE TRANSITION WRAPPER
// ═══════════════════════════════════════════════

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// STAGGERED LIST — for rendering lists with entrance
// ═══════════════════════════════════════════════

export function StaggeredItem({ children, index = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// CELEBRATION BURST — for achievements/milestones
// ═══════════════════════════════════════════════

export function CelebrationBurst({ show, color = 'hsl(42 63% 55%)' }) {
  const particles = Array.from({ length: 12 });
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((_, i) => {
            const angle = (i / particles.length) * Math.PI * 2;
            const dist = 80 + Math.random() * 60;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════
// TAP FEEDBACK — ripple on tap for touch targets
// ═══════════════════════════════════════════════

export function TapFeedback({ children, className = '', color = 'hsl(42 63% 55%)' }) {
  const [ripples, setRipples] = useState([]);

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  return (
    <div
      onClick={handleTap}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: r.x - 20,
            top: r.y - 20,
            width: 40,
            height: 40,
            backgroundColor: color,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MORPHING ORB — ambient breathing visual
// ═══════════════════════════════════════════════

export function MorphingOrb({ size = 120, color = 'hsl(42 63% 55%)', active = true }) {
  if (!active) return null;
  return (
    <motion.div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
        border: `1px solid ${color}30`,
      }}
      animate={{
        scale: [1, 1.08, 1],
        borderRadius: ['50%', '48% 52% 50% 50%', '50%'],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ═══════════════════════════════════════════════
// FADE IN ON MOUNT
// ═══════════════════════════════════════════════

export function FadeIn({ children, delay = 0, duration = 0.3, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE IN PANEL
// ═══════════════════════════════════════════════

export function SlideInPanel({ show, children, side = 'bottom' }) {
  const initial = side === 'bottom' ? { y: '100%' } : side === 'right' ? { x: '100%' } : { x: '-100%' };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={initial}
          animate={{ x: 0, y: 0 }}
          exit={initial}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}