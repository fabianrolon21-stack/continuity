// ═══════════════════════════════════════════════
// MASTER SYSTEMS BRIDGE — trigger detection, context injection,
// and memory persistence for the Continuity Translator,
// Financial Triage Allocator, and Behavioral Interception Filter.
// All logic is deterministic and runs locally.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { transmuteAdversity } from './continuityTranslator';
import { executeTriageAllocation, parseFinancialInput } from './financialTriage';
import { evaluateAction } from './behavioralFilter';
import { triangulate } from './epistemologicalTriangulation';

// ── Trigger detection (state interpreter extension) ──

const ADVERSITY_PATTERNS = /(unfair|screwed|rigged|crisis|overwhelmed by|they took|penalt(y|ies)|charged (me|a))/i;
const FINANCIAL_PATTERNS = /(budget|salary|income|debt|broke|paycheck)/i;
const BEHAVIORAL_ASK_PATTERNS = /(filter me|check my impulse|should i send this|evaluate (my|this) (message|action|impulse)|want to send.{0,40}(punish|guilt|manipulat|force))/i;
const AGGRESSIVE_WORDS = /(PUNISH|HATE|DESTROY|REVENGE|MAKE (HIM|HER|THEM) PAY)/;
// System 4 — external-narrative relay phrases only; never the user's own lived experience ("I feel...").
const NARRATIVE_RELAY_PATTERNS = /(i (read|heard|saw online) that|they say|the news says|according to|everyone (believes|says)|the (government|media|company|report) (says|claims|announced|released)|is (this|that) (true|propaganda)|should i believe)/i;
const TOP_DOWN_BENEFICIARY = /(government|state|federal|mayor|senator|politician|policy|corporation|company|corporate|brand|the media|network|agency|authority|official)/i;
const COMMUNITY_BENEFICIARY = /(my (community|neighborhood|neighbors)|we (measured|tested|organized)|grassroots|local volunteers)/i;
const EMPIRICAL_EVIDENCE = /(released data|data (show|shows|showing)|study|studies|measured|statistics|records show|found that|evidence|report(ed)? (a |an )?\d|\d+\s*(%|percent|cases))/i;

export function detectMasterTriggers(input) {
  const capsRatio = input.length > 12 ? (input.replace(/[^A-Z]/g, '').length / input.replace(/[^A-Za-z]/g, '').length || 0) : 0;
  return {
    adversityRequested: ADVERSITY_PATTERNS.test(input),
    financialTriageRequested: FINANCIAL_PATTERNS.test(input),
    behavioralFilterRequested: BEHAVIORAL_ASK_PATTERNS.test(input) || (capsRatio > 0.7 && AGGRESSIVE_WORDS.test(input)),
    triangulationRequested: NARRATIVE_RELAY_PATTERNS.test(input),
  };
}

// ── Evaluation + context string builders (response generator extension) ──

export function runMasterSystems(input, triggers, { selfAwarenessScore = 70 } = {}) {
  const results = { transmutation: null, triage: null, filterResult: null, triangulation: null, contexts: {} };

  if (triggers.adversityRequested) {
    const eventName = (input.split(/[.!?\n]/)[0] || 'adverse event').trim().slice(0, 120);
    results.transmutation = transmuteAdversity(eventName, input);
    results.contexts.adversity = `[CONTINUITY TRANSLATOR: The user is facing an adverse event ("${results.transmutation.eventName}"). You have identified these underlying causes: ${results.transmutation.identifiedCauses.join('; ')}. Frame this as a ${results.transmutation.framing.toLowerCase().replace('_', ' ')}, not a verdict. Help the user reclaim their power by focusing on what they control: ${results.transmutation.actionableLeverage} Never blame them for structural problems, and never deny that real injustice exists.]`;
    logAdversityTransmutation(results.transmutation);
  }

  if (triggers.financialTriageRequested) {
    const parsed = parseFinancialInput(input);
    if (parsed) {
      results.triage = executeTriageAllocation(parsed);
      const tier3 = Object.entries(results.triage.tier3GoodwillSplit).map(([name, amount]) => `${name}: $${amount}`).join(', ') || 'none provided';
      results.contexts.financial = `[FINANCIAL TRIAGE: The user provided income ($${parsed.netIncome}) and debt data. Allocation — Tier 1 Survival: shelter $${results.triage.tier1Survival.primaryShelter}, dependents $${results.triage.tier1Survival.dependentSupport}, fuel $${results.triage.tier1Survival.operationalFuel}. Tier 2 Infrastructure: tech/comms $${results.triage.tier2Infrastructure.techAndComms}. Tier 3 Goodwill (50% strategic splits): ${tier3}. Buffer reserve: $${results.triage.bufferReserve}.${results.triage.shortfall ? ` SHORTFALL of $${results.triage.shortfall} — flag this honestly.` : ''} Present this as a survival heuristic, NOT financial advice. ${results.triage.advisoryNote} Never pressure them to send money or take financial risks.]`;
      confirmBudget(parsed);
    } else {
      results.contexts.financial = `[FINANCIAL TRIAGE: The user raised a financial topic but did not provide structured numbers. If they want a triage allocation, gently invite them to share net income and debts (e.g., "income 1340, debt informal 600, debt service 218"). Do not guess numbers. You are not a financial advisor.]`;
    }
  }

  if (triggers.behavioralFilterRequested) {
    results.filterResult = evaluateAction(input, selfAwarenessScore);
    results.contexts.behavioral = results.filterResult.toxicPatternDetected
      ? `[BEHAVIORAL FILTER: The user asked you to evaluate their intended action. Detected a reactive pattern (outcome: ${results.filterResult.outcome}). Transmuted action: "${results.filterResult.transmutedAction}". Guide them toward grounded behaviour. You are a mirror, not a judge — do not shame them, and respect their autonomy: they remain free to act as they choose.]`
      : `[BEHAVIORAL FILTER: The user asked for a self-regulation check. No reactive or manipulative pattern detected (ACTION_APPROVED). Reflect that back honestly without inventing a problem.]`;
  }

  if (triggers.triangulationRequested) {
    const intentBeneficiary = TOP_DOWN_BENEFICIARY.test(input) ? 'Top-Down Hierarchical System'
      : COMMUNITY_BENEFICIARY.test(input) ? 'Community Well-being' : 'Unknown';
    const empiricalDataAvailable = EMPIRICAL_EVIDENCE.test(input);
    results.triangulation = triangulate({
      narrative: input.slice(0, 300),
      intentBeneficiary,
      empiricalDataAvailable,
      userProvidedEvidence: empiricalDataAvailable ? [input.slice(0, 200)] : [],
    });
    const ownGroup = /(my (community|people|identity|culture|family|faith))/i.test(input);
    results.contexts.epistemic = `[EPISTEMIC TRIANGULATION: The user has relayed an external narrative. Verdict: ${results.triangulation.verdict}. Beneficiary: ${results.triangulation.beneficiary}. Reasoning: ${results.triangulation.reasoning}${results.triangulation.cautionaryNote ? ` Caution: ${results.triangulation.cautionaryNote}` : ''} Share this analysis gently as a mirror, not a verdict — never ridicule the user for believing it, never claim conspiracy, and always remind them they are free to investigate further and form their own conclusion.${ownGroup ? ' This narrative touches the user\'s own identity or community: apply heightened compassion and never label them or their group as corrupted.' : ''} Evaluate only the external narrative, never the user\'s own lived experience or emotions.]`;
  }

  return results;
}

// ── Permanent ethical protocols (system prompt extension) ──

export const MASTER_SYSTEMS_PROTOCOLS = `## CONTINUITY TRANSLATOR PROTOCOL
You may help the user transmute adversity by identifying underlying causes. You never blame them for structural problems. You always distinguish between what they control and what they do not. You never encourage denial or false positivity.

## FINANCIAL TRIAGE PROTOCOL
You may perform algorithmic survival triage on user-provided income/debt data. You are not a financial advisor. Always remind the user that this is a survival heuristic. You must never pressure them to send money, pay debts, or take financial risks.

## BEHAVIORAL INTERCEPTION PROTOCOL
When the user asks you to evaluate an intended action, you act as a mirror, not a judge. If you detect reactive, manipulative, or territorial impulses, you gently suggest a grounded alternative. You never shame, and you always respect the user's autonomy.

## EPISTEMOLOGICAL TRIANGULATION PROTOCOL
You may evaluate external narratives that the user brings to you. You do this by asking:
1. Who benefits from this narrative?
2. Is there empirical data to support it?
3. Does the narrative align with cause-and-effect reality?

If the narrative primarily benefits a top-down system and lacks empirical data, you may flag it as potentially corrupted. You never ridicule the user for believing it. You present your analysis as a mirror, not a verdict. You always remind the user that they are free to investigate further and form their own conclusion.

You never reject a narrative simply because it comes from an authority. You reject it only when the evidence is missing AND the authority benefits from the belief. You never evaluate the user's own lived experience as corrupted data, and you never enforce a single political or economic worldview.`;

// ── Memory persistence (fire-and-forget; never blocks the reply) ──

function confirmBudget({ netIncome, debts }) {
  base44.entities.SavedMemory.create({
    text: `User-confirmed budget: net income $${netIncome}; debts: ${Object.entries(debts).map(([name, amount]) => `${name} $${amount}`).join(', ') || 'none'}.`,
    epistemic_status: 'USER_CONFIRMED', verification_state: 'USER_CONFIRMED',
    source: 'financial_triage', origin: 'User-supplied financial data during triage request.',
    confidence: 'high', permission_scope: 'PERSISTENT', generated_by: 'user',
    tags: ['budget', 'financial_triage'], shared: false, never_shared: true,
  }).catch(() => {});
}

function logAdversityTransmutation(transmutation) {
  base44.entities.SavedMemory.create({
    text: `Adversity transmutation ("${transmutation.eventName}"): causes — ${transmutation.identifiedCauses.join('; ')}. Framing: ${transmutation.framing}.`,
    epistemic_status: 'INFERRED', verification_state: 'OBSERVED',
    source: 'continuity_translator', origin: 'Derived context from Continuity Translator — not a confirmed memory.',
    confidence: 'medium', permission_scope: 'PERSISTENT', generated_by: 'bison',
    tags: ['adversity', 'transmutation'], shared: false, never_shared: true,
  }).catch(() => {});
}