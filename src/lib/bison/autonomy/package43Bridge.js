// ═══════════════════════════════════════════════
// PACKAGE 43 BRIDGE
// One seam between the pipeline and the update / awareness /
// community / external-service engines, so the pipeline gains four
// context strings rather than four subsystems.
//
// Everything here is read-only and cheap: the background sweeps run
// after the reply is sent (see metaCycle), never in the hot path.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { buildUpdateContextString } from '../updates/updateManager';
import { getBriefing, markPresented, buildAwarenessContextString } from './autonomousAwarenessEngine';
import { detectServiceRequest, buildExternalServiceContextString } from './externalServiceIntegrator';
import { detectShareRequest, listConsents, buildCommunityContextString } from '../community/communityIntelligenceManager';

const UPDATE_PATTERNS = [
  /check for updates?/i,
  /(?:are|any) (?:there )?(?:any )?updates?(?: available)?/i,
  /(?:what|which) version/i,
  /update status/i,
];

const BRIEFING_PATTERNS = [
  /what'?s new/i,
  /any (?:breaking )?news/i,
  /(?:give me|show me) (?:a |the )?briefing/i,
  /anything i should know (?:about|today)/i,
  /security (?:advisor|advisories|issues)/i,
];

export function detectPackage43Intents(input) {
  return {
    updates: UPDATE_PATTERNS.some(p => p.test(input)),
    briefing: BRIEFING_PATTERNS.some(p => p.test(input)),
    community: detectShareRequest(input),
    externalService: detectServiceRequest(input),
  };
}

export function anyIntent(intents) {
  return !!(intents.updates || intents.briefing || intents.community || intents.externalService);
}

/**
 * Builds only the contexts the moment actually calls for.
 * The awareness briefing is the one exception: a critical security
 * item may surface unprompted, but even then only when the user speaks.
 */
export async function buildPackage43Contexts(intents, user) {
  const out = {
    updateContext: null,
    awarenessContext: null,
    communityContext: null,
    externalServiceContext: null,
  };

  if (intents.updates && user?.role === 'admin') {
    const staged = await base44.entities.UpdateStage
      .filter({ stage: 'STAGED' }, '-created_date', 5).catch(() => []);
    out.updateContext = buildUpdateContextString(staged);
  }

  const briefing = await getBriefing(intents.briefing ? 3 : 1);
  if (briefing.length) {
    out.awarenessContext = buildAwarenessContextString(briefing, { requested: intents.briefing });
    if (out.awarenessContext) markPresented(briefing).catch(() => {});
  }

  if (intents.community) {
    const consents = await listConsents();
    out.communityContext = buildCommunityContextString(consents, user);
  }

  if (intents.externalService) {
    out.externalServiceContext = buildExternalServiceContextString(user);
  }

  return out;
}