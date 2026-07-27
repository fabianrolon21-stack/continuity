// ═══════════════════════════════════════════════
// DEPTH CONTROLLER (Package 44.5)
// Estimates desired response length from input + mode.
// Simple question → simple answer. Only go long if
// the user clearly wants depth.
// ═══════════════════════════════════════════════

export function estimateDepth(userInput, conversationMode) {
  if (!conversationMode) return { targetWords: 100, note: 'Answer directly.' };

  const mode = conversationMode.mode;
  const wordCount = (userInput || '').split(/\s+/).filter(Boolean).length;

  if (mode === 'CASUAL') {
    return { targetWords: 30, note: 'Keep it brief and natural.' };
  }
  if (mode === 'EMERGENCY') {
    return { targetWords: 50, note: 'Be direct and grounding.' };
  }
  if (mode === 'TECHNICAL') {
    return { targetWords: 180, note: 'Be precise and concise.' };
  }
  if (mode === 'TEACHING') {
    return { targetWords: 300, note: 'Explain clearly with examples.' };
  }
  if (mode === 'ANALYSIS') {
    return { targetWords: 400, note: 'Structure with headers if needed.' };
  }
  if (mode === 'DEEP_REFLECTION') {
    return { targetWords: 200, note: 'Be thoughtful but not excessive.' };
  }
  // NORMAL
  if (wordCount <= 10) {
    return { targetWords: 60, note: 'Short answer. Only go long if the user clearly wants depth.' };
  }
  return { targetWords: 100, note: 'Answer directly. Only go long if the user clearly wants depth.' };
}