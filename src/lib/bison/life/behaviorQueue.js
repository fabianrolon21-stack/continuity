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
    this.items.sort((a, b) => b.priority - a.priority || a.queuedAt - b.queuedAt);
    return request;
  }

  /** Highest-priority non-expired request. */
  take(now = Date.now()) {
    this.items = this.items.filter(i => !i.expiresAt || i.expiresAt > now);
    return this.items.shift() || null;
  }

  /** Does anything outrank what is currently running? */
  outranks(currentPriority, now = Date.now()) {
    this.items = this.items.filter(i => !i.expiresAt || i.expiresAt > now);
    return this.items.length > 0 && this.items[0].priority > currentPriority;
  }

  clear() { this.items = []; }
  get pending() { return this.items.length; }
}