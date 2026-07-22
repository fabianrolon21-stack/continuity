// ═══════════════════════════════════════════════
// BACKGROUND ENGINE HOOK (Package A — Background Engine)
// Combines time-of-day config + decorative layout + parallax state.
// Single hook consumed by BackgroundLayer component.
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { getTimeOfDayConfig } from './timeOfDay';
import { generateDecorativeLayout } from './decorativeElements';

const TIME_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useBackgroundEngine() {
  const [config, setConfig] = useState(() => getTimeOfDayConfig());
  const [decorations, setDecorations] = useState(() =>
    generateDecorativeLayout(getTimeOfDayConfig().iconSet)
  );
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Periodically re-check time of day
  useEffect(() => {
    const interval = setInterval(() => {
      const newConfig = getTimeOfDayConfig();
      setConfig(prev => {
        if (prev.period === newConfig.period) return prev;
        setDecorations(generateDecorativeLayout(newConfig.iconSet, Date.now() % 1000));
        return newConfig;
      });
    }, TIME_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Parallax — mouse (desktop)
  useEffect(() => {
    if (reducedMotion) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x: x * 12, y: y * 8 });  // max 12px, 8px
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Parallax — device orientation (mobile)
  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window.DeviceOrientationEvent === 'undefined') return;

    let rafId = null;

    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = Math.max(-1, Math.min(1, e.gamma / 45));  // -1 to 1
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
        setParallax({ x: x * 8, y: y * 6 });
        rafId = null;
      });
    };

    // iOS 13+ requires permission — attempt silently, don't block
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Permission must be requested from a user gesture — skip auto-request
      return;
    }

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  const requestOrientationPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission !== 'function') return false;
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }, []);

  return {
    config,
    decorations,
    parallax,
    reducedMotion,
    requestOrientationPermission,
  };
}