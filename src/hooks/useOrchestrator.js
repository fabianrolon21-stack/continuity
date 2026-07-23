// ═══════════════════════════════════════════════
// USE ORCHESTRATOR — React Hook (Base 44.4)
// Starts the unified runtime on app launch.
// Handles lifecycle, interaction tracking, and
// browser events (visibility, online/offline).
// ═══════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { orchestrator } from '@/lib/bison/runtime';

export function useOrchestrator() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let isActive = true;

    // Start the orchestrator
    import('@/api/base44Client')
      .then(({ base44 }) => base44.auth.me())
      .then((user) => {
        if (!isActive) return;
        orchestrator.startup(user);
      })
      .catch(() => {
        if (!isActive) return;
        orchestrator.startup(null);
      });

    // Track user interactions
    const interactionHandler = () => orchestrator.recordInteraction();
    window.addEventListener('click', interactionHandler);
    window.addEventListener('keydown', interactionHandler);
    window.addEventListener('touchstart', interactionHandler, {
      passive: true,
    });

    // Visibility change — record interaction when returning
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        orchestrator.recordInteraction();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // Network events
    const onlineHandler = () =>
      orchestrator.submitEvent({
        type: 'network_restored',
        source: 'browser',
        priority: 1,
      });
    const offlineHandler = () =>
      orchestrator.submitEvent({
        type: 'network_lost',
        source: 'browser',
        priority: 0,
      });
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // Graceful shutdown
    const shutdownHandler = () => orchestrator.shutdown();
    window.addEventListener('pagehide', shutdownHandler);

    return () => {
      isActive = false;
      window.removeEventListener('click', interactionHandler);
      window.removeEventListener('keydown', interactionHandler);
      window.removeEventListener('touchstart', interactionHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      window.removeEventListener('pagehide', shutdownHandler);
      orchestrator.shutdown();
    };
  }, []);
}