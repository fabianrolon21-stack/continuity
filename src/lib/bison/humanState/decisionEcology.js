// Base 44.2 — Decision Ecology
// Treats decisions as interconnected. Every important decision may affect multiple domains.
// Exposes decision impact through a common interface for the forecasting engine.

export const DECISION_DOMAINS = [
  'finances', 'relationships', 'health', 'time',
  'education', 'long_term_goals', 'career', 'emotional_wellbeing',
];

const DOMAIN_KEYWORDS = {
  finances: [/money|cost|spend|save|invest|salary|income|budget|debt|loan|buy|purchase|rent/i],
  relationships: [/partner|spouse|friend|family|date|marriage|breakup|move in|relationship/i],
  health: [/health|doctor|exercise|diet|sleep|mental|therapy|medication|surgery|treatment/i],
  time: [/time|schedule|commit|deadline|duration|hours|days|weeks|months|years/i],
  education: [/school|course|degree|learn|study|certification|training|class|program/i],
  long_term_goals: [/future|career|dream|goal|plan|5 year|10 year|retirement|legacy|purpose/i],
  career: [/job|career|promotion|quit|switch|company|role|position|professional/i],
  emotional_wellbeing: [/feel|happiness|stress|anxiety|peace|fulfill|joy|satisfaction|burnout/i],
};

export function estimateDecisionDomains(decisionText) {
  if (!decisionText || typeof decisionText !== 'string') return [];
  const domains = [];
  for (const [domain, patterns] of Object.entries(DOMAIN_KEYWORDS)) {
    if (patterns.some(p => p.test(decisionText))) domains.push(domain);
  }
  return domains.length > 0 ? domains : ['time'];
}

export function buildDecisionEcology(decisionText, options = {}) {
  const affectedDomains = estimateDecisionDomains(decisionText);
  const domainCount = affectedDomains.length;
  let complexity = 'SIMPLE';
  if (domainCount >= 5) complexity = 'HIGHLY_COMPLEX';
  else if (domainCount >= 3) complexity = 'COMPLEX';
  else if (domainCount >= 2) complexity = 'MODERATE';
  return {
    affectedDomains,
    domainCount,
    complexity,
    userConstraints: options.constraints || [],
  };
}

export function buildDecisionEcologyContextString(ecology) {
  if (!ecology?.affectedDomains?.length) return '';
  const parts = ['[DECISION ECOLOGY]'];
  parts.push(`Affected domains: ${ecology.affectedDomains.join(', ')}`);
  parts.push(`Complexity: ${ecology.complexity} (${ecology.domainCount} domains)`);
  if (ecology.userConstraints?.length > 0) {
    parts.push(`Known constraints: ${ecology.userConstraints.join('; ')}`);
  }
  parts.push('Guidance: Treat this decision as interconnected. Changes in one domain may ripple to others.');
  parts.push('[/DECISION ECOLOGY]\n');
  return parts.join('\n') + '\n';
}