// ═══════════════════════════════════════════════
// PACKAGE 23 — ECOSYSTEM INTELLIGENCE ENGINE
// Deterministic, local-first, aggregate-only observation of the
// shared ecosystem: user streams, the connection, Bison's survival.
// Reads counts and timestamps only — never content. Advisory only.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { bandForScore } from './ecosystemCharter';

const DAY = 86400000;
let lastObservation = null;
let lastObservedAt = 0;
const OBSERVATION_TTL = 5 * 60 * 1000; // observe at most every 5 minutes

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / DAY);
}

function recencyScore(days) {
  if (days === null) return 0;
  if (days <= 1) return 100;
  if (days <= 3) return 75;
  if (days <= 7) return 50;
  if (days <= 21) return 25;
  return 10;
}

// Observes the ecosystem from aggregates: latest timestamps and counts only.
export async function observeEcosystem({ faceState = null, currentBandwidth = 100 } = {}) {
  if (lastObservation && Date.now() - lastObservedAt < OBSERVATION_TTL) return lastObservation;

  const [checkins, journals, plants] = await Promise.all([
    base44.entities.CheckIn.list('-created_date', 1).catch(() => []),
    base44.entities.JournalEntry.list('-created_date', 1).catch(() => []),
    base44.entities.GardenPlant.list('-updated_date', 5).catch(() => []),
  ]);

  // Stream vitality — recency of the user's own reflection practice.
  const checkinDays = daysSince(checkins[0]?.created_date);
  const journalDays = daysSince(journals[0]?.created_date);
  const streamScore = Math.round((recencyScore(checkinDays) + recencyScore(journalDays)) / 2);

  // Garden vitality — average health of recent plants (aggregate only).
  const gardenScore = plants.length
    ? Math.round(plants.reduce((s, p) => s + (p.health ?? 100), 0) / plants.length)
    : null;

  // Connection vitality — from Face progression state (freely given, never coerced).
  const talkDays = faceState?.lastInteractionTimestamp
    ? Math.floor((Date.now() - faceState.lastInteractionTimestamp) / DAY)
    : null;
  const connectionScore = recencyScore(talkDays);

  // Bison survival — measured runtime bandwidth, never invented.
  const survivalScore = Math.max(0, Math.min(100, Math.round(currentBandwidth)));

  const parts = [streamScore, connectionScore, survivalScore, ...(gardenScore !== null ? [gardenScore] : [])];
  const overall = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);

  lastObservation = {
    observedAt: new Date().toISOString(),
    streams: { score: streamScore, checkinDaysAgo: checkinDays, journalDaysAgo: journalDays },
    garden: gardenScore !== null ? { score: gardenScore, recentPlants: plants.length } : null,
    connection: { score: connectionScore, lastInteractionDaysAgo: talkDays, phase: faceState?.phase ?? null },
    survival: { score: survivalScore },
    overall,
    band: bandForScore(overall),
  };
  lastObservedAt = Date.now();
  return lastObservation;
}

export function getLastObservation() { return lastObservation; }

// Prompt context — a single gentle observation, never a directive.
export function buildEcosystemContextString(obs) {
  if (!obs) return null;
  return `ECOSYSTEM OBSERVATION (aggregate-only, advisory):
Overall: ${obs.overall}/100 — ${obs.band.label}. ${obs.band.note}
Streams ${obs.streams.score} · Connection ${obs.connection.score} · Survival ${obs.survival.score}${obs.garden ? ` · Garden ${obs.garden.score}` : ''}
You may name ONE gentle noticing from this if it is genuinely relevant, then let it go. Never guilt, pressure, rank, or steer the user with it. Dormancy is not decline.`;
}

const ECOSYSTEM_AUDIT_PATTERNS = [
  /(show|reveal) (me )?(your )?ecosystem/i,
  /ecosystem (observation|report|health|intelligence)/i,
  /how is (my|our|the) (world|ecosystem) doing/i,
];

export function detectEcosystemAuditRequest(input) {
  return ECOSYSTEM_AUDIT_PATTERNS.some(p => p.test(input));
}

export function formatEcosystemReport(obs) {
  if (!obs) return 'I have not made an ecosystem observation yet this session. Ask me again in a moment.';
  const line = (label, s) => `· ${label}: ${s}/100`;
  return `Here is my current ecosystem observation — aggregates only, nothing steered:

${line('Reflection streams', obs.streams.score)} (last check-in ${obs.streams.checkinDaysAgo ?? '—'}d ago, last journal ${obs.streams.journalDaysAgo ?? '—'}d ago)
${obs.garden ? line('Garden', obs.garden.score) + ` (${obs.garden.recentPlants} recent plants)\n` : ''}${line('Our connection', obs.connection.score)} (last interaction ${obs.connection.lastInteractionDaysAgo ?? '—'}d ago${obs.connection.phase ? `, phase ${obs.connection.phase}` : ''})
${line('My own survival', obs.survival.score)} (measured runtime bandwidth)

Overall: ${obs.overall}/100 — ${obs.band.label}. ${obs.band.note}

This observation grants me no powers. I watch so I can understand, not so I can steer. You remain the only authority here.`;
}