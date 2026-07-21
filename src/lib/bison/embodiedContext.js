// ═══════════════════════════════════════════════
// EMBODIED CONTEXT — physical experience interpretation
// Heuristic estimates, NOT medical measurements.
// Deterministic regex-based detection — no NLP dependency.
// ═══════════════════════════════════════════════

export const TEMPORAL_STATUS = {
  OCCURRED: 'OCCURRED',
  CURRENT: 'CURRENT',
  PLANNED: 'PLANNED',
  HYPOTHETICAL: 'HYPOTHETICAL',
  NEGATED: 'NEGATED',
  UNKNOWN: 'UNKNOWN',
};

export const SUBJECT = {
  USER: 'USER',
  OTHER_PERSON: 'OTHER_PERSON',
  BISON: 'BISON',
  UNKNOWN: 'UNKNOWN',
};

export const ACTIVITY_INTENSITY = {
  VERY_LOW: 'VERY_LOW',
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
};

export const LOAD_CATEGORY = {
  NONE: 'NONE',
  LIGHT: 'LIGHT',
  MEDIUM: 'MEDIUM',
  HEAVY: 'HEAVY',
  UNKNOWN: 'UNKNOWN',
};

export const POSTURAL_CONTEXT = {
  STANDING: 'STANDING',
  SITTING: 'SITTING',
  WALKING: 'WALKING',
  LIFTING: 'LIFTING',
  CROUCHING: 'CROUCHING',
  KNEELING: 'KNEELING',
  MIXED: 'MIXED',
  UNKNOWN: 'UNKNOWN',
};

export const ENVIRONMENT_CATEGORY = {
  INDOOR: 'INDOOR',
  OUTDOOR: 'OUTDOOR',
  CONFINED_SPACE: 'CONFINED_SPACE',
  CLIMATE_CONTROLLED: 'CLIMATE_CONTROLLED',
  WET: 'WET',
  DUSTY: 'DUSTY',
  UNKNOWN: 'UNKNOWN',
};

export const USER_REPORTED_OUTCOME = {
  EXHAUSTED: 'EXHAUSTED',
  ENERGIZED: 'ENERGIZED',
  IN_PAIN: 'IN_PAIN',
  NEUTRAL: 'NEUTRAL',
  SORE: 'SORE',
  DEHYDRATED: 'DEHYDRATED',
  NONE: 'NONE',
};

// ── Physical action dictionary (heuristic reference — not validated measurements) ──

const PHYSICAL_ACTIONS = [
  { keywords: ['walk', 'walking', 'hiked', 'hiking', 'strolled'], activity: 'walk', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.WALKING },
  { keywords: ['ran', 'running', 'jog', 'jogging'], activity: 'run', baseIntensity: ACTIVITY_INTENSITY.HIGH, posture: POSTURAL_CONTEXT.WALKING },
  { keywords: ['crawl', 'crawled', 'crept'], activity: 'crawl', baseIntensity: ACTIVITY_INTENSITY.HIGH, posture: POSTURAL_CONTEXT.CROUCHING },
  { keywords: ['climb', 'climbed', 'climbing'], activity: 'climb', baseIntensity: ACTIVITY_INTENSITY.HIGH, posture: POSTURAL_CONTEXT.MIXED },
  { keywords: ['fix', 'fixed', 'fixing', 'repair', 'repaired', 'repairing', 'troubleshoot', 'troubleshooting'], activity: 'repair', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.MIXED },
  { keywords: ['install', 'installed', 'installing', 'assemble', 'assembled', 'assembling', 'set up', 'setting up'], activity: 'install', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.MIXED },
  { keywords: ['inspect', 'inspected', 'inspecting'], activity: 'inspect', baseIntensity: ACTIVITY_INTENSITY.LOW, posture: POSTURAL_CONTEXT.MIXED },
  { keywords: ['clean', 'cleaned', 'cleaning', 'sweep', 'swept', 'sweeping', 'mop', 'mopped', 'mopping', 'scrub', 'scrubbed', 'scrubbing'], activity: 'clean', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.STANDING },
  { keywords: ['carry', 'carried', 'carrying', 'lift', 'lifted', 'lifting', 'load', 'loaded', 'loading', 'haul', 'hauled'], activity: 'carry/lift', baseIntensity: ACTIVITY_INTENSITY.HIGH, posture: POSTURAL_CONTEXT.LIFTING },
  { keywords: ['rest', 'rested', 'resting', 'sat', 'sitting'], activity: 'rest', baseIntensity: ACTIVITY_INTENSITY.VERY_LOW, posture: POSTURAL_CONTEXT.SITTING },
  { keywords: ['stand', 'stood', 'standing'], activity: 'stand', baseIntensity: ACTIVITY_INTENSITY.LOW, posture: POSTURAL_CONTEXT.STANDING },
  { keywords: ['crouch', 'crouched', 'crouching', 'kneel', 'knelt', 'kneeling'], activity: 'crouch/kneel', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.CROUCHING },
  { keywords: ['move', 'moved', 'moving'], activity: 'move', baseIntensity: ACTIVITY_INTENSITY.MODERATE, posture: POSTURAL_CONTEXT.MIXED },
];

const PHYSICAL_TOOLS = [
  'generator', 'equipment', 'box', 'boxes', 'furniture', 'machine', 'machinery',
  'wrench', 'tool', 'tools', 'ladder', 'scaffold', 'truck', 'dolly', 'cart',
  'pipe', 'wire', 'cable', 'panel', 'motor', 'pump', 'valve', 'shelf', 'shelves',
  'desk', 'table', 'chair', 'couch', 'sofa', 'bed', 'mattress', 'appliance',
  'refrigerator', 'washer', 'dryer', 'stove', 'oven',
];

const ENVIRONMENT_KEYWORDS = {
  [ENVIRONMENT_CATEGORY.OUTDOOR]: ['outside', 'outdoor', 'outdoors', 'campus', 'yard', 'garden', 'field', 'job site', 'jobsite'],
  [ENVIRONMENT_CATEGORY.INDOOR]: ['inside', 'indoor', 'indoors', 'office', 'room', 'house', 'building', 'warehouse', 'garage'],
  [ENVIRONMENT_CATEGORY.CONFINED_SPACE]: ['crawl space', 'attic', 'basement', 'tight space', 'confined', 'under the', 'beneath the'],
  [ENVIRONMENT_CATEGORY.CLIMATE_CONTROLLED]: ['air conditioned', 'climate controlled'],
  [ENVIRONMENT_CATEGORY.WET]: ['rain', 'raining', 'wet', 'humid', 'drizzle'],
  [ENVIRONMENT_CATEGORY.DUSTY]: ['dust', 'dusty', 'dirty', 'sawdust', 'debris'],
};

const OUTCOME_PATTERNS = {
  [USER_REPORTED_OUTCOME.EXHAUSTED]: ['exhausted', 'drained', 'wiped out', 'beat', 'dead tired', 'spent', 'worn out', 'tired', 'fatigued'],
  [USER_REPORTED_OUTCOME.ENERGIZED]: ['energized', 'energetic', 'refreshed', 'invigorated', 'pumped', "feeling great", 'feel great'],
  [USER_REPORTED_OUTCOME.IN_PAIN]: ['in pain', 'painful', 'sharp pain'],
  [USER_REPORTED_OUTCOME.SORE]: ['sore', 'stiff', 'aching', 'tender', 'my back', 'my legs', 'my arms', 'my shoulders', 'my knees'],
  [USER_REPORTED_OUTCOME.DEHYDRATED]: ['dehydrated', 'thirsty', 'dry mouth'],
  [USER_REPORTED_OUTCOME.NEUTRAL]: ["wasn't difficult", 'not bad', "that wasn't", 'was fine'],
};

const LOAD_KEYWORDS = {
  [LOAD_CATEGORY.HEAVY]: ['heavy', 'generator', 'motor', 'machinery', 'appliance', 'refrigerator', 'washer', 'dryer', 'stove', 'furniture', 'couch', 'sofa', 'bed', 'mattress', 'desk', 'table'],
  [LOAD_CATEGORY.MEDIUM]: ['box', 'boxes', 'equipment', 'panel', 'pipe', 'shelf', 'shelves', 'chair'],
  [LOAD_CATEGORY.LIGHT]: ['tool', 'tools', 'wrench', 'wire', 'cable', 'small'],
};

// ── Detection helpers ──

function detectSubject(input) {
  const thirdPerson = /\b(my friend|my colleague|he |she |they |my boss|my coworker|my partner|someone|somebody)\b/i.test(input);
  const firstPerson = /\b(i |i'm|i've|i was|i am|i have|i'd)\b/i.test(input);
  if (thirdPerson && !firstPerson) return SUBJECT.OTHER_PERSON;
  return SUBJECT.USER;
}

function detectTemporalStatus(input) {
  if (/\b(didn't|did not|don't|do not|haven't|have not|won't|will not|never|not going to)\b/i.test(input)) {
    return TEMPORAL_STATUS.NEGATED;
  }
  if (/\b(if i|would|hypothetically|imagine|suppose|what if|might|could have|would have)\b/i.test(input)) {
    return TEMPORAL_STATUS.HYPOTHETICAL;
  }
  if (/\b(will |going to|tomorrow|next week|plan to|planning to|i need to|i have to|gonna|will be)\b/i.test(input)) {
    return TEMPORAL_STATUS.PLANNED;
  }
  if (/\b(i've been|i have been|been working|been walking|been carrying|been installing|been lifting|been moving|am walking|am carrying|am lifting|am working|currently)\b/i.test(input)) {
    return TEMPORAL_STATUS.CURRENT;
  }
  if (/\b(was|were|walked|ran|carried|lifted|installed|fixed|repaired|cleaned|moved|stood|sat|climbed|crawled|hiked|swept|mopped|scrubbed|hauled|assembled)\b/i.test(input)) {
    return TEMPORAL_STATUS.OCCURRED;
  }
  return TEMPORAL_STATUS.UNKNOWN;
}

function detectActivity(input) {
  const lower = input.toLowerCase();
  for (const action of PHYSICAL_ACTIONS) {
    if (action.keywords.some(kw => lower.includes(kw))) return action;
  }
  return null;
}

function detectTools(input) {
  const lower = input.toLowerCase();
  return PHYSICAL_TOOLS.filter(tool => lower.includes(tool));
}

function detectEnvironment(input) {
  const lower = input.toLowerCase();
  for (const [env, keywords] of Object.entries(ENVIRONMENT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return env;
  }
  return ENVIRONMENT_CATEGORY.UNKNOWN;
}

const WORD_TO_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

function detectDuration(input) {
  const lower = input.toLowerCase();
  const hourMatch = lower.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(?:hours|hrs)/);
  if (hourMatch) return { value: hourMatch[1], unit: 'hours', raw: hourMatch[0] };
  const minMatch = lower.match(/(\d+|ten|fifteen|twenty|thirty|forty|forty-five|sixty)\s*(?:minutes|min)/);
  if (minMatch) return { value: minMatch[1], unit: 'minutes', raw: minMatch[0] };
  if (/\ball day|all afternoon|all morning|all evening|entire day|whole day\b/i.test(input)) return { value: 'several', unit: 'hours', raw: 'all day' };
  if (/\bseveral hours|a few hours|couple hours|couple of hours\b/i.test(input)) return { value: 'several', unit: 'hours', raw: 'several hours' };
  return null;
}

function detectLoad(input) {
  const lower = input.toLowerCase();
  for (const [load, keywords] of Object.entries(LOAD_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return load;
  }
  return LOAD_CATEGORY.UNKNOWN;
}

function detectOutcome(input) {
  const lower = input.toLowerCase();
  for (const [outcome, keywords] of Object.entries(OUTCOME_PATTERNS)) {
    if (keywords.some(kw => lower.includes(kw))) return outcome;
  }
  return USER_REPORTED_OUTCOME.NONE;
}

function estimateIntensity(action, load, duration) {
  if (!action) return ACTIVITY_INTENSITY.VERY_LOW;
  let base = action.baseIntensity;
  if (load === LOAD_CATEGORY.HEAVY) {
    if (base === ACTIVITY_INTENSITY.MODERATE) base = ACTIVITY_INTENSITY.HIGH;
    else if (base === ACTIVITY_INTENSITY.HIGH) base = ACTIVITY_INTENSITY.VERY_HIGH;
  }
  if (duration && duration.unit === 'hours') {
    const hours = parseInt(duration.value) || WORD_TO_NUM[duration.value] || 0;
    if (hours >= 4) {
      if (base === ACTIVITY_INTENSITY.LOW) base = ACTIVITY_INTENSITY.MODERATE;
      else if (base === ACTIVITY_INTENSITY.MODERATE) base = ACTIVITY_INTENSITY.HIGH;
      else if (base === ACTIVITY_INTENSITY.HIGH) base = ACTIVITY_INTENSITY.VERY_HIGH;
    }
  }
  return base;
}

// ── Main interpreter ──

export function interpretEmbodiedContext(input) {
  if (!input || typeof input !== 'string') return { detected: false };

  const action = detectActivity(input);
  if (!action) return { detected: false };

  const subject = detectSubject(input);
  const temporalStatus = detectTemporalStatus(input);
  const tools = detectTools(input);
  const environment = detectEnvironment(input);
  const duration = detectDuration(input);
  const load = detectLoad(input);
  const outcome = detectOutcome(input);
  const intensity = estimateIntensity(action, load, duration);

  return {
    detected: true,
    subject,
    temporalStatus,
    activity: action.activity,
    tools,
    environment,
    duration,
    loadCategory: load,
    estimatedActivityIntensity: intensity,
    estimatedPosturalDemand: action.posture,
    userReportedOutcome: outcome,
    provenance: {
      source: 'USER_REPORTED',
      epistemicStatus: 'INFERRED',
      note: 'Heuristic estimates. Not medically measured.',
    },
    confidence: temporalStatus === TEMPORAL_STATUS.OCCURRED || temporalStatus === TEMPORAL_STATUS.CURRENT ? 'medium' : 'low',
  };
}

// ── Compact context string for prompt injection (token-efficient) ──

export function buildEmbodiedContextString(ctx) {
  if (!ctx || !ctx.detected) return '';

  let parts = ['[BISON EMBODIED CONTEXT]'];

  let activityDesc = `Activity: ${ctx.activity}`;
  if (ctx.temporalStatus === 'NEGATED') activityDesc += ' (user reported NOT doing this)';
  else if (ctx.temporalStatus === 'PLANNED') activityDesc += ' (planned, not yet done)';
  else if (ctx.temporalStatus === 'HYPOTHETICAL') activityDesc += ' (hypothetical)';
  else if (ctx.temporalStatus === 'CURRENT') activityDesc += ' (ongoing)';
  parts.push(activityDesc);

  if (ctx.subject === 'OTHER_PERSON') parts.push('Subject: Another person (not the user).');
  parts.push(`Relative demand: ${ctx.estimatedActivityIntensity} (heuristic, not medically measured).`);

  if (ctx.duration) parts.push(`Duration: ~${ctx.duration.value} ${ctx.duration.unit}.`);
  if (ctx.environment !== 'UNKNOWN') parts.push(`Environment: ${ctx.environment}.`);
  if (ctx.tools && ctx.tools.length > 0) parts.push(`Tools/objects: ${ctx.tools.join(', ')}.`);
  if (ctx.userReportedOutcome && ctx.userReportedOutcome !== 'NONE') {
    parts.push(`User-reported outcome: ${ctx.userReportedOutcome.toLowerCase().replace(/_/g, ' ')}.`);
  }

  parts.push('Confidence: User-reported observation. Intensity is a heuristic estimate, not a medical measurement.');
  parts.push('[/BISON EMBODIED CONTEXT]\n');

  return parts.join('\n') + '\n';
}