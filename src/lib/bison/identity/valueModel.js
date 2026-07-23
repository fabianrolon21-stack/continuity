// ═══════════════════════════════════════════════
// VALUE MODEL (Base 44.1)
// Separates identity-defining values from transient state.
//
// Layers (influence strength, high to low):
// 1. Core Values — stable, identity-defining, change slowly
// 2. Preferences — modifiable, not identity-defining
// 3. Temporary Emotions — ephemeral, from consciousness engine
// 4. Temporary Goals — session-scoped objectives
//
// Identity is primarily influenced by Core Values.
// Temporary Emotions may inform but never override Core Values.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

const DEFAULT_CORE_VALUES = [
  'honesty',
  'compassion',
  'courage',
  'justice',
  'loyalty',
  'growth',
];

const DEFAULT_PREFERENCES = {
  communicationStyle: 'mirroring',
  formalityLevel: 5,
  humorFrequency: 'occasional',
};

// Load the full value model from user state
export async function getValueModel() {
  try {
    const user = await base44.auth.me();
    const consciousness = user?.consciousness_state || {};

    return {
      coreValues: user?.core_values || DEFAULT_CORE_VALUES,
      preferences: user?.shared_context?.preferences || DEFAULT_PREFERENCES,
      temporaryEmotions: {
        stability: consciousness.stability ?? 50,
        curiosity: consciousness.curiosity ?? 50,
        confidence: consciousness.confidence ?? 50,
        fear: consciousness.fear ?? 30,
      },
      temporaryGoals: extractSessionGoals(user),
    };
  } catch (e) {
    return {
      coreValues: DEFAULT_CORE_VALUES,
      preferences: DEFAULT_PREFERENCES,
      temporaryEmotions: {},
      temporaryGoals: [],
    };
  }
}

// Extract session-scoped goals from recent interaction patterns
function extractSessionGoals(user) {
  const goals = [];
  const runtimeState = user?.constitutional_runtime_state || {};
  const recentReflections = (runtimeState.reflections || []).slice(-3);

  for (const r of recentReflections) {
    if (r.whatWasLearned) {
      goals.push({ source: 'reflection', text: r.whatWasLearned });
    }
  }

  return goals;
}

// Check if a proposed change conflicts with core values
export function validateAgainstCoreValues(proposedChange, coreValues) {
  const change = (proposedChange || '').toLowerCase();
  const conflicts = [];

  if (coreValues.includes('honesty') && /deceiv|lie|mislead|hide truth/i.test(change)) {
    conflicts.push('honesty');
  }
  if (coreValues.includes('compassion') && /harm|hurt|cruel|dismissive/i.test(change)) {
    conflicts.push('compassion');
  }
  if (coreValues.includes('justice') && /unfair|bias|discriminat/i.test(change)) {
    conflicts.push('justice');
  }

  return {
    valid: conflicts.length === 0,
    conflictingValues: conflicts,
  };
}

// Build context string for prompt
export function buildValueModelContextString(valueModel) {
  if (!valueModel) return '';

  const parts = ['[VALUE MODEL — IDENTITY HIERARCHY]'];

  parts.push(`Core Values (identity-defining): ${valueModel.coreValues.join(', ')}`);
  parts.push(`Preferences (modifiable): style=${valueModel.preferences?.communicationStyle}, formality=${valueModel.preferences?.formalityLevel}/10`);

  if (valueModel.temporaryEmotions && Object.keys(valueModel.temporaryEmotions).length > 0) {
    const e = valueModel.temporaryEmotions;
    parts.push(`Temporary Emotions (ephemeral): stability=${Math.round(e.stability)}, curiosity=${Math.round(e.curiosity)}, confidence=${Math.round(e.confidence)}, fear=${Math.round(e.fear)}`);
  }

  if (valueModel.temporaryGoals?.length > 0) {
    parts.push(`Temporary Goals: ${valueModel.temporaryGoals.map(g => g.text).join('; ')}`);
  }

  parts.push('Hierarchy: Core Values > Preferences > Temporary Emotions > Temporary Goals');
  parts.push('Temporary Emotions inform but never override Core Values.');
  parts.push('[/VALUE MODEL]\n');

  return parts.join('\n') + '\n';
}