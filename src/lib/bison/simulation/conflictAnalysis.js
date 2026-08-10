// Conflict Interpretation Layer — a general abstraction, not a scenario template.
// Observed situation → goals → constraints → misunderstanding estimate →
// low-escalation options → predicted outcomes → recommendation.
//
// The core stance: observed behaviour usually has a mundane explanation.
// Hidden motive is the least likely reading, never the default one.

const GOAL_PATTERNS = [
  { re: /\b(quiet|noise|sleep|loud|music)\b/i, goal: 'Protect rest and quiet at home' },
  { re: /\b(park|parking|driveway|blocked|car)\b/i, goal: 'Reliable access to your own space' },
  { re: /\b(fence|boundary|property|yard|tree|garden)\b/i, goal: 'Clear, respected boundaries' },
  { re: /\b(rent|money|pay|bill|cost|owe)\b/i, goal: 'A fair and predictable financial arrangement' },
  { re: /\b(deadline|work|project|manager|shift|meeting)\b/i, goal: 'Workable expectations and a sustainable pace' },
  { re: /\b(trash|mess|clean|smell|repair|broken)\b/i, goal: 'A maintained, liveable shared environment' },
  { re: /\b(ignored|excluded|left out|invited)\b/i, goal: 'Being included and treated as a peer' },
  { re: /\b(rude|disrespect|talked|shouted|snapped)\b/i, goal: 'Being spoken to with basic respect' },
];

const CONSTRAINT_PATTERNS = [
  { re: /\b(landlord|lease|contract|rules|policy|hoa|association)\b/i, constraint: 'A formal rule or agreement limits what either side can unilaterally change' },
  { re: /\b(kids|children|family|baby|elderly|carer|caring)\b/i, constraint: 'Care responsibilities constrain timing and flexibility' },
  { re: /\b(money|afford|broke|budget|cost)\b/i, constraint: 'Financial limits are shaping the options' },
  { re: /\b(shift|night|early|schedule|work)\b/i, constraint: 'Incompatible schedules limit when this can be resolved' },
  { re: /\b(live next|neighbou?r|every day|daily|share)\b/i, constraint: 'The relationship continues afterwards — a "win" that burns it costs more than it gains' },
];

const ESCALATION_MARKERS = /\b(threat|threaten|police|lawyer|sue|scream|yell|revenge|report them|confront)\b/i;
const REPEAT_MARKERS = /\b(again|always|every time|keeps|repeatedly|third time|constantly)\b/i;
const ASKED_MARKERS = /\b(i asked|i told|i've spoken|i mentioned|i requested)\b/i;

export function identifyGoals(text) {
  const goals = GOAL_PATTERNS.filter(g => g.re.test(text)).map(g => g.goal);
  return goals.length ? goals : ['Resolve the situation without making daily life harder'];
}

export function inferConstraints(text) {
  const found = CONSTRAINT_PATTERNS.filter(c => c.re.test(text)).map(c => c.constraint);
  return found.length ? found : ['Limited information — you can only see behaviour, not intent'];
}

// Explanation weighting. Repetition after a direct request slightly raises the
// chance of intent, but convenience stays the leading hypothesis.
export function estimateExplanations(text) {
  let convenience = 70, misunderstanding = 20, intentional = 10;
  if (REPEAT_MARKERS.test(text)) { convenience -= 10; intentional += 5; misunderstanding += 5; }
  if (ASKED_MARKERS.test(text)) { convenience -= 15; intentional += 10; misunderstanding += 5; }
  if (ESCALATION_MARKERS.test(text)) { convenience -= 5; intentional += 5; }
  if (/\b(new|just moved|first time|recently)\b/i.test(text)) { misunderstanding += 10; intentional -= 5; convenience -= 5; }

  const total = convenience + misunderstanding + intentional;
  return [
    { label: 'Convenience or habit — not about you', pct: Math.round((convenience / total) * 100) },
    { label: 'Misunderstanding — different assumptions', pct: Math.round((misunderstanding / total) * 100) },
    { label: 'Intentional friction', pct: Math.round((intentional / total) * 100) },
  ];
}

const OPTION_LIBRARY = [
  {
    id: 'clarify',
    title: 'Ask a genuine question first',
    escalation: 1,
    detail: 'Open with curiosity about their side before stating your ask. Cheap, reversible, and it directly tests the misunderstanding hypothesis.',
    outcome: 'Most likely: you learn a constraint you did not know about. Worst case: nothing changes and you have lost nothing.',
  },
  {
    id: 'name_impact',
    title: 'Name the impact, not the motive',
    escalation: 2,
    detail: 'Describe what happens to you in concrete terms, with no theory about why they do it. Motive claims are the usual trigger for defensiveness.',
    outcome: 'Often produces an adjustment without anyone needing to be wrong. Low risk to the ongoing relationship.',
  },
  {
    id: 'concrete_ask',
    title: 'Make one specific, small request',
    escalation: 2,
    detail: 'One change, clearly stated, easy to say yes to. Vague or bundled asks are usually refused by default.',
    outcome: 'Higher compliance than a general complaint. Gives you a clean signal about willingness.',
  },
  {
    id: 'trade',
    title: 'Offer something in exchange',
    escalation: 2,
    detail: 'Find the version where they also gain. Trades survive longer than concessions.',
    outcome: 'Slower to arrange, but the most durable outcome when both sides have real constraints.',
  },
  {
    id: 'boundary',
    title: 'Set a boundary you control alone',
    escalation: 3,
    detail: 'Change what is yours to change, without requiring their cooperation. Independent of their goodwill.',
    outcome: 'Reliable, but may reduce contact. Use when direct requests have already been tried.',
  },
  {
    id: 'third_party',
    title: 'Bring in a neutral third party',
    escalation: 4,
    detail: 'Only after direct routes are exhausted. Involving an authority converts a disagreement into a formal dispute.',
    outcome: 'Can force resolution, but usually ends the informal relationship. Hard to reverse.',
  },
];

export function generateOptions(text, explanations) {
  const tried = ASKED_MARKERS.test(text);
  const repeated = REPEAT_MARKERS.test(text);
  const options = OPTION_LIBRARY.filter(o => {
    if (o.id === 'third_party') return tried && repeated;
    if (o.id === 'boundary') return tried || repeated;
    if (o.id === 'clarify') return !tried;
    return true;
  });
  const misread = explanations.find(e => e.label.startsWith('Misunderstanding'))?.pct ?? 0;
  return options
    .map(o => ({ ...o, fit: o.id === 'clarify' && misread >= 20 ? o.escalation - 0.5 : o.escalation }))
    .sort((a, b) => a.fit - b.fit);
}

export function analyzeConflict(situationText) {
  const text = String(situationText || '').trim();
  if (!text) return null;

  const goals = identifyGoals(text);
  const constraints = inferConstraints(text);
  const explanations = estimateExplanations(text);
  const options = generateOptions(text, explanations);
  const recommended = options[0];

  return {
    situation: text,
    goals,
    constraints,
    explanations,
    options,
    recommended,
    uncertainty: 'These are estimates from what you described, not conclusions about anyone. Behaviour is observed; motive is not.',
    guidance: `Start with: ${recommended.title.toLowerCase()}. It supports your goal while keeping escalation at its lowest, and it stays reversible if you learn something new.`,
  };
}