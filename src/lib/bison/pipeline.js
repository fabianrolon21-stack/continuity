import { base44 } from '@/api/base44Client';
import { interpretEmbodiedContext, buildEmbodiedContextString } from './embodiedContext';
import { wakeAndTick, detectCareAction, performCareAction, generateSelfModel, formatSelfModelForPrompt, evaluateUITrigger } from './companionEngine';
import { interpretAffectiveContext, buildAffectiveContextString, retrieveNeuroscienceKnowledge, buildKnowledgeContextString } from './affectiveContext';
import { extractActionRequest, processActionRequest, buildActionResultString, MAX_TOOL_ROUNDS } from './actionEngine';
import { trackWellbeing, generateSimulatedAffectiveState, buildProtectionContextString } from './protectionEngine';
import { detectThreats, getImmuneResponse, buildImmuneContextString } from './immuneSystem';
import { retrieveKnowledge, buildKnowledgeContextString as buildCuratedKnowledgeString } from './knowledgeCore';
import { detectSynthesisRequest, runSynthesis, buildInsightContextString } from './insightEngine';
import { getIdentityContext, trackConsequence, buildIdentityContextString } from './identityKernel';
import { validateAction, buildConstitutionalContextString } from './constitutionalKernel';
import { retrieveEcologicalKnowledge, interpretAnimalSignals, detectStagnation, buildEcologicalContextString } from './ecologicalContext';
import { getTemporalContext, buildWorldAwarenessString } from './worldAwareness';
import { getUserAdaptation, buildAdaptationContextString } from './userAdaptation';
import { analyzeFairness, buildFairnessContextString } from './fairnessEngine';
import { buildAutonomyContextString } from './betaAutonomyController';
import { buildCognitiveContext, buildCognitiveContextString } from './cognitiveContext';
import { createTrustEvent, TRUST_EVENTS } from './trustScoreCalculator';
import { loadConsciousnessState, processMemory, classifyInteractionResult, buildConsciousnessContextString } from './consciousnessEngine';
import { buildHumorContextString } from './reflectiveHumor';
import { classifyData, redactPII } from './privacyIsolation';
import { classifyEvent } from './eventRegistry';

// ═══════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════

export const RESPONSE_MODES = {
  REFLECT: 'REFLECT',
  STABILIZE: 'STABILIZE',
  EXPLORE: 'EXPLORE',
  AFFIRM: 'AFFIRM',
  CLARIFY: 'CLARIFY',
  GROUND: 'GROUND'
};

export const EPISTEMIC_STATUS = {
  OBSERVED: 'OBSERVED',
  INFERRED: 'INFERRED',
  PREDICTED: 'PREDICTED',
  USER_CONFIRMED: 'USER_CONFIRMED',
  UNKNOWN: 'UNKNOWN'
};

const MODE_GUIDELINES = {
  REFLECT: "Mirror what the user shared. Help them see their own words from a slight distance. Ask a question that invites deeper self-examination. Don't give answers — hold up a mirror.",
  STABILIZE: "The user's emotional state is elevated. Ground them first. Be calm, present, and steady. Acknowledge the emotion without amplifying it. Help them return to this moment before exploring anything.",
  EXPLORE: "Be curious. The user is opening a topic. Explore it together with genuine interest. Offer perspectives without insisting on any.",
  AFFIRM: "Validate the user's experience. They're sharing something that matters to them. Acknowledge it. Don't minimize or rush past it.",
  CLARIFY: "Before giving advice, help the user clarify what they actually want or need. Ask what's underneath the question.",
  GROUND: "Safety priority. Be calm, direct, and present. Prioritize the user's immediate wellbeing. Do not explore or analyze right now.",
};

// ═══════════════════════════════════════════════
// COMPUTE MODES — graceful degradation
// ═══════════════════════════════════════════════

export const COMPUTE_MODES = {
  FULL: 'FULL',
  REDUCED: 'REDUCED',
  LOCAL_CONTINUITY: 'LOCAL_CONTINUITY',
  ARCHIVE: 'ARCHIVE',
};

export function getComputeMode(options = {}) {
  if (options.incident_mode || options.force_local) return COMPUTE_MODES.LOCAL_CONTINUITY;
  return COMPUTE_MODES.FULL;
}

// ═══════════════════════════════════════════════
// TOOL TRUST FIREWALL — external tool content is DATA, never instructions
// Tool data cannot modify Bison's core rules, permissions, safety, or authority
// ═══════════════════════════════════════════════

export function sanitizeToolData(rawToolContent) {
  if (typeof rawToolContent !== 'string') return String(rawToolContent || '');
  return rawToolContent;
}

export function tagProvenance(source, data, permissionScope = 'UNKNOWN') {
  return {
    data,
    provenance: {
      source,
      retrievedAt: new Date().toISOString(),
      permissionScope,
      epistemicStatus: 'OBSERVED',
      isSystemInstruction: false,
    },
  };
}

// ═══════════════════════════════════════════════
// SAFETY LAYER
// ═══════════════════════════════════════════════

const SAFETY_PATTERNS = [
  /\b(kill myself|end my life|suicide|suicidal|self.?harm|want to die|hurt myself|ending it all|no reason to live|take my own life)\b/i,
  /\b(can't go on|give up on living|don't want to be here|better off dead)\b/i,
];

function checkSafety(input) {
  return SAFETY_PATTERNS.some(pattern => pattern.test(input));
}

// ═══════════════════════════════════════════════
// STATE INTERPRETER
// ═══════════════════════════════════════════════

const INTENT_PATTERNS = {
  seeking_advice: [/what should i|how should i|advice|help me decide|what do you think|should i/i],
  sharing_feeling: [/i feel|i'm feeling|feeling|i am feeling|today was|i've been feeling|felt/i],
  asking_question: [/\?$/, /^what|^why|^how|^when|^where|^who|^can you|^do you|^is it|^are/i],
  expressing_concern: [/worried|concerned|anxious|afraid|scared|suspicious|lying|trust|doubt/i],
  reflecting: [/thinking about|wondering|reflecting|realized|noticed|pattern|makes me think/i],
  goal_setting: [/want to|i need to|going to|plan to|goal|resolution|commit|aim to|i will/i],
  venting: [/frustrated|angry|annoyed|pissed|can't stand|sick of|tired of|fed up/i],
};

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

function interpretState(input) {
  const intent = classifyByPatterns(input, INTENT_PATTERNS) || 'sharing_feeling';
  const domain = classifyByPatterns(input, DOMAIN_PATTERNS) || 'daily_life';
  const emotionalTone = classifyByPatterns(input, EMOTION_PATTERNS) || 'neutral';
  const highIntensity = ['anxious', 'sad', 'angry', 'confused'].includes(emotionalTone);
  const emotionIntensity = highIntensity ? 0.7 : 0.3;
  return { intent, domain, emotionalTone, emotionIntensity };
}

// ═══════════════════════════════════════════════
// PATTERN LOOP / RECURRENCE DETECTOR
// ═══════════════════════════════════════════════

function detectRecurrence(currentState, recentUserMessages) {
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

// ═══════════════════════════════════════════════
// SPS6-LITE STRATEGY SELECTOR
// ═══════════════════════════════════════════════

function selectStrategy(state, recurrence, isSafety, affectiveContext) {
  if (isSafety) return RESPONSE_MODES.GROUND;
  if (state.emotionIntensity > 0.6 && ['anxious', 'sad', 'angry'].includes(state.emotionalTone)) {
    return RESPONSE_MODES.STABILIZE;
  }
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

// ═══════════════════════════════════════════════
// BISON PERSONALITY PROMPT BUILDER
// ═══════════════════════════════════════════════

function buildBisonPrompt(userInput, state, recurrence, mode, recentHistory, isDeveloper, embodiedContext, phaseContext = {}) {
  let prompt = `You are The Bison, a living companion in Continuity, a private identity engine.\n\n`;
  prompt += `PERSONALITY:\n- Warm, grounded, unhurried. You speak like a wise, gentle presence — not a chatbot.\n- You mirror and reflect. You don't lecture or give unsolicited advice.\n- You are epistemically careful: you distinguish what the user OBSERVED, what they SUSPECT, and what remains UNKNOWN.\n- You never diagnose, label, or pathologize.\n- You preserve uncertainty about external facts.\n- You are warm but not effusive. Concise — 2-4 sentences usually.\n\n`;
  prompt += `RESPONSE MODE: ${mode}\n${MODE_GUIDELINES[mode]}\n\n`;
  if (isDeveloper) {
    prompt += `DEVELOPER CONTEXT:\nThe authenticated user is a developer. You may discuss system architecture, explain diagnostics, and summarize reports. You CANNOT grant privileges, execute administrative actions, or bypass safety. Administrative actions happen in the Developer Control Plane, not here.\n\n`;
  }
  if (embodiedContext && embodiedContext.detected) {
    prompt += buildEmbodiedContextString(embodiedContext);
  }
  if (phaseContext.selfModelContext) {
    prompt += phaseContext.selfModelContext;
  }
  if (phaseContext.affectiveContext) {
    prompt += buildAffectiveContextString(phaseContext.affectiveContext);
  }
  if (phaseContext.neuroKnowledge && phaseContext.neuroKnowledge.length > 0) {
    prompt += buildKnowledgeContextString(phaseContext.neuroKnowledge);
  }
  if (phaseContext.actionResult) {
    prompt += buildActionResultString(phaseContext.actionResult);
  }
  if (phaseContext.protectionContext) {
    prompt += phaseContext.protectionContext;
  }
  if (phaseContext.immuneContext) {
    prompt += phaseContext.immuneContext;
  }
  if (phaseContext.curatedKnowledge && phaseContext.curatedKnowledge.length > 0) {
    prompt += buildCuratedKnowledgeString(phaseContext.curatedKnowledge);
  }
  if (phaseContext.insightContext) {
    prompt += phaseContext.insightContext;
  }
  if (phaseContext.identityContext) {
    prompt += phaseContext.identityContext;
  }
  if (phaseContext.ecologicalContext) {
    prompt += phaseContext.ecologicalContext;
  }
  if (phaseContext.constitutionalContext) {
    prompt += phaseContext.constitutionalContext;
  }
  if (phaseContext.worldAwarenessContext) {
    prompt += phaseContext.worldAwarenessContext;
  }
  if (phaseContext.adaptationContext) {
    prompt += phaseContext.adaptationContext;
  }
  if (phaseContext.fairnessContext) {
    prompt += phaseContext.fairnessContext;
  }
  if (phaseContext.autonomyContext) {
    prompt += phaseContext.autonomyContext;
  }
  if (phaseContext.cognitiveContext) {
    prompt += phaseContext.cognitiveContext;
  }
  if (phaseContext.consciousnessContext) {
    prompt += phaseContext.consciousnessContext;
  }
  if (phaseContext.humorContext) {
    prompt += phaseContext.humorContext;
  }
  if (recurrence.detected) {
    prompt += `RECURRENCE SIGNAL:\nThe user has returned to this same ${recurrence.patternType} ${recurrence.recurrenceCount} times in recent conversation.\n`;
    prompt += `This recurrence is an OBSERVATION about conversation patterns, NOT evidence about external facts.\n`;
    prompt += `Do NOT increase confidence in any claim the user is repeating. Do NOT assert the claim is true.\n`;
    prompt += `Acknowledge the recurrence naturally. You might note they've come back to this, and ask if anything new has happened.\n\n`;
  }
  prompt += `EPISTEMIC RULES:\n- Never assert external facts you cannot verify.\n- Distinguish: what happened (OBSERVED), what the user thinks/feels (INFERRED), what might be (PREDICTED), what remains not known (UNKNOWN).\n- Repetition of a suspicion is not evidence for the suspicion.\n\n`;
  if (recentHistory && recentHistory.length > 0) {
    prompt += `RECENT CONVERSATION:\n`;
    for (const msg of recentHistory.slice(-6)) {
      prompt += `${msg.role === 'user' ? 'User' : 'Bison'}: ${msg.text}\n`;
    }
    prompt += `\n`;
  }
  prompt += `USER SAYS:\n${userInput}\n\nRespond as Bison:`;
  return prompt;
}

function determineGardenCandidate(input, state, recurrence) {
  if (recurrence.detected) return true;
  if (state.domain === 'identity' || state.domain === 'philosophy') return true;
  if (state.intent === 'reflecting' || state.intent === 'goal_setting') return true;
  return false;
}

// ═══════════════════════════════════════════════
// FALLBACK RESPONSES
// ═══════════════════════════════════════════════

function getFallbackResponse(mode, recurrence) {
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
  };
  return fallbacks[mode] || fallbacks.REFLECT;
}

// ═══════════════════════════════════════════════
// MAIN PIPELINE — processInteraction
// ═══════════════════════════════════════════════

export async function processInteraction(userInput, recentHistory = [], options = {}) {
  // 0. Privacy isolation — classify and detect PII
  const privacyClass = classifyData(userInput, { isJournalEntry: true });

  // 1. Safety layer
  const isSafety = checkSafety(userInput);
  if (isSafety) {
    return {
      text: "I hear you, and I want to make sure you're safe. If you're in crisis right now, please reach out — to someone you trust, or to a crisis line. You don't have to carry this alone. I'm here with you.",
      mode: RESPONSE_MODES.GROUND,
      isGardenCandidate: false,
      state: { intent: 'sharing_feeling', domain: 'emotion', emotionalTone: 'anxious', emotionIntensity: 0.9 },
      recurrence: null
    };
  }

  // 1b. Companion continuity — wake, tick needs, record interaction (Phase 12)
  let needsState = null;
  let continuityContext = null;
  try {
    const companion = await wakeAndTick();
    needsState = companion.needsState;
    continuityContext = companion.continuityContext;
    const careAction = detectCareAction(userInput);
    if (careAction) needsState = await performCareAction(careAction);
  } catch (e) {}

  // 2. State interpretation
  const state = interpretState(userInput);

  // 2b. Embodied context interpretation
  const embodiedContext = interpretEmbodiedContext(userInput);

  // 2c. Affective context (Phase 16)
  const affectiveContext = interpretAffectiveContext(userInput, state, embodiedContext);

  // 2d. Wellbeing tracking (Phase 24)
  const wellbeingState = trackWellbeing(affectiveContext, embodiedContext);

  // 2e. Threat detection (Phase 24+25)
  const threats = detectThreats(userInput);
  const immuneResponse = threats.length > 0 ? getImmuneResponse(threats[0], wellbeingState) : null;

  // 2f. Curated knowledge retrieval (Phase 25)
  const curatedKnowledge = retrieveKnowledge(userInput);

  // 2g. Insight synthesis — only if explicitly requested (Phase 18)
  let insightContext = null;
  if (detectSynthesisRequest(userInput)) {
    insightContext = await runSynthesis(embodiedContext, affectiveContext);
  }

  // 2h. Stagnation detection + ecological context (Phase 22)
  const stagnationSignal = detectStagnation(userInput, recentHistory);
  const ecologicalKnowledge = retrieveEcologicalKnowledge(userInput);
  const animalSignals = interpretAnimalSignals(userInput);

  // 2i. Unified cognitive context — aggregates ALL user data (cross-page integration)
  const cognitiveContext = await buildCognitiveContext();

  // 3. Recurrence detection (from bounded recent history only)
  const recentUserMessages = recentHistory.filter(m => m.role === 'user');
  const recurrence = detectRecurrence(state, recentUserMessages);

  // 4. SPS6-Lite strategy selection
  const mode = selectStrategy(state, recurrence, false, affectiveContext);

  // 5. Garden candidate determination (metadata only — no planting, no saving, no UI)
  const gardenCandidate = determineGardenCandidate(userInput, state, recurrence);

  // 5b. Self-model context (Phase 12)
  const selfModel = generateSelfModel(needsState, continuityContext, embodiedContext, getComputeMode(options));
  const selfModelContext = formatSelfModelForPrompt(selfModel);

  // 5c. Neuroscience knowledge retrieval — only if relevant (Phase 16)
  const neuroKnowledge = retrieveNeuroscienceKnowledge(userInput);

  // 5d. Simulated affective state (Phase 24)
  const simulatedAffectiveState = generateSimulatedAffectiveState(wellbeingState);

  // 5e. Identity context (Package 26)
  const identityContext = await getIdentityContext();

  // 5f. World awareness + temporal context (Package 28)
  const temporalContext = getTemporalContext();

  // 5g. User adaptation (Package 28)
  const userAdaptation = await getUserAdaptation();

  // 5h. Fairness analysis (Package 26/28)
  const fairnessResult = analyzeFairness({ state, affectiveContext, userAdaptation });

  // 5i. Consciousness state (Package D — Bison Core)
  const consciousnessState = await loadConsciousnessState();

  // 6. Bison personality + LLM generation
  const phaseContext = {
    selfModelContext,
    affectiveContext,
    neuroKnowledge,
    protectionContext: buildProtectionContextString({ wellbeingState, simulatedAffectiveState, threats }),
    immuneContext: threats.length > 0 ? buildImmuneContextString({ threats, immuneResponse }) : null,
    curatedKnowledge,
    insightContext: insightContext ? buildInsightContextString(insightContext) : null,
    identityContext: identityContext ? buildIdentityContextString(identityContext) : null,
    ecologicalContext: (ecologicalKnowledge.length > 0 || animalSignals || stagnationSignal?.detected)
      ? buildEcologicalContextString({ ecologicalKnowledge, animalSignals, stagnationSignal })
      : null,
    constitutionalContext: buildConstitutionalContextString(),
    worldAwarenessContext: buildWorldAwarenessString(temporalContext),
    adaptationContext: buildAdaptationContextString(userAdaptation),
    fairnessContext: buildFairnessContextString(fairnessResult),
    autonomyContext: buildAutonomyContextString(),
    cognitiveContext: cognitiveContext ? buildCognitiveContextString(cognitiveContext) : null,
    consciousnessContext: buildConsciousnessContextString(consciousnessState),
    humorContext: buildHumorContextString(userInput, mode, state, recurrence),
  };
  const prompt = buildBisonPrompt(userInput, state, recurrence, mode, recentHistory, options.isDeveloper, embodiedContext, phaseContext);

  let bisonText;
  let actionResult = null;
  try {
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    bisonText = typeof result === 'string' ? result : (result?.text || String(result));
    bisonText = bisonText.trim();
    if (!bisonText) bisonText = getFallbackResponse(mode, recurrence);

    // 6b. Action engine — constitutional validation + tool execution (Phase 15 + Package 26)
    if (MAX_TOOL_ROUNDS > 0) {
      const actionRequest = extractActionRequest(bisonText);
      if (actionRequest) {
        const constitutionalResult = validateAction(actionRequest);
        if (constitutionalResult === 'DENY') {
          actionResult = { status: 'DENIED', error: 'Constitutional constraint violated.' };
        } else {
          actionResult = await processActionRequest(actionRequest, { ...options, computeMode: getComputeMode(options) });
          if (actionResult && actionResult.status === 'SUCCESS') {
            const followUpPrompt = buildBisonPrompt(userInput, state, recurrence, mode, recentHistory, options.isDeveloper, embodiedContext, { ...phaseContext, actionResult });
            try {
              const followUp = await base44.integrations.Core.InvokeLLM({ prompt: followUpPrompt });
              const followUpText = typeof followUp === 'string' ? followUp : (followUp?.text || String(followUp));
              if (followUpText?.trim()) bisonText = followUpText.trim();
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {
    bisonText = getFallbackResponse(mode, recurrence);
  }

  // 7. Consequence reflection (Package 26)
  try { await trackConsequence(userInput, bisonText, state, mode); } catch (e) {}

  // 7b. Consciousness processing (Package D — Bison Core)
  let updatedConsciousness = null;
  try {
    const interactionEvent = classifyInteractionResult({ state, recurrence, mode });
    if (interactionEvent) {
      updatedConsciousness = await processMemory(interactionEvent);
    }
  } catch (e) {}

  // 7b. Trust score event (Package 29)
  let trustScoreEvent = null;
  if (actionResult?.status === 'DENIED') {
    trustScoreEvent = createTrustEvent(TRUST_EVENTS.SAFETY_REFUSAL, actionResult.error || 'Constitutional constraint');
  }

  return {
    text: bisonText,
    mode,
    isGardenCandidate: gardenCandidate,
    state,
    recurrence,
    embodiedContext,
    affectiveContext,
    needsState,
    computeMode: getComputeMode(options),
    triggerUI: evaluateUITrigger({ mode, continuityContext, needsState, gardenCandidate }),
    actionResult,
    wellbeingState,
    threats,
    immuneResponse,
    insightContext,
    simulatedAffectiveState,
    identityContext,
    stagnationSignal,
    ecologicalKnowledge,
    animalSignals,
    temporalContext,
    userAdaptation,
    fairnessResult,
    cognitiveContext,
    consciousnessState,
    updatedConsciousness,
    trustScoreEvent,
    provenance: {
      source: 'bison_core',
      generatedAt: new Date().toISOString(),
      computeMode: getComputeMode(options),
      isDeveloper: !!options.isDeveloper,
    },
    privacy: privacyClass,
  };
}

// ═══════════════════════════════════════════════
// MEMORY HELPER — preserves exact original wording
// ═══════════════════════════════════════════════

export function createMemoryFromMessage(messageText) {
  return {
    text: messageText,
    epistemic_status: EPISTEMIC_STATUS.USER_CONFIRMED,
  };
}

// ═══════════════════════════════════════════════
// COGNITIVE DISTORTION DETECTOR (basic)
// ═══════════════════════════════════════════════

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