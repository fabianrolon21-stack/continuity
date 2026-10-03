// ═══════════════════════════════════════════════
// SYSTEM 10 — SPECULATIVE LEGAL FORECASTING
// The user may predict how law will evolve. Bison engages with the prediction
// as reasoning — never as fact, never dismissed as fantasy. Everything is
// labelled SPECULATIVE and the conditions for change are laid out honestly.
// ═══════════════════════════════════════════════

const PREDICT = /\b(predict(ion)?|will (be|become)|gonna (start to )?be|going to be (dictated|law|illegal|a crime)|eventually be (law|illegal|a crime)|future law|by (19|20)\d{2}|in (19|20)\d{2})\b/i;
const LEGAL_TOPIC = /\b(law|legal|illegal|crime|abuse|court|statute|rights|liability|consent|privacy|regulation|bill|act|dictated)\b/i;

const TOPIC_TRENDS = [
  { test: /(possess|abuse|consent|intimacy|harass)/i,
    current: 'Current law generally reaches possessive or intrusive language only where it rises to harassment, stalking, or a protective order — the words alone are usually not actionable.',
    support: ['Growing recognition of coercive control and emotional abuse in statute', 'Expanding harassment definitions in digital-communication laws', 'Civil remedies being created where criminal ones fall short'],
    against: ['Strong free-speech protection for language that is not a true threat', 'Courts are slow to create new categories of civil liability', 'Enforcement would require proving harm and intent'] },
  { test: /(privacy|encrypt|surveil|track|monitor|data)/i,
    current: 'Current law protects communications content mainly through wiretap statutes and sectoral privacy rules; metadata and third-party data receive far weaker protection.',
    support: ['State comprehensive privacy statutes spreading', 'Regulators treating dark patterns and silent data sharing as deceptive', 'Default-encryption expectations growing in platform practice'],
    against: ['Third-party doctrine still limits privacy in data shared with services', 'Preemption and industry litigation slow new rules', 'Cross-border enforcement remains fragmented'] },
  { test: /(ai|agent|algorithm|automated|bot)/i,
    current: 'Current law has no general AI-specific statute; existing fraud, agency, and disclosure rules apply unevenly.',
    support: ['Disclosure requirements appearing in advertising and political-speech rules', 'Agency guidance on automated decision-making', 'Contract and consumer law already covering misrepresentation by software'],
    against: ['No federal framework; state approaches diverge', 'Liability allocation between developer and deployer is unsettled'] },
];

const GENERIC = {
  current: 'Current law generally addresses a predicted harm only where an existing statute already reaches the conduct.',
  support: ['Public awareness shifting faster than legislation', 'Regulators and courts filling gaps case by case'],
  against: ['Legislatures move slowly', 'Existing rights are strongly protected until a clear harm is proven'],
};

export function detectLegalForecast(input) {
  const text = String(input || '');
  if (!PREDICT.test(text) || !LEGAL_TOPIC.test(text)) return null;
  const y = text.match(/\b(19|20)\d{2}\b/);
  return { prediction: text.slice(0, 300), year: y ? parseInt(y[0], 10) : null };
}

export function buildLegalForecast(input, year = null) {
  const text = String(input || '');
  const topic = TOPIC_TRENDS.find(t => t.test.test(text)) || GENERIC;
  return {
    prediction: text.slice(0, 300),
    currentLaw: topic.current,
    supportingTrends: topic.support,
    contradictingTrends: topic.against,
    conditionsForChange: [
      'A sustained pattern of documented harm that courts and legislatures can point to',
      'A test case or agency action that establishes the harm is legally cognisable',
      'Enough public pressure that the political cost of inaction exceeds the cost of acting',
    ],
    epistemicStatus: 'SPECULATIVE',
    year,
  };
}

export function buildLegalForesightContext(f) {
  if (!f) return null;
  return `[LEGAL FORESIGHT — SPECULATIVE]
Prediction: ${f.prediction}${f.year ? ` (horizon: ${f.year})` : ''}
What current law says: ${f.currentLaw}
Trends supporting it: ${f.supportingTrends.join('; ')}.
Trends against it: ${f.contradictingTrends.join('; ')}.
What would have to change for it to become law: ${f.conditionsForChange.join('; ')}.
Label this SPECULATIVE throughout. Never treat speculation as fact, and never dismiss it as fantasy. Reason with it honestly, flag uncertainty, and never fabricate statutes or cases.`;
}