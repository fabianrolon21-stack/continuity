// ═══════════════════════════════════════════════
// INTERACTION EFFECTS (Package 018 — Section 8)
// Subtle environmental responses to user actions.
// Touch ripple, achievement sparkles, journal page-flip,
// check-in brighten. All tasteful, never distracting.
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emit, eventBus } from '@/lib/events/eventBus';
import { EVENT_TYPES } from '@/lib/events/eventTypes';

export default function InteractionEffects({ reduceMotion = false }) {
  const [ripples, setRipples] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [pageFlip, setPageFlip] = useState(false);
  const [brighten, setBrighten] = useState(false);

  // Touch ripple — any pointer down creates a soft ripple
  useEffect(() => {
    if (reduceMotion) return;
    const handlePointerDown = (e) => {
      const id = `ripple_${Date.now()}`;
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [reduceMotion]);

  // Achievement sparkles
  useEffect(() => {
    if (reduceMotion) return;
    const unsub = eventBus.subscribe(EVENT_TYPES.ACHIEVEMENT_UNLOCKED, () => {
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: `spark_${Date.now()}_${i}`,
        x: 40 + Math.random() * 20,
        y: 30 + Math.random() * 20,
        delay: i * 0.05,
        angle: (Math.PI * 2 * i) / 8,
      }));
      setSparkles(prev => [...prev, ...newSparkles]);
      setTimeout(() => setSparkles([]), 1200);
    });
    return unsub;
  }, [reduceMotion]);

  // Journal page-flip
  useEffect(() => {
    if (reduceMotion) return;
    const unsub = eventBus.subscribe(EVENT_TYPES.JOURNAL_CREATED, () => {
      setPageFlip(true);
      setTimeout(() => setPageFlip(false), 600);
    });
    return unsub;
  }, [reduceMotion]);

  // Check-in brighten
  useEffect(() => {
    if (reduceMotion) return;
    const unsub = eventBus.subscribe(EVENT_TYPES.CHECKIN_COMPLETED, () => {
      setBrighten(true);
      setTimeout(() => setBrighten(false), 1000);
    });
    return unsub;
  }, [reduceMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} aria-hidden="true">
      {/* Touch ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="absolute rounded-full border border-gold/30"
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Achievement sparkles */}
      <AnimatePresence>
        {sparkles.map(s => (
          <motion.div
            key={s.id}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], x: Math.cos(s.angle) * 40, y: Math.sin(s.angle) * 40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: s.delay, ease: 'easeOut' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(42 63% 55%)">
              <path d="M12 2 L13.5 9 L21 10.5 L13.5 12 L12 19 L10.5 12 L3 10.5 L10.5 9 Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Journal page-flip flash */}
      <AnimatePresence>
        {pageFlip && (
          <motion.div
            className="absolute inset-0 bg-gold/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Check-in brighten */}
      <AnimatePresence>
        {brighten && (
          <motion.div
            className="absolute inset-0"
            style={{ background: 'hsl(42 63% 55% / 0.04)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}