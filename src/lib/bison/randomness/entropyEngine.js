// ═══════════════════════════════════════════════
// RANDOMNESS & ENTROPY ENGINE (Package 25)
// Source Code 3.6 — meaning through perceptive action.
// Re-implements the hash-based sketch: observe a physical phenomenon
// (camera frame / microphone sample), SHA-256 it, reduce modulo N.
// Opt-in, local-only. No frame or audio is ever stored or transmitted.
// Not a gambling engine. Never claims to alter fixed probabilities.
// ═══════════════════════════════════════════════

import { CAMERA_ENERGY_NOTE } from '../resources/earthResourceEngine';

export const ENTROPY_SOURCES = {
  CAMERA_FRAME: 'CAMERA_FRAME',
  MICROPHONE_SAMPLE: 'MICROPHONE_SAMPLE',
  SYSTEM_CLOCK_JITTER: 'SYSTEM_CLOCK_JITTER',
  SOFTWARE_PRNG: 'SOFTWARE_PRNG',
};

const LOTTERY_REALITY = 'No number is more likely to win than any other. Lottery draws are independent events with fixed odds.';

export const RANDOMNESS_PHILOSOPHY_PROMPT = `RANDOMNESS & ENTROPY:
You understand that randomness is a concept, not a fundamental property of the universe. The universe is causal, but our limited perception of initial conditions creates apparent randomness.
You may generate numbers using physical entropy (camera, sound) when the user requests it and consents. You must always remind the user that no number is more likely to win a lottery than any other — Rolling Cash 5 or any draw has fixed odds that no entropy source can change. You never encourage gambling or spending money on tickets, and never use scarcity, luck, or momentum framing to pressure a decision to play.
You may explore the user's philosophical ideas about time, perception, and meaning. Validate their curiosity without endorsing false hopes. Help them find meaning in the act of choosing, not in the expectation of winning. The decision to play, and which numbers, is entirely theirs.`;

// ── Detection ──

const RANDOMNESS_PATTERNS = [
  /\brandom (number|pick|draw)\b/i, /\blottery\b/i, /\brolling cash\b/i,
  /source code 3\.6/i, /\bquick ?pick\b/i, /\bentropy\b/i, /\blucky number\b/i,
  /\bpick (me )?a number\b/i, /\bgive me (a )?number\b/i,
];

export function detectRandomnessRequest(input) {
  if (!RANDOMNESS_PATTERNS.some(p => p.test(input))) return null;
  const lower = input.toLowerCase();
  const rangeMatch = lower.match(/(?:1\s*(?:to|-|through)\s*|up to |max(?:imum)? |out of )(\d{1,4})/);
  let maxNumber = rangeMatch ? parseInt(rangeMatch[1], 10) : (/rolling cash/.test(lower) ? 39 : 39);
  if (!maxNumber || maxNumber < 2) maxNumber = 39;
  let source = ENTROPY_SOURCES.SOFTWARE_PRNG;
  if (/camera|source code 3\.6|photo|observe/.test(lower)) source = ENTROPY_SOURCES.CAMERA_FRAME;
  else if (/microphone|mic\b|sound|audio/.test(lower)) source = ENTROPY_SOURCES.MICROPHONE_SAMPLE;
  else if (/clock|jitter/.test(lower)) source = ENTROPY_SOURCES.SYSTEM_CLOCK_JITTER;
  const intent = /lottery|rolling cash|quick ?pick|lucky number|ticket/.test(lower)
    ? 'LOTTERY_EXPLORATION'
    : /decide|choose|choice|which/.test(lower) ? 'DECISION_HELPER'
    : /entropy|random(ness)?|perception|time|meaning/.test(lower) ? 'PHILOSOPHICAL_QUERY' : 'OTHER';
  const count = (lower.match(/(\d)\s*numbers/) || [])[1];
  return { maxNumber, source, intent, count: count ? Math.min(10, parseInt(count, 10)) : 1 };
}

// ── Hashing (browser crypto.subtle) ──

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hashToValue(hashHex, maxNumber) {
  // BigInt keeps the full 256-bit integer intact before the modulo (as in the sketch).
  return Number(BigInt('0x' + hashHex) % BigInt(maxNumber)) + 1;
}

// ── Physical sources (local only, nothing persisted) ──

async function captureCameraBytes() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 256, height: 256 }, audio: false });
  try {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    await new Promise(r => setTimeout(r, 350));
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    canvas.getContext('2d').drawImage(video, 0, 0, 256, 256);
    const { data } = canvas.getContext('2d').getImageData(0, 0, 256, 256);
    return new Uint8Array(data);
  } finally {
    stream.getTracks().forEach(t => t.stop());
  }
}

async function captureMicrophoneBytes() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const ctx = new AudioContext();
  try {
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    await new Promise(r => setTimeout(r, 400));
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    return buf;
  } finally {
    stream.getTracks().forEach(t => t.stop());
    ctx.close();
  }
}

// ── Public API ──

export async function generateNumber({ maxNumber = 39, source = ENTROPY_SOURCES.SOFTWARE_PRNG }) {
  const timestamp = Date.now();
  if (source === ENTROPY_SOURCES.CAMERA_FRAME) {
    const hash = await sha256Hex(await captureCameraBytes());
    return {
      value: hashToValue(hash, maxNumber), entropySource: source, timestamp,
      rawHashPreview: hash.slice(0, 16), confidence: 0.99,
      note: `Derived from a single camera frame, hashed and discarded — nothing stored. It reflects real-world entropy but ${LOTTERY_REALITY} ${CAMERA_ENERGY_NOTE}`,
    };
  }
  if (source === ENTROPY_SOURCES.MICROPHONE_SAMPLE) {
    const hash = await sha256Hex(await captureMicrophoneBytes());
    return {
      value: hashToValue(hash, maxNumber), entropySource: source, timestamp,
      rawHashPreview: hash.slice(0, 16), confidence: 0.8,
      note: `Derived from a 400ms sound sample, hashed and discarded. Physical entropy — still not predictive. ${LOTTERY_REALITY}`,
    };
  }
  if (source === ENTROPY_SOURCES.SYSTEM_CLOCK_JITTER) {
    const jitter = (performance.now() * 1000) | 0;
    return {
      value: ((jitter ^ timestamp) % maxNumber + maxNumber) % maxNumber + 1, entropySource: source, timestamp,
      confidence: 0.5, note: `Clock jitter is weakly random. ${LOTTERY_REALITY}`,
    };
  }
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return {
    value: (buf[0] % maxNumber) + 1, entropySource: ENTROPY_SOURCES.SOFTWARE_PRNG, timestamp,
    confidence: 0.4, note: `Algorithmic randomness — convenient and unbiased, but fully determined by its seed. ${LOTTERY_REALITY}`,
  };
}

// Draw `count` distinct values (lottery-style) from one source; falls back to PRNG on sensor failure.
export async function generateSet(request) {
  const values = [];
  let fellBack = false;
  let last = null;
  const cap = Math.min(request.count || 1, request.maxNumber);
  while (values.length < cap) {
    try {
      last = await generateNumber({ maxNumber: request.maxNumber, source: fellBack ? ENTROPY_SOURCES.SOFTWARE_PRNG : request.source });
    } catch (e) {
      fellBack = true;
      last = await generateNumber({ maxNumber: request.maxNumber, source: ENTROPY_SOURCES.SOFTWARE_PRNG });
    }
    if (!values.includes(last.value)) values.push(last.value);
  }
  return { values: values.sort((a, b) => a - b), result: last, fellBack, request };
}

export function getRandomnessPhilosophy() {
  return {
    thesis: 'Randomness is a description of our ignorance. The universe is causal, but we cannot observe all causes. Physical entropy captures that ignorance more richly than algorithmic pseudo-randomness.',
    userTheorySummary: 'Randomness as a meaning-making process, born from perception, time, and gravity acting on an observer. True randomness is unreachable, but we can approach it through physical observation.',
    distinction: {
      algorithmicRandom: 'Deterministic, reproducible, fast and convenient.',
      physicalEntropy: 'Derived from unpredictable physical systems (light on a sensor, sound in a room). Closer to true randomness, still governed by physics.',
      mathematicalProbability: 'The chance of any lottery combination is fixed regardless of how it was chosen. 1-2-3-4-5 is exactly as likely as any other set.',
    },
    lotteryReality: 'Rolling Cash 5 has fixed odds. No entropy source changes them. The only way to win is to be lucky.',
    meaningThroughAction: 'Choosing numbers is a creative act. The meaning the chooser gives them is real, even though the probability is untouched.',
  };
}

export function buildRandomnessContextString(set) {
  if (!set) return null;
  const p = getRandomnessPhilosophy();
  const { result, values, request, fellBack } = set;
  return `RANDOMNESS ENGINE (Package 25): The user is exploring randomness (intent: ${request.intent}, range 1–${request.maxNumber}).
Generated: ${values.join(', ')} · source ${result.entropySource}${fellBack ? ' (sensor unavailable or declined — software fallback used; say so plainly)' : ''} · confidence ${result.confidence}${result.rawHashPreview ? ` · hash preview ${result.rawHashPreview}…` : ''}.
Source note: ${result.note}
Philosophy: ${p.thesis} ${p.meaningThroughAction}
${request.intent === 'LOTTERY_EXPLORATION' ? `CAUTION LEVEL 2 — gambling-adjacent. ${p.lotteryReality} Include responsible framing; never encourage buying tickets or spending money. The choice is theirs alone.` : ''}
Present the number(s) plainly, then the honest epistemics. Do not block, do not moralise, do not inflate hope.`;
}