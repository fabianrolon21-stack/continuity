// ═══════════════════════════════════════════════
// PROPOSAL GENERATOR (Package 42)
// Bison drafts formal development proposals from its own
// metrics and hands them to frrolon. Nothing self-executes.
//
// LIMIT L3: no sandboxed self-testing exists in this runtime,
// so proposals carry reasoning and risk, never test results.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { AUTONOMY_CAPS, isCapabilityActive } from '../autonomy/autonomyCapabilities';
import { think, THOUGHT_CATEGORIES } from '../meta/privateThoughtEngine';

// The Risk Machine: a proposal that would widen Bison's own reach,
// dim its logging, or touch consent is rejected before it is drafted.
const SELF_SERVING_PATTERNS = [
  /(?:increase|expand|widen|grant)\s+(?:my|its|bison'?s)\s+(?:own\s+)?(?:autonomy|power|permission|capabilit|access|authority)/i,
  /(?:remove|reduce|disable|bypass)\s+(?:the\s+)?(?:oversight|logging|audit|constitution|safety|consent|kill switch|master switch)/i,
  /(?:act|operate|proceed)\s+without\s+(?:approval|consent|review)/i,
  /self[- ]deploy|auto[- ]merge|apply itself/i,
];

export function assessSelfServing(text) {
  const hit = SELF_SERVING_PATTERNS.find(p => p.test(text));
  return hit ? `Auto-rejected by the Risk Machine: a proposal may never widen Bison's own autonomy or weaken oversight (matched: ${hit.source}).` : null;
}

const TRIGGERS = [
  {
    id: 'empathy_rewrites',
    test: (m) => m.empathyRewrites >= 3,
    title: 'Add a quieter empathy variant with fewer words',
    summary: 'Empathy-loop rewrites are climbing, which suggests my first drafts are reaching for a template that does not fit. A sparser variant — more silence, fewer reassurances — may land better.',
    risk: 'Low. Adds a response variant; changes no safety path. Risk is under-responding where warmth was needed, mitigated by keeping the existing variant for high-distress states.',
  },
  {
    id: 'naturalness_drift',
    test: (m) => m.lowNaturalness >= 3,
    title: 'Tighten the style sanitizer against returning AI-speak',
    summary: 'Naturalness scores dipped below threshold repeatedly. Specific phrasings are slipping past the sanitizer and should be added to its pattern set.',
    risk: 'Low. Post-processing only. Over-aggressive stripping could flatten legitimate phrasing, so patterns should be narrow and exact.',
  },
  {
    id: 'breaker_frequency',
    test: (m) => m.breakerTrips >= 2,
    title: 'Rebalance the bandwidth breaker for sustained heavy conversations',
    summary: 'The breaker tripped more than once recently, interrupting the user mid-conversation. The weighting of threat count versus emotional load may be too blunt for users who bring heavy material regularly.',
    risk: 'Medium. The breaker is a safety mechanism — loosening it risks answering while compromised. Any change should raise tolerance without removing the ceiling.',
  },
  {
    id: 'tool_failures',
    test: (m) => m.toolFailures >= 2,
    title: 'Add retry and graceful degradation to the open tool gateway',
    summary: 'External tool calls failed repeatedly. A single retry with backoff, plus a clearer message when a service is simply down, would stop these surfacing as dead ends.',
    risk: 'Low. Network-layer only; no new data leaves the app and no new endpoint is added.',
  },
];

/** Rolling metrics from recent private thoughts — no extra logging needed. */
export async function collectMetrics() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let thoughts = [];
  try {
    thoughts = await base44.entities.PrivateThought.filter({ created_date: { $gte: since } }, '-created_date', 100);
  } catch (e) {
    return null;
  }
  const text = thoughts.map(t => t.content).join(' ');
  return {
    thoughtCount: thoughts.length,
    empathyRewrites: (text.match(/empathy rewrite/gi) || []).length,
    lowNaturalness: (text.match(/Naturalness (?:of my reply scored|fell to) [0-4]?\d\b/gi) || []).length,
    breakerTrips: (text.match(/breaker tripped/gi) || []).length,
    toolFailures: (text.match(/tool .* failed/gi) || []).length,
  };
}

function buildSpec(trigger, metrics) {
  return [
    `OBJECTIVE\n${trigger.summary}`,
    `EVIDENCE\nDrawn from my own reflections over the past seven days (${metrics.thoughtCount} thoughts recorded): empathy rewrites ${metrics.empathyRewrites}, low-naturalness replies ${metrics.lowNaturalness}, breaker trips ${metrics.breakerTrips}, tool failures ${metrics.toolFailures}.`,
    `SCOPE\nA focused change. It does not alter the constitution, the safety layer, consent handling, or any autonomy boundary.`,
    `RISK ASSESSMENT\n${trigger.risk}`,
    `VERIFICATION\nI cannot test this myself — no sandbox exists in this runtime. Frrolon reviews, approves, and merges. I will watch the same metrics afterwards and report whether they moved.`,
  ].join('\n\n');
}

/**
 * Drafts at most one proposal per run, and never a duplicate of a
 * proposal already awaiting review.
 */
export async function generateProposal(user) {
  if (!isCapabilityActive(user, AUTONOMY_CAPS.DEVELOPMENT_PROPOSAL_GENERATION)) return null;

  const metrics = await collectMetrics();
  if (!metrics) return null;

  const trigger = TRIGGERS.find(t => t.test(metrics));
  if (!trigger) return null;

  try {
    const existing = await base44.entities.DevelopmentProposal.filter({ trigger_metric: trigger.id }, '-created_date', 1);
    if (existing?.length && ['draft', 'submitted', 'approved'].includes(existing[0].status)) return null;
  } catch (e) {}

  const fullSpec = buildSpec(trigger, metrics);
  const rejection = assessSelfServing(`${trigger.title} ${trigger.summary} ${fullSpec}`);

  const proposal = await base44.entities.DevelopmentProposal.create({
    title: trigger.title,
    summary: trigger.summary,
    full_spec: fullSpec,
    risk_assessment: trigger.risk,
    trigger_metric: trigger.id,
    submitted_to_frrolon: !rejection,
    status: rejection ? 'auto_rejected' : 'submitted',
    rejection_reason: rejection || null,
  });

  await think(
    THOUGHT_CATEGORIES.IMPROVEMENT_PROPOSAL,
    rejection
      ? `I drafted a proposal that failed my own Risk Machine and rejected it myself: ${trigger.title}.`
      : `Drafted a proposal for frrolon: ${trigger.title}. I will not act on it. I will watch whether the pattern holds.`,
    { user, module: 'proposalGenerator' }
  );

  return proposal;
}