// ═══════════════════════════════════════════════
// BACKGROUND LAYER (Phase 31 — Living World)
// Now renders the LivingWorld — an animated environment
// driven by time, weather, season, and holidays.
// The app is never frozen.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import LivingWorld from '@/components/world/LivingWorld';
import { autoDetectPerformanceMode } from '@/lib/world/performanceModes';
import { base44 } from '@/api/base44Client';

export default function BackgroundLayer() {
  const [performanceMode, setPerformanceMode] = useState('balanced');
  const [userBirthday, setUserBirthday] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setPerformanceMode(user?.performance_mode || autoDetectPerformanceMode());
      if (user?.birthday) setUserBirthday(user.birthday);
    }).catch(() => {
      setPerformanceMode(autoDetectPerformanceMode());
    });
  }, []);

  return <LivingWorld performanceMode={performanceMode} userBirthday={userBirthday} />;
}