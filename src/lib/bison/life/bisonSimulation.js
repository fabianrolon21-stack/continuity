// ═══════════════════════════════════════════════
// CONTINUOUS LIFE — BISON SIMULATION (§1, §3, §10, §11, §12, §18)
// The single source of truth for what Bison is doing.
// It runs whether or not any screen is showing him: the renderer
// decides visibility, the simulation decides behavior, and the two
// are never coupled. You visit Bison; you do not activate him.
// ═══════════════════════════════════════════════

import { BEHAVIORS } from '@/lib/sanctuary/bisonBehavior';
import { getDef, PRIORITY, MICRO_BEHAVIORS, timeOfDay } from './behaviorRegistry';
import { selectBehavior } from './behaviorSelector';
import { BehaviorQueue } from './behaviorQueue';
import { loadState, saveState, advanceStats, applyStats, nudgePersonality, rememberActivity, defaultState } from './bisonState';
import { getPresence, initPresence, shouldGreet, idleForMs } from './playerPresence';
import { computeWorldState } from '@/lib/world/worldStateEngine';
import { eventBus } from '@/lib/events/eventBus';
import { audioEngine } from '@/lib/ambiance/audioEngine';

const TICK_MS = 1000;
const SAVE_EVERY_MS = 20000;
const COOLDOWN_AFTER = 1200; // §4 — brief cooldown before deciding again

// §18 — how app events translate into Bison's inner life.
const CARE_EFFECTS = {
  feed: { stats: { hunger: -35, happiness: 8, energy: 6 }, behavior: BEHAVIORS.EAT, trait: 'affection', memory: 'lastFedAt' },
  water: { stats: { thirst: -40, happiness: 5 }, behavior: BEHAVIORS.DRINK, memory: 'lastFedAt' },
  play: { stats: { happiness: 16, loneliness: -22, energy: -8, affection: 8 }, behavior: BEHAVIORS.PLAY, trait: 'playfulness', memory: 'lastPlayedAt' },
  pet: { stats: { affection: 14, loneliness: -18, happiness: 10 }, behavior: BEHAVIORS.LOOK_AT_USER, trait: 'affection', memory: 'lastPettedAt' },
  rest: { stats: { energy: 22, happiness: 4 }, behavior: BEHAVIORS.SLEEP, memory: 'lastPettedAt' },
  talk: { stats: { loneliness: -14, happiness: 6 }, behavior: BEHAVIORS.LOOK_AT_USER, trait: 'sociability', memory: 'lastSpokenToAt' },
};

class BisonSimulation {
  constructor() {
    this.state = defaultState();
    this.behavior = BEHAVIORS.IDLE;
    this.behaviorSource = 'autonomous';
    this.behaviorPriority = PRIORITY.IDLE;
    this.behaviorUntil = 0;
    this.micro = null;
    this.nextMicroAt = 0;
    this.history = [];      // §6 — recent behavior history
    this.cooldowns = {};
    this.queue = new BehaviorQueue();
    this.sceneHold = false; // a scripted care scene owns the body
    this.digest = [];       // what happened while you were away
    this.lastSaveAt = 0;
    this.started = false;
    this.timer = null;
    this.listeners = [];
    this.decisionCount = 0;
  }

  // ─── lifecycle ───
  start() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    initPresence();
    this.state = loadState();

    // §28 — resume from elapsed time rather than freezing where we left off.
    this.resume();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.resume();
      else this.pause();
    });

    eventBus.subscribe('BISON_CARE_ACTION', (e) => {
      this.handleInteraction(e.payload?.action, e.payload?.prop);
    });

    this.runLoop();
  }

  runLoop() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  // §12 — no animation loop in the background; only elapsed-time math.
  pause() {
    clearInterval(this.timer);
    this.timer = null;
    this.state.lastSimulationTimestamp = Date.now();
    saveState(this.state);
  }

  resume() {
    const elapsed = Date.now() - (this.state.lastSimulationTimestamp || Date.now());
    if (elapsed > 60000) this.advance(elapsed);
    this.state.lastSimulationTimestamp = Date.now();
    if (!this.timer) this.runLoop();
    this.emit();
  }

  /** Advance the simulation by an arbitrary elapsed span. */
  advance(elapsedMs) {
    const world = computeWorldState();
    const { stats, digest } = advanceStats(this.state, elapsedMs, { isNight: world.sky.isNight });
    this.state.stats = stats;
    this.digest = digest;
    // Decide fresh on return rather than resuming a stale behavior.
    this.behaviorUntil = 0;
    this.history = [];
    this.emit();
    return digest;
  }

  // ─── the decide → execute → complete → cooldown cycle (§4) ───
  tick() {
    const now = Date.now();
    const world = computeWorldState();
    const presence = getPresence();

    this.driftNeeds(now);

    // Micro-behaviors keep tiny signs of life running under everything (§7).
    if (presence.isBisonVisible && now >= this.nextMicroAt) {
      this.micro = MICRO_BEHAVIORS[Math.floor(Math.random() * MICRO_BEHAVIORS.length)];
      this.nextMicroAt = now + 2500 + Math.random() * 5000;
      this.emit();
    }

    // A queued higher-priority request interrupts what is running (§9, §22).
    if (!this.sceneHold && this.queue.outranks(this.behaviorPriority, now)) {
      const req = this.queue.take(now);
      if (req) return this.execute(req.id, req.durationMs, req.priority, req.source);
    }

    if (this.sceneHold || now < this.behaviorUntil) return;

    // Completed → cooldown → decide again.
    const req = this.queue.take(now);
    if (req) return this.execute(req.id, req.durationMs, req.priority, req.source);

    // §16 — Bison may notice you arriving, but only on a cooldown.
    if (presence.isBisonVisible && idleForMs(now) < 4000 && this.state.stats.energy > 30 && shouldGreet(now)) {
      return this.execute(BEHAVIORS.LOOK_AT_USER, 4000, PRIORITY.CURIOSITY, 'autonomous');
    }

    const choice = selectBehavior({
      now,
      stats: this.state.stats,
      personality: this.state.personality,
      history: this.history,
      cooldowns: this.cooldowns,
      isNight: world.sky.isNight,
      weather: world.weather.current,
      isBisonVisible: presence.isBisonVisible,
      musicPlaying: audioEngine.isPlaying,
    });
    this.decisionCount++;
    this.execute(choice.behavior, choice.durationMs + COOLDOWN_AFTER, choice.priority, 'autonomous');
  }

  execute(id, durationMs, priority, source) {
    const def = getDef(id);
    this.behavior = id;
    this.behaviorPriority = priority;
    this.behaviorSource = source;
    this.behaviorUntil = Date.now() + durationMs;
    this.history = [{ behaviorId: id, timestamp: Date.now() }, ...this.history].slice(0, 12);
    if (def?.cooldown) this.cooldowns[id] = Date.now() + def.cooldown;
    // Every behavior has a return path — nothing can play once and stick (§9).
    this.returnState = def?.returnState || BEHAVIORS.IDLE;
    this.emit();
  }

  driftNeeds(now) {
    if (now - (this._lastDrift || 0) < 15000) return;
    this._lastDrift = now;
    const asleep = this.behavior === BEHAVIORS.SLEEP || this.behavior === BEHAVIORS.DOZE;
    this.state.stats = applyStats(this.state.stats, {
      hunger: 0.25, thirst: 0.3,
      energy: asleep ? 0.6 : -0.2,
      loneliness: getPresence().isBisonVisible ? -0.3 : 0.15,
    });
    if (now - this.lastSaveAt > SAVE_EVERY_MS) {
      this.lastSaveAt = now;
      this.state.lastSimulationTimestamp = now;
      saveState(this.state);
    }
  }

  // ─── §10, §23 — every interaction enters the same behavior system ───
  handleInteraction(action, prop) {
    const effect = CARE_EFFECTS[action];
    if (!effect) return null;

    this.state.stats = applyStats(this.state.stats, effect.stats);
    if (effect.trait) this.state.personality = nudgePersonality(this.state.personality, effect.trait, 0.008);
    this.state.interactionMemory = rememberActivity(
      { ...this.state.interactionMemory, [effect.memory]: Date.now() },
      prop || action,
    );
    saveState(this.state);

    // Requested, not forced: it enters the queue at user priority, so it
    // works while wandering, looking away, sleeping, or mid-idle.
    this.queue.push({
      id: effect.behavior,
      priority: PRIORITY.USER_INTERACTION,
      source: 'user',
      durationMs: 6000,
      expiresAt: Date.now() + 15000,
    });
    return effect;
  }

  /** §18/§22 — system celebrations outrank user and autonomous behavior. */
  celebrate(durationMs = 5000) {
    this.state.stats = applyStats(this.state.stats, { happiness: 12 });
    this.queue.push({ id: 'celebrate', priority: PRIORITY.EMOTIONAL_EVENT, source: 'system', durationMs, expiresAt: Date.now() + 20000 });
  }

  /** A scripted care scene temporarily owns the body; autonomous life pauses. */
  beginScene() { this.sceneHold = true; this.emit(); }
  endScene() { this.sceneHold = false; this.behaviorUntil = 0; this.emit(); }

  // Debug forcing (§25)
  force(id, durationMs = 8000) {
    this.queue.clear();
    this.sceneHold = false;
    this.execute(id, durationMs, PRIORITY.EMERGENCY, 'system');
  }
  reset() { this.state = defaultState(); saveState(this.state); this.history = []; this.cooldowns = {}; this.queue.clear(); this.force(BEHAVIORS.IDLE, 2000); }

  snapshot() {
    return {
      behavior: this.behavior,
      micro: this.micro,
      source: this.behaviorSource,
      priority: this.behaviorPriority,
      msUntilDecision: Math.max(0, this.behaviorUntil - Date.now()),
      stats: { ...this.state.stats },
      personality: { ...this.state.personality },
      memory: { ...this.state.interactionMemory },
      history: this.history.map(h => h.behaviorId),
      queued: this.queue.pending,
      timeOfDay: timeOfDay(),
      sceneHold: this.sceneHold,
      decisions: this.decisionCount,
      digest: this.digest,
      returnState: this.returnState,
      active: !!this.timer,
    };
  }

  subscribe(fn) {
    this.listeners.push(fn);
    fn(this.snapshot());
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  emit() {
    const snap = this.snapshot();
    this.listeners.forEach(fn => { try { fn(snap); } catch {} });
  }
}

export const bisonSimulation = new BisonSimulation();
bisonSimulation.start();