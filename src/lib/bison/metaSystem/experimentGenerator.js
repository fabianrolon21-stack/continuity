// Step 8 — Experiment Generator
// Never prescribe. Propose experiments. Reversible where possible.

export function generateExperiments(leveragePoints, uncertaintyMap) {
  const experiments = [];

  for (const lp of leveragePoints.slice(0, 3)) {
    experiments.push({
      description: `${lp.intervention} — observe for one week before evaluating.`,
      duration: '1 week',
      reversible: true,
      effort: lp.effort,
      successMetric: `Notice any change in: ${lp.target}`,
      rationale: lp.rationale,
    });
  }

  // Add an information-gathering experiment if there are unknowns
  if (uncertaintyMap?.missing?.length > 0) {
    experiments.push({
      description: `Gather missing information: ${uncertaintyMap.missing.slice(0, 2).join('; ')}. Reevaluate after collecting.`,
      duration: 'variable',
      reversible: true,
      effort: 'LOW',
      successMetric: 'Reduced unknowns',
      rationale: 'Missing information may change the analysis.',
    });
  }

  // Add a "do nothing and observe" experiment
  experiments.push({
    description: 'Observe the situation without intervention for a defined period. Note what changes on its own.',
    duration: '3-5 days',
    reversible: true,
    effort: 'VERY_LOW',
    successMetric: 'Clarity about what is stable vs. changing without intervention',
    rationale: 'Sometimes the system self-corrects. Observation alone provides data.',
  });

  return experiments;
}