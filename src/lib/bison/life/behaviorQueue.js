// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — BEHAVIOR QUEUE (§9, §22)
// Autonomous, user, and system requests never fight over the
// animation controller. Priority decides, and everything has
// a defined exit path back into normal behavior.
// ═══════════════════════════════════════════════

export class BehaviorQueue {
  constructor() { this.items = []; }

  /** @param {{id,priority,source,durationMs,returnState,expiresAt}} request */
  push(request) {
    this.items.push({ ...request, queuedAt: Date.now() });
    this.items.sort((a, b) => b.priority - a.priority || (a.sequence ?? 0) - (b.sequence ?? 0) || a.queuedAt - b.queuedAt);
    return request;
  }

  /** Highest-priority non-expired request. */
  take(now = Date.now()) {
    this.items = this.items.filter(i => !i.expiresAt || i.expiresAt > now);
    const index = this.items.findIndex(i => !i.notBefore || i.notBefore <= now);
    return index === -1 ? null : this.items.splice(index, 1)[0];
  }

  /** Does anything outrank what is currently running? */
  outranks(currentPriority, now = Date.now()) {
    this.items = this.items.filter(i => !i.expiresAt || i.expiresAt > now);
    const ready = this.items.find(i => !i.notBefore || i.notBefore <= now);
    return !!ready && ready.priority > currentPriority;
  }

  clear() { this.items = []; }
  get pending() { return this.items.length; }
}