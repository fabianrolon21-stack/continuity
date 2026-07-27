// ═══════════════════════════════════════════════
// DASHBOARD DATA COLLECTOR (Package 29)
// Aggregates existing internal state into a single DashboardState.
// Pure aggregation — no new data collection, no new analysis.
// All data comes from already-existing state variables.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { listCapabilities } from '@/lib/security/deviceAccess';
import { getImmuneMemory } from '@/lib/bison/immuneSystem';
import { getComputeMode } from '@/lib/bison/pipeline';
import { calculateTrustScore } from '@/lib/bison/trustScoreCalculator';
import { getQuarantinedCount } from '@/lib/bison/provenance/provenanceTracker';
import { getSpinLog } from '@/lib/bison/evolution/cognitiveCircleManager';

export async function collectDashboardState(lastInteractionResult = null) {
  try {
    const [user, capabilities, immuneMemory, recentMemories, recentMessages] = await Promise.all([
      base44.auth.me().catch(() => null),
      listCapabilities().catch(() => []),
      getImmuneMemory().catch(() => ({ threats: [] })),
      base44.entities.SavedMemory.list('-created_date', 5).catch(() => []),
      base44.entities.BisonMessage.list('-created_date', 10).catch(() => []),
    ]);

    const companionState = user?.companion_state || {};
    const trustScoreState = user?.trust_score_state || { score: 100, breakdown: [], sessionStart: new Date().toISOString() };

    // Observation mode — derived from capability statuses
    const observationMode = determineObservationMode(capabilities);

    // Epistemic flags from last interaction
    const epistemicFlags = extractEpistemicFlags(lastInteractionResult, recentMessages);

    // Self-model summary
    const selfModelSummary = lastInteractionResult?.needsState
      ? buildSelfModelSummary(lastInteractionResult, companionState)
      : buildSelfModelSummary(null, companionState);

    // Simulated affect
    const simulatedAffectiveState = lastInteractionResult?.simulatedAffectiveState || null;

    // Protective actions from immune memory
    const protectiveActions = (immuneMemory?.threats || []).slice(-5).reverse().map(t => ({
      time: t.timestamp,
      action: `${t.category} blocked (${t.actionTaken || 'observed'})`,
    }));

    // Constitutional status
    const constitutionalStatus = lastInteractionResult?.actionResult
      ? `${lastInteractionResult.actionResult.status}${lastInteractionResult.actionResult.error ? ' — ' + lastInteractionResult.actionResult.error : ''}`
      : 'No action requested';

    // Trust score
    const trustScore = calculateTrustScore(trustScoreState, null);

    // Oracle consultation history (Package 30)
    const oracleConsultations = await getOracleConsultationHistory();

    return {
      permissions: capabilities.map(c => ({ name: c.label, status: c.permissionStatus, available: c.available })),
      observationMode,
      recentMemories: recentMemories.map(m => ({ text: m.text?.substring(0, 80), source: m.source })),
      epistemicFlags,
      selfModelSummary,
      painLevel: simulatedAffectiveState?.painLevel ?? 10,
      empathyLevel: simulatedAffectiveState?.empathyLevel ?? 20,
      protectiveActions,
      trustScore: trustScore.score,
      trustScoreBreakdown: trustScore.breakdown,
      computeMode: lastInteractionResult?.computeMode || getComputeMode({ incident_mode: user?.incident_mode, force_local: user?.force_local }),
      constitutionalStatus,
      wellbeingState: lastInteractionResult?.wellbeingState || null,
      threats: lastInteractionResult?.threats || [],
      oracleConsultations,
      oracleConsultation: lastInteractionResult?.oracleConsultation || null,
      evolutionState: user?.evolution_state || null,
      socialNavigationAdvice: lastInteractionResult?.socialNavResult?.adviceTypes || [],
      coRegulationEvent: lastInteractionResult?.coRegulationData?.anchorResult
        ? {
            triggered: true,
            exited: lastInteractionResult.coRegulationData.anchorResult.exitCoRegulation,
            concerns: lastInteractionResult.coRegulationData.concerns,
            realitySummary: lastInteractionResult.coRegulationData.realitySummary,
          }
        : null,
      provenanceStats: {
        registeredCount: lastInteractionResult?.provenanceAudit?.length || 0,
        quarantinedCount: getQuarantinedCount(),
        auditRequested: !!lastInteractionResult?.provenanceAudit,
      },
      contextOrchestration: {
        intent: lastInteractionResult?.contextPlan?.intent || 'UNKNOWN',
        requiredContexts: lastInteractionResult?.contextPlan?.requiredContexts || [],
        optionalContexts: lastInteractionResult?.contextPlan?.optionalContexts || [],
        skippedContexts: lastInteractionResult?.contextPlan?.skippedContexts || [],
        estimatedTokens: lastInteractionResult?.contextPlan?.estimatedTokens || 0,
        estimatedQueries: lastInteractionResult?.contextPlan?.estimatedQueries || 0,
        tokenBudget: lastInteractionResult?.contextPlan?.tokenBudget || 5000,
        queryBudget: lastInteractionResult?.contextPlan?.queryBudget || 8,
        remainingBudget: lastInteractionResult?.contextPlan?.remainingBudget || 0,
        profile: lastInteractionResult?.runtimeMetrics?.profile || null,
        cacheStats: lastInteractionResult?.runtimeMetrics?.cacheStats || null,
        authority: lastInteractionResult?.runtimeAuthorityReport || null,
        hallucinationsPrevented: lastInteractionResult?.runtimeAuthorityReport?.hallucinationsPrevented || 0,
      },
      lumenCount: await getLumenCount(),
      spinProtocol: {
        lastSpin: lastInteractionResult?.spinProtocolResult || null,
        recentSpins: getSpinLog().slice(0, 5),
      },
    };
  } catch (e) {
    return null;
  }
}

async function getLumenCount() {
  try {
    const lumens = await base44.entities.SavedMemory.filter({ source: 'lumen_token' });
    return lumens?.length || 0;
  } catch (e) {
    return 0;
  }
}

async function getOracleConsultationHistory() {
  try {
    const logs = await base44.entities.AuditLog.filter(
      { action: 'EXTERNAL_ORACLE_CONSULT' },
      '-created_date',
      5
    );
    return (logs || []).map(log => {
      let parsed = {};
      try { parsed = JSON.parse(log.message || '{}'); } catch (e) {}
      return {
        requestId: log.id,
        timestamp: log.timestamp,
        model: parsed.model || 'unknown',
        querySummary: parsed.querySummary || '',
        result: log.result,
        insightCount: parsed.insightCount || 0,
        verificationStats: parsed.verificationStats || null,
        redactionApplied: parsed.redactionApplied || false,
        blocked: parsed.blocked || false,
      };
    });
  } catch (e) {
    return [];
  }
}

function determineObservationMode(capabilities) {
  const camera = capabilities.find(c => c.id === 'camera');
  const mic = capabilities.find(c => c.id === 'microphone');
  if (camera?.permissionStatus === 'AUTHORIZED' && mic?.permissionStatus === 'AUTHORIZED') return 'audio + camera';
  if (camera?.permissionStatus === 'AUTHORIZED') return 'camera';
  if (mic?.permissionStatus === 'AUTHORIZED') return 'audio';
  return 'text-only';
}

function extractEpistemicFlags(lastInteractionResult, recentMessages) {
  const flags = [];
  if (lastInteractionResult?.state) {
    flags.push({ claim: `Intent: ${lastInteractionResult.state.intent}`, status: 'INFERRED' });
    flags.push({ claim: `Domain: ${lastInteractionResult.state.domain}`, status: 'INFERRED' });
    flags.push({ claim: `Emotional tone: ${lastInteractionResult.state.emotionalTone}`, status: 'INFERRED' });
  }
  if (lastInteractionResult?.recurrence?.detected) {
    flags.push({ claim: `Recurring pattern: ${lastInteractionResult.recurrence.patternType}`, status: 'OBSERVED' });
  }
  if (lastInteractionResult?.cognitiveContext?.contradictions?.length > 0) {
    flags.push({ claim: 'Cross-entity contradiction detected', status: 'INFERRED' });
  }
  return flags;
}

function buildSelfModelSummary(interactionResult, companionState) {
  const energy = companionState?.energy ?? 80;
  const hunger = companionState?.hunger ?? 80;
  const hydration = companionState?.hydration ?? 80;
  return `Energy: ${Math.round(energy)}/100. Hunger: ${Math.round(hunger)}/100. Hydration: ${Math.round(hydration)}/100. Companion state, not biological.`;
}