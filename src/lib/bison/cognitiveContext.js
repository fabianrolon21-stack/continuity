// ═══════════════════════════════════════════════
// COGNITIVE CONTEXT — UNIFIED DATA PIPELINE
// Aggregates ALL user data into a single cognitive profile.
// Every page's data flows into Bison's understanding.
// Every stored memory becomes useful elsewhere.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';

export async function buildCognitiveContext() {
  try {
    const [checkins, journals, relationships, philosophies, ethics, memories, insights] = await Promise.all([
      base44.entities.CheckIn.list('-date', 30).catch(() => []),
      base44.entities.JournalEntry.list('-created_date', 20).catch(() => []),
      base44.entities.Relationship.list('-updated_date', 10).catch(() => []),
      base44.entities.PhilosophyStatement.list('-created_date', 10).catch(() => []),
      base44.entities.EthicalAssessment.list('-created_date', 10).catch(() => []),
      base44.entities.SavedMemory.list('-created_date', 20).catch(() => []),
      base44.entities.InsightGem.list('-created_date', 5).catch(() => []),
    ]);

    return {
      wellbeing: analyzeWellbeingTrends(checkins),
      journal: analyzeJournalPatterns(journals),
      relationships: analyzeRelationships(relationships),
      philosophy: analyzePhilosophy(philosophies),
      ethics: analyzeEthics(ethics),
      memories: memories.slice(0, 5).map(m => ({
        text: m.text?.substring(0, 100),
        tags: m.tags,
        epistemic_status: m.epistemic_status,
      })),
      insights: insights.map(i => ({
        hypothesis: i.hypothesis?.substring(0, 100),
        feedback: i.user_feedback_status,
      })),
      contradictions: detectContradictions(journals, philosophies, ethics),
      summary: {
        totalCheckins: checkins.length,
        totalJournals: journals.length,
        totalMemories: memories.length,
        totalRelationships: relationships.length,
        totalPhilosophies: philosophies.length,
        totalEthics: ethics.length,
      },
    };
  } catch (e) {
    return null;
  }
}

// ── Wellbeing trend analysis from check-ins ──
function analyzeWellbeingTrends(checkins) {
  if (!checkins || checkins.length === 0) return null;

  const recent = checkins.slice(0, 7);
  const avgMood = avg(recent.map(c => c.mood).filter(v => v != null));
  const avgEnergy = avg(recent.map(c => c.energy).filter(v => v != null));
  const avgStress = avg(recent.map(c => c.stress_level).filter(v => v != null));
  const avgSleep = avg(recent.map(c => c.sleep_hours).filter(v => v != null));

  const moodValues = checkins.slice(0, Math.min(7, checkins.length)).map(c => c.mood).filter(v => v != null);
  const moodTrend = moodValues.length >= 2 ? trendDirection(moodValues) : 'unknown';

  // Exercise frequency
  const exerciseDays = recent.filter(c => c.exercise_type).length;

  return {
    recentAvgMood: avgMood,
    recentAvgEnergy: avgEnergy,
    recentAvgStress: avgStress,
    recentAvgSleep: avgSleep,
    moodTrend,
    exerciseFrequency: exerciseDays,
    dataPoints: recent.length,
  };
}

// ── Journal pattern analysis ──
function analyzeJournalPatterns(journals) {
  if (!journals || journals.length === 0) return null;

  const tagCounts = {};
  for (const j of journals) {
    for (const tag of (j.tags || [])) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const allDistortions = journals.flatMap(j => j.distortions_detected || []);
  const distortionCounts = {};
  for (const d of allDistortions) {
    distortionCounts[d] = (distortionCounts[d] || 0) + 1;
  }
  const recurringDistortions = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const journalMoods = journals.slice(0, 5).map(j => j.mood).filter(v => v != null);
  const avgJournalMood = avg(journalMoods);

  return { topTags, recurringDistortions, avgJournalMood, total: journals.length };
}

// ── Relationship overview ──
function analyzeRelationships(relationships) {
  if (!relationships || relationships.length === 0) return null;

  const byCategory = {};
  for (const r of relationships) {
    const cat = r.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = 0;
    byCategory[cat]++;
  }

  const avgTrust = avg(relationships.map(r => r.trust_level).filter(v => v != null));
  const avgCloseness = avg(relationships.map(r => r.closeness_level).filter(v => v != null));

  return {
    total: relationships.length,
    categories: Object.keys(byCategory),
    avgTrust,
    avgCloseness,
    topRelationships: relationships.slice(0, 5).map(r => ({
      name: r.name,
      trust: r.trust_level,
      closeness: r.closeness_level,
      category: r.category,
    })),
  };
}

// ── Philosophy overview ──
function analyzePhilosophy(philosophies) {
  if (!philosophies || philosophies.length === 0) return null;

  const perspectives = {};
  for (const p of philosophies) {
    const persp = p.perspective || 'personal';
    perspectives[persp] = (perspectives[persp] || 0) + 1;
  }

  const categories = {};
  for (const p of philosophies) {
    const cat = p.category || 'belief';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  return {
    total: philosophies.length,
    perspectives,
    categories,
    recent: philosophies.slice(0, 3).map(p => ({
      text: p.text?.substring(0, 100),
      category: p.category,
      perspective: p.perspective,
    })),
  };
}

// ── Ethics overview ──
function analyzeEthics(ethics) {
  if (!ethics || ethics.length === 0) return null;

  const byDimension = {};
  for (const e of ethics) {
    const dim = e.dimension;
    if (!byDimension[dim]) byDimension[dim] = { blue: 0, red: 0, mixed: 0 };
    byDimension[dim].blue += e.blue_points || 0;
    byDimension[dim].red += e.red_points || 0;
    byDimension[dim].mixed += e.mixed_points || 0;
  }

  return { dimensions: byDimension, totalAssessments: ethics.length };
}

// ── Cross-entity contradiction detection ──
function detectContradictions(journals, philosophies, ethics) {
  const contradictions = [];

  // Detect goal-setting language in journals that might conflict with stated values
  if (journals && journals.length > 0 && philosophies && philosophies.length > 0) {
    const goalJournals = journals.filter(j => /\b(goal|want to|plan to|going to|i will)\b/i.test(j.content || ''));
    const valueStatements = philosophies.filter(p => p.category === 'value' || p.category === 'principle');

    if (goalJournals.length > 3 && valueStatements.length > 0) {
      // Lightweight: flag if many goals but few aligned with stated values
      // This is intentionally cautious — not a diagnosis
    }
  }

  // Detect recurring cognitive distortions that might conflict with ethical growth
  if (journals && ethics) {
    const distortionJournals = journals.filter(j => j.distortions_detected && j.distortions_detected.length > 0);
    if (distortionJournals.length > 3) {
      contradictions.push({
        type: 'recurring_distortions_vs_growth',
        note: 'Multiple journal entries show cognitive distortions alongside ethical self-assessment.',
        confidence: 'low',
      });
    }
  }

  return contradictions;
}

// ── Utilities ──
function avg(arr) {
  if (!arr || arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function trendDirection(arr) {
  if (!arr || arr.length < 2) return 'unknown';
  const midpoint = Math.ceil(arr.length / 2);
  const first = avg(arr.slice(0, midpoint));
  const second = avg(arr.slice(midpoint));
  if (first == null || second == null) return 'unknown';
  const diff = second - first;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

// ── Compact context string for LLM prompt ──
export function buildCognitiveContextString(context) {
  if (!context) return '';

  const parts = ['[COGNITIVE CONTEXT — UNIFIED USER PROFILE]'];

  if (context.wellbeing) {
    parts.push('WELLBEING TRENDS (recent check-ins):');
    parts.push(`  Mood: ${context.wellbeing.recentAvgMood?.toFixed(1) || '—'}/10 (${context.wellbeing.moodTrend})`);
    parts.push(`  Energy: ${context.wellbeing.recentAvgEnergy?.toFixed(1) || '—'}/10`);
    parts.push(`  Stress: ${context.wellbeing.recentAvgStress?.toFixed(1) || '—'}/10`);
    parts.push(`  Sleep: ${context.wellbeing.recentAvgSleep?.toFixed(1) || '—'}h`);
    parts.push(`  Exercise: ${context.wellbeing.exerciseFrequency}/7 days`);
  }

  if (context.journal) {
    parts.push(`JOURNAL PATTERNS (${context.journal.total} entries):`);
    if (context.journal.topTags.length > 0) {
      parts.push(`  Recurring themes: ${context.journal.topTags.map(([tag, count]) => `${tag}(${count})`).join(', ')}`);
    }
    if (context.journal.recurringDistortions.length > 0) {
      parts.push(`  Cognitive distortions: ${context.journal.recurringDistortions.map(([d, count]) => `${d.replace(/_/g, ' ')}(${count})`).join(', ')}`);
    }
    if (context.journal.avgJournalMood != null) {
      parts.push(`  Avg journal mood: ${context.journal.avgJournalMood.toFixed(1)}/10`);
    }
  }

  if (context.relationships) {
    parts.push(`RELATIONSHIPS: ${context.relationships.total} tracked`);
    parts.push(`  Categories: ${context.relationships.categories.join(', ')}`);
    if (context.relationships.avgTrust != null) {
      parts.push(`  Avg trust: ${context.relationships.avgTrust.toFixed(1)}/10`);
    }
  }

  if (context.philosophy) {
    parts.push(`PHILOSOPHY: ${context.philosophy.total} statements`);
    parts.push(`  Perspectives: ${Object.entries(context.philosophy.perspectives).map(([p, c]) => `${p}(${c})`).join(', ')}`);
  }

  if (context.ethics) {
    parts.push(`ETHICS: ${context.ethics.totalAssessments} assessments across ${Object.keys(context.ethics.dimensions).length} dimensions`);
  }

  if (context.memories && context.memories.length > 0) {
    parts.push(`RECENT MEMORIES: ${context.memories.length} saved`);
  }

  if (context.insights && context.insights.length > 0) {
    const accepted = context.insights.filter(i => i.feedback === 'ACCEPTED').length;
    parts.push(`INSIGHTS: ${context.insights.length} generated (${accepted} accepted)`);
  }

  if (context.contradictions && context.contradictions.length > 0) {
    parts.push('POTENTIAL CONTRADICTIONS:');
    for (const c of context.contradictions) {
      parts.push(`  ${c.type}: ${c.note} (confidence: ${c.confidence})`);
    }
  }

  parts.push('Note: This is aggregated historical data from all user activities.');
  parts.push('Reference specific data points only when relevant to the conversation.');
  parts.push('Do not recite data mechanically. Let it inform your understanding naturally.');
  parts.push('[/COGNITIVE CONTEXT]\n');

  return parts.join('\n') + '\n';
}