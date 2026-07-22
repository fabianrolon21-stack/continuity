// ═══════════════════════════════════════════════
// COMPANION BUBBLE (Phase 31 — Living World)
// Ambient speech bubbles where Bison makes gentle,
// optional observations. Never intrusive.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAmbientLine } from '@/lib/world/bisonPresenceController';
import { pickAmbientObservation, detectPatterns } from '@/lib/world/ambientIntelligence';

const BUBBLE_INTERVAL = 45000; // 45 seconds between bubbles

export default function CompanionBubble({ worldState }) {
  const [currentLine, setCurrentLine] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!worldState) return;

    let cancelled = false;

    async function showNext() {
      if (cancelled) return;

      // Don't show during quiet hours
      if (worldState.isQuietHours) {
        setVisible(false);
        return;
      }

      // Try ambient intelligence first (pattern-based)
      try {
        const patterns = await detectPatterns(worldState);
        const observation = pickAmbientObservation(patterns, worldState);
        if (observation) {
          setCurrentLine(observation.observation);
          setVisible(true);
          setTimeout(() => { if (!cancelled) setVisible(false); }, 8000);
          return;
        }
      } catch (e) {}

      // Fall back to world-state-based ambient lines
      const line = generateAmbientLine(worldState, {});
      if (line) {
        setCurrentLine(line);
        setVisible(true);
        setTimeout(() => { if (!cancelled) setVisible(false); }, 7000);
      }
    }

    // Initial delay
    const initialTimer = setTimeout(showNext, 8000);
    const interval = setInterval(showNext, BUBBLE_INTERVAL);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [worldState?.time?.period, worldState?.weather?.current, worldState?.isQuietHours]);

  return (
    <AnimatePresence>
      {visible && currentLine && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 max-w-md px-4"
        >
          <div className="glass rounded-2xl px-5 py-3 shadow-xl border border-gold/20">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🦬</span>
              <p className="text-sm text-foreground/90 leading-relaxed">{currentLine}</p>
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 glass rotate-45 border-b border-r border-gold/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}