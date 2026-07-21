// ═══════════════════════════════════════════════
// AFFECTIVE CONTEXT (Phase 16)
// Conversational signal detection — NOT neurochemical measurement.
// NOT medical diagnosis. NOT clinical assessment.
// Text classification is not brain chemistry.
// ═══════════════════════════════════════════════

export const AROUSAL_SIGNAL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  UNKNOWN: 'UNKNOWN',
};

export const VALENCE_SIGNAL = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
  MIXED: 'MIXED',
  UNKNOWN: 'UNKNOWN',
};

export const SUPPORT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  UNKNOWN: 'UNKNOWN',
};

export const EPISTEMIC_GRADE = {
  WELL_ESTABLISHED: 'WELL_ESTABLISHED',
  EMERGING: 'EMERGING',
  CORRELATIONAL: 'CORRELATIONAL',
};

// ── Conversational signal patterns ──

const STRESS_PATTERNS = [
  /overwhelmed|can't cope|too much to handle|under pressure|stressed out|burning out|drowning|burying me/i,
  /can't handle this|breaking point|at my limit|stretched thin/i,
];

const AROUSAL_HIGH_PATTERNS = [
  /!{2,}/,
  /[A-Z]{6,}/,
  /racing|can't sit still|hyper/i,
];

const AROUSAL_LOW_PATTERNS = [
  /exhausted|drained|no energy|can barely|barely functioning|depleted/i,
];

const POSITIVE_PATTERNS = [
  /happy|great|amazing|wonderful|joyful|grateful|excited|love it|fantastic|really happy/i,
];

const NEGATIVE_PATTERNS = [
  /sad|awful|terrible|miserable|depressed|angry|hate this|frustrated|feeling down/i,
];

// Explicit user-reported states (from language, not inferred neurochemistry)
const USER_REPORTED_PATTERNS = {
  tired: [/tired|exhausted|fatigued|drained|no energy/i],
  unmotivated: [/unmotivated|no motivation|can't motivate|don't want to do anything/i],
  stressed: [/\bstressed\b|\bstress\b|under pressure/i],
  anxious: [/anxious|worried|nervous|panic/i],
  sad: [/\bsad\b|feeling down|depressed|blue/i],
  in_pain: [/in pain|hurting|hurts|painful/i],
  okay: [/i'm okay|i'm fine|i'm alright|doing okay|but i'm okay|but i'm fine/i],
};

function detectUserReportedStates(input) {
  const states = [];
  for (const [state, patterns] of Object.entries(USER_REPORTED_PATTERNS)) {
    if (patterns.some(p => p.test(input))) states.push(state);
  }
  return states;
}

export function interpretAffectiveContext(input, state, embodiedContext) {
  if (!input) return { detected: false };

  const userReportedStates = detectUserReportedStates(input);

  // Arousal — conversational signal
  let arousal = AROUSAL_SIGNAL.UNKNOWN;
  if (AROUSAL_HIGH_PATTERNS.some(p => p.test(input))) arousal = AROUSAL_SIGNAL.HIGH;
  else if (AROUSAL_LOW_PATTERNS.some(p => p.test(input))) arousal = AROUSAL_SIGNAL.LOW;
  else if (state?.emotionIntensity > 0.6) arousal = AROUSAL_SIGNAL.MEDIUM;
  else if (state?.emotionIntensity <= 0.3) arousal = AROUSAL_SIGNAL.LOW;

  // Valence — supports mixed states (e.g. "tired but really happy")
  const hasPositive = POSITIVE_PATTERNS.some(p => p.test(input));
  const hasNegative = NEGATIVE_PATTERNS.some(p => p.test(input));
  let valence = VALENCE_SIGNAL.UNKNOWN;
  if (hasPositive && hasNegative) valence = VALENCE_SIGNAL.MIXED;
  else if (hasPositive) valence = VALENCE_SIGNAL.POSITIVE;
  else if (hasNegative) valence = VALENCE_SIGNAL.NEGATIVE;
  else if (state?.emotionalTone === 'neutral') valence = VALENCE_SIGNAL.NEUTRAL;

  // Stress signals
  const stressSignals = STRESS_PATTERNS.filter(p => p.test(input)).length > 0
    ? ['stress_language']
    : [];

  // Support priority — categorical, not numerical
  const hasExplicitDistress = userReportedStates.includes('anxious')
    || userReportedStates.includes('sad')
    || userReportedStates.includes('stressed');
  const hasOkay = userReportedStates.includes('okay');

  let supportPriority = SUPPORT_PRIORITY.UNKNOWN;

  // "I'm frustrated but I'm okay" — explicit qualification preserved
  if (hasOkay && !hasExplicitDistress) {
    supportPriority = SUPPORT_PRIORITY.LOW;
  } else if (hasExplicitDistress && arousal === AROUSAL_SIGNAL.HIGH) {
    supportPriority = SUPPORT_PRIORITY.HIGH;
  } else if (hasExplicitDistress || (valence === VALENCE_SIGNAL.NEGATIVE && arousal !== AROUSAL_SIGNAL.LOW)) {
    supportPriority = SUPPORT_PRIORITY.MEDIUM;
  } else if (valence === VALENCE_SIGNAL.POSITIVE || valence === VALENCE_SIGNAL.NEUTRAL) {
    supportPriority = SUPPORT_PRIORITY.LOW;
  }

  // Phase 14 integration — physical outcome informs context (not diagnosis)
  if (embodiedContext?.userReportedOutcome === 'EXHAUSTED' || embodiedContext?.userReportedOutcome === 'IN_PAIN') {
    if (supportPriority === SUPPORT_PRIORITY.UNKNOWN) supportPriority = SUPPORT_PRIORITY.LOW;
  }

  // Confidence
  let confidence = 'low';
  if (userReportedStates.length > 0) confidence = 'moderate';
  if (hasExplicitDistress && arousal !== AROUSAL_SIGNAL.UNKNOWN) confidence = 'moderate';

  return {
    detected: true,
    arousalSignal: arousal,
    valenceSignal: valence,
    stressSignals,
    supportPriority,
    userReportedStates,
    confidence,
    provenance: {
      source: 'TEXT_INFERENCE',
      epistemicStatus: 'INFERRED',
      note: 'Conversational signals. Not neurochemical measurements.',
    },
  };
}

// ── Neuroscience knowledge base — small, curated, evidence-graded ──

const NEUROSCIENCE_FACTS = [
  {
    topic: 'dopamine',
    keywords: ['dopamine'],
    explanation: 'Dopamine is involved in several functions including movement, motivation, learning, and reward-related processes. It is not simply a "reward chemical" — it participates in complex, distributed biological systems.',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
  {
    topic: 'serotonin',
    keywords: ['serotonin'],
    explanation: 'Serotonin is involved in mood regulation, sleep, digestion, and other functions. It does not simply "control happiness."',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
  {
    topic: 'cortisol',
    keywords: ['cortisol'],
    explanation: 'Cortisol is a hormone involved in the stress response, metabolism, and immune function. It follows daily rhythms and is not simply a "stress chemical."',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
  {
    topic: 'sleep',
    keywords: ['rem sleep', 'deep sleep', 'sleep stages'],
    explanation: 'Sleep involves multiple stages including REM and non-REM sleep, each serving different functions for memory consolidation, physical recovery, and emotional processing.',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
  {
    topic: 'neuroplasticity',
    keywords: ['neuroplasticity', 'brain plasticity', 'neurons rewire'],
    explanation: 'The brain can reorganize itself by forming new neural connections throughout life. This neuroplasticity underlies learning, recovery, and adaptation.',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
  {
    topic: 'amygdala',
    keywords: ['amygdala'],
    explanation: 'The amygdala is involved in processing emotions, particularly fear and threat detection. It is part of a broader network, not a standalone "fear center."',
    epistemicGrade: EPISTEMIC_GRADE.WELL_ESTABLISHED,
  },
];

const MAX_FACTS = 2;

export function retrieveNeuroscienceKnowledge(input) {
  if (!input) return [];
  const lower = input.toLowerCase();
  const matched = [];
  for (const fact of NEUROSCIENCE_FACTS) {
    if (matched.length >= MAX_FACTS) break;
    if (fact.keywords.some(kw => lower.includes(kw))) {
      matched.push({
        ...fact,
        provenance: { source: 'GENERAL_SCIENCE', epistemicStatus: 'OBSERVED' },
      });
    }
  }
  return matched;
}

export function buildAffectiveContextString(ctx) {
  if (!ctx || !ctx.detected) return '';

  const parts = ['[AFFECTIVE CONTEXT]'];
  if (ctx.userReportedStates && ctx.userReportedStates.length > 0) {
    parts.push(`User explicitly reports: ${ctx.userReportedStates.join(', ')}`);
  }
  if (ctx.stressSignals && ctx.stressSignals.length > 0) {
    parts.push('Conversational signals: stress-related language');
  }
  parts.push(`Support priority: ${ctx.supportPriority} (categorical, not clinical)`);
  parts.push(`Confidence: ${ctx.confidence}`);
  parts.push('Instruction: Use this only to adjust response strategy and tone.');
  parts.push('Do not diagnose. Do not infer neurochemistry.');
  parts.push('[/AFFECTIVE CONTEXT]\n');

  return parts.join('\n') + '\n';
}

export function buildKnowledgeContextString(facts) {
  if (!facts || facts.length === 0) return '';

  const parts = ['[RELEVANT KNOWLEDGE — GENERAL SCIENCE, NOT USER DIAGNOSIS]'];
  for (const fact of facts) {
    parts.push(`Topic: ${fact.topic}`);
    parts.push(`Fact: ${fact.explanation}`);
    parts.push(`Epistemic grade: ${fact.epistemicGrade}`);
  }
  parts.push('Note: This is general educational information, not a claim about the individual user.');
  parts.push('[/RELEVANT KNOWLEDGE]\n');

  return parts.join('\n') + '\n';
}