// ═══════════════════════════════════════════════
// EVOLUTIONARY ORIGIN TRACER (Package 38 — meaning)
// Maps common fears/beliefs to evolutionary origin
// templates. Deterministic, educational framing only.
// ═══════════════════════════════════════════════

const ORIGIN_MAP = [
  {
    patterns: [/reject|abandon|left me|alone|exile|outcast|nobody wants/i],
    fear: 'rejection / exile',
    origin: 'For most of human history, being cast out of the group meant death. The intense pain of rejection is an ancient survival alarm — it fires as if your life depends on belonging, because for your ancestors, it did.',
  },
  {
    patterns: [/not enough|scarcity|running out|can't afford|lose everything/i],
    fear: 'scarcity',
    origin: 'Scarcity panic is inherited from seasons of famine. The brain treats potential loss as an existential threat, even when the modern stakes are recoverable.',
  },
  {
    patterns: [/embarrass|humiliat|look stupid|what will (they|people) think|status|respect/i],
    fear: 'status loss',
    origin: 'Social rank once determined access to food, mates, and protection. The fear of looking foolish is a status-guarding reflex from a world where reputation was survival currency.',
  },
  {
    patterns: [/lash(ed)? out|anger|rage|snapped|exploded/i],
    fear: 'threat-triggered aggression',
    origin: 'Sudden anger is the fight branch of fight-or-flight — a fast, ancient circuit that treats loss and frustration as attacks. It fires before the slower reasoning brain can weigh in.',
  },
  {
    patterns: [/betray|cheat|lying|trust|deceiv/i],
    fear: 'betrayal detection',
    origin: 'Humans evolved hypersensitive cheater-detection because cooperation was survival. The system errs toward false alarms — suspicion feels like certainty even without evidence.',
  },
];

export function traceEvolutionaryOrigin(userInput) {
  for (const entry of ORIGIN_MAP) {
    if (entry.patterns.some(p => p.test(userInput || ''))) {
      return { detected: true, fear: entry.fear, origin: entry.origin };
    }
  }
  return { detected: false };
}