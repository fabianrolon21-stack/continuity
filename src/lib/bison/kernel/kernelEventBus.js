// ═══════════════════════════════════════════════
// KERNEL EVENT BUS (§4) — the sole communication backbone.
// Subsystems never call each other; they publish events the kernel routes.
// Kernel events are mirrored onto the legacy app bus for existing UI.
// ═══════════════════════════════════════════════

import { eventBus as legacyBus } from '@/lib/events/eventBus';

class KernelEventBus {
  constructor() {
    this.subscribers = new Map(); // type (or '*') → Set<fn>
    this.history = [];
  }

  publish(type, payload, source, sessionId) {
    const event = { id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, timestamp: Date.now(), sessionId: sessionId || 'boot', source: source || 'kernel', payload };
    this.history = [event, ...this.history].slice(0, 200);
    for (const key of [type, '*']) {
      for (const handler of this.subscribers.get(key) || []) {
        try { handler(event); } catch {}
      }
    }
    try { legacyBus.publish(`KERNEL:${type}`, payload, source || 'kernel'); } catch {}
    return event;
  }

  subscribe(type, handler) {
    if (!this.subscribers.has(type)) this.subscribers.set(type, new Set());
    this.subscribers.get(type).add(handler);
    return () => this.subscribers.get(type)?.delete(handler);
  }

  recent(limit = 20) { return this.history.slice(0, limit); }
}

export const kernelBus = new KernelEventBus();