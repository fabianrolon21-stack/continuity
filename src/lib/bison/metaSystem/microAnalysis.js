// Step 1 — Micro Analysis
// Break the problem into observable components.
// Only use information currently available. Never invent missing information.

import { tagEpistemic, EPISTEMIC_TIER } from './epistemicFirewall';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that',
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return [...new Set(text.toLowerCase()
    .replace(/[^\w\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w)))];
}

function extractMatches(text, pattern) {
  if (!text) return [];
  const matches = [];
  let match;
  const regex = new RegExp(pattern.source, pattern.flags);
  while ((match = regex.exec(text)) !== null && matches.length < 5) {
    if (match[1]) matches.push(match[1].trim().substring(0, 120));
    regex.lastIndex = match.index + 1;
  }
  return matches;
}

export function performMicroAnalysis(description, userContext = {}) {
  const tokens = tokenize(description);
  const recentMemories = userContext.recentMemories || [];

  const events = extractMatches(description, /(?:happened|occurred|did|went|came|started|ended|finished|began|said) (.+?)(?:\.|,|$)/i);
  const goals = extractMatches(description, /(?:want to|need to|plan to|going to|aim to|goal is|trying to|working on) (.+?)(?:\.|,|$)/i);
  const constraints = extractMatches(description, /(?:can'?t|cannot|don'?t have|unable to|limited by|constrained by|blocked by) (.+?)(?:\.|,|$)/i);
  const resources = extractMatches(description, /(?:have|with|using|available|access to) (.+?)(?:\.|,|$)/i);
  const unknowns = extractMatches(description, /(?:don'?t know|unsure|uncertain|unclear|no idea|wondering|confused) (.+?)(?:\.|,|$)/i);
  const assumptions = extractMatches(description, /(?:assume|assuming|presume|presumably|supposedly|must be|should be) (.+?)(?:\.|,|$)/i);

  const objects = tokens.filter(t =>
    recentMemories.some(m => (m.text || '').toLowerCase().includes(t))
  ).slice(0, 8);

  const relationships = tokens.filter(t =>
    /friend|family|partner|colleague|boss|team|group|community|parent|child|spouse/i.test(t)
  ).slice(0, 5);

  const knownFacts = tokens.slice(0, 6).map(t => tagEpistemic({
    text: t, type: 'fact', epistemicTier: EPISTEMIC_TIER.OBSERVED,
  }));

  return {
    events: events.map(e => tagEpistemic({ text: e, type: 'event' })),
    relationships: relationships.map(r => tagEpistemic({ text: r, type: 'relationship' })),
    objects: objects.map(o => tagEpistemic({ text: o, type: 'object' })),
    goals: goals.map(g => tagEpistemic({ text: g, type: 'goal' })),
    constraints: constraints.map(c => tagEpistemic({ text: c, type: 'constraint' })),
    resources: resources.map(r => tagEpistemic({ text: r, type: 'resource' })),
    knownFacts,
    unknowns: unknowns.map(u => tagEpistemic({ text: u, type: 'unknown', epistemicTier: EPISTEMIC_TIER.UNKNOWN })),
    assumptions: assumptions.map(a => tagEpistemic({ text: a, type: 'assumption', epistemicTier: EPISTEMIC_TIER.INFERRED })),
    elementCount: tokens.length,
    sourceCount: recentMemories.length,
    summary: `Key actors: ${tokens.slice(0, 6).join(', ') || 'none detected'}`,
  };
}