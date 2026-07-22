// ═══════════════════════════════════════════════
// AMBIENT INTELLIGENCE (Phase 31 — Living World)
// Bison notices patterns and makes gentle observations.
// Never surveillance — always soft, always optional.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { TIME_PERIODS } from './worldStateEngine';

// ── Pattern detection ──
export async function detectPatterns(worldState) {
  const patterns = [];

  try {
    const [checkins, journals, memories] = await Promise.all([
      base44.entities.CheckIn.list('-date', 14).catch(() => []),
      base44.entities.JournalEntry.list('-created_date', 14).catch(() => []),
      base44.entities.SavedMemory.list('-created_date', 10).catch(() => []),
    ]);

    // Streak detection — consecutive days with check-ins
    const streakDays = calculateStreak(checkins);
    if (streakDays >= 3) {
      patterns.push({
        type: 'streak',
        days: streakDays,
        observation: `You've checked in ${streakDays} days in a row.`,
      });
    }

    // Usual activity time — check if current hour matches common journal time
    const journalHours = journals
      .map(j => new Date(j.created_date).getHours())
      .filter(h => !isNaN(h));
    if (journalHours.length >= 3) {
      const currentHour = worldState.time.hour;
      const hourCounts = {};
      journalHours.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
      const mostCommonHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (parseInt(mostCommonHour) === currentHour) {
        patterns.push({
          type: 'usual_time',
          observation: "It's your usual reflection time.",
        });
      }
    }

    // Mood trend
    if (checkins.length >= 3) {
      const recent = checkins.slice(0, 3).map(c => c.mood).filter(m => m != null);
      const older = checkins.slice(3, 6).map(c => c.mood).filter(m => m != null);
      if (recent.length >= 2 && older.length >= 2) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        if (recentAvg > olderAvg + 1) {
          patterns.push({ type: 'mood_improving', observation: "You've been feeling a bit better lately." });
        } else if (recentAvg < olderAvg - 1) {
          patterns.push({ type: 'mood_declining', observation: "Things have felt heavier recently." });
        }
      }
    }

    // Weather + activity correlation
    if (worldState.weather.current === 'sunny' && streakDays >= 3) {
      patterns.push({
        type: 'weather_walk',
        observation: "The weather looks perfect for the walk you usually take.",
      });
    }

    // Late night reflection
    if (worldState.time.period === TIME_PERIODS.LATE_NIGHT && journals.length > 0) {
      const lateNightJournals = journals.filter(j => {
        const h = new Date(j.created_date).getHours();
        return h >= 1 && h <= 4;
      });
      if (lateNightJournals.length >= 2) {
        patterns.push({
          type: 'late_night_pattern',
          observation: "You do some of your best thinking late at night.",
        });
      }
    }

  } catch (e) {}

  return patterns;
}

function calculateStreak(checkins) {
  if (!checkins || checkins.length === 0) return 0;
  const dates = checkins.map(c => c.date).filter(Boolean).sort().reverse();
  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === expected.getTime()) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else if (d.getTime() < expected.getTime()) {
      break;
    }
  }
  return streak;
}

// ── Generate a single ambient observation (non-intrusive) ──
export function pickAmbientObservation(patterns, worldState) {
  if (!patterns || patterns.length === 0) return null;

  // Don't show during quiet hours unless it's important
  if (worldState.isQuietHours) {
    const important = patterns.filter(p => p.type === 'mood_declining');
    if (important.length === 0) return null;
    return important[0];
  }

  // Pick one at random — never overwhelm
  return patterns[Math.floor(Math.random() * patterns.length)];
}