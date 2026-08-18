// ═══════════════════════════════════════════════
// STATE MANAGER (§2) — one canonical BisonState object.
// Subsystems receive and write only their own slice.
// ═══════════════════════════════════════════════

const SLICES = ['runtime', 'context', 'emotions', 'introspection', 'epistemic', 'continuity', 'resources', 'finances', 'legal', 'security', 'privacy', 'decisions', 'social', 'memory', 'ui'];

class StateManager {
  constructor() {
    this.state = Object.fromEntries(SLICES.map(slice => [slice, {}]));
    this.state.runtime = { mode: 'FULL', degraded: false, bootedAt: null, disabledPackages: [] };
    this.listeners = new Set();
  }

  get(slice) { return slice ? this.state[slice] : this.state; }

  update(slice, patch) {
    if (!SLICES.includes(slice)) return;
    this.state = { ...this.state, [slice]: { ...this.state[slice], ...patch, updatedAt: Date.now() } };
    this.listeners.forEach(listener => { try { listener(this.state); } catch {} });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
}

export const stateManager = new StateManager();