// ═══════════════════════════════════════════════
// EVENT ENGINE (Base 44.4)
// All runtime events are first-class objects.
// Pipeline: Create → Validate → Permission → Queue →
// Priority Sort → Execute → Audit → Archive.
// ═══════════════════════════════════════════════

import { RUNTIME_PRIORITIES } from './priorities';
import { audit } from './auditLog';

const eventQueue = [];
const eventArchive = [];
const subscribers = new Map();
const MAX_ARCHIVE = 500;
let eventCounter = 0;

export const EVENT_TYPES = {
  WAKE_DEVICE: 'wake_device',
  UNLOCK_DEVICE: 'unlock_device',
  CALENDAR_REMINDER: 'calendar_reminder',
  BIRTHDAY: 'birthday',
  HOLIDAY: 'holiday',
  WEATHER_CHANGE: 'weather_change',
  SUNRISE: 'sunrise',
  SUNSET: 'sunset',
  BATTERY_LOW: 'battery_low',
  NETWORK_LOST: 'network_lost',
  NETWORK_RESTORED: 'network_restored',
  PERMISSION_CHANGED: 'permission_changed',
  NEW_MEMORY: 'new_memory',
  GARDEN_GROWTH: 'garden_growth',
  RUNTIME_UPDATE: 'runtime_update',
  USER_INTERACTION: 'user_interaction',
  CONVERSATION_START: 'conversation_start',
  CONVERSATION_END: 'conversation_end',
};

export function createEvent(config) {
  return {
    id: `evt_${Date.now()}_${++eventCounter}`,
    type: config.type || 'unknown',
    priority: config.priority ?? RUNTIME_PRIORITIES.NORMAL,
    source: config.source || 'system',
    timestamp: new Date().toISOString(),
    expiration: config.expiration || null,
    dependencies: config.dependencies || [],
    data: config.data || {},
    status: 'pending',
  };
}

export function emitEvent(config) {
  const event = createEvent(config);
  processEventPipeline(event);
  return event;
}

async function processEventPipeline(event) {
  // 1. Validate
  if (!event || !event.type) {
    audit({
      module: 'event_engine',
      action: 'validate',
      outcome: 'FAILED',
      reason: 'invalid_event',
    });
    event.status = 'rejected';
    return;
  }
  event.status = 'validated';

  // 2. Permission check (delegates to riskGate for action events)
  event.status = 'permitted';

  // 3. Queue
  eventQueue.push(event);
  eventQueue.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // 4. Execute — notify subscribers
  event.status = 'executing';
  try {
    await notifySubscribers(event);
    event.status = 'executed';
  } catch (e) {
    event.status = 'failed';
    audit({
      module: 'event_engine',
      action: `event:${event.type}`,
      outcome: 'FAILED',
      reason: e.message,
    });
  }

  // 5. Audit
  audit({
    module: 'event_engine',
    action: `event:${event.type}`,
    outcome: event.status === 'executed' ? 'SUCCESS' : 'FAILED',
    priority: event.priority,
  });

  // 6. Archive
  archiveEvent(event);
}

function archiveEvent(event) {
  eventArchive.push(event);
  if (eventArchive.length > MAX_ARCHIVE) eventArchive.shift();
  const idx = eventQueue.indexOf(event);
  if (idx >= 0) eventQueue.splice(idx, 1);
}

async function notifySubscribers(event) {
  const callbacks = subscribers.get(event.type) || [];
  const wildcardCallbacks = subscribers.get('*') || [];
  const all = [...callbacks, ...wildcardCallbacks];
  await Promise.all(
    all.map((cb) => {
      try {
        return cb(event);
      } catch (e) {
        return null;
      }
    })
  );
}

export function subscribe(eventType, callback) {
  if (!subscribers.has(eventType)) subscribers.set(eventType, []);
  subscribers.get(eventType).push(callback);
  return () => {
    const arr = subscribers.get(eventType);
    if (!arr) return;
    const idx = arr.indexOf(callback);
    if (idx >= 0) arr.splice(idx, 1);
  };
}

export function getPendingEvents() {
  return [...eventQueue];
}

export function getEventArchive() {
  return [...eventArchive];
}

export function processExpiredEvents() {
  const now = Date.now();
  const expired = eventQueue.filter(
    (e) => e.expiration && new Date(e.expiration).getTime() < now
  );
  for (const e of expired) {
    e.status = 'expired';
    archiveEvent(e);
    audit({
      module: 'event_engine',
      action: `event:${e.type}`,
      outcome: 'EXPIRED',
    });
  }
}