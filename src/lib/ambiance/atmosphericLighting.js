// ═══════════════════════════════════════════════
// ATMOSPHERIC LIGHTING (Base 44.5)
// Dynamically shifts interface CSS custom properties
// (background, card, border, glow) based on the
// current local time of day. Runs on a 60-second
// heartbeat and writes vars to document root.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { computeWorldState, TIME_PERIODS } from '@/lib/world/worldStateEngine';

const CHECK_INTERVAL = 60000; // 1 minute

// Each profile provides HSL triplets (no hsl() wrapper)
// and complete glow CSS values for the time period.
const ATMOSPHERIC_PROFILES = {
  [TIME_PERIODS.DAWN]: {
    background: '270 18% 9%',
    card: '270 16% 13%',
    secondary: '270 12% 17%',
    border: '270 12% 20%',
    glowShadow: '0 0 20px hsl(280 35% 60% / 0.10), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(280 35% 60% / 0.08)',
  },
  [TIME_PERIODS.MORNING]: {
    background: '268 16% 11%',
    card: '268 14% 15%',
    secondary: '268 10% 19%',
    border: '268 10% 23%',
    glowShadow: '0 0 20px hsl(42 70% 60% / 0.15), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(42 70% 60% / 0.10)',
  },
  [TIME_PERIODS.AFTERNOON]: {
    background: '268 16% 10%',
    card: '268 14% 14%',
    secondary: '268 10% 18%',
    border: '268 10% 22%',
    glowShadow: '0 0 20px hsl(42 63% 55% / 0.08), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(42 63% 55% / 0.10)',
  },
  [TIME_PERIODS.GOLDEN_HOUR]: {
    background: '275 18% 9%',
    card: '275 16% 13%',
    secondary: '275 12% 17%',
    border: '275 12% 20%',
    glowShadow: '0 0 20px hsl(30 80% 55% / 0.18), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(30 80% 55% / 0.12)',
  },
  [TIME_PERIODS.EVENING]: {
    background: '278 18% 8%',
    card: '278 16% 12%',
    secondary: '278 12% 16%',
    border: '278 12% 19%',
    glowShadow: '0 0 20px hsl(21 73% 60% / 0.14), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(21 73% 60% / 0.10)',
  },
  [TIME_PERIODS.DUSK]: {
    background: '272 20% 7%',
    card: '272 18% 11%',
    secondary: '272 14% 15%',
    border: '272 14% 18%',
    glowShadow: '0 0 20px hsl(285 35% 58% / 0.10), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(285 35% 58% / 0.08)',
  },
  [TIME_PERIODS.NIGHT]: {
    background: '268 22% 6%',
    card: '268 20% 10%',
    secondary: '268 16% 14%',
    border: '268 14% 17%',
    glowShadow: '0 0 20px hsl(265 41% 64% / 0.08), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(265 41% 64% / 0.08)',
  },
  [TIME_PERIODS.LATE_NIGHT]: {
    background: '268 24% 4%',
    card: '268 22% 8%',
    secondary: '268 18% 12%',
    border: '268 16% 15%',
    glowShadow: '0 0 20px hsl(260 30% 50% / 0.05), 0 4px 24px hsl(268 16% 5% / 0.4)',
    glowBorder: 'hsl(260 30% 50% / 0.06)',
  },
};

const DEFAULT_PROFILE = ATMOSPHERIC_PROFILES[TIME_PERIODS.AFTERNOON];

export function useAtmosphericLighting({ userBirthday = null, enabled = true } = {}) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const apply = () => {
      const ws = computeWorldState({ userBirthday });
      const p = ATMOSPHERIC_PROFILES[ws.time.period] || DEFAULT_PROFILE;
      setProfile(p);
      const root = document.documentElement;
      root.style.setProperty('--background', p.background);
      root.style.setProperty('--card', p.card);
      root.style.setProperty('--secondary', p.secondary);
      root.style.setProperty('--border', p.border);
      root.style.setProperty('--atmospheric-glow-shadow', p.glowShadow);
      root.style.setProperty('--atmospheric-glow-border', p.glowBorder);
    };

    apply();
    const interval = setInterval(apply, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [userBirthday, enabled]);

  return profile;
}