// ═══════════════════════════════════════════════
// PERFORMANCE MODE SELECTOR (Phase 31 — Living World)
// Lets the user choose animation density: High, Balanced,
// Battery Saver, or Minimal. Persists to user settings.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getAllPerformanceModes, autoDetectPerformanceMode } from '@/lib/world/performanceModes';
import { Gauge, ChevronDown, Check } from 'lucide-react';

export default function PerformanceModeSelector({ currentMode, onChange }) {
  const [mode, setMode] = useState(currentMode || 'balanced');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!currentMode) {
      // Try to load from user settings, or auto-detect
      base44.auth.me().then(user => {
        const saved = user?.performance_mode || autoDetectPerformanceMode();
        setMode(saved);
        onChange?.(saved);
      }).catch(() => {
        const auto = autoDetectPerformanceMode();
        setMode(auto);
        onChange?.(auto);
      });
    } else {
      setMode(currentMode);
    }
  }, [currentMode]);

  async function selectMode(newMode) {
    setMode(newMode);
    setOpen(false);
    onChange?.(newMode);
    try {
      await base44.auth.updateMe({ performance_mode: newMode });
    } catch (e) {}
  }

  const modes = getAllPerformanceModes();
  const currentConfig = modes.find(m => m.key === mode) || modes[1];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Gauge className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentConfig.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 glass rounded-xl shadow-2xl border border-border w-64 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground">Performance Mode</p>
                <p className="text-[10px] text-muted-foreground">Controls animation density</p>
              </div>
              {modes.map(m => (
                <button
                  key={m.key}
                  onClick={() => selectMode(m.key)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent/10 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{m.description}</p>
                  </div>
                  {m.key === mode && (
                    <Check className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}