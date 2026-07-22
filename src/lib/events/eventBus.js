// ═══════════════════════════════════════════════
// EVENT BUS (Package 011)
// Centralized pub/sub system. Every meaningful action
// becomes an event that flows through this bus.
//
// Flow:
//   Event Bus → Subscribers → Bison → Achievements
//             → Animations → Notifications → Insights → Timeline
// ═══════════════════════════════════════════════

import { createEvent, EVENT_TYPES } from './eventTypes';

const MAX_HISTORY = 100;

class EventBus {
  constructor() {
    this._subscribers = new Map();
    this._history = [];
  }

  // Subscribe to an event type. Returns an unsubscribe function.
  subscribe(eventType, handler) {
    if (!this._subscribers.has(eventType)) {
      this._subscribers.set(eventType, new Set());
    }
    this._subscribers.get(eventType).add(handler);
    return () => this._subscribers.get(eventType)?.delete(handler);
  }

  // Subscribe once — handler is removed after first call.
  once(eventType, handler) {
    const unsubscribe = this.subscribe(eventType, (event) => {
      unsubscribe();
      handler(event);
    });
    return unsubscribe;
  }

  // Publish an event to all subscribers.
  publish(eventType, payload = {}, source = 'unknown') {
    const event = createEvent(eventType, payload, source);

    // Store in bounded history for debugging/timeline
    this._history.unshift(event);
    if (this._history.length > MAX_HISTORY) {
      this._history = this._history.slice(0, MAX_HISTORY);
    }

    // Notify subscribers
    const handlers = this._subscribers.get(eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (e) {
          // Handler errors don't break the bus
          console.error(`[EventBus] Handler error for ${eventType}:`, e);
        }
      }
    }

    return event;
  }

  // Get recent event history (for timeline, debugging)
  getHistory(limit = 20) {
    return this._history.slice(0, limit);
  }

  // Get events of a specific type from history
  getHistoryByType(eventType, limit = 10) {
    return this._history.filter(e => e.type === eventType).slice(0, limit);
  }

  // Clear all subscribers (for testing)
  clear() {
    this._subscribers.clear();
    this._history = [];
  }
}

// Singleton instance — one bus for the entire app
export const eventBus = new EventBus();

// Convenience helper for publishing
export function emit(eventType, payload, source) {
  return eventBus.publish(eventType, payload, source);
}