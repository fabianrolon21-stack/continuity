// ═══════════════════════════════════════════════
// REALITY TRIAGE ENGINE (Package: Somatic Anchor)
// Classifies user concerns into threat items with
// urgency, actionability, and status, then generates
// a structured reality summary for grounding.
//
// Deterministic keyword + context mapper.
// No external API calls — fully local.
// ═══════════════════════════════════════════════

const KEYWORD_MAP = {
  'rent': { category: 'Financial', urgency: 'Soon' },
  'insurance': { category: 'Financial', urgency: 'Soon' },
  'fire': { category: 'Immediate Physical', urgency: 'Immediate' },
  'message': { category: 'Digital', urgency: 'Later' },
  'subscription': { category: 'Financial', urgency: 'Later' },
  'health': { category: 'Health', urgency: 'Soon' },
  'relationship': { category: 'Relationship', urgency: 'Later' },
  'deadline': { category: 'Time Sensitive', urgency: 'Soon' },
  'future': { category: 'Future', urgency: 'Later' },
  'hypothetical': { category: 'Hypothetical', urgency: 'Unknown' },
  'money': { category: 'Financial', urgency: 'Soon' },
  'work': { category: 'Time Sensitive', urgency: 'Soon' },
  'family': { category: 'Relationship', urgency: 'Later' },
  'pain': { category: 'Health', urgency: 'Soon' },
};

function getInitialStatus(statement, verified, urgency) {
  const lower = statement.toLowerCase();
  if (lower.includes('rent') && verified.rentPaid) return 'SECURED';
  if (lower.includes('insurance') && verified.insurancePaid) return 'SECURED';
  if (urgency === 'Immediate') return 'ACTIVE';
  return 'WAITING';
}

export function extractConcerns(userInput) {
  if (!userInput) return [];
  const parts = userInput
    .split(/[,;.]|\band\b|\bbut\b|\bbecause\b/i)
    .map(s => s.trim())
    .filter(s => s.length > 3);
  return parts.length > 0 ? parts : [userInput.trim()];
}

export function classifyConcerns(userStatements, verifiedFacts = {}) {
  if (!userStatements || userStatements.length === 0) return [];

  const threats = [];

  for (const statement of userStatements) {
    let matched = false;
    for (const [keyword, defaults] of Object.entries(KEYWORD_MAP)) {
      if (statement.toLowerCase().includes(keyword)) {
        threats.push({
          source: statement,
          category: defaults.category,
          urgency: defaults.urgency,
          confidence: 0.7,
          actionability: 'Medium',
          status: getInitialStatus(statement, verifiedFacts, defaults.urgency),
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      threats.push({
        source: statement,
        category: 'Unknown',
        urgency: 'Unknown',
        confidence: 0.3,
        actionability: 'Low',
        status: 'UNKNOWN',
      });
    }
  }
  return threats;
}

export function generateRealitySummary(threats, verifiedFacts = {}) {
  if (!threats || threats.length === 0) {
    return {
      immediateReality: [],
      knownFacts: [],
      openQuestions: [],
      unknowns: [],
      nextConcreteStep: null,
    };
  }

  const immediate = threats
    .filter(t => t.urgency === 'Immediate' && t.status !== 'SECURED')
    .map(t => t.source);

  const known = threats
    .filter(t => t.status === 'SECURED')
    .map(t => t.source);

  const open = threats
    .filter(t => t.status === 'WAITING')
    .map(t => t.source);

  const unknowns = threats
    .filter(t => t.status === 'UNKNOWN')
    .map(t => t.source);

  let nextStep = null;
  if (immediate.length) {
    nextStep = `Address: ${immediate[0]}`;
  } else if (open.length) {
    nextStep = `Clarify: ${open[0]}`;
  }

  return {
    immediateReality: known.length ? known : [],
    knownFacts: known,
    openQuestions: open,
    unknowns,
    nextConcreteStep: nextStep,
  };
}