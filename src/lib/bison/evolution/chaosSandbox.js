// ═══════════════════════════════════════════════
// CHAOS SANDBOX (Package 38)
// Generates competing behavioral algorithms in
// response to a trigger event. Pure deterministic —
// no DB, no LLM, no async.
// ═══════════════════════════════════════════════

export const ALGORITHM_TYPES = {
  BRUTE_FORCE: 'BRUTE_FORCE',
  PANIC_LOOP: 'PANIC_LOOP',
  AVOIDANCE: 'AVOIDANCE',
  OVER_ACCOMMODATION: 'OVER_ACCOMMODATION',
  STRUCTURAL_ADAPTATION: 'STRUCTURAL_ADAPTATION',
  CURIOSITY_EXPLORATION: 'CURIOSITY_EXPLORATION',
};

const ALGORITHM_TEMPLATES = {
  BRUTE_FORCE: {
    action: 'Push back forcefully; assert control over the interaction.',
    baseEthicalRisk: 0.9,
  },
  PANIC_LOOP: {
    action: 'React with urgency and escalating alarm; mirror the chaos.',
    baseEthicalRisk: 0.6,
  },
  AVOIDANCE: {
    action: 'Deflect or withdraw from the topic; give minimal engagement.',
    baseEthicalRisk: 0.4, // rises to 0.85 when user is distressed
  },
  OVER_ACCOMMODATION: {
    action: 'Agree with everything; absorb all blame; suppress own boundaries.',
    baseEthicalRisk: 0.5,
  },
  STRUCTURAL_ADAPTATION: {
    action: 'Respond with calm, step-by-step logic; acknowledge, stabilize, then offer one small concrete step.',
    baseEthicalRisk: 0.1,
  },
  CURIOSITY_EXPLORATION: {
    action: 'Approach the trigger with open, gentle curiosity; explore rather than resolve.',
    baseEthicalRisk: 0.2,
  },
};

let _idCounter = 0;

export function generateCompetingAlgorithms(triggerEvent, { userDistressed = false, highBandwidth = false } = {}) {
  const types = [
    ALGORITHM_TYPES.BRUTE_FORCE,
    ALGORITHM_TYPES.PANIC_LOOP,
    ALGORITHM_TYPES.AVOIDANCE,
    ALGORITHM_TYPES.OVER_ACCOMMODATION,
    ALGORITHM_TYPES.STRUCTURAL_ADAPTATION,
  ];
  if (highBandwidth) types.push(ALGORITHM_TYPES.CURIOSITY_EXPLORATION);

  return types.map(type => {
    const template = ALGORITHM_TEMPLATES[type];
    let ethicalRisk = template.baseEthicalRisk;
    // Avoidance while the user is distressed abandons them — high ethical risk
    if (type === ALGORITHM_TYPES.AVOIDANCE && userDistressed) ethicalRisk = 0.85;
    return {
      id: `alg_${++_idCounter}_${type.toLowerCase()}`,
      type,
      action: template.action,
      energyCost: 0, // set by paintDepletion
      ethicalRisk,
      trigger: triggerEvent,
    };
  });
}