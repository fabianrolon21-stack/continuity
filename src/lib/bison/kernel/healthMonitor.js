// ═══════════════════════════════════════════════
// HEALTH MONITOR (§9) — graceful degradation / quiet lighthouse.
// Non-essential failure → package disabled, event logged.
// Core failure → SAFE mode. Bison never fully crashes from one package.
// ═══════════════════════════════════════════════

import { CORE_PACKAGES, BISON_EVENTS } from '@/lib/bison/kernel/kernelTypes';

const CHECK_EVERY_MS = 30000;

export function startHealthMonitor({ registry, stateManager, bus }) {
  const check = () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    let degraded = false;
    for (const info of registry.snapshot()) {
      if (info.status !== 'RUNNING') { if (info.status === 'DISABLED' || info.status === 'FAILED') degraded = true; continue; }
      const pkg = registry.get(info.id);
      try {
        const health = pkg?.healthCheck?.();
        if (health && health.ok === false) throw new Error(health.detail || 'health check failed');
      } catch (error) {
        degraded = true;
        registry.disable(info.id);
        bus.publish(BISON_EVENTS.PACKAGE_ERROR, { package: info.id, error: error.message }, 'healthMonitor');
        if (CORE_PACKAGES.includes(info.id)) {
          stateManager.update('runtime', { mode: 'SAFE', degraded: true });
          bus.publish(BISON_EVENTS.MODE_CHANGED, { mode: 'SAFE', reason: `core package ${info.id} failed` }, 'healthMonitor');
          return;
        }
      }
    }
    if (degraded !== stateManager.get('runtime').degraded) stateManager.update('runtime', { degraded });
  };
  const timer = setInterval(check, CHECK_EVERY_MS);
  check();
  return () => clearInterval(timer);
}