// ═══════════════════════════════════════════════
// NEGOTIABILITY SCANNER (Patch 40.3)
// Tags every detected variable: what can actually
// move, and what is reality itself.
// ═══════════════════════════════════════════════

export const NEGOTIABILITY = {
  NEGOTIABLE: 'Negotiable',
  PARTIAL: 'Partially Negotiable',
  NON_NEGOTIABLE: 'Non-Negotiable',
  UNKNOWN: 'Unknown',
};

const VARIABLE_CATALOG = [
  // Reality itself — cannot negotiate
  { name: 'Time already passed', pattern: /already|too late|missed|yesterday|last week/i, tag: NEGOTIABILITY.NON_NEGOTIABLE },
  { name: 'Biology / health condition', pattern: /sick|illness|injury|pain|aging|exhausted|health/i, tag: NEGOTIABILITY.NON_NEGOTIABLE },
  { name: 'Weather / physical world', pattern: /weather|storm|rain|snow|flood|broke down/i, tag: NEGOTIABILITY.NON_NEGOTIABLE },
  { name: 'Inflation / macro economy', pattern: /inflation|economy|market rate|cost of living/i, tag: NEGOTIABILITY.NON_NEGOTIABLE },
  { name: 'Law / regulation', pattern: /law|legal|regulation|illegal|court|rights|policy/i, tag: NEGOTIABILITY.NON_NEGOTIABLE },
  // Partially negotiable
  { name: 'Rent / price / salary', pattern: /rent|price|salary|raise|cost|fee|pay/i, tag: NEGOTIABILITY.PARTIAL },
  { name: 'Deadline', pattern: /deadline|due date|due by/i, tag: NEGOTIABILITY.PARTIAL },
  { name: 'Workload', pattern: /workload|hours|overtime|shifts/i, tag: NEGOTIABILITY.PARTIAL },
  // Negotiable — human agreements and interpretations
  { name: 'Lease / contract / agreement', pattern: /lease|contract|agreement|terms|deal/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Schedule / plans', pattern: /schedule|plans|meeting|appointment|timing/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Expectations', pattern: /expect|expectation|supposed to|should have/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Communication', pattern: /talk|conversation|communicat|said|tell|message|text|call/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Priorities', pattern: /priorit|what matters|focus on/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Mood / attitude', pattern: /mood|attitude|angry|upset|annoyed|frustrated/i, tag: NEGOTIABILITY.NEGOTIABLE },
  { name: 'Boundaries', pattern: /boundar|limit|say no/i, tag: NEGOTIABILITY.NEGOTIABLE },
];

export function scanNegotiability(input) {
  const text = input || '';
  const variables = [];
  for (const v of VARIABLE_CATALOG) {
    if (v.pattern.test(text)) {
      variables.push({ name: v.name, tag: v.tag });
    }
  }
  return variables;
}