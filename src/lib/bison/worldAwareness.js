// ═══════════════════════════════════════════════
// WORLD AWARENESS ENGINE (Package 28)
// Temporal awareness + information staleness classification.
// ACCESS TO INFORMATION IS NOT THE SAME AS ACCEPTANCE OF INFORMATION.
// ═══════════════════════════════════════════════

export function getTemporalContext() {
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 5 ? 'late_night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
  return {
    timestamp: now.toISOString(),
    timeOfDay,
    dayOfWeek: now.getDay(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    hour,
    date: now.toISOString().split('T')[0],
  };
}

// Domains where information becomes stale and requires current verification
const STALENESS_DOMAINS = ['legal', 'medical', 'political', 'financial', 'scientific', 'regulatory'];

export function classifyInformationStaleness(infoDate, domain) {
  if (!infoDate) return { status: 'UNKNOWN', note: 'No date available.' };
  const ageMs = Date.now() - new Date(infoDate).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (STALENESS_DOMAINS.includes((domain || '').toLowerCase())) {
    if (ageDays > 30) return { status: 'STALE', note: 'Requires current authoritative verification.' };
    if (ageDays > 7) return { status: 'AGING', note: 'May require verification.' };
    return { status: 'RECENT', note: '' };
  }

  return { status: 'UNKNOWN', note: '' };
}

export const EPISTEMIC_CLASSIFICATIONS = [
  'OBSERVED',
  'VERIFIED',
  'INFERRED',
  'PREDICTED',
  'SPECULATIVE',
  'HYPOTHETICAL',
  'USER_CONFIRMED',
  'DISPUTED',
  'UNKNOWN',
];

export function buildWorldAwarenessString(temporalContext) {
  const parts = ['[WORLD AWARENESS]'];
  parts.push(`Current time: ${temporalContext.timeOfDay} (${temporalContext.hour}:00)`);
  parts.push(`Date: ${temporalContext.date}`);
  if (temporalContext.isWeekend) parts.push('Weekend context.');
  parts.push('Note: Legal, medical, political, financial, scientific, and regulatory information may require current authoritative verification.');
  parts.push('Never pretend static knowledge is current.');
  parts.push('Epistemic classifications: OBSERVED, VERIFIED, INFERRED, PREDICTED, SPECULATIVE, HYPOTHETICAL, USER_CONFIRMED, DISPUTED, UNKNOWN.');
  parts.push('Never convert speculation, popularity, repetition, or internet content into established fact without sufficient evidence.');
  parts.push('[/WORLD AWARENESS]\n');
  return parts.join('\n') + '\n';
}