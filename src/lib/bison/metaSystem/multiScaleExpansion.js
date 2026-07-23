// Step 3 — Multi-Scale Expansion
// Analyze the problem across nested scales.
// Determine which scales are relevant. Ignore unrelated levels.

export const SCALES = [
  'individual', 'relationship', 'family', 'organization',
  'community', 'society', 'ecology', 'civilizational',
];

const SCALE_INDICATORS = {
  individual: [/i |me |my |myself|personal|i feel|i think|i want/i],
  relationship: [/partner|friend|date|spouse|relationship|couple|us |we |together/i],
  family: [/family|parent|mom|dad|mother|father|sister|brother|child|son|daughter|relative/i],
  organization: [/work|company|team|office|colleague|boss|department|organization|workplace/i],
  community: [/community|neighbor|town|city|local|group|club|church|school district/i],
  society: [/society|culture|social|political|economic|nation|country|system|policy|law/i],
  ecology: [/environment|nature|climate|ecosystem|land|water|air|weather|season|earth/i],
  civilizational: [/civilization|history|future of humanity|species|generational|century|millennia|evolution/i],
};

export function expandAcrossScales(microModel, patternCandidates = []) {
  const text = [
    microModel?.summary || '',
    ...(microModel?.events || []).map(e => e.text || ''),
    ...(microModel?.goals || []).map(g => g.text || ''),
    ...(microModel?.constraints || []).map(c => c.text || ''),
  ].join(' ');

  const relevantScales = SCALES.filter(scale =>
    SCALE_INDICATORS[scale].some(p => p.test(text))
  );

  // Always include individual scale as baseline
  if (!relevantScales.includes('individual')) relevantScales.unshift('individual');

  const scaleAnalysis = relevantScales.map(scale => ({
    scale,
    relevance: 'ACTIVE',
    note: getScaleNote(scale, microModel),
  }));

  return {
    relevantScales,
    scaleAnalysis,
    ignoredScales: SCALES.filter(s => !relevantScales.includes(s)),
    primaryScale: relevantScales[0] || 'individual',
  };
}

function getScaleNote(scale, microModel) {
  const notes = {
    individual: 'The user is experiencing this personally.',
    relationship: 'This involves dynamics between people.',
    family: 'Family system dynamics are in play.',
    organization: 'Workplace or organizational structures are relevant.',
    community: 'Community-level forces are shaping the situation.',
    society: 'Broader social or cultural patterns apply.',
    ecology: 'Environmental or ecological factors are present.',
    civilizational: 'Long-term civilizational trends are at work.',
  };
  return notes[scale] || '';
}