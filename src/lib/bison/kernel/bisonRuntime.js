// ═══════════════════════════════════════════════
// BISON RUNTIME (§0) — the one unified runtime all packages plug
// into. Boot: register → topological initialize → health monitor.
// ═══════════════════════════════════════════════

import { buildAdapters } from '@/lib/bison/kernel/adapters';
import { packageRegistry } from '@/lib/bison/kernel/packageRegistry';
import { kernelBus } from '@/lib/bison/kernel/kernelEventBus';
import { stateManager } from '@/lib/bison/kernel/stateManager';
import { contextManager } from '@/lib/bison/kernel/contextManager';
import { permissionManager } from '@/lib/bison/kernel/permissionManager';
import { createPipeline } from '@/lib/bison/kernel/pipeline';
import { startHealthMonitor } from '@/lib/bison/kernel/healthMonitor';
import { BISON_EVENTS, RUNTIME_MODES } from '@/lib/bison/kernel/kernelTypes';

class BisonRuntime {
  constructor() { this.booted = false; }

  async boot() {
    if (this.booted || typeof window === 'undefined') return;
    this.booted = true;
    buildAdapters().forEach(adapter => packageRegistry.register(adapter));
    await packageRegistry.initializeAll({ bus: kernelBus, state: stateManager, permissions: permissionManager });
    this.pipeline = createPipeline({ registry: packageRegistry, bus: kernelBus, stateManager, contextManager });
    this.stopHealth = startHealthMonitor({ registry: packageRegistry, stateManager, bus: kernelBus });
    stateManager.update('runtime', { bootedAt: Date.now() });
  }

  /** The single public entry point — the integration seam every screen can use. */
  async process(input) {
    if (!this.booted) await this.boot();
    return this.pipeline.process(input);
  }

  setMode(mode) {
    if (!RUNTIME_MODES.includes(mode)) return;
    stateManager.update('runtime', { mode });
    kernelBus.publish(BISON_EVENTS.MODE_CHANGED, { mode, reason: 'manual' }, 'runtime');
  }

  snapshot() {
    return {
      runtime: stateManager.get('runtime'),
      packages: packageRegistry.snapshot(),
      permissions: permissionManager.snapshot(),
      recentEvents: kernelBus.recent(12),
      sessionId: contextManager.sessionId,
    };
  }
}

export const bisonRuntime = new BisonRuntime();