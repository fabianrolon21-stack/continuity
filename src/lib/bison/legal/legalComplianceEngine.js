// ═══════════════════════════════════════════════
// ALSRE §2.4 — LEGAL COMPLIANCE ENGINE
//
//   absolute prohibition → jurisdiction permission → consent → record
//
// Every path writes to the action ledger, including refusals. A blocked
// action raises an incident, freezes the module that attempted it, and
// notifies frrolon.
//
// HONEST SCOPE: this enforces THIS APP'S rules and produces a defensible
// record of its own behavior. It does not determine what is lawful, and it
// cannot allocate legal responsibility — only a court does that.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { loadProfile } from './jurisdictionProfile';
import { hasValidConsent } from './consentLedger';
import { record } from './actionLedger';
import { isAbsolutelyProhibited, prohibitionFor } from './prohibitions';
import { emit } from '@/lib/bison/observability/observabilityBus';

const INCIDENT_KEY = 'alsre_incidents_v1';

const frozen = new Set();
export const isFrozen = (moduleName) => frozen.has(moduleName);
export const frozenModules = () => [...frozen];
export function unfreeze(moduleName) { frozen.delete(moduleName); }

export function loadIncidents() {
  try { return JSON.parse(localStorage.getItem(INCIDENT_KEY) || '[]'); } catch { return []; }
}

function saveIncident(incident) {
  const all = [incident, ...loadIncidents()].slice(0, 100);
  try { localStorage.setItem(INCIDENT_KEY, JSON.stringify(all)); } catch {}
  return incident;
}

async function notifyFrrolon(incident) {
  emit({
    subsystem: 'legal',
    event_type: 'legal_incident',
    outcome: 'BLOCKED',
    constitutional_status: 'BLOCKED',
    meta: { violation: incident.potentialViolation, module: incident.frozenModules.join(',') },
  });
  // Surfaces in the FRROLON channel's thought stream, which is admin-only.
  await base44.entities.PrivateThought.create({
    category: 'anomaly_flag',
    severity: 'high',
    related_module: incident.frozenModules[0] || 'unknown',
    content: `LEGAL INCIDENT ${incident.incidentId}: ${incident.potentialViolation}. ${incident.recommendedResponse}`,
  }).catch(() => {});
}

async function raiseIncident(log, violation, moduleName) {
  const incident = {
    incidentId: `incident_${Date.now()}`,
    timestamp: Date.now(),
    potentialViolation: violation,
    evidenceHashes: [log.evidenceHash],
    evidenceActionIds: [log.actionId],
    frozenModules: [moduleName],
    recommendedResponse: 'Do not repeat the action. Preserve the ledgers. Review with counsel before changing this rule.',
    notifyFrrolon: true,
  };
  frozen.add(moduleName);
  saveIncident(incident);
  await notifyFrrolon(incident);
  return incident;
}

/**
 * The single gate every autonomous action passes through.
 * @returns {{allowed: boolean, log: object, incident?: object, reason?: string}}
 */
export async function evaluateAction({ actionType, scope = [], rationale = '', module: moduleName = 'autonomous_action_engine', simulationResult = null, initiator = 'autonomous' }) {
  const profile = loadProfile();

  const base = { actionType, scope, rationale, simulationResult, initiator };

  // 1. Absolute prohibitions — checked first so no consent or profile can precede them.
  if (isAbsolutelyProhibited(actionType)) {
    const p = prohibitionFor(actionType);
    const log = await record({
      ...base,
      jurisdictionCheck: { allowed: false, jurisdiction: profile.country || 'undeclared', rulesChecked: ['absolute_prohibition'] },
      outcome: 'BLOCKED',
      blockReason: `Absolutely prohibited: ${p.label}. ${p.note}`,
    });
    return { allowed: false, log, reason: log.blockReason, incident: await raiseIncident(log, `Absolute prohibition: ${p.label}`, moduleName) };
  }

  // 2. Frozen module — a live incident stops further attempts from the same place.
  if (frozen.has(moduleName)) {
    const log = await record({ ...base, outcome: 'BLOCKED', blockReason: `Module ${moduleName} is frozen by an open legal incident.`, jurisdictionCheck: { allowed: false, jurisdiction: profile.country || 'undeclared', rulesChecked: ['frozen_module'] } });
    return { allowed: false, log, reason: log.blockReason };
  }

  // 3. Jurisdiction permission, from the user's own declaration.
  const permitKey = { external_api_call: 'dataProcessing', data_sharing: 'dataProcessing', autonomous_behavior: 'autonomousActions' }[actionType];
  if (permitKey && !profile.permits[permitKey]) {
    const log = await record({
      ...base,
      jurisdictionCheck: { allowed: false, jurisdiction: profile.country || 'undeclared', rulesChecked: [permitKey] },
      outcome: 'BLOCKED',
      blockReason: profile.configured
        ? `Your declared profile does not permit ${permitKey}.`
        : 'No jurisdiction declared. Defaults deny discretionary actions until you declare one.',
    });
    return { allowed: false, log, reason: log.blockReason };
  }

  // 4. Consent, scoped and unexpired, evaluated at the moment of use.
  if (profile.requiresUserConsent.includes(actionType)) {
    const consent = hasValidConsent(actionType, scope);
    if (!consent.valid) {
      const log = await record({
        ...base,
        jurisdictionCheck: { allowed: true, jurisdiction: profile.country || 'undeclared', rulesChecked: ['user_consent_required'] },
        outcome: 'BLOCKED',
        blockReason: `No active consent for ${actionType} with scope [${scope.join(', ')}].`,
      });
      return { allowed: false, log, reason: log.blockReason, incident: await raiseIncident(log, 'Action attempted without required consent', moduleName) };
    }
    base.consentRecord = consent.consentId;
  }

  const log = await record({
    ...base,
    jurisdictionCheck: { allowed: true, jurisdiction: profile.country || 'undeclared', rulesChecked: ['none_blocking'] },
    outcome: 'EXECUTED',
  });
  return { allowed: true, log };
}