import { useState } from 'react';
import { listDecisions, explain } from '@/lib/bison/observability/decisionReplay';

export default function ReplayInspector() {
  const records = listDecisions();
  const [openId, setOpenId] = useState(records[0]?.id || null);

  if (!records.length) {
    return <p className="text-xs text-muted-foreground">No autonomous decisions recorded yet. Run a verification pipeline in the Security Operations panel and its full reasoning will be replayable here.</p>;
  }

  const record = records.find(r => r.id === openId) || records[0];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {records.map(r => (
          <button key={r.id} onClick={() => setOpenId(r.id)} className={`text-[10px] px-2.5 py-1.5 rounded-lg border whitespace-nowrap ${r.id === record.id ? 'border-gold text-gold' : 'border-border text-muted-foreground'}`}>
            {new Date(r.timestamp).toLocaleTimeString()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium">{record.title}</p>

        <Block label="Inputs" rows={Object.entries(record.inputs).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)} />
        <Block label="Constraints" rows={[`risk ceilings: overall ${record.constraints.risk_ceilings.overall}, dimension ${record.constraints.risk_ceilings.dimension}`, `invariants checked: ${record.constraints.invariants_checked}`, `humanity floor: ${record.constraints.humanity_floor}`]} />
        <Block label="Assumptions / evidence" rows={record.assumptions} />
        <Block label="Forecasts" rows={record.forecasts.map(f => `${f.horizon}: benefit ${f.benefit}, risk ${f.risk}, ±${f.uncertainty}`)} />
        <Block label="Chosen branch" rows={[record.chosen_branch.replace(/_/g, ' ')]} />
        <Block label="Rejected branches" rows={record.rejected_branches.length ? record.rejected_branches.map(b => `${b.branch} — ${b.reason}`) : ['None — every stage passed on the chosen path.']} />
        <Block label="Risk analysis" rows={[`overall ${record.risk_analysis.overall}`, `worst: ${record.risk_analysis.worst}`]} />
        <Block label="Constitutional rules" rows={[
          `evaluated: ${record.constitutional.rules_evaluated.join(', ')}`,
          `passed: ${record.constitutional.rules_passed.join(', ') || 'none'}`,
          `failed: ${record.constitutional.rules_failed.join(', ') || 'none'}`,
          `confidence: ${record.constitutional.confidence}`,
        ]} />

        <div className="p-2.5 rounded-lg bg-secondary/30">
          <p className="text-[11px] font-medium mb-1">Explainability</p>
          {explain(record).map(e => (
            <div key={e.question} className="mb-1">
              <p className="text-[10px] text-gold">{e.question}</p>
              <p className="text-[10px] text-muted-foreground">{e.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Block({ label, rows }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {rows.map((r, i) => <p key={i} className="text-[10px]">· {r}</p>)}
    </div>
  );
}