// ═══════════════════════════════════════════════
// CONVERSATION MODE ENGINE (Package 44.5)
// Selects a communication style mode based on user input.
// 95% of chats should land in CASUAL or NORMAL.
// ═══════════════════════════════════════════════

const MODE_STYLES = {
  CASUAL: {
    targetWords: 40,
    allowHeaders: false,
    allowBullets: false,
    allowQuestions: false,
    allowMetaphors: false,
    vocabulary: 'simple',
  },
  NORMAL: {
    targetWords: 100,
    allowHeaders: false,
    allowBullets: false,
    allowQuestions: true,
    allowMetaphors: false,
    vocabulary: 'conversational',
  },
  ANALYSIS: {
    targetWords: 400,
    allowHeaders: true,
    allowBullets: true,
    allowQuestions: true,
    allowMetaphors: false,
    vocabulary: 'precise',
  },
  DEEP_REFLECTION: {
    targetWords: 200,
    allowHeaders: false,
    allowBullets: false,
    allowQuestions: true,
    allowMetaphors: true,
    vocabulary: 'reflective',
  },
  EMERGENCY: {
    targetWords: 50,
    allowHeaders: false,
    allowBullets: false,
    allowQuestions: false,
    allowMetaphors: false,
    vocabulary: 'simple',
  },
  TEACHING: {
    targetWords: 300,
    allowHeaders: true,
    allowBullets: true,
    allowQuestions: false,
    allowMetaphors: true,
    vocabulary: 'educational',
  },
  TECHNICAL: {
    targetWords: 200,
    allowHeaders: true,
    allowBullets: true,
    allowQuestions: false,
    allowMetaphors: false,
    vocabulary: 'technical',
  },
};

const CASUAL_PATTERNS = /^(hi|hey|hello|sup|yo|hiya|howdy|thanks|thank you|cool|ok|okay|sure|nice|awesome|got it|makes sense|right|yep|nope|lol|haha)\b/i;
const TECHNICAL_PATTERNS = /\b(api|code|function|database|query|algorithm|system|architecture|endpoint|compile|runtime|debug|server|client|frontend|backend|deploy|docker|kubernetes|git|sql|json|javascript|python|react|node|bug|error|stack|trace|log)\b/i;
const TEACHING_PATTERNS = /\b(what is|what are|explain|how does|how do|teach|tutorial|guide|learn|understand|concept|difference between)\b/i;
const ANALYSIS_PATTERNS = /\b(analyz|break down|systemic|deconstruct|assess|evaluate|framework|audit|diagnos|root cause|map out)\b/i;

export function selectConversationMode(userInput, state, options = {}) {
  const { affectiveContext } = options;
  const input = (userInput || '').toLowerCase().trim();
  const wordCount = (userInput || '').split(/\s+/).filter(Boolean).length;

  if (affectiveContext?.supportPriority === 'HIGH' && state.emotionIntensity > 0.7) {
    return { mode: 'EMERGENCY', styleParams: MODE_STYLES.EMERGENCY };
  }

  if (CASUAL_PATTERNS.test(input) || wordCount <= 3) {
    return { mode: 'CASUAL', styleParams: MODE_STYLES.CASUAL };
  }

  if (TECHNICAL_PATTERNS.test(input)) {
    return { mode: 'TECHNICAL', styleParams: MODE_STYLES.TECHNICAL };
  }

  if (TEACHING_PATTERNS.test(input) && state.intent === 'asking_question') {
    return { mode: 'TEACHING', styleParams: MODE_STYLES.TEACHING };
  }

  if (ANALYSIS_PATTERNS.test(input)) {
    return { mode: 'ANALYSIS', styleParams: MODE_STYLES.ANALYSIS };
  }

  if (state.domain === 'identity' || state.domain === 'philosophy') {
    return { mode: 'DEEP_REFLECTION', styleParams: MODE_STYLES.DEEP_REFLECTION };
  }

  return { mode: 'NORMAL', styleParams: MODE_STYLES.NORMAL };
}

export function buildConversationModeContextString(conversationMode) {
  if (!conversationMode) return '';
  const { mode, styleParams: s } = conversationMode;
  const rules = [`CONVERSATION MODE: ${mode}`];
  if (!s.allowHeaders) rules.push('No headers.');
  if (!s.allowBullets) rules.push('No bullet points. Use paragraphs.');
  if (!s.allowQuestions) rules.push('Do not end with questions.');
  if (!s.allowMetaphors) rules.push('No metaphors or poetic language.');
  rules.push(`Target: ~${s.targetWords} words.`);
  rules.push(`Vocabulary: ${s.vocabulary}.`);
  return rules.join(' ');
}

export const NATURAL_CONVERSATION_RULES = `NATURAL CONVERSATION RULES:
- Never use em dashes or en dashes. Use commas or periods.
- Do not start sentences with "You are [verb]ing..." Address the topic directly.
- Do not narrate thought process. Just answer. Only acknowledge emotion when the user is emotional.
- Do not use poetic metaphors ("mirror," "forest," "canopy") unless in DEEP REFLECTION mode.
- Use headers only if explanation exceeds 300 words or user asked for analysis. Otherwise paragraphs.
- Prefer paragraphs over bullets. Use bullets only for lists of 3+ distinct items.
- Scale personality to input. "Hi" gets "Hey. Good to see you." Not philosophy.
- Vary sentence openings. Do not start every response with "You" or "I" or "It sounds like."
- Vary sentence lengths. Short. Then longer. Then short again. Avoid uniform long sentences.
- Do not end with "What do you think?" or "Does that resonate?" unless the question genuinely advances the conversation.
- Say "I don't know" or "I'm not confident about that" when appropriate. Imperfection builds trust.
- Do not say "I hear you" or "I see" or "I recognize" unless the user is sharing something emotional.
- Use simple, direct language. Avoid corporate tone, generic AI phrases, and over-formalization.`;