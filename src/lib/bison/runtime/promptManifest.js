// ═══════════════════════════════════════════════
// PROMPT MANIFEST (Part IX)
// Replaces huge string concatenation with structured
// sections that carry provenance metadata.
//
// PromptManifest → sections[] → join()
//
// Every section contains:
//   id, priority, dependency, tokens, loaded, reason
// ═══════════════════════════════════════════════

import { estimateTokens, recordTokenEstimate, recordPromptBuildTime } from './runtimeAuthority';

const PRIORITY_ORDER = {
  CRITICAL: 5,
  HIGH: 4,
  NORMAL: 3,
  LOW: 2,
  OPTIONAL: 1,
};

export function createPromptManifest() {
  const sections = [];

  return {
    addSection({ id, priority, dependency, content, reason, tokenCost }) {
      if (!content) return;
      if (typeof content === 'string' && content.trim().length === 0) return;
      const tokens = tokenCost ?? estimateTokens(content);
      sections.push({
        id,
        priority: priority || 'NORMAL',
        dependency: dependency || null,
        tokens,
        loaded: true,
        reason: reason || 'Loaded by planner',
        loadedAt: new Date().toISOString(),
        content,
      });
    },

    build() {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const sorted = [...sections].sort(
        (a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)
      );
      const prompt = sorted.map(s => s.content).join('\n\n');
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
      recordPromptBuildTime(elapsed);
      recordTokenEstimate(this.getTotalTokens());
      return prompt;
    },

    getSections() {
      return sections.map(s => ({
        id: s.id,
        priority: s.priority,
        dependency: s.dependency,
        tokens: s.tokens,
        loaded: s.loaded,
        reason: s.reason,
        loadedAt: s.loadedAt,
      }));
    },

    getTotalTokens() {
      return sections.reduce((sum, s) => sum + s.tokens, 0);
    },

    getSectionCount() {
      return sections.length;
    },
  };
}