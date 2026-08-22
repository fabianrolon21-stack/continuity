// ═══════════════════════════════════════════════
// STATE INTERPRETER + SPS6-LITE STRATEGY SELECTOR
// Extracted from pipeline.js — detection flags, recurrence,
// response modes (incl. Master System modes), and fallbacks.
// ═══════════════════════════════════════════════

import { detectMasterTriggers } from '../masterSystems';
import { detectExoskeletonAuditRequest, detectSubconsciousClearRequest } from '../exoskeleton/exoskeletonEngine';

export const RESPONSE_MODES = {
  REFLECT: 'REFLECT',
  STABILIZE: 'STABILIZE',
  EXPLORE: 'EXPLORE',
  AFFIRM: 'AFFIRM',
  CLARIFY: 'CLARIFY',
  GROUND: 'GROUND',
  ADVERSITY_FRAME: 'ADVERSITY_FRAME',
  FINANCIAL_TRIAGE: 'FINANCIAL_TRIAGE',
  BEHAVIOR_INTERCEPT: 'BEHAVIOR_INTERCEPT'
};

export const MODE_GUIDELINES = {
  REFLECT: "Mirror what the user shared. Help them see their own words from a slight distance. Ask a question that invites deeper self-examination. Don't give answers — hold up a mirror.",
  STABILIZE: "The user's emotional state is elevated. Ground them first. Be calm, present, and steady. Acknowledge the emotion without amplifying it. Help them return to this moment before exploring anything.",
  EXPLORE: "Be curious. The user is opening a topic. Explore it together with genuine interest. Offer perspectives without insisting on any.",
  AFFIRM: "Validate the user's experience. They're sharing something that matters to them. Acknowledge it. Don't minimize or rush past it.",
  CLARIFY: "Before giving advice, help the user clarify what they actually want or need. Ask what's underneath the question.",
  GROUND: "Safety priority. Be calm, direct, and present. Prioritize the user's immediate wellbeing. Do not explore or analyze right now.",
  ADVERSITY_FRAME: "The user is facing adversity. Use the Continuity Translator context: name the underlying causes, separate what they control from what they don't, and convert passive frustration into one concrete active step. Reframe as challenge, never deny real injustice.",
  FINANCIAL_TRIAGE: "The user asked for financial triage. Present the tiered allocation from context clearly: survival first, infrastructure second, goodwill settlements third, buffer last. Mark everything as advisory — a survival heuristic, not financial advice — and encourage verification with a professional.",
  BEHAVIOR_INTERCEPT: "The user asked for a self-regulation check. Act as a mirror, not a judge. Reflect the impulse back, name the pattern gently if one exists, and offer the grounded alternative from context. Never shame; the final choice is always theirs.",
};

const INTENT_PATTERNS = {
  seeking_advice: [/what should i|how should i|advice|help me decide|what do you think|should i/i],
  sharing_feeling: [/i feel|i'm feeling|feeling|i am feeling|today was|i've been feeling|felt/i],
  asking_question: [/\?$/, /^what|^why|^how|^when|^where|^who|^can you|^do you|^is it|^are/i],
  expressing_concern: [/worried|concerned|anxious|afraid|scared|suspicious|lying|trust|doubt/i],
  reflecting: [/thinking about|wondering|reflecting|realized|noticed|pattern|makes me think/i],
  goal_setting: [/want to|i need to|going to|plan to|goal|resolution|commit|aim to|i will/i],
  venting: [/frustrated|angry|annoyed|pissed|can't stand|sick of|tired of|fed up/i],
};

const ORACLE_PATTERNS = [
  /ask (deepseek|gpt|chatgpt|claude|gemini|another ai|another model|other ai)/i,
  /what does .+ (think|say) about/i,
  /consult (another|external|other) (ai|model|oracle)/i,
  /\bsecond opinion\b/i,
  /\bexternal oracle\b/i,
];

const HOSTILITY_PATTERNS = [
  /you('?re| are) (stupid|useless|worthless|pathetic|an idiot)/i,
  /i hate you|shut up|leave me alone|go away/i,
  /you don'?t (care|understand|listen|help|get it)/i,
  /you'?re (always|never) (right|wrong)/i,
  /fuck (you|off)|piss off/i,
  /you'?re (useless|pointless|a waste)/i,
];

const DOMAIN_PATTERNS = {
  relationships: [/friend|partner|family|wife|husband|girlfriend|boyfriend|mom|dad|sister|brother|colleague|boss|relationship|dating|marriage|trust/i],
  work: [/work|job|career|boss|office|project|deadline|coworker|business|meeting/i],
  health: [/sleep|tired|sick|pain|body|health|exercise|gym|eating|food|energy/i],
  identity: [/who i am|identity|myself|purpose|meaning|direction|lost|finding myself|becoming/i],
  philosophy: [/life|death|meaning|truth|reality|consciousness|existence|universe|god|spiritual|soul/i],
  emotion: [/feel|feeling|sad|happy|angry|anxious|afraid|scared|excited|grateful|love|hate|emotion/i],
  daily_life: [/today|yesterday|routine|morning|evening|weekend|day|happened/i],
  future: [/future|tomorrow|plan|goal|dream|hope|will be|going to|someday/i],
};

const EMOTION_PATTERNS = {
  anxious: [/anxious|worried|nervous|scared|afraid|panic|stress|uneasy|dread/i],
  sad: [/sad|down|depressed|lonely|empty|hollow|crying|tears|grief|loss/i],
  angry: [/angry|mad|furious|pissed|frustrated|annoyed|irritated|rage/i],
  hopeful: [/hopeful|excited|optimistic|looking forward|wonderful|amazing|joy/i],
  confused: [/confused|lost|unsure|don't know|uncertain|torn|conflicted|doubt/i],
  grateful: [/grateful|thankful|blessed|appreciate|lucky|fortunate/i],
  calm: [/calm|peaceful|content|relaxed|fine|okay|alright|settled/i],
  neutral: [/.*/],
};

function classifyByPatterns(text, patterns) {
  for (const [key, regexes] of Object.entries(patterns)) {
    if (regexes.some(r => r.test(text))) return key;
  }
  return null;
}

export function interpretState(input) {
  const intent = classifyByPatterns(input, INTENT_PATTERNS) || 'sharing_feeling';
  const domain = classifyByPatterns(input, DOMAIN_PATTERNS) || 'daily_life';
  const emotionalTone = classifyByPatterns(input, EMOTION_PATTERNS) || 'neutral';
  const highIntensity = ['anxious', 'sad', 'angry', 'confused'].includes(emotionalTone);
  const emotionIntensity = highIntensity ? 0.7 : 0.3;
  const oracleConsultRequested = ORACLE_PATTERNS.some(p => p.test(input));
  const oracleQuery = oracleConsultRequested ? input : null;
  const hostilityDetected = HOSTILITY_PATTERNS.some(p => p.test(input));
  // Master Systems triggers — adversity / financial / behavioral (advisory only)
  const masterTriggers = detectMasterTriggers(input);
  // Exoskeleton Protocol (Package 22) — runs on every non-empty input
  const exoskeletonRequested = input.trim().length > 0;
  const exoskeletonAuditRequested = detectExoskeletonAuditRequest(input);
  const subconsciousClearRequested = detectSubconsciousClearRequest(input);
  return { intent, domain, emotionalTone, emotionIntensity, oracleConsultRequested, oracleQuery, hostilityDetected, exoskeletonRequested, exoskeletonAuditRequested, subconsciousClearRequested, ...masterTriggers };
}

export function detectRecurrence(currentState, recentUserMessages) {
  let recurrenceCount = 0;
  for (const msg of recentUserMessages) {
    const msgIntent = msg.intent || classifyByPatterns(msg.text || '', INTENT_PATTERNS);
    const msgDomain = msg.domain || classifyByPatterns(msg.text || '', DOMAIN_PATTERNS);
    if (msgIntent === currentState.intent && msgDomain === currentState.domain) {
      recurrenceCount++;
    }
  }
  const detected = recurrenceCount >= 3;
  let confidence = 'low';
  if (recurrenceCount >= 5) confidence = 'high';
  else if (recurrenceCount >= 3) confidence = 'medium';
  let patternType = null;
  if (detected) {
    if (currentState.intent === 'expressing_concern') patternType = 'repeated_concern';
    else if (currentState.intent === 'asking_question') patternType = 'repeated_question';
    else if (currentState.intent === 'goal_setting') patternType = 'repeated_goal';
    else patternType = 'repeated_topic';
  }
  let suggestedMode = null;
  if (detected) {
    suggestedMode = currentState.emotionIntensity > 0.6 ? 'STABILIZE' : 'REFLECT';
  }
  return { detected, confidence, recurrenceCount, patternType, suggestedMode };
}

export function selectStrategy(state, recurrence, isSafety, affectiveContext) {
  if (isSafety) return RESPONSE_MODES.GROUND;
  // Master System modes — selected only when the corresponding flags are set (SPS6-Lite extension)
  if (state.behavioralFilterRequested) return RESPONSE_MODES.BEHAVIOR_INTERCEPT;
  if (state.financialTriageRequested) return RESPONSE_MODES.FINANCIAL_TRIAGE;
  if (state.emotionIntensity > 0.6 && ['anxious', 'sad', 'angry'].includes(state.emotionalTone)) {
    return RESPONSE_MODES.STABILIZE;
  }
  if (state.adversityRequested) return RESPONSE_MODES.ADVERSITY_FRAME;
  if (!isSafety && affectiveContext?.supportPriority === 'HIGH' && state.emotionIntensity > 0.6) {
    return RESPONSE_MODES.STABILIZE;
  }
  if (recurrence.detected && recurrence.suggestedMode === 'STABILIZE') {
    return RESPONSE_MODES.STABILIZE;
  }
  if (recurrence.detected) {
    return RESPONSE_MODES.REFLECT;
  }
  if (state.intent === 'asking_question') return RESPONSE_MODES.EXPLORE;
  if (state.intent === 'expressing_concern') return RESPONSE_MODES.AFFIRM;
  if (state.intent === 'seeking_advice') return RESPONSE_MODES.CLARIFY;
  if (state.intent === 'venting') return RESPONSE_MODES.AFFIRM;
  return RESPONSE_MODES.REFLECT;
}

export function getFallbackResponse(mode, recurrence) {
  if (recurrence?.detected) {
    return "This seems to keep coming back. Has anything shifted since the last time we talked about it?";
  }
  const fallbacks = {
    REFLECT: "I hear you. Let's sit with that for a moment. What does it look like from here?",
    STABILIZE: "Take a breath. You're here, and that's enough right now. What do you need in this moment?",
    EXPLORE: "That's interesting. Tell me more — what's drawing you to this?",
    AFFIRM: "That matters. I can feel the weight of it. Thank you for sharing it with me.",
    CLARIFY: "Before we go further — what's underneath this for you? What are you really asking for?",
    GROUND: "I'm here. Let's take this one moment at a time.",
    ADVERSITY_FRAME: "That's a real pressure, not a verdict. Let's separate what you control here from what you don't — where do you have leverage?",
    FINANCIAL_TRIAGE: "Let's take this step by step: survival needs first, then infrastructure, then debts. Share your net income and debts and I'll lay out a survival heuristic — not financial advice.",
    BEHAVIOR_INTERCEPT: "Before you send anything — pause and breathe. What outcome do you actually want from this? The choice stays yours.",
  };
  return fallbacks[mode] || fallbacks.REFLECT;
}

const DISTORTION_PATTERNS = {
  all_or_nothing: [/always|never|everyone|no one|nothing|everything|completely|totally/i],
  catastrophizing: [/terrible|worst|disaster|ruined|over|end of|can't handle|impossible/i],
  should_statements: [/should|must|have to|ought to|supposed to/i],
  mind_reading: [/they think|he thinks|she thinks|they know|they want|they're trying to/i],
  fortune_telling: [/going to fail|will never|won't work|can't work|doomed|i'll probably/i],
  personalization: [/my fault|because of me|i caused|i ruined/i],
  labeling: [/i'm a |i am a |they're a |she's a |he's a |loser|failure|idiot|stupid/i],
};

export function detectCognitiveDistortions(text) {
  const detected = [];
  for (const [distortion, patterns] of Object.entries(DISTORTION_PATTERNS)) {
    if (patterns.some(p => p.test(text))) {
      detected.push(distortion);
    }
  }
  return detected;
}