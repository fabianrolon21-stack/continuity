// ═══════════════════════════════════════════════
// FASEE §6 — UNIFIED INTERCONNECTION LOOP
// One event-driven cycle that keeps self-understanding and agenda
// current, and surfaces staged work.
//
// HONEST LIMITATION: the directive specifies `while (true)` with
// automatic application of code edits. Neither happens. A blocking
// infinite loop would freeze the browser's single thread, so this is
// an interval-driven cycle; and the loop cannot apply edits because
// nothing in this runtime can write to its own source.
// ═══════════════════════════════════════════════

import { buildSelfUnderstanding } from './selfUnderstanding';
import { updateAgenda } from './agencyAgenda';
import { emit, traced } from '@/lib/bison/observability/observabilityBus';

const CYCLE_MS = 300000; // five minutes

class AutonomyLoop {
  constructor() {
    this.timer = null;
    this.lastCycle = null;
    this.cycles = 0;
    this.listeners = [];
  }

  async runCycle() {
    return traced({ subsystem: 'self', event_type: 'autonomy_cycle', constitutional_status: 'PASSED' }, async () => {
      const self = buildSelfUnderstanding();
      const agenda = await updateAgenda();
      this.cycles++;
      this.lastCycle = {
        at: new Date().toISOString(),
        self,
        agenda,
        // Stated every cycle so the boundary never quietly erodes.
        editsApplied: 0,
        editPolicy: 'Bison stages code changes; a human deploys them. This runtime cannot write its own source.',
      };
      this.listeners.forEach(fn => fn(this.lastCycle));
      return this.lastCycle;
    });
  }

  start() {
    if (this.timer) return;
    this.runCycle();
    this.timer = setInterval(() => this.runCycle(), CYCLE_MS);
    emit({ subsystem: 'self', event_type: 'autonomy_loop_started', outcome: 'OK' });
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    emit({ subsystem: 'self', event_type: 'autonomy_loop_stopped', outcome: 'OK' });
  }

  get running() { return !!this.timer; }
  subscribe(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; }
  status() { return { running: this.running, cycles: this.cycles, lastCycle: this.lastCycle }; }
}

export const autonomyLoop = new AutonomyLoop();