// ═══════════════════════════════════════════════
// PACKAGE REGISTRY (§3) — lifecycle + topological dependency order.
// Circular dependencies refuse startup for the affected subsystem.
// ═══════════════════════════════════════════════

class PackageRegistry {
  constructor() { this.packages = new Map(); this.status = new Map(); }

  register(pkg) {
    this.packages.set(pkg.id, pkg);
    this.status.set(pkg.id, 'REGISTERED');
  }

  /** Topological sort with cycle detection. Cyclic packages are refused. */
  loadOrder() {
    const order = [];
    const marks = new Map(); // id → 'visiting' | 'done' | 'cycle'
    const visit = id => {
      const mark = marks.get(id);
      if (mark === 'done') return true;
      if (mark === 'visiting') { marks.set(id, 'cycle'); return false; }
      const pkg = this.packages.get(id);
      if (!pkg) return true;
      marks.set(id, 'visiting');
      for (const dep of pkg.dependencies || []) {
        if (!visit(dep)) { marks.set(id, 'cycle'); this.status.set(id, 'REFUSED_CIRCULAR'); return false; }
      }
      marks.set(id, 'done');
      order.push(id);
      return true;
    };
    for (const id of this.packages.keys()) visit(id);
    return order;
  }

  async initializeAll(context) {
    for (const id of this.loadOrder()) {
      const pkg = this.packages.get(id);
      if (this.status.get(id) === 'REFUSED_CIRCULAR') continue;
      try {
        await pkg.initialize?.(context);
        await pkg.start?.();
        this.status.set(id, 'RUNNING');
      } catch (error) {
        this.status.set(id, 'FAILED');
        pkg.lastError = error?.message;
      }
    }
  }

  get(id) { return this.status.get(id) === 'RUNNING' ? this.packages.get(id) : null; }
  disable(id) { this.status.set(id, 'DISABLED'); }

  snapshot() {
    return [...this.packages.values()].map(pkg => ({ id: pkg.id, version: pkg.version, dependencies: pkg.dependencies || [], status: this.status.get(pkg.id), lastError: pkg.lastError }));
  }
}

export const packageRegistry = new PackageRegistry();