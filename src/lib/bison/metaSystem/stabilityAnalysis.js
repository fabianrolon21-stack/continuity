// Step 4 — Stability Analysis
// Replace entropy-only reasoning. Calculate sources of stability and instability,
// resilience and fragility factors, and recovery paths.

export function analyzeStability(microModel, scaleAnalysis) {
  const elements = [
    ...(microModel?.objects || []),
    ...(microModel?.events || []),
    ...(microModel?.goals || []),
    ...(microModel?.constraints || []),
    ...(microModel?.resources || []),
  ].map(e => e.text || e).join(' ');

  const stabilitySources = [];
  const instabilitySources = [];
  const resilienceFactors = [];
  const fragilityFactors = [];
  const recoveryPaths = [];

  // Stability: things that ground or anchor
  if (/routine|habit|practice|discipline|schedule|structure|support|stable|consistent/i.test(elements)) {
    stabilitySources.push('Existing routines or structures provide anchoring.');
  }
  if (microModel?.resources?.length > 0) {
    stabilitySources.push(`Available resources: ${microModel.resources.map(r => r.text).join(', ')}.`);
  }

  // Instability: things that disrupt
  if (/change|transition|move|conflict|crisis|breakdown|uncertain|chaos|disrupt/i.test(elements)) {
    instabilitySources.push('Active transitions or conflicts are introducing disorder.');
  }
  if (microModel?.constraints?.length > 0) {
    instabilitySources.push(`Constraints are creating pressure: ${microModel.constraints.map(c => c.text).join(', ')}.`);
  }

  // Resilience: things that help recover
  if (/support|friend|family|community|practice|exercise|sleep|therapy|rest/i.test(elements)) {
    resilienceFactors.push('Support systems and self-care practices aid recovery.');
  }
  if (microModel?.goals?.length > 0) {
    resilienceFactors.push('Clear goals provide direction during instability.');
  }

  // Fragility: things that make the system brittle
  if (/isolated|alone|no support|exhausted|burned|overwhelmed|no time|broke/i.test(elements)) {
    fragilityFactors.push('Isolation or exhaustion reduces the system\'s capacity to absorb shocks.');
  }
  if (microModel?.unknowns?.length > 0) {
    fragilityFactors.push('Unresolved unknowns create blind spots.');
  }

  // Recovery paths
  if (resilienceFactors.length > 0) {
    recoveryPaths.push('Leverage existing support systems and routines to stabilize.');
  }
  if (microModel?.goals?.length > 0) {
    recoveryPaths.push('Reconnect with stated goals to reorient.');
  }
  recoveryPaths.push('Identify one small, reversible change to test stability.');

  return {
    stabilitySources: stabilitySources.length > 0 ? stabilitySources : ['No explicit stability sources detected.'],
    instabilitySources: instabilitySources.length > 0 ? instabilitySources : ['No explicit instability sources detected.'],
    resilienceFactors: resilienceFactors.length > 0 ? resilienceFactors : ['Resilience factors not yet clear from available data.'],
    fragilityFactors: fragilityFactors.length > 0 ? fragilityFactors : ['No specific fragility factors detected.'],
    recoveryPaths: recoveryPaths,
  };
}