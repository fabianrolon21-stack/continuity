// ═══════════════════════════════════════════════
// PATTERN MEMORY (Patch 40.9)
// Remembers BEHAVIOR, never identity.
// "Repeated communication delays" — not "he manipulates".
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { applyEthicalFilter } from './ethicalLanguageFilter';

export async function recordBehaviorPattern(patternText) {
  return base44.entities.SavedMemory.create({
    text: applyEthicalFilter(patternText),
    epistemic_status: 'OBSERVED',
    origin: 'Dendritic Framework — repeated behavior pattern',
    confidence: 'medium',
    permission_scope: 'PERSISTENT',
    verification_state: 'OBSERVED',
    tags: ['behavior_pattern'],
  });
}

export async function getBehaviorPatterns(limit = 5) {
  try {
    return await base44.entities.SavedMemory.filter({ tags: 'behavior_pattern' }, '-created_date', limit);
  } catch (e) {
    return [];
  }
}