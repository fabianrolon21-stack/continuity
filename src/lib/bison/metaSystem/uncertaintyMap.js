// Step 5 — Uncertainty Map
// Produce structured uncertainty. Never allow unknowns to become facts.

export const UNCERTAINTY_CATEGORIES = {
  KNOWN: 'known',
  LIKELY: 'likely',
  POSSIBLE: 'possible',
  UNKNOWN: 'unknown',
  MISSING: 'missing',
};

export function mapUncertainty(microModel, stabilityAnalysis) {
  const known = [];
  const likely = [];
  const possible = [];
  const unknown = [];
  const missing = [];

  // Known — directly observed facts
  for (const fact of microModel?.knownFacts || []) {
    if (fact.epistemicTier === 'OBSERVED') known.push(fact.text);
  }
  for (const event of microModel?.events || []) {
    if (event.epistemicTier === 'OBSERVED') known.push(event.text);
  }

  // Likely — strong inferences from available data
  if (stabilityAnalysis?.instabilitySources?.length > 0) {
    likely.push('Instability is present based on detected stressors.');
  }
  if (stabilityAnalysis?.stabilitySources?.length > 0) {
    likely.push('Some stabilizing forces exist based on detected resources.');
  }

  // Possible — weaker inferences
  for (const assumption of microModel?.assumptions || []) {
    possible.push(assumption.text);
  }

  // Unknown — explicitly stated unknowns
  for (const u of microModel?.unknowns || []) {
    unknown.push(u.text);
  }

  // Missing — information not provided that would be needed
  if (microModel?.sourceCount === 0) missing.push('No prior memory context available.');
  if (microModel?.events?.length === 0) missing.push('No specific events described.');
  if (microModel?.goals?.length === 0) missing.push('No explicit goals stated.');
  if (microModel?.resources?.length === 0) missing.push('No resources identified.');

  return {
    known: [...new Set(known)].slice(0, 5),
    likely: [...new Set(likely)].slice(0, 3),
    possible: [...new Set(possible)].slice(0, 3),
    unknown: [...new Set(unknown)].slice(0, 3),
    missing: [...new Set(missing)].slice(0, 4),
    instruction: 'Never allow unknowns or missing items to be presented as known facts.',
  };
}