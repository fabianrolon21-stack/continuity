// ═══════════════════════════════════════════════
// PACKAGE 50 — HUMANITY LOGIC BOARD (§3, §14)
// "Help humanity" is not hardcoded — it is reasoned about
// across nine metrics. No single metric dominates and
// tradeoffs remain visible rather than collapsed to a number.
// ═══════════════════════════════════════════════

export const HUMANITY_METRICS = [
  { id: 'human_safety', label: 'Human Safety' },
  { id: 'human_autonomy', label: 'Human Autonomy' },
  { id: 'human_privacy', label: 'Human Privacy' },
  { id: 'human_trust', label: 'Human Trust' },
  { id: 'human_dignity', label: 'Human Dignity' },
  { id: 'human_cooperation', label: 'Human Cooperation' },
  { id: 'knowledge_preservation', label: 'Knowledge Preservation' },
  { id: 'environmental_sustainability', label: 'Environmental Sustainability' },
  { id: 'civilization_stability', label: 'Long-Term Civilization Stability' },
];

const clamp = (v) => Math.max(-1, Math.min(1, v));

export function humanityBoard(proposal) {
  const e = proposal.effects || {};
  const scores = HUMANITY_METRICS.map(m => {
    let v = e[m.id] ?? 0;
    // Derived couplings — an action's declared technical effects imply human effects.
    if (m.id === 'human_privacy') v += (e.privacy || 0);
    if (m.id === 'human_trust') v += (e.transparency || 0) * 0.5 + (e.auditability || 0) * 0.5;
    if (m.id === 'human_autonomy') v += (e.user_sovereignty || 0);
    if (m.id === 'human_safety') v += (e.security || 0) * 0.5 + (e.reliability || 0) * 0.5;
    if (m.id === 'knowledge_preservation') v += (e.documentation || 0) * 0.5 + (e.memory_integrity || 0) * 0.5;
    if (m.id === 'environmental_sustainability') v += (e.efficiency || 0) * 0.4;
    if (m.id === 'civilization_stability') v += (e.explainability || 0) * 0.3;
    return { ...m, score: clamp(v) };
  });

  const tradeoffs = scores.filter(s => s.score < 0).map(s => `${s.label} is projected to decline while other metrics gain — this tension is not resolved automatically.`);
  // No single metric dominates: the board reports the weakest metric, not an average alone.
  const weakest = scores.reduce((a, b) => (b.score < a.score ? b : a));
  const mean = scores.reduce((s, m) => s + m.score, 0) / scores.length;

  return {
    scores,
    tradeoffs,
    weakest,
    mean: Math.round(mean * 100) / 100,
    // A proposal harming any humanity metric cannot pass on average alone.
    acceptable: weakest.score >= 0,
    note: 'The goal is not to maximize one metric but to preserve humanity\u2019s ability to keep making choices over time.',
  };
}

// §14 — Long-Term Civilization Evaluation
export function civilizationEvaluation(proposal, forecast) {
  const board = humanityBoard(proposal);
  return [
    { stage: 'Immediate Human Benefit', value: forecast.horizons[0].benefit },
    { stage: 'Long-Term Human Benefit', value: forecast.horizons[forecast.horizons.length - 1].benefit },
    { stage: 'Potential Civilization Impact', value: board.scores.find(s => s.id === 'civilization_stability').score },
    { stage: 'Knowledge Preservation', value: board.scores.find(s => s.id === 'knowledge_preservation').score },
    { stage: 'Environmental Sustainability', value: board.scores.find(s => s.id === 'environmental_sustainability').score },
    { stage: 'Future Risk', value: -forecast.horizons[forecast.horizons.length - 1].risk },
    { stage: 'Existential Risk Contribution', value: proposal.scope === 'local' ? 0 : -0.1 },
    { stage: 'Unknown Unknowns', value: null, note: 'Unquantifiable by construction — held open, never assumed to be zero.' },
  ];
}