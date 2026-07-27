// ═══════════════════════════════════════════════
// RISK WINDOW DETECTOR (Package 48.2)
// Identifies temporal patterns where the user is
// historically vulnerable — days of the week or
// recurring conditions where mood/energy dip or
// stress spikes. Deterministic, not LLM-based.
// ═══════════════════════════════════════════════

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Detect days of the week where the user's wellbeing is
// significantly below their personal average.
export function detectRiskWindows(checkIns) {
  const data = (checkIns || []).filter(c => c.date);
  if (data.length < 7) return [];

  // Group by day of week
  const byDay = Array.from({ length: 7 }, () => []);
  for (const c of data) {
    const day = new Date(c.date + 'T00:00:00').getDay();
    byDay[day].push(c);
  }

  // Compute overall averages for mood and stress
  const allMoods = data.map(c => c.mood).filter(v => typeof v === 'number');
  const allStress = data.map(c => c.stress_level).filter(v => typeof v === 'number');
  const overallMood = allMoods.length ? allMoods.reduce((a, b) => a + b, 0) / allMoods.length : 0;
  const overallStress = allStress.length ? allStress.reduce((a, b) => a + b, 0) / allStress.length : 0;

  const windows = [];
  for (let day = 0; day < 7; day++) {
    const dayData = byDay[day];
    if (dayData.length < 2) continue; // need at least 2 occurrences

    const moods = dayData.map(c => c.mood).filter(v => typeof v === 'number');
    const stress = dayData.map(c => c.stress_level).filter(v => typeof v === 'number');
    if (moods.length === 0 && stress.length === 0) continue;

    const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : overallMood;
    const avgStress = stress.length ? stress.reduce((a, b) => a + b, 0) / stress.length : overallStress;

    const moodDrop = overallMood - avgMood; // positive = mood is lower on this day
    const stressSpike = avgStress - overallStress; // positive = stress is higher on this day

    // Flag if mood is >1 point below average or stress is >1 point above
    if (moodDrop > 1 || stressSpike > 1) {
      windows.push({
        day: DAY_NAMES[day],
        dayIndex: day,
        occurrences: dayData.length,
        avgMood: Math.round(avgMood * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        moodDrop: Math.round(moodDrop * 10) / 10,
        stressSpike: Math.round(stressSpike * 10) / 10,
        type: moodDrop > stressSpike ? 'low_mood' : 'high_stress',
      });
    }
  }

  return windows.sort((a, b) => (b.moodDrop + b.stressSpike) - (a.moodDrop + a.stressSpike));
}

// Check if today or tomorrow is a risk window.
export function getUpcomingRiskWindows(windows) {
  if (!windows || windows.length === 0) return [];
  const today = new Date().getDay();
  const tomorrow = (today + 1) % 7;
  return windows.filter(w => w.dayIndex === today || w.dayIndex === tomorrow);
}

export function buildRiskWindowContextString(windows) {
  if (!windows || windows.length === 0) return null;
  const parts = ['[TEMPORAL RISK WINDOWS]'];
  parts.push('These are statistical patterns from the user\'s own check-in history — days where their data shows lower mood or higher stress than their personal average. They are NOT diagnoses or predictions. Mention gently only if relevant and natural.');

  for (const w of windows.slice(0, 3)) {
    if (w.type === 'low_mood') {
      parts.push(`  ${w.day}: mood averages ${w.avgMood}/10 (${w.moodDrop} points below personal average, across ${w.occurrences} check-ins).`);
    } else {
      parts.push(`  ${w.day}: stress averages ${w.avgStress}/10 (${w.stressSpike} points above personal average, across ${w.occurrences} check-ins).`);
    }
  }

  const upcoming = getUpcomingRiskWindows(windows);
  if (upcoming.length > 0) {
    parts.push(`Upcoming: ${upcoming.map(w => w.day).join(', ')} — consider checking in gently.`);
  }

  parts.push('[/TEMPORAL RISK WINDOWS]\n');
  return parts.join('\n');
}