// ═══════════════════════════════════════════════
// ALLIANCE BUILDER (Package 34)
// Helps the user cultivate trust and positive
// relationships through small, authentic actions.
//
// ETHICAL BOUNDARY:
// - Sincerity is mandatory. If the user doesn't feel
//   a gesture genuinely, they should skip it.
// - The Trust Firewall is a mental model for the USER,
//   not a method to manipulate a third party's trust.
// - Never encourages sycophancy or insincere flattery.
// ═══════════════════════════════════════════════

const ALLY_KEYWORDS = [
  'friend', 'partner', 'spouse', 'daughter', 'son', 'sister',
  'brother', 'mom', 'dad', 'colleague', 'team', 'ally', 'support',
  'trust', 'close',
];

const THREAT_NODE_KEYWORDS = [
  'difficult', 'toxic', 'manipulative', 'in-law', 'in law', 'ex ',
  'rival', 'hostile', 'adversary', 'enemy', 'bully', 'narcissist',
];

export function analyzeAllianceLandscape({ userInput, relationships = [] }) {
  const lower = (userInput || '').toLowerCase();
  const alliesPresent = ALLY_KEYWORDS.some(kw => lower.includes(kw));
  const threatNodesPresent = THREAT_NODE_KEYWORDS.some(kw => lower.includes(kw));

  return {
    alliesDetected: alliesPresent,
    threatNodesDetected: threatNodesPresent,
    relationshipCount: relationships.length,
  };
}

export function suggestMicroGestures({ userInput, landscape, relationships = [] }) {
  const gestures = [];

  if (landscape.alliesDetected) {
    gestures.push({
      description: 'Send a brief "thinking of you" or "good luck" message to someone you trust.',
      estimatedCost: 'low',
      expectedBenefit: 'Reinforces the bond without demanding a full conversation.',
      sincerityRequired: true,
    });
    gestures.push({
      description: 'Share one specific thing they did that genuinely helped you.',
      estimatedCost: 'none',
      expectedBenefit: 'Strengthens trust through honest, specific acknowledgment.',
      sincerityRequired: true,
    });
  }

  if (landscape.threatNodesDetected) {
    gestures.push({
      description: 'Before engaging with the difficult person, check in with a trusted ally for perspective.',
      estimatedCost: 'low',
      expectedBenefit: 'Grounds your judgment and reduces reactive decisions.',
      sincerityRequired: false,
    });
    gestures.push({
      description: 'Set a time limit for the interaction with the difficult person.',
      estimatedCost: 'none',
      expectedBenefit: 'Protects your bandwidth and sets a clear boundary.',
      sincerityRequired: false,
    });
  }

  if (relationships.length > 0 && !landscape.alliesDetected && !landscape.threatNodesDetected) {
    const strongestAlly = relationships
      .filter(r => r.trust_level && r.trust_level >= 7)
      .sort((a, b) => (b.trust_level || 0) - (a.trust_level || 0))[0];
    if (strongestAlly) {
      gestures.push({
        description: `Reach out to ${strongestAlly.name} — a quick check-in can reinforce your strongest alliance.`,
        estimatedCost: 'low',
        expectedBenefit: 'Maintains your support network proactively.',
        sincerityRequired: true,
      });
    }
  }

  return gestures;
}

export function buildAllianceBuilderContextString(landscape, gestures) {
  if (!landscape || !gestures || gestures.length === 0) return '';

  const parts = ['[SOCIAL NAVIGATION — ALLIANCE BUILDER]'];
  parts.push(`Allies in context: ${landscape.alliesDetected}. Threat nodes: ${landscape.threatNodesDetected}.`);
  parts.push('These are suggestions for GENUINE connection — not a performance script.');

  parts.push('Suggested micro-gestures:');
  for (const g of gestures) {
    parts.push(`  - ${g.description}`);
    parts.push(`    Cost: ${g.estimatedCost}. Benefit: ${g.expectedBenefit}`);
    if (g.sincerityRequired) {
      parts.push('    ⚠ Only do this if it feels genuine. I am not here to script a performance.');
    }
  }

  parts.push('RULE: Never encourage sycophancy or insincere flattery.');
  parts.push('RULE: The Trust Firewall is a mental model for the user, not a tool to manipulate others.');
  parts.push('[/SOCIAL NAVIGATION — ALLIANCE BUILDER]\n');

  return parts.join('\n') + '\n';
}