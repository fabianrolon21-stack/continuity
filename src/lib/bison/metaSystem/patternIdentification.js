// Step 2 — Pattern Identification
// Search existing memory graph for similar structures.
// Return multiple candidates. Never force one pattern.

import patternsData from '../metaSystemPatterns.json';

function computeKeywordScore(elements, pattern) {
  const keywords = pattern.detectionKeywords || [];
  const lowerElements = elements.map(e => e.toLowerCase());
  let matches = 0;
  for (const kw of keywords) {
    if (lowerElements.some(e => e.includes(kw) || kw.includes(e))) matches++;
  }
  return keywords.length > 0 ? matches / keywords.length : 0;
}

function computeSubgraphScore(elements, pattern) {
  const nodes = pattern.graphStructure?.nodes || [];
  const lowerElements = elements.map(e => e.toLowerCase());
  let nodeMatches = 0;
  for (const node of nodes) {
    if (lowerElements.some(e => e.includes(node) || node.includes(e))) nodeMatches++;
  }
  return nodes.length > 0 ? nodeMatches / nodes.length : 0;
}

export function identifyPatterns(microModel) {
  const elements = [
    ...(microModel?.objects || []),
    ...(microModel?.events || []),
    ...(microModel?.goals || []),
    ...(microModel?.constraints || []),
    ...(microModel?.resources || []),
    ...(microModel?.relationships || []),
  ].map(e => e.text || e);

  if (!elements.length) return [];

  const matches = patternsData.patterns.map(pattern => {
    const keywordScore = computeKeywordScore(elements, pattern);
    const subgraphScore = computeSubgraphScore(elements, pattern);
    const combinedScore = keywordScore * 0.6 + subgraphScore * 0.4;
    return { pattern, confidence: Math.round(combinedScore * 100) / 100, keywordScore, subgraphScore };
  });

  const viable = matches.filter(m => m.confidence > 0.05);
  viable.sort((a, b) => b.confidence - a.confidence);
  return viable.slice(0, 3);
}