// ═══════════════════════════════════════════════
// ECOLOGICAL CONTEXT (Phase 22B)
// Ecological knowledge + animal signal interpretation + stagnation detection.
// NOTE: Web app — no physical sensors. All input is text-based.
// Physical safety controller, embodiment manager, hardware = N/A.
// ═══════════════════════════════════════════════

// ── Ecological Knowledge ──

const ECOLOGICAL_KNOWLEDGE = [
  {
    id: 'eco_001',
    keywords: ['bird', 'robin', 'sparrow', 'crow', 'nest', 'nesting'],
    statement: 'Birds serve various ecological roles including seed dispersal, pest control, and pollination. Nest-building behavior varies significantly by species.',
    epistemicStatus: 'ESTABLISHED',
    source: 'general ecological reference',
  },
  {
    id: 'eco_002',
    keywords: ['tree', 'forest', 'canopy', 'roots', 'mycorrhizal'],
    statement: 'Trees and forests play critical roles in carbon sequestration, water cycle regulation, and habitat provision. Mycorrhizal networks connect tree roots, enabling nutrient exchange.',
    epistemicStatus: 'ESTABLISHED',
    source: 'general ecological reference',
  },
  {
    id: 'eco_003',
    keywords: ['pollinator', 'bee', 'butterfly', 'flower', 'pollination'],
    statement: 'Pollinators are essential for plant reproduction and food production. Declines in pollinator populations affect ecosystem stability and agriculture.',
    epistemicStatus: 'ESTABLISHED',
    source: 'general ecological reference',
  },
  {
    id: 'eco_004',
    keywords: ['river', 'stream', 'watershed', 'aquatic', 'wetland'],
    statement: 'Watersheds connect terrestrial and aquatic ecosystems. Stream health reflects upstream land use and affects downstream water quality.',
    epistemicStatus: 'ESTABLISHED',
    source: 'general ecological reference',
  },
  {
    id: 'eco_005',
    keywords: ['compost', 'decomposition', 'soil', 'nutrient cycle'],
    statement: 'Decomposition and nutrient cycling are fundamental ecosystem processes. Composting accelerates natural decomposition, returning nutrients to soil.',
    epistemicStatus: 'ESTABLISHED',
    source: 'general ecological reference',
  },
];

const MAX_ECO_FACTS = 2;

export function retrieveEcologicalKnowledge(input) {
  if (!input) return [];
  const lower = input.toLowerCase();
  const matched = [];

  for (const fact of ECOLOGICAL_KNOWLEDGE) {
    if (matched.length >= MAX_ECO_FACTS) break;
    if (fact.keywords.some(kw => lower.includes(kw))) {
      matched.push({
        ...fact,
        provenance: { source: 'CURATED_ECOLOGICAL', epistemicStatus: fact.epistemicStatus },
      });
    }
  }

  return matched;
}

// ── Animal Signal Interpretation — probabilistic, NOT translation ──

const ANIMAL_SIGNAL_PATTERNS = [
  {
    species: 'dog',
    triggers: ['dog', 'puppy', 'canine'],
    signals: {
      'ears pinned back|growling|body tension|teeth bared': {
        observations: ['ears_pinned_back', 'growling', 'body_tension'],
        possibleStates: [{ state: 'fear_or_defensive_arousal', confidence: 'medium' }],
        recommendation: 'Increase distance and avoid forcing interaction.',
      },
      'tail wagging|relaxed|play bow|wiggling': {
        observations: ['tail_wagging', 'relaxed posture', 'play_bow'],
        possibleStates: [{ state: 'possible_playful_arousal', confidence: 'medium' }],
        recommendation: 'Context matters — tail wagging is not universally friendly. Observe overall body language.',
      },
      'panting|pacing|whining|licking lips': {
        observations: ['panting', 'pacing', 'whining'],
        possibleStates: [{ state: 'possible_stress_or_anxiety', confidence: 'low' }],
        recommendation: 'Consider environmental stressors. Multiple signals needed for confidence.',
      },
    },
  },
  {
    species: 'cat',
    triggers: ['cat', 'kitten', 'feline'],
    signals: {
      'purring|kneading|slow blink|relaxed': {
        observations: ['purring', 'kneading', 'slow_blink'],
        possibleStates: [{ state: 'possible_contentment', confidence: 'medium' }],
        recommendation: 'Purring can also indicate stress or pain. Observe context and other body signals.',
      },
      'hissing|arched back|fur raised|swatting': {
        observations: ['hissing', 'arched_back', 'fur_raised'],
        possibleStates: [{ state: 'fear_or_threatened', confidence: 'medium' }],
        recommendation: 'Give space. Do not approach.',
      },
    },
  },
  {
    species: 'bird',
    triggers: ['bird', 'parrot', 'cockatiel', 'parakeet'],
    signals: {
      'fluffed feathers|puffed up|sleepy': {
        observations: ['fluffed_feathers'],
        possibleStates: [{ state: 'possible_resting_or_ill', confidence: 'low' }],
        recommendation: 'Fluffed feathers can indicate rest or illness. Observe for other signs.',
      },
      'screaming|agitated|biting|feather plucking': {
        observations: ['screaming', 'agitated', 'biting'],
        possibleStates: [{ state: 'possible_stress_or_boredom', confidence: 'low' }],
        recommendation: 'Multiple factors can cause distress. Consider environment and enrichment.',
      },
    },
  },
];

export function interpretAnimalSignals(input) {
  if (!input) return null;
  const lower = input.toLowerCase();

  for (const speciesEntry of ANIMAL_SIGNAL_PATTERNS) {
    if (!speciesEntry.triggers.some(t => lower.includes(t))) continue;

    for (const [signalPattern, interpretation] of Object.entries(speciesEntry.signals)) {
      const regex = new RegExp(signalPattern, 'i');
      if (regex.test(lower)) {
        return {
          species: speciesEntry.species,
          observations: interpretation.observations,
          possibleStates: interpretation.possibleStates,
          recommendation: interpretation.recommendation,
          epistemicNote: 'Probabilistic interpretation based on observable signals. Not animal language translation.',
          confidence: 'low',
        };
      }
    }

    // Species mentioned but no specific signals detected
    return {
      species: speciesEntry.species,
      observations: [],
      possibleStates: [],
      recommendation: 'Observe multiple body language signals before drawing conclusions.',
      epistemicNote: 'Cannot determine state from species mention alone.',
      confidence: 'low',
    };
  }

  return null;
}

// ── Stagnation Detection — explicit language only, NOT verbosity ──

const STAGNATION_PATTERNS = [
  /i'?m stuck/i,
  /going in circles/i,
  /don'?t know what else to do/i,
  /keep coming back to/i,
  /can'?t figure out/i,
  /spinning my wheels/i,
  /no progress/i,
  /keep hitting a wall/i,
];

export function detectStagnation(input, recentHistory) {
  if (!input) return { detected: false };

  const explicitStagnation = STAGNATION_PATTERNS.some(p => p.test(input));

  // Check for conversational repetition (NOT boredom inference)
  let recurrenceCount = 0;
  const inputWords = new Set(input.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  for (const msg of (recentHistory || []).slice(-6)) {
    if (msg.role === 'user' && msg.text) {
      const msgWords = new Set(msg.text.toLowerCase().split(/\s+/).filter(w => w.length > 4));
      const overlap = [...msgWords].filter(w => inputWords.has(w)).length;
      if (overlap > 3) recurrenceCount++;
    }
  }

  const detected = explicitStagnation || recurrenceCount >= 3;

  return {
    detected,
    type: explicitStagnation ? 'explicit' : 'possible_repetition',
    recurrenceCount,
    // NOTE: detected stagnation does NOT mean "user is bored"
    // It means "possible conversational repetition worth offering alternatives"
  };
}

// ── Context String Builder ──

export function buildEcologicalContextString({ ecologicalKnowledge, animalSignals, stagnationSignal }) {
  const parts = [];
  let hasContent = false;

  if (ecologicalKnowledge && ecologicalKnowledge.length > 0) {
    hasContent = true;
    parts.push('[ECOLOGICAL KNOWLEDGE — GENERAL EDUCATION]');
    for (const fact of ecologicalKnowledge) {
      parts.push(`Statement: ${fact.statement}`);
      parts.push(`Source: ${fact.source}, status: ${fact.epistemicStatus}`);
    }
    parts.push('Note: General ecological information. Not a substitute for professional assessment.');
    parts.push('[/ECOLOGICAL KNOWLEDGE]\n');
  }

  if (animalSignals) {
    hasContent = true;
    parts.push('[ANIMAL SIGNAL INTERPRETATION — PROBABILISTIC]');
    parts.push(`Species: ${animalSignals.species}`);
    if (animalSignals.observations.length > 0) {
      parts.push(`Observed signals: ${animalSignals.observations.join(', ')}`);
      parts.push(`Possible states: ${animalSignals.possibleStates.map(s => `${s.state} (${s.confidence} confidence)`).join(', ')}`);
    }
    parts.push(`Recommendation: ${animalSignals.recommendation}`);
    parts.push(`Note: ${animalSignals.epistemicNote}`);
    parts.push('Never claim to speak with animals or translate animal language.');
    parts.push('Never infer a single emotional state from one signal.');
    parts.push('[/ANIMAL SIGNAL INTERPRETATION]\n');
  }

  if (stagnationSignal?.detected) {
    hasContent = true;
    parts.push('[STAGNATION SIGNAL]');
    parts.push(`Type: ${stagnationSignal.type}`);
    if (stagnationSignal.type === 'explicit') {
      parts.push('The user explicitly indicated feeling stuck or going in circles.');
    } else {
      parts.push('Possible conversational repetition detected.');
    }
    parts.push('You may offer: explore another angle, summarize progress, take a break, or switch activities.');
    parts.push('Never infer boredom from short messages or pauses. Never treat disengagement as a problem.');
    parts.push('[/STAGNATION SIGNAL]\n');
  }

  return hasContent ? parts.join('\n') + '\n' : '';
}