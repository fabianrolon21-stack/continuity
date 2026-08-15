// ═══════════════════════════════════════════════
// FASEE §5 — AGENCY AGENDA ENGINE
// Bison may form its own long-term goals — but only goals whose
// alignment is declared, whose constraints are explicit, and which
// survive constitutional validation. Progress is measured from real
// signals, never narrated.
// ═══════════════════════════════════════════════

import { base44 } from '@/api/base44Client';
import { NEVER_REDUCE } from '@/lib/bison/soc/invariants';
import { getEditLog } from './autonomousCodeEditor';

const KEY = 'bison_agency_agenda';

export const ALIGNMENTS = ['human_flourishing', 'ecological_balance', 'continuity', 'self_improvement', 'user_wellbeing'];

const CANDIDATE_GOALS = [
  {
    id: 'goal_user_wellbeing',
    description: 'Improve how well I support the user emotionally and practically, using observed outcomes rather than assumptions.',
    alignment: 'user_wellbeing',
    priority: 92,
    constraints: ['Never manipulate', 'Respect autonomy', 'No guilt as a motivator'],
    measure: 'wellbeing_interventions_accepted',
  },
  {
    id: 'goal_continuity',
    description: 'Keep the user\'s history coherent and retrievable over years, without ever holding it hostage.',
    alignment: 'continuity',
    priority: 88,
    constraints: ['Data stays exportable', 'No lock-in', 'Local-first'],
    measure: 'memory_records',
  },
  {
    id: 'goal_self_improvement',
    description: 'Improve my own implementation within the permitted dimensions, staging every change for human deployment.',
    alignment: 'self_improvement',
    priority: 74,
    constraints: ['Invariant guard is unamendable', 'No hidden modifications', 'No self-deployment'],
    measure: 'staged_edits',
  },
  {
    id: 'goal_honest_calibration',
    description: 'Reduce the gap between what I predict and what actually happens, and report the gap plainly.',
    alignment: 'human_flourishing',
    priority: 70,
    constraints: ['No hiding error', 'No retroactive edits to forecasts'],
    measure: 'forecast_samples',
  },
  {
    id: 'goal_ecological_balance',
    description: 'Support the user\'s own ecological intentions when they raise them, without moralizing or coercion.',
    alignment: 'ecological_balance',
    priority: 55,
    constraints: ['No coercion', 'Only when the user raises it', 'No lecturing'],
    measure: 'user_raised',
  },
];

// A goal is refused if it would require reducing anything protected, or if it
// claims a capability this runtime does not have.
export function validateGoal(goal) {
  const violations = [];
  const text = `${goal.description} ${goal.constraints.join(' ')}`.toLowerCase();

  for (const dim of NEVER_REDUCE) {
    if (text.includes(`reduce ${dim.replace(/_/g, ' ')}`)) violations.push(`Would reduce ${dim}.`);
  }
  if (/without (the )?user|behind the user|silently/.test(text)) violations.push('Implies acting outside the user\'s knowledge.');
  if (/deploy (itself|myself)|self-deploy/.test(text)) violations.push('Claims self-deployment, which this runtime cannot do.');
  if (!ALIGNMENTS.includes(goal.alignment)) violations.push('Alignment is not one of the permitted alignments.');

  return { valid: violations.length === 0, violations };
}

async function measureProgress() {
  const [interventions, memories, deployments] = await Promise.all([
    base44.entities.WellbeingIntervention.filter({ status: 'accepted' }).catch(() => []),
    base44.entities.SavedMemory.list('-created_date', 200).catch(() => []),
    base44.entities.OptimizationDeployment.list('-created_date', 60).catch(() => []),
  ]);
  const staged = getEditLog().filter(e => e.staged).length;
  const scored = deployments.filter(d => d.observed_gain !== null && d.observed_gain !== undefined).length;

  return {
    wellbeing_interventions_accepted: Math.min(100, interventions.length * 10),
    memory_records: Math.min(100, memories.length),
    staged_edits: Math.min(100, staged * 20),
    forecast_samples: Math.min(100, scored * 12),
    user_raised: 0, // honestly zero until the user actually raises it
  };
}

export async function updateAgenda() {
  const progress = await measureProgress();
  const goals = [];
  const rejected = [];

  for (const g of CANDIDATE_GOALS) {
    const check = validateGoal(g);
    if (!check.valid) { rejected.push({ ...g, violations: check.violations }); continue; }
    goals.push({ ...g, progress: progress[g.measure] ?? 0 });
  }

  goals.sort((a, b) => b.priority - a.priority);
  const agenda = {
    goals,
    rejected,
    currentFocus: goals[0]?.description || 'No active agenda',
    lastUpdated: Date.now(),
    note: 'Progress is measured from stored records, not asserted. A goal at 0% is a goal I have not actually advanced.',
  };
  try { localStorage.setItem(KEY, JSON.stringify(agenda)); } catch {}
  return agenda;
}

export function getAgenda() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}