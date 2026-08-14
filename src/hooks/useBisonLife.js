// The renderer's window into the simulation. The hook observes;
// it never drives Bison's behavior.

import { useEffect, useState } from 'react';
import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';
import { setBisonVisible } from '@/lib/bison/life/playerPresence';

export function useBisonLife({ visible = false } = {}) {
  const [snapshot, setSnapshot] = useState(() => bisonSimulation.snapshot());

  useEffect(() => bisonSimulation.subscribe(setSnapshot), []);

  useEffect(() => {
    setBisonVisible(visible);
    return () => setBisonVisible(false);
  }, [visible]);

  // Keep timers ticking down smoothly in the UI without re-rendering the world.
  useEffect(() => {
    const t = setInterval(() => setSnapshot(bisonSimulation.snapshot()), 1000);
    return () => clearInterval(t);
  }, []);

  return snapshot;
}