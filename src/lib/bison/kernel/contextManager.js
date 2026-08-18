// ═══════════════════════════════════════════════
// CONTEXT MANAGER (§2, §5) — builds the per-input context and hands
// each subsystem only the state slices it needs.
// ═══════════════════════════════════════════════

import { stateManager } from '@/lib/bison/kernel/stateManager';

const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const contextManager = {
  sessionId,
  build(input) {
    return {
      sessionId,
      input,
      timestamp: Date.now(),
      slice: name => stateManager.get(name),
    };
  },
};