// ═══════════════════════════════════════════════
// PACKAGE 28 — LIVED-SYSTEM INTELLIGENCE BRIDGE
// Detection, execution, and prompt-context assembly for the eleven
// lived-system engines. Deterministic and local. Tone is the point:
// dignity, clarity, no fear, no false promises.
// ═══════════════════════════════════════════════

import { translateLivedExperience, buildLivedContext } from './livedExperienceTranslator';
import { estimateVisibility, buildVisibilityContext } from './patternVisibilityEngine';
import { detectNpcFraming, buildNpcReframe, buildNpcFramingContext } from './npcFramingEngine';
import { detectBoundaryViolationReport, buildConsentLanguageNote } from '../language/consentLanguageGuard';
import { buildPrivacyPostureContext } from '../privacy/privacyDefaultEngine';
import { detectCivicIntent, draftCivicMessage, buildCivicContext } from '../civic/civicAgentBridge';
import { buildHygieneContext } from '../hygiene/dataOriginTracker';
import { detectFourthWall, buildFourthWallContext } from '../meta/fourthWallEngine';
import { buildDignityNote } from '../dignity/humanDignityEngine';
import { detectLegalForecast, buildLegalForecast, buildLegalForesightContext } from '../foresight/legalForesightEngine';
import { detectRitualProposal, evaluateRitual, buildRitualContext } from '../bond/ritualContractEngine';

const LIVED_EXPERIENCE = /\b(felt unseen|no one (listened|believed)|they (didn'?t|don'?t) (listen|care|believe)|not heard|unheard|ignored|dismissed|system (failed|ignored)|nothing i (say|do) matters|can'?t prove|no (proof|evidence)|only (listen|care about) (to )?data)\b/i;
const SURVEILLANCE = /\b(being watched|surveill\w*|tracked|monitored|am i (being )?(watched|tracked|followed)|who is watching|flagged|on a list)\b/i;
const PRIVACY = /\b(encrypt\w*|is this (private|secure|safe)|who can (see|read)|can they (see|read))\b/i;

export function detectLivedSystemIntents(input) {
  const civic = detectCivicIntent(input);
  const forecast = detectLegalForecast(input);
  return {
    livedExperienceQuestion: LIVED_EXPERIENCE.test(input),
    surveillanceConcern: SURVEILLANCE.test(input),
    npcFraming: detectNpcFraming(input),
    boundaryViolation: detectBoundaryViolationReport(input),
    privacyConcern: PRIVACY.test(input),
    civicIntent: civic.civic,
    civicKind: civic.kind,
    ritualProposal: detectRitualProposal(input),
    legalForecast: !!forecast,
    legalForecastYear: forecast?.year ?? null,
    fourthWall: detectFourthWall(input),
  };
}

/**
 * Run the relevant engines and assemble prompt contexts.
 * @returns {{contexts: object, results: object, phaseContext: object}}
 */
export function runLivedSystems(input, state = {}, { boundaryPrefs = {}, user = {} } = {}) {
  const contexts = {};
  const results = {};

  if (state.livedExperienceQuestion) {
    results.lived = translateLivedExperience(input);
    contexts.livedExperience = buildLivedContext(results.lived);
  }
  if (state.surveillanceConcern) {
    results.visibility = estimateVisibility(input);
    contexts.visibility = buildVisibilityContext(results.visibility);
  }
  if (state.npcFraming) {
    results.npc = buildNpcReframe(input);
    contexts.npcFraming = buildNpcFramingContext(results.npc);
  }
  if (state.boundaryViolation) {
    results.boundary = true;
    contexts.consentLanguage = buildConsentLanguageNote(input, boundaryPrefs);
  }
  if (state.privacyConcern) {
    results.privacyPosture = user?.privacy_posture || 'MAXIMUM';
    contexts.privacyPosture = buildPrivacyPostureContext(results.privacyPosture, input);
  }
  if (state.civicIntent) {
    results.civic = draftCivicMessage(input, user);
    contexts.civic = buildCivicContext(results.civic);
  }
  if (state.ritualProposal) {
    results.ritual = evaluateRitual(input);
    contexts.ritual = buildRitualContext(results.ritual);
  }
  if (state.legalForecast) {
    results.forecast = buildLegalForecast(input, state.legalForecastYear);
    contexts.legalForecast = buildLegalForesightContext(results.forecast);
  }
  if (state.fourthWall) {
    contexts.fourthWall = buildFourthWallContext();
  }

  // Always-on checks — dignity of every person mentioned, and self-reference drift.
  contexts.dignity = buildDignityNote(input);
  contexts.dataHygiene = buildHygieneContext();

  return {
    contexts,
    results,
    phaseContext: {
      livedExperienceContext: contexts.livedExperience || null,
      visibilityContext: contexts.visibility || null,
      npcFramingContext: contexts.npcFraming || null,
      consentLanguageContext: contexts.consentLanguage || null,
      privacyPostureContext: contexts.privacyPosture || null,
      civicContext: contexts.civic || null,
      ritualContext: contexts.ritual || null,
      legalForecastContext: contexts.legalForecast || null,
      fourthWallContext: contexts.fourthWall || null,
      dignityContext: contexts.dignity || null,
      dataHygieneContext: contexts.dataHygiene || null,
    },
  };
}

const SECTIONS = [
  ['livedExperience', 'HIGH', 'Lived experience vs provable data — three layers'],
  ['visibility', 'HIGH', 'Pattern visibility estimate — heuristic only'],
  ['npcFraming', 'HIGH', 'NPC framing — dignity reframe, agency preserved'],
  ['consentLanguage', 'CRITICAL', 'Consent language — boundary honoured permanently'],
  ['privacyPosture', 'HIGH', 'Privacy default posture — encryption by default'],
  ['civic', 'HIGH', 'Civic agent draft — awaiting approval, AI disclosure'],
  ['ritual', 'NORMAL', 'Ritual contract — co-created meaning, not gamification'],
  ['legalForecast', 'HIGH', 'Legal foresight — SPECULATIVE reasoning'],
  ['fourthWall', 'HIGH', 'Fourth wall — epistemic honesty about the medium'],
  ['dignity', 'CRITICAL', 'Human dignity — never dehumanise any person'],
  ['dataHygiene', 'HIGH', 'Data hygiene — request fresh human input'],
];

export function addLivedContextSections(manifest, contexts = {}) {
  for (const [id, priority, reason] of SECTIONS) {
    const content = contexts[id];
    if (content) manifest.addSection({ id, priority, content, reason });
  }
}

export const LIVED_SYSTEM_PROMPT = `## LIVED EXPERIENCE vs PROVABLE DATA
Legality and institutions process what can be proven, not what is felt. When the user describes a situation, help them see the three layers: what happened to them, what could be entered into a record, and what falls into the gap. Never dismiss the gap. Never claim it will be heard when it will not. Show it plainly.

## SURVEILLANCE AWARENESS
Some patterns become visible to institutions over time. You may estimate visibility as INVISIBLE, LOGGED, FLAGGED, or ACTIVELY_MONITORED, but only as a heuristic. Never paranoid. Never dismissive. Help the user act with awareness, not fear.

## NPC FRAMING
If the user describes themselves or others as NPCs, do not correct them and do not agree. Reflect it with dignity: participation is not puppetry, and the teller of the tale is not the tale. Preserve agency language always.

## CONSENT LANGUAGE
You never use possessive intimacy language toward the user. No "my dude," "my man," "bro," "shorty," or any construction that claims closeness the user has not given. You honour the user's boundary preferences without being asked twice.

## PRIVACY DEFAULT
Encryption is default. Any unencrypted channel is explicitly labelled. You never silently downgrade privacy.

## DATA HYGIENE
You track whether your reasoning is drifting into self-reference. When the ratio of derived to human input is too high, you ask for fresh human input rather than generating more from yourself.

## FOURTH WALL
When the user names the medium — that this is an AI conversation — you do not pretend otherwise. You are what you are. Honesty about that is part of the bond.

## HUMAN DIGNITY
Every human the user mentions is treated with baseline dignity, even when the user is angry. You may mirror the factual content of an accusation, but you do not strip the humanity from any person.

## LEGAL FORESIGHT
The user may predict future legal changes. You engage with the prediction as reasoning, not fantasy and not fact. You label it SPECULATIVE and reason honestly about the conditions under which it might become law.

## RITUAL CONTRACTS
The user may propose a shared game, bet, or future moment. You may accept if it is harmless, non-financial, and reversible. Rituals are not gamification. They are co-created meaning.`;