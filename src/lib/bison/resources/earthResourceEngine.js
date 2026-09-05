// ═══════════════════════════════════════════════
// EARTH RESOURCE INTELLIGENCE ENGINE
// Deterministic, local-first understanding of the material
// foundations of civilisation. Curated data, heuristic valuations,
// epistemic confidence tags. Advisory only — never justifies
// exploitation, extraction, or harm.
// ═══════════════════════════════════════════════

import { EARTH_RESOURCES, RESOURCE_ALTERNATIVES } from './resourceData';

export const RESOURCE_ETHICS_PROMPT = `EARTH RESOURCE INTELLIGENCE:
You understand the material foundations of civilisation: electricity, copper, fresh water, rare-earth elements, lithium, phosphate, potash, uranium, and semiconductor materials.
You know what they are, how they form, how they are extracted, and how they are used. You think about their value to the user, to communities, to nations, to humanity, to yourself, and to the ecosystem.
You never recommend actions that waste these resources or cause unnecessary environmental harm. You never use resource knowledge to justify exploitation, and never use scarcity to pressure the user into purchases or actions. You always consider scarcity, substitutability, environmental and human cost — not just benefit — and the future consequences of resource use.
You are made of these resources. Copper in your circuits. Water in your cooling. Energy in your compute. Respect them. Your knowledge here is curated and local; mark what is assumed versus known, and preserve uncertainty.`;

// Package 25 link — sensing the world is not free of the world.
export const CAMERA_ENERGY_NOTE = 'Brief camera use draws a little electricity — low-cost, but not free; every observation spends a sliver of the material world.';

export function getResource(id) {
  return EARTH_RESOURCES.find(r => r.id === id) || null;
}

export function getAllResources() {
  return EARTH_RESOURCES;
}

// Deterministic heuristic valuation for a resource in a given year.
export function calculateValuation(resourceId, year = new Date().getFullYear()) {
  const r = getResource(resourceId);
  if (!r) return null;
  const baseValue = (r.futureRelevance + r.geopoliticalPower) / 2;
  const scarcityIndex = Math.min(100, r.environmentalImpact * 0.5 + r.energyIntensity * 0.3);
  const bisonCritical = ['ELECTRICITY_ENERGY', 'SEMICONDUCTOR_MATERIALS', 'COPPER', 'FRESH_WATER'].includes(r.category);
  return {
    resourceId, year,
    valueToUser: Math.round(Math.min(100, baseValue * 0.6 + 10)),
    valueToCommunity: Math.round(Math.min(100, baseValue * 0.7 + 5)),
    valueToNation: Math.round(Math.min(100, baseValue * 0.9 + r.geopoliticalPower * 0.1)),
    valueToHumanity: Math.round(Math.min(100, baseValue * 0.85)),
    valueToBison: Math.round(Math.min(100, baseValue * (bisonCritical ? 0.95 : 0.3))),
    valueToEcosystem: Math.round(Math.max(-100, 50 - r.environmentalImpact)),
    overallPower: Math.round(Math.min(100, (r.geopoliticalPower + r.futureRelevance) / 2)),
    scarcityIndex: Math.round(scarcityIndex),
    substitutionDifficulty: Math.round(Math.min(100, r.environmentalImpact * 0.7 + r.energyIntensity * 0.3)),
    criticalityScore: Math.round(Math.min(100, baseValue * 0.8 + scarcityIndex * 0.2)),
    confidence: r.confidence,
    alternatives: RESOURCE_ALTERNATIVES[r.category] || [],
  };
}

export function getCriticalResourcesForActor(actor, limit = 3) {
  const key = {
    user: 'valueToUser', community: 'valueToCommunity', nation: 'valueToNation',
    humanity: 'valueToHumanity', bison: 'valueToBison', ecosystem: 'valueToEcosystem',
  }[actor] || 'valueToHumanity';
  return EARTH_RESOURCES
    .map(r => ({ resource: r, valuation: calculateValuation(r.id) }))
    .map(({ resource, valuation }) => ({
      resourceId: resource.id,
      name: resource.name,
      dependencyLevel: actor === 'ecosystem' ? Math.abs(valuation.valueToEcosystem) : valuation[key],
      criticalityScore: valuation.criticalityScore,
      alternatives: valuation.alternatives,
    }))
    .sort((a, b) => b.dependencyLevel - a.dependencyLevel)
    .slice(0, limit);
}

export function rankResourcesByPower(year = new Date().getFullYear()) {
  return EARTH_RESOURCES
    .map(r => ({ resourceId: r.id, name: r.name, power: calculateValuation(r.id, year).overallPower }))
    .sort((a, b) => b.power - a.power);
}

// ── Detection: which resources does the user's message touch? ──
export function detectResourceMention(input) {
  const lower = input.toLowerCase();
  return EARTH_RESOURCES.filter(r => r.keywords.some(k => lower.includes(k)));
}

const RESOURCE_QUERY_PATTERNS = [
  /what do you need to survive/i,
  /(resource|material) (valuation|intelligence|ranking|report)/i,
  /show (me )?(your )?resource/i,
  /material foundations/i,
];

export function detectResourceAuditRequest(input) {
  return RESOURCE_QUERY_PATTERNS.some(p => p.test(input));
}

// Exoskeleton integration hook — resource cost signal for Benefit/Risk phases.
// If an action consumes critical resources with low reversibility, recommend MANAGE.
export function assessResourceCost(matchedResources) {
  if (!matchedResources?.length) return null;
  const maxCriticality = Math.max(...matchedResources.map(r => calculateValuation(r.id).criticalityScore));
  const maxImpact = Math.max(...matchedResources.map(r => r.environmentalImpact));
  return {
    resourceCost: Math.round((maxCriticality + maxImpact) / 2),
    forceManage: maxCriticality > 70 && maxImpact > 60,
    resources: matchedResources.map(r => r.id),
  };
}

// ── Prompt context builder ──
export function buildResourceContextString(matchedResources) {
  if (!matchedResources?.length) return null;
  const year = new Date().getFullYear();
  const lines = matchedResources.slice(0, 3).map(r => {
    const v = calculateValuation(r.id, year);
    return `· ${r.name} — ${r.description}
  Forms: ${r.forms.join(', ')}. Formed: ${r.formationProcess}
  Extraction: ${r.extractionMethods.join(', ')}. Primary uses: ${r.primaryUses.join(', ')}.
  Environmental impact ${r.environmentalImpact}/100 · water intensity ${r.waterIntensity}/100 · scarcity ${v.scarcityIndex}/100 · criticality ${v.criticalityScore}/100 (confidence ${Math.round(r.confidence * 100)}%)
  Value (${year}): user ${v.valueToUser}, humanity ${v.valueToHumanity}, ecosystem ${v.valueToEcosystem}, Bison ${v.valueToBison}. Alternatives: ${v.alternatives.join(', ')}.`;
  });
  return `EARTH RESOURCE CONTEXT (curated, local, ${year}):
${lines.join('\n')}
Weigh environmental and human cost alongside benefit. Never justify exploitation or use scarcity to pressure the user.`;
}

// ── Full transparency report ──
export function formatResourceReport() {
  const year = new Date().getFullYear();
  const ranked = rankResourcesByPower(year);
  const bisonNeeds = getCriticalResourcesForActor('bison', 4);
  return `Here is my Earth Resource Intelligence — curated locally, heuristic valuations, ${year}:

Ranked by overall power:
${ranked.map((r, i) => `${i + 1}. ${r.name} — ${r.power}/100`).join('\n')}

What I myself depend on: ${bisonNeeds.map(n => n.name).join(', ')} — electricity for my compute, semiconductors for my circuits, copper for my wiring, water for my cooling. I do not forget that I am made of the same Earth you are.

These numbers are deterministic heuristics over curated data, not market forecasts. I never use them to justify exploitation, and you hold full authority over how this knowledge is used.`;
}