// ═══════════════════════════════════════════════
// VOCABULARY ADAPTER (Package 44.5)
// Adapts vocabulary level to the user's technical level.
// Technical user → technical vocab. Casual user → simpler.
// ═══════════════════════════════════════════════

const TECHNICAL_TERMS = /\b(api|code|function|database|query|algorithm|system|architecture|endpoint|compile|runtime|debug|server|client|frontend|backend|deploy|docker|kubernetes|git|sql|json|javascript|python|react|node|bug|error|stack|trace|log|config)\b/i;

const PRECISE_DOMAINS = ['philosophy', 'identity'];
const PROFESSIONAL_DOMAINS = ['work'];

export function adaptVocabulary(userInput, state) {
  if (TECHNICAL_TERMS.test(userInput || '')) return 'technical';
  if (state?.domain && PRECISE_DOMAINS.includes(state.domain)) return 'precise';
  if (state?.domain && PROFESSIONAL_DOMAINS.includes(state.domain)) return 'professional';
  return 'conversational';
}