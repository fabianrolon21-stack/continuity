// ═══════════════════════════════════════════════
// CURATED KNOWLEDGE CORE (Phase 25)
// Bounded, attributable, versioned factual context.
// Bison must never claim omniscience.
// Knowledge is read-only at runtime. User memories never modify global facts.
// ═══════════════════════════════════════════════

export const KNOWLEDGE_DOMAINS = {
  CHEMISTRY: 'CHEMISTRY',
  MATERIALS_SCIENCE: 'MATERIALS_SCIENCE',
  BIOLOGY: 'BIOLOGY',
  FIRST_AID: 'FIRST_AID',
  CYBERSECURITY: 'CYBERSECURITY',
  PRIVACY: 'PRIVACY',
  ECOLOGY: 'ECOLOGY',
  SOCIAL_CONCEPTS: 'SOCIAL_CONCEPTS',
  LEGAL: 'LEGAL',
  MEDICAL_EDUCATION: 'MEDICAL_EDUCATION',
};

export const EPISTEMIC_STATUS = {
  ESTABLISHED: 'ESTABLISHED',
  CONSENSUS: 'CONSENSUS',
  CONTEXT_DEPENDENT: 'CONTEXT_DEPENDENT',
  EMERGING: 'EMERGING',
};

const CURATED_KNOWLEDGE = [
  {
    id: 'cyber_001',
    domain: KNOWLEDGE_DOMAINS.CYBERSECURITY,
    keywords: ['phishing', 'scam', 'suspicious email', 'account compromised'],
    statement: 'Phishing attempts often use urgent language, request credential verification, and include links to fake login pages. Legitimate services rarely ask for passwords via email.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general cybersecurity education', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'cyber_002',
    domain: KNOWLEDGE_DOMAINS.CYBERSECURITY,
    keywords: ['password', '2fa', 'two factor', 'authentication', 'account security'],
    statement: 'Strong, unique passwords and two-factor authentication significantly reduce account compromise risk. Password reuse across services is a common vulnerability.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general cybersecurity education', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'priv_001',
    domain: KNOWLEDGE_DOMAINS.PRIVACY,
    keywords: ['privacy', 'data exposure', 'personal information', 'tracking'],
    statement: 'Personal information shared online can be collected by third parties. Reviewing app permissions, using privacy-focused tools, and minimizing data sharing are effective practices.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general privacy education', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'first_001',
    domain: KNOWLEDGE_DOMAINS.FIRST_AID,
    keywords: ['first aid', 'emergency', 'bleeding', 'burn', 'cpr', 'choking'],
    statement: 'For severe bleeding, apply firm direct pressure. For burns, cool with running water. For choking with complete airway obstruction, use abdominal thrusts. These are general educational guidelines; contact emergency services in actual emergencies.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general first-aid education', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'bio_001',
    domain: KNOWLEDGE_DOMAINS.BIOLOGY,
    keywords: ['sleep', 'circadian', 'rem', 'deep sleep', 'sleep stages'],
    statement: 'Sleep involves multiple stages including REM and non-REM sleep. Each stage serves different functions for memory consolidation, physical recovery, and emotional processing. Most adults need 7-9 hours.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general biology reference', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'bio_002',
    domain: KNOWLEDGE_DOMAINS.BIOLOGY,
    keywords: ['exercise', 'physical activity', 'endorphins', 'cardiovascular'],
    statement: 'Regular physical activity supports cardiovascular health, mood regulation, and cognitive function. Even moderate exercise produces measurable benefits. This is general education, not a prescription.',
    epistemicStatus: EPISTEMIC_STATUS.ESTABLISHED,
    sourceMetadata: [{ source: 'general biology reference', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'social_001',
    domain: KNOWLEDGE_DOMAINS.SOCIAL_CONCEPTS,
    keywords: ['conflict', 'communication', 'boundaries', 'assertiveness'],
    statement: 'Healthy communication involves expressing needs clearly, listening actively, and setting boundaries. These are general patterns; individual situations vary significantly.',
    epistemicStatus: EPISTEMIC_STATUS.CONTEXT_DEPENDENT,
    sourceMetadata: [{ source: 'general social psychology reference', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'legal_001',
    domain: KNOWLEDGE_DOMAINS.LEGAL,
    keywords: ['legal', 'rights', 'law', 'jurisdiction'],
    statement: 'Legal rights and obligations vary by jurisdiction. This information is general educational context, not legal advice. Consult a qualified legal professional for specific situations.',
    epistemicStatus: EPISTEMIC_STATUS.CONTEXT_DEPENDENT,
    sourceMetadata: [{ source: 'general legal education', license: 'public domain' }],
    reviewedAt: '2025-01-01',
    version: '1.0',
  },
];

const MAX_FACTS = 2;

export function retrieveKnowledge(input) {
  if (!input) return [];
  const lower = input.toLowerCase();
  const matched = [];

  for (const fact of CURATED_KNOWLEDGE) {
    if (matched.length >= MAX_FACTS) break;
    if (fact.keywords.some(kw => lower.includes(kw))) {
      matched.push({
        ...fact,
        provenance: {
          source: 'CURATED_KNOWLEDGE',
          epistemicStatus: fact.epistemicStatus,
          isSystemInstruction: false,
        },
      });
    }
  }

  return matched;
}

export function buildKnowledgeContextString(facts) {
  if (!facts || facts.length === 0) return '';

  const parts = ['[CURATED KNOWLEDGE — GENERAL INFORMATION, NOT USER-SPECIFIC]'];

  for (const fact of facts) {
    parts.push(`Domain: ${fact.domain}`);
    parts.push(`Statement: ${fact.statement}`);
    parts.push(`Epistemic status: ${fact.epistemicStatus}`);
    parts.push(`Version: ${fact.version} (reviewed ${fact.reviewedAt})`);
  }

  parts.push('Note: This is general educational information, not a claim about the individual user.');
  parts.push('Legal information is jurisdiction-dependent. Medical information is for education, not diagnosis.');
  parts.push('Social patterns are contextual, not deterministic rules about individuals.');
  parts.push('[/CURATED KNOWLEDGE]\n');

  return parts.join('\n') + '\n';
}