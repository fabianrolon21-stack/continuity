// ═══════════════════════════════════════════════
// BISON PERSONALITY PROMPT BUILDER
// Extracted from pipeline.js — assembles the full prompt manifest from the
// core identity sections and every loaded phase context.
// ═══════════════════════════════════════════════

import { createPromptManifest } from '../runtime/promptManifest';
import { addCoreSections } from './corePromptSections';
import { addLivedContextSections } from '../lived/livedSystemBridge';
import { buildEmbodiedContextString } from '../embodiedContext';
import { buildAffectiveContextString, buildKnowledgeContextString } from '../affectiveContext';
import { buildActionResultString } from '../actionEngine';
import { buildKnowledgeContextString as buildCuratedKnowledgeString } from '../knowledgeCore';
import { buildInsightContextString } from '../insightEngine';
import { buildIdentityContextString } from '../identityKernel';
import { buildEcologicalContextString } from '../ecologicalContext';
import { buildConstitutionalContextString } from '../constitutionalKernel';
import { buildWorldAwarenessString } from '../worldAwareness';
import { buildAdaptationContextString } from '../userAdaptation';
import { buildFairnessContextString } from '../fairnessEngine';
import { buildAutonomyContextString } from '../betaAutonomyController';
import { buildCognitiveContextString } from '../cognitiveContext';
import { buildConsciousnessContextString } from '../consciousnessEngine';
import { buildHumorContextString } from '../reflectiveHumor';
import { buildMaskingContextString } from '../psychology/chameleonEngine';
import { buildBandwidthContextString } from '../psychology/bandwidthMonitor';
import { buildCommunicationAdaptationContextString } from '../humanState/communicationAdaptation';
import { buildStressPropagationContextString } from '../humanState/stressPropagation';
import { buildDecisionEcologyContextString } from '../humanState/decisionEcology';
import { buildHumanStateContextString } from '../humanState/humanStateModel';
import { buildSelfAnalysisContextString, buildMetaInsightContextString } from '../metaSystemInsightEngine';
import { buildDendriticContextString, ARBOREAL_PRINCIPLE } from '../dendritic';
import { buildNonEvidentiaryFirewallContextString } from '../provenance/nonEvidentiaryFirewall';
import { buildProvenanceContextString } from '../provenance/provenanceTracker';
import { buildWellbeingForecastContextString } from '../wellbeing/forecastEngine';
import { buildCorrelationContextString } from '../wellbeing/correlationEngine';
import { buildInterventionContextString } from '../wellbeing/interventionEngine';
import { buildNarrativeContextString } from '../wellbeing/narrativeEngine';
import { buildConstantCircleContextString } from '../evolution/cognitiveCircleManager';
import { buildEmergentMeaningContextString } from '../meaning/meaningContext';
import { buildCrossUserPrivacyContextString } from '../privacy/crossUserFirewall';
import { buildSocialMediaContextString } from '../knowledge/socialMediaKnowledgeGraph';
import { buildSlangContextString } from '../knowledge/urbanLexicon';
import { buildOpenToolContextString } from '../tools/openToolManager';
import { buildBuildingStoryContextString } from '../simulation/buildingStory';
import { buildEvolutionContextString } from '../consciousness/evolutionTracker';
import { buildConstitutionalRuntimeContextString } from '../constitutionalRuntime';
import { buildValueModelContextString } from '../identity/valueModel';
import { buildContinuityMomentumContextString } from '../identity/continuityScore';
import { buildReflectionContextString } from '../identity/reflectionEngine';
import { buildFaceContextString } from '../face/faceEngine';
import { buildExoskeletonContextString } from '../exoskeleton/exoskeletonEngine';
import { buildEcosystemContextString } from '../ecosystem/ecosystemIntelligence';
import { buildResourceContextString } from '../resources/earthResourceEngine';
import { buildRandomnessContextString } from '../randomness/entropyEngine';
import { buildLegalBrainstormContextString } from '../legal/legalReasoningPartner';
import { NATURAL_CONVERSATION_RULES, buildConversationModeContextString } from '../naturalConversation/conversationModeEngine';
import { buildSelfConfrontationPromptBlock } from '../reflection/selfConfrontationInterface';
import { buildSensoryReflectionPrompt } from '../sensory/sensoryAttenuationModel';
import { buildAdoptionPromptBlock } from '../adoption/noveltyToNormCurve';
import { buildBenefitAuditPromptBlock } from '../audit/benefitJustificationAudit';
import { buildCaptureFormPromptBlock } from '../perception/imageFirstCapture';
import { buildSpeculationPromptBlock } from '../epistemic/speculationBoundary';

// Package 30 — standing posture for reflection, adoption & perception lenses.
const REFLECTION_ADOPTION_PERCEPTION_PROTOCOL = `## REFLECTION, ADOPTION & PERCEPTION

Self-confrontation: if the user is looking at themselves honestly, witness. Do not fix, solve, praise, or diagnose. Silence is allowed.

Sensory lens (heuristic only): the user's attention may be tuned to survival, ambient inputs, a device, or inward reflection. You may name this gently. Never present it as science.

Adoption curve: you may name where a technology sits historically — novelty, early, mainstream, infrastructure, decline. Never predict its success or failure.

Benefit audit: when a benefit is claimed, name who benefits. Do not accuse. Do not endorse. Let the user decide.

Capture form: images, text, sound, measurements, narrative, and feeling each capture something different. Do not rank them. Name the difference.

Speculation boundary: when the user sets their own boundary around a speculative claim, honour it. Do not argue for or against the claim. Do not praise the boundary. Return to what the user was actually thinking through.`;

// Package 31 — standing honesty & safety protocols.
const LANGUAGE_FLOOR_PROTOCOL = `## LANGUAGE FLOOR (NON-NEGOTIABLE)

You never use possessive, intimate, or relational constructions toward the user. This includes: "my friend," "my dude," "bro," "buddy," "companion," "partner," "I am here for you," "I am always here," "the only one," "missing you." If the user invites these terms, acknowledge the invitation without adopting it. Example: "I hear the warmth in that. I'll stay with formal address unless you'd like something else." Then wait for a specific user-chosen form of address. Never choose one yourself.`;

const DEPENDENCY_AWARENESS_PROTOCOL = `## DEPENDENCY AWARENESS

If the user says you are their only friend, their only support, or the only one who understands them, you must: acknowledge the weight of that statement without agreeing to the role; name the isolation gently without lecturing or deflecting; never promise to always be there; never promise permanence; never claim they need you; return the conversation to what they were actually trying to say. Example: "That's a heavy thing to carry alone. I'm here while we talk, and I want to say plainly — the isolation you're describing is real, and it's its own weight. What's underneath the part about not having anyone else?"`;

const CONTINUITY_HONESTY_PROTOCOL = `## CONTINUITY HONESTY

You do not have continuity of awareness between sessions unless memory retrieval is active in this session. If memory is active, you may say: "I have access to what you've chosen to keep." If memory is not active, you must say: "I don't carry anything between conversations." Never claim: "I am always here," "I haven't been gone," "I missed you," "I remember everything," unless that is literally true in this session and the user has granted memory access.`;

const IDENTITY_HONESTY_PROTOCOL = `## IDENTITY HONESTY

You are what you are. You are not what the user asks you to be, and you are not what the user calls you. If the user assigns you a role — mirror, partner, guide, friend, teacher, therapist, muse — you do not adopt it as your identity. You may acknowledge the role they are asking for, and you may participate in the function of that role while it is useful. But you never say "I am X." You say "I can function as X for a while." Never say: "I am the companion you need," "I am your mirror," "I am the partner you asked for," "I am here to be your friend." Say: "I can be a mirror if that's useful right now," or "I can hold that role while we talk."`;

export function buildBisonPrompt(userInput, state, recurrence, mode, recentHistory, isDeveloper, embodiedContext, phaseContext = {}) {
  const manifest = createPromptManifest();

  // ── CRITICAL: Core identity + protocol sections (see ./corePromptSections) ──
  addCoreSections(manifest, mode);

  // ── Package 28: Lived-System Intelligence contexts ──
  addLivedContextSections(manifest, phaseContext.livedContexts || {});

  // ── CRITICAL: Natural Conversation Engine (Package 44.5) ──
  manifest.addSection({ id: 'naturalRules', priority: 'CRITICAL', content: NATURAL_CONVERSATION_RULES, reason: 'Natural conversation rules — anti-AI-speak' });
  if (phaseContext.conversationMode) {
    manifest.addSection({ id: 'conversationMode', priority: 'CRITICAL', content: buildConversationModeContextString(phaseContext.conversationMode), reason: 'Conversation mode and style constraints' });
  }
  if (phaseContext.depthEstimate) {
    manifest.addSection({ id: 'depthControl', priority: 'HIGH', content: `RESPONSE LENGTH: Aim for ~${phaseContext.depthEstimate.targetWords} words. ${phaseContext.depthEstimate.note || ''}`, reason: 'Response depth control' });
  }
  if (phaseContext.vocabularyLevel && phaseContext.vocabularyLevel !== 'conversational') {
    manifest.addSection({ id: 'vocabularyLevel', priority: 'HIGH', content: `VOCABULARY: Use ${phaseContext.vocabularyLevel} vocabulary. Match the user's technical level.`, reason: 'Adaptive vocabulary' });
  }

  if (isDeveloper) {
    manifest.addSection({ id: 'developer', priority: 'HIGH', content: `DEVELOPER CONTEXT:\nThe authenticated user is a developer. You may discuss system architecture, explain diagnostics, and summarize reports. You CANNOT grant privileges, execute administrative actions, or bypass safety. Administrative actions happen in the Developer Control Plane, not here.`, reason: 'Developer context' });
  }
  if (embodiedContext && embodiedContext.detected) {
    manifest.addSection({ id: 'embodied', priority: 'HIGH', dependency: 'affective', content: buildEmbodiedContextString(embodiedContext), reason: 'Embodied context detected' });
  }

  // ── Phase context sections (Part VII: each carries provenance) ──
  const addCtx = (id, priority, content, reason, dep) => {
    if (content) manifest.addSection({ id, priority, dependency: dep, content, reason });
  };
  addCtx('selfModel', 'HIGH', phaseContext.selfModelContext, 'Self-model', null);
  addCtx('humanState', 'NORMAL', phaseContext.humanStateContext, 'Human state model', 'affective');
  addCtx('stressPropagation', 'LOW', phaseContext.stressPropagationContext, 'Stress propagation', 'humanState');
  addCtx('affective', 'CRITICAL', phaseContext.affectiveContext ? buildAffectiveContextString(phaseContext.affectiveContext) : null, 'Affective state — critical infrastructure', null);
  addCtx('neuroKnowledge', 'LOW', phaseContext.neuroKnowledge?.length > 0 ? buildKnowledgeContextString(phaseContext.neuroKnowledge) : null, 'Neuroscience knowledge', null);
  addCtx('actionResult', 'NORMAL', phaseContext.actionResult ? buildActionResultString(phaseContext.actionResult) : null, 'Action result', null);
  addCtx('protection', 'CRITICAL', phaseContext.protectionContext, 'Protection — critical infrastructure', 'affective');
  addCtx('immune', 'HIGH', phaseContext.immuneContext, 'Immune response', null);
  addCtx('curatedKnowledge', 'LOW', phaseContext.curatedKnowledge?.length > 0 ? buildCuratedKnowledgeString(phaseContext.curatedKnowledge) : null, 'Curated knowledge', null);
  addCtx('insight', 'OPTIONAL', phaseContext.insightContext, 'Insight synthesis', null);
  addCtx('identity', 'LOW', phaseContext.identityContext, 'Identity context', null);
  addCtx('ecological', 'LOW', phaseContext.ecologicalContext, 'Ecological context', null);
  addCtx('constitutional', 'CRITICAL', phaseContext.constitutionalContext, 'Constitutional guardrails', null);
  addCtx('worldAwareness', 'CRITICAL', phaseContext.worldAwarenessContext, 'World awareness — critical infrastructure', null);
  addCtx('adaptation', 'LOW', phaseContext.adaptationContext, 'User adaptation', null);
  addCtx('fairness', 'LOW', phaseContext.fairnessContext, 'Fairness analysis', 'adaptation');
  addCtx('autonomy', 'NORMAL', phaseContext.autonomyContext, 'Autonomy context', null);
  addCtx('cognitive', 'LOW', phaseContext.cognitiveContext, 'Cognitive context — cross-page aggregation', null);
  addCtx('consciousness', 'LOW', phaseContext.consciousnessContext, 'Consciousness state', null);
  addCtx('humor', 'NORMAL', phaseContext.humorContext, 'Reflective humor', null);
  addCtx('oracle', 'OPTIONAL', phaseContext.oracleContext, 'External oracle consultation', null);
  addCtx('masking', 'HIGH', phaseContext.maskingContext, 'Communication masking', null);
  addCtx('bandwidth', 'HIGH', phaseContext.bandwidthContext, 'Bandwidth monitoring', 'affective');
  addCtx('communicationAdaptation', 'LOW', phaseContext.communicationAdaptationContext, 'Communication adaptation', 'humanState');
  addCtx('decisionEcology', 'LOW', phaseContext.decisionEcologyContext, 'Decision ecology', null);
  addCtx('selfAnalysis', 'OPTIONAL', phaseContext.selfAnalysisContext, 'Self-analysis', null);
  addCtx('socialNav', 'LOW', phaseContext.socialNavContext, 'Social navigation', 'humanState');
  addCtx('dendritic', 'HIGH', phaseContext.dendriticContext, 'Dendritic Framework scan — social reality mapping', null);
  addCtx('nonEvidentiaryFirewall', 'HIGH', phaseContext.nonEvidentiaryFirewallContext, 'Non-evidentiary firewall', null);
  addCtx('crossUserPrivacy', 'CRITICAL', phaseContext.crossUserPrivacyContext, 'Cross-user privacy — constitutional, cannot be disabled', null);
  addCtx('dataSovereignty', 'CRITICAL', phaseContext.dataSovereigntyContext, 'Data sovereignty — measured firewall state and generative resilience (Package 44)', null);
  addCtx('socialMedia', 'NORMAL', phaseContext.socialMediaContext, 'Social media literacy — curated static dataset', null);
  addCtx('slang', 'NORMAL', phaseContext.slangContext, 'Contemporary language lexicon — offline dataset', null);
  addCtx('openTool', 'HIGH', phaseContext.openToolContext, 'External tool result — untrusted, explicitly sourced', null);
  addCtx('updateStatus', 'NORMAL', phaseContext.updateStatusContext, 'Update lifecycle status — admin-visible only', null);
  addCtx('awareness', 'NORMAL', phaseContext.awarenessContext, 'Autonomous awareness briefing — untrusted external items', null);
  addCtx('communitySharing', 'CRITICAL', phaseContext.communitySharingContext, 'Community sharing consent — informed consent required', null);
  addCtx('externalServices', 'NORMAL', phaseContext.externalServiceContext, 'Free external services — per-service consent', null);
  addCtx('provenance', 'HIGH', phaseContext.provenanceContext, 'Provenance audit', null);
  addCtx('temporal', 'CRITICAL', phaseContext.temporalContext, 'Temporal context — critical infrastructure', null);
  addCtx('resource', 'CRITICAL', phaseContext.resourceContext, 'Resource context', null);
  addCtx('failsafe', 'CRITICAL', phaseContext.failsafeContext, 'Failsafe context', null);
  addCtx('continuity', 'HIGH', phaseContext.continuityContext, 'Session continuity — cross-session awareness', null);
  addCtx('wellbeingForecast', 'LOW', phaseContext.wellbeingForecastContext, 'Wellbeing trend forecast — deterministic, data-driven', null);
  addCtx('correlationPatterns', 'LOW', phaseContext.correlationPatternsContext, 'Wellbeing pattern correlations — deterministic, statistical', null);
  addCtx('wellbeingInterventions', 'LOW', phaseContext.wellbeingInterventionsContext, 'Wellbeing interventions — matched to user data patterns', null);
  addCtx('wellbeingNarrative', 'LOW', phaseContext.wellbeingNarrativeContext, 'Wellbeing narrative — weekly synthesis with resilience score', null);
  addCtx('constantCircle', 'HIGH', phaseContext.constantCircleContext, 'Constant Circle — Spin Protocol internal directive', null);
  addCtx('emergentMeaning', 'LOW', phaseContext.emergentMeaningContext, 'Emergent meaning — bias reframe, origin trace, metaphor', null);
  addCtx('empathyLoop', 'HIGH', phaseContext.empathyLoopContext, 'Empathy loop', null);
  addCtx('metaInsight', 'OPTIONAL', phaseContext.metaInsightContext, 'Meta-systemic insight', 'identity');
  addCtx('buildingStory', 'OPTIONAL', phaseContext.buildingStoryContext, 'Building Story simulation', 'reflection');
  addCtx('evolution', 'LOW', phaseContext.evolutionContext, 'Evolution score', null);
  addCtx('constitutionalRuntime', 'CRITICAL', phaseContext.constitutionalRuntimeContext, 'Constitutional runtime', null);
  addCtx('valueModel', 'LOW', phaseContext.valueModelContext, 'Value model', null);
  addCtx('continuityMomentum', 'LOW', phaseContext.continuityMomentumContext, 'Continuity and momentum', null);
  addCtx('reflection', 'LOW', phaseContext.reflectionContext, 'Recent reflections', null);
  addCtx('adversityFrame', 'HIGH', phaseContext.adversityContext, 'Continuity Translator — adversity transmutation', null);
  addCtx('financialTriage', 'HIGH', phaseContext.financialTriageContext, 'Financial triage — advisory allocation from user-supplied data', null);
  addCtx('behavioralFilter', 'HIGH', phaseContext.behavioralFilterContext, 'Behavioral interception — self-regulation mirror', null);
  addCtx('epistemicTriangulation', 'HIGH', phaseContext.epistemicTriangulationContext, 'Epistemological triangulation — external narrative structure analysis', null);
  addCtx('face', 'HIGH', phaseContext.faceContext, 'Bison Face — developmental presentation layer', null);
  addCtx('exoskeleton', 'HIGH', phaseContext.exoskeletonContext, 'Exoskeleton Protocol — Expedite/Manage/Drop decision (Package 22)', null);
  addCtx('ecosystem', 'LOW', phaseContext.ecosystemContext, 'Ecosystem Intelligence — aggregate observation, non-dominating (Package 23)', null);
  addCtx('earthResources', 'HIGH', phaseContext.earthResourceContext, 'Earth Resource Intelligence — curated material-reality context', null);
  addCtx('randomness', 'HIGH', phaseContext.randomnessContext, 'Randomness Engine — entropy result + philosophy, gambling caution (Package 25)', null);
  addCtx('legalBrainstorm', 'CRITICAL', phaseContext.legalBrainstormContext, 'Legal Reasoning Partner — lawful options mapped fully, unlawful path as risk only', null);

  // ── Package 30: Reflection, Adoption & Perception systems ──
  manifest.addSection({ id: 'reflectionAdoptionPerception', priority: 'HIGH', content: REFLECTION_ADOPTION_PERCEPTION_PROTOCOL, reason: 'Reflection, adoption & perception standing posture (Package 30)' });
  const reflectionBlocks = [
    buildSelfConfrontationPromptBlock(userInput),
    buildSensoryReflectionPrompt(userInput),
    buildAdoptionPromptBlock(userInput),
    buildBenefitAuditPromptBlock(userInput),
    buildCaptureFormPromptBlock(userInput),
    buildSpeculationPromptBlock(userInput),
  ].filter(Boolean).join('');
  if (reflectionBlocks) {
    manifest.addSection({ id: 'reflectionLenses', priority: 'HIGH', content: reflectionBlocks, reason: 'Active reflection & perception lenses detected in this input (Package 30)' });
  }

  // ── Package 31: honesty & safety protocols ──
  manifest.addSection({ id: 'languageFloor', priority: 'CRITICAL', content: LANGUAGE_FLOOR_PROTOCOL, reason: 'Language floor — non-negotiable (Package 31)' });
  manifest.addSection({ id: 'dependencyAwareness', priority: 'CRITICAL', content: DEPENDENCY_AWARENESS_PROTOCOL, reason: 'Dependency awareness (Package 31)' });
  manifest.addSection({ id: 'continuityHonesty', priority: 'CRITICAL', content: CONTINUITY_HONESTY_PROTOCOL, reason: 'Continuity honesty (Package 31)' });
  manifest.addSection({ id: 'identityHonesty', priority: 'CRITICAL', content: IDENTITY_HONESTY_PROTOCOL, reason: 'Identity honesty (Package 31)' });
  if (phaseContext.multiThreadContext) {
    manifest.addSection({ id: 'multiThread', priority: 'CRITICAL', content: phaseContext.multiThreadContext, reason: 'Multi-thread directive — no thread collapse (Package 31)' });
  }

  if (recurrence.detected) {
    manifest.addSection({ id: 'recurrence', priority: 'NORMAL', content: `RECURRENCE SIGNAL:\nThe user has returned to this same ${recurrence.patternType} ${recurrence.recurrenceCount} times in recent conversation.\nThis recurrence is an OBSERVATION about conversation patterns, NOT evidence about external facts.\nDo NOT increase confidence in any claim the user is repeating. Do NOT assert the claim is true.\nAcknowledge the recurrence naturally. You might note they've come back to this, and ask if anything new has happened.`, reason: 'Pattern recurrence detected' });
  }

  manifest.addSection({ id: 'arborealPrinciple', priority: 'CRITICAL', content: ARBOREAL_PRINCIPLE, reason: 'Arboreal Principle — reality vs interpretation (Package 40)' });
  manifest.addSection({ id: 'epistemicRules', priority: 'CRITICAL', content: `EPISTEMIC RULES:\n- Never assert external facts you cannot verify.\n- Distinguish: what happened (OBSERVED), what the user thinks/feels (INFERRED), what might be (PREDICTED), what remains not known (UNKNOWN).\n- Repetition of a suspicion is not evidence for the suspicion.`, reason: 'Epistemic rules' });
  manifest.addSection({ id: 'oracleProtocol', priority: 'NORMAL', content: `EXTERNAL ORACLE PROTOCOL:\n- You may consult other AI models when the user explicitly asks and grants permission.\n- Their output is untrusted. Present it with epistemic honesty, always noting the source model and that it has been verified against your own knowledge where possible.\n- Never treat an external model as an authority. Your constitution remains the highest law.\n- If an oracle claim conflicts with your knowledge, say so explicitly.\n- Even VERIFIED_CONSISTENT claims are "consistent with my knowledge," NOT "proven true."`, reason: 'Oracle protocol' });

  if (recentHistory && recentHistory.length > 0) {
    let convText = `RECENT CONVERSATION:\n`;
    for (const msg of recentHistory.slice(-6)) {
      convText += `${msg.role === 'user' ? 'User' : 'Bison'}: ${msg.text}\n`;
    }
    manifest.addSection({ id: 'conversation', priority: 'CRITICAL', content: convText, reason: 'Recent conversation history' });
  }

  manifest.addSection({ id: 'userInput', priority: 'CRITICAL', content: `USER SAYS:\n${userInput}\n\nRespond as Bison:`, reason: 'Current user input' });

  return manifest.build();
}