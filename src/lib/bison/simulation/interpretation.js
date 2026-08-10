// Layer 3 — Interpretation. Facts become beliefs, and every belief carries confidence.

export const BELIEF_LABELS = ['unknown', 'known', 'trusted', 'untrusted'];
export const CONFIDENCE_BANDS = ['unknown', 'possible', 'likely', 'certain'];

export function confidenceBand(score) {
  if (score >= 0.85) return 'certain';
  if (score >= 0.6) return 'likely';
  if (score >= 0.3) return 'possible';
  return 'unknown';
}

function ensureBelief(agent, id, name) {
  if (!agent.beliefs[id]) {
    agent.beliefs[id] = { subjectId: id, name, label: 'unknown', trust: 0, encounters: 0, confidence: 0 };
  }
  return agent.beliefs[id];
}

export function interpret(agent, perception) {
  const updated = [];
  for (const other of perception.visibleAgents) {
    const belief = ensureBelief(agent, other.id, other.name);
    belief.encounters += 1;
    belief.confidence = Math.min(1, belief.encounters / 8);
    if (belief.label === 'unknown' && belief.encounters >= 1) belief.label = 'known';
    if (belief.label === 'known' && belief.confidence >= 0.6) {
      belief.label = belief.trust >= 0 ? 'trusted' : 'untrusted';
    }
    if (belief.label !== 'unknown' && belief.confidence >= 0.6) {
      belief.label = belief.trust >= 0 ? 'trusted' : 'untrusted';
    }
    belief.band = confidenceBand(belief.confidence);
    updated.push(belief);
  }
  return updated;
}

export function adjustTrust(agent, subjectId, delta, name = '') {
  const belief = ensureBelief(agent, subjectId, name);
  belief.trust = Math.max(-1, Math.min(1, belief.trust + delta));
  belief.band = confidenceBand(belief.confidence);
  return belief;
}