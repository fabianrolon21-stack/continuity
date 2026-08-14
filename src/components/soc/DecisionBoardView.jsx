import { decisionBoard } from '@/lib/bison/soc/decisionBoard';

export default function DecisionBoardView({ proposal }) {
  if (!proposal) return <p className="text-xs text-muted-foreground">Select a proposal to construct its decision board.</p>;
  const b = decisionBoard(proposal);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {b.rows.map(r => (
          <div key={r.row} className="flex items-start justify-between gap-3 py-1 border-b border-border/30">
            <span className="text-[11px] text-muted-foreground shrink-0">{r.row}</span>
            <span className="text-[11px] text-right">{r.value}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Humanity logic board — no metric dominates</p>
        <div className="grid grid-cols-1 gap-1">
          {b.humanity.scores.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="text-[10px] w-40 shrink-0 text-muted-foreground">{s.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.abs(s.score) * 100}%`, background: s.score < 0 ? 'hsl(0 70% 50%)' : 'hsl(120 40% 58%)' }} />
              </div>
              <span className="text-[10px] font-mono w-8 text-right">{s.score}</span>
            </div>
          ))}
        </div>
        {b.humanity.tradeoffs.map(t => <p key={t} className="text-[10px] text-gold mt-1">· {t}</p>)}
        <p className="text-[10px] text-muted-foreground/70 mt-1">{b.humanity.note}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Multi-horizon forecast</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="text-muted-foreground text-left"><th className="py-1">Horizon</th><th>Benefit</th><th>Risk</th><th>Uncert.</th><th>Confidence</th><th>Divergence</th></tr></thead>
            <tbody>
              {b.forecast.horizons.map(h => (
                <tr key={h.id} className="border-t border-border/30">
                  <td className="py-1 text-muted-foreground">{h.label}</td>
                  <td className="font-mono">{h.benefit}</td>
                  <td className="font-mono">{h.risk}</td>
                  <td className="font-mono">±{h.uncertainty}</td>
                  <td>{h.confidence}</td>
                  <td className="font-mono">{h.branch_divergence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Most sensitive input: <span className="text-gold">{b.forecast.sensitivity[0].input}</span> · data quality {b.forecast.data_quality} · model agreement {b.forecast.model_agreement}</p>
        <p className="text-[10px] text-muted-foreground/70">{b.forecast.disclaimer}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Long-term civilization evaluation</p>
        {b.civilization.map(c => (
          <div key={c.stage} className="flex items-center justify-between text-[10px] py-0.5">
            <span className="text-muted-foreground">{c.stage}</span>
            <span className="font-mono">{c.value === null ? c.note : c.value}</span>
          </div>
        ))}
      </div>

      <div className={`p-2.5 rounded-lg text-[11px] ${b.may_execute ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
        {b.may_execute ? 'Decision board complete — this action may proceed to the verification pipeline.' : `Action blocked at the board: ${b.risk.reason || b.invariants.violations[0]?.reason || 'a humanity metric declines.'}`}
      </div>
    </div>
  );
}