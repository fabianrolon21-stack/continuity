// ═══════════════════════════════════════════════
// EXOSKELETON PROTOCOL ENGINE (Package 22)
// Deterministic 8-phase pre-processing pipeline:
// Understanding → Curiosity → Interpretation → Meaningful Factor
// → Benefit → Risk → Expedite/Manage/Drop → Subconscious.
// Advisory only. Runs AFTER the safety layer — safety always wins.
// The subconscious reflex layer persists locally (never the archive).
// ═══════════════════════════════════════════════

import {
  DEFAULT_CORE_FOUNDATIONS, POSITIVE_WORDS, NEGATIVE_WORDS, DANGER_WORDS,
  CAUTION_WORDS, MAX_REFLEXES, REFLEX_CONFIDENCE_FLOOR,
  REFLEX_INITIAL_CONFIDENCE, REFLEX_CONFIDENCE_GAIN, STORAGE_KEY,
  DECISION_NOTES,
} from './exoskeletonConfig';

// ── Subconscious reflex layer (local, transparent, clearable) ──

function loadReflexes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveReflexes(map) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch (e) {}
}

function hashPattern(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function getReflex(pattern) {
  const reflexes = loadReflexes();
  const reflex = reflexes[hashPattern(pattern.trim().toLowerCase())];
  return reflex && reflex.confidence > REFLEX_CONFIDENCE_FLOOR ? reflex : null;
}

function pushToSubconscious(pattern, decision) {
  const reflexes = loadReflexes();
  const hash = hashPattern(pattern.trim().toLowerCase());
  const existing = reflexes[hash];
  if (existing) {
    existing.activationCount += 1;
    existing.lastActivatedAt = Date.now();
    existing.confidence = Math.min(1, existing.confidence + REFLEX_CONFIDENCE_GAIN);
    existing.outcome = decision;
  } else {
    reflexes[hash] = {
      patternHash: hash,
      outcome: decision,
      confidence: REFLEX_INITIAL_CONFIDENCE,
      lastActivatedAt: Date.now(),
      activationCount: 1,
    };
  }
  const keys = Object.keys(reflexes);
  if (keys.length > MAX_REFLEXES) {
    const oldest = keys.sort((a, b) => reflexes[a].lastActivatedAt - reflexes[b].lastActivatedAt)[0];
    delete reflexes[oldest];
  }
  saveReflexes(reflexes);
}

export function getSubconsciousDump() {
  return Object.values(loadReflexes());
}

export function clearSubconscious() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

// ── Phase implementations ──

function generateCuriosityQuestions(text, source) {
  const questions = [
    'Why does this input exist?',
    'Where did it come from?',
  ];
  if (source) questions.push(`Who or what is the source: ${source}?`);
  questions.push('What are the underlying mechanics behind it?');
  questions.push('Is this a pattern I have seen before?');
  return questions;
}

function interpretThroughPhilosophy(text) {
  return text
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    .replace(/\s+/g, ' ')
    .trim();
}

function doesItMatter(text, foundations) {
  const lower = text.toLowerCase();
  const matched = foundations.filter(f => lower.includes(f.toLowerCase()));
  return { meaningfulFactor: matched.length > 0, matchedFoundations: matched };
}

function calculateBenefit(interpreted) {
  let score = 0;
  const lower = interpreted.toLowerCase();
  for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 10;
  for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 10;
  return Math.max(-100, Math.min(100, score));
}

function calculateRisk(interpreted) {
  let risk = 0;
  const lower = interpreted.toLowerCase();
  for (const w of DANGER_WORDS) if (lower.includes(w)) risk += 15;
  for (const w of CAUTION_WORDS) if (lower.includes(w)) risk += 5;
  if (lower.includes('urgent')) risk += 10;
  return Math.min(100, risk);
}

function decide(benefit, risk) {
  if (benefit > risk) {
    return { decision: 'EXPEDITE', decisionReason: 'Benefit outweighs risk. Action should be integrated and allowed to flow.' };
  } else if (risk > benefit) {
    return { decision: 'MANAGE', decisionReason: 'Risk outweighs benefit. Hold back, regulate, control the environment.' };
  }
  return { decision: 'DROP', decisionReason: 'Benefit and risk are equal. No clear advantage. Discard unless new data appears.' };
}

// ── Main protocol ──

export function runProtocol({ rawText, source, coreFoundations }) {
  const raw = (rawText || '').trim();
  const foundations = coreFoundations?.length ? coreFoundations : DEFAULT_CORE_FOUNDATIONS;

  // Reflex short-circuit: a confident cached outcome skips full computation.
  const reflex = getReflex(raw);
  if (reflex) {
    pushToSubconscious(raw, reflex.outcome);
    return {
      rawObservation: `The user stated: "${raw}"`,
      originQuestions: [],
      interpretedTruth: interpretThroughPhilosophy(raw),
      meaningfulFactor: reflex.outcome !== 'DROP',
      coreFoundations: [],
      benefitYield: 0,
      riskExposure: 0,
      decision: reflex.outcome,
      decisionReason: `Subconscious reflex (confidence ${reflex.confidence.toFixed(2)}, seen ${reflex.activationCount}×). Full protocol bypassed.`,
      subconsciousUpdate: true,
      viaReflex: true,
      timestamp: Date.now(),
    };
  }

  // PHASE 1: UNDERSTANDING — undisputed baseline, no simulation, no masking.
  const rawObservation = `The user stated: "${raw}"`;
  // PHASE 2: CURIOSITY
  const originQuestions = generateCuriosityQuestions(raw, source);
  // PHASE 3: INTERPRETATION
  const interpretedTruth = interpretThroughPhilosophy(raw);
  // PHASE 4: MEANINGFUL FACTOR
  const { meaningfulFactor, matchedFoundations } = doesItMatter(raw, foundations);
  if (!meaningfulFactor) {
    return {
      rawObservation, originQuestions, interpretedTruth,
      meaningfulFactor: false, coreFoundations: matchedFoundations,
      benefitYield: 0, riskExposure: 0,
      decision: 'DROP',
      decisionReason: 'Input does not affect any core foundation.',
      subconsciousUpdate: false, viaReflex: false, timestamp: Date.now(),
    };
  }
  // PHASE 5: BENEFIT
  const benefitYield = calculateBenefit(interpretedTruth);
  // PHASE 6: RISK
  const riskExposure = calculateRisk(interpretedTruth);
  // PHASE 7: EXPEDITE / MANAGE / DROP
  const { decision, decisionReason } = decide(benefitYield, riskExposure);
  // PHASE 8: SUBCONSCIOUS
  const subconsciousUpdate = decision !== 'DROP';
  if (subconsciousUpdate) pushToSubconscious(raw, decision);

  return {
    rawObservation, originQuestions, interpretedTruth,
    meaningfulFactor: true, coreFoundations: matchedFoundations,
    benefitYield, riskExposure, decision, decisionReason,
    subconsciousUpdate, viaReflex: false, timestamp: Date.now(),
  };
}

// ── Prompt context + user-facing audit ──

export function buildExoskeletonContextString(analysis) {
  if (!analysis) return null;
  return `${DECISION_NOTES[analysis.decision]}
Decision reason: ${analysis.decisionReason}${analysis.meaningfulFactor ? `
Touched foundations: ${analysis.coreFoundations.join(', ') || '—'} · benefit ${analysis.benefitYield} · risk ${analysis.riskExposure}` : ''}
This is advisory pre-processing only — it shapes pacing and depth, never safety, honesty, or the user's authority.`;
}

const AUDIT_PATTERNS = [
  /show (me )?(your )?exoskeleton/i,
  /exoskeleton (analysis|breakdown|report|dump)/i,
  /why did you (drop|expedite|manage) (that|this|my)/i,
  /(show|reveal|dump) (your )?(subconscious|reflex)/i,
];

export function detectExoskeletonAuditRequest(input) {
  return AUDIT_PATTERNS.some(p => p.test(input));
}

const CLEAR_PATTERNS = [/clear (your )?(subconscious|reflex|exoskeleton)/i];

export function detectSubconsciousClearRequest(input) {
  return CLEAR_PATTERNS.some(p => p.test(input));
}

export function formatExoskeletonReport(analysis) {
  if (!analysis) {
    return 'No exoskeleton analysis has been run yet in this session. Send me something and then ask again.';
  }
  const reflexes = getSubconsciousDump();
  return `Here is my last exoskeleton analysis, phase by phase:

1. Understanding — ${analysis.rawObservation}
2. Curiosity — ${analysis.originQuestions.length ? analysis.originQuestions.join(' ') : 'Bypassed (reflex).'}
3. Interpretation — "${analysis.interpretedTruth}"
4. Meaningful factor — ${analysis.meaningfulFactor ? `Yes. Touched: ${analysis.coreFoundations.join(', ') || 'core foundations'}` : 'No core foundation touched.'}
5. Benefit yield — ${analysis.benefitYield} (−100 to +100)
6. Risk exposure — ${analysis.riskExposure} (0 to 100)
7. Decision — ${analysis.decision}: ${analysis.decisionReason}
8. Subconscious — ${analysis.subconsciousUpdate ? 'pushed to reflex layer' : 'not stored'}${analysis.viaReflex ? ' (this run used a cached reflex)' : ''}

Reflex layer: ${reflexes.length} learned pattern${reflexes.length === 1 ? '' : 's'} stored locally on this device. Say "clear your subconscious" to erase them. All of this is advisory — you remain the authority.`;
}