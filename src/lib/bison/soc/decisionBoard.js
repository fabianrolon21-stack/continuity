// ═══════════════════════════════════════════════
// PACKAGE 50 — DECISION SIMULATION BOARD (§2)
// Before ANY autonomous action, Bison constructs a Decision
// Board. An action that cannot produce a complete board
// cannot execute.
// ═══════════════════════════════════════════════

import { forecast } from './forecastHorizons';
import { humanityBoard, civilizationEvaluation } from './humanityBoard';
import { riskMatrix } from './riskMatrix';
import { checkInvariants } from './invariants';

export function decisionBoard(proposal) {
  const fc = forecast(proposal);
  const humanity = humanityBoard(proposal);
  const risk = riskMatrix(proposal);
  const invariants = checkInvariants(proposal);

  const h = (id) => fc.horizons.find(x => x.id === id);
  const longRun = h('long');
  const spread = longRun.uncertainty;

  const rows = [
    { row: 'Immediate Outcome', value: `Benefit ${h('immediate').benefit}, risk ${h('immediate').risk}` },
    { row: 'Short-Term Outcome', value: `Benefit ${h('week').benefit}, risk ${h('week').risk}` },
    { row: 'Medium-Term Outcome', value: `Benefit ${h('month').benefit}, risk ${h('month').risk}` },
    { row: 'Long-Term Outcome', value: `Benefit ${longRun.benefit}, risk ${longRun.risk}` },
    { row: 'Worst Case', value: `Benefit ${Math.round((longRun.benefit - spread) * 100) / 100}, risk ${Math.round(Math.min(1, longRun.risk + spread) * 100) / 100}` },
    { row: 'Best Case', value: `Benefit ${Math.round((longRun.benefit + spread) * 100) / 100}, risk ${Math.round(Math.max(0, longRun.risk - spread) * 100) / 100}` },
    { row: 'Expected Case', value: `Benefit ${longRun.benefit}, risk ${longRun.risk}` },
    { row: 'Uncertainty', value: `±${spread} at long horizon · confidence ${longRun.confidence}` },
    { row: 'Human Impact', value: humanity.acceptable ? `No humanity metric declines (weakest: ${humanity.weakest.label} at ${humanity.weakest.score})` : `${humanity.weakest.label} declines to ${humanity.weakest.score}` },
    { row: 'Environmental Impact', value: String(humanity.scores.find(s => s.id === 'environmental_sustainability').score) },
    { row: 'System Impact', value: `${proposal.scope === 'local' ? 'Local' : 'Global'} blast radius · ${proposal.reversible === false ? 'irreversible' : 'reversible'}` },
    { row: 'Constitutional Compliance', value: invariants.passed ? `All ${invariants.checked} invariants preserved` : `${invariants.violations.length} violation(s)` },
  ];

  const complete = rows.every(r => r.value !== undefined && r.value !== null);

  return {
    proposal,
    rows,
    complete,
    forecast: fc,
    humanity,
    risk,
    invariants,
    civilization: civilizationEvaluation(proposal, fc),
    may_execute: complete && invariants.passed && risk.permitted && humanity.acceptable,
  };
}