import { riskMatrix } from '@/lib/bison/soc/riskMatrix';

const COLOR = { LOW: 'hsl(120 40% 58%)', MODERATE: 'hsl(42 63% 55%)', HIGH: 'hsl(0 70% 50%)' };

export default function RiskMatrixView({ proposal }) {
  if (!proposal) return <p className="text-xs text-muted-foreground">Select a proposal to see its risk matrix.</p>;
  const m = riskMatrix(proposal);

  return (
    <div className="space-y-2">
      {m.rows.map(r => (
        <div key={r.id} className="flex items-center gap-2">
          <span className="text-[10px] w-32 shrink-0 text-muted-foreground">{r.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${r.score * 100}%`, background: COLOR[r.level] }} />
          </div>
          <span className="text-[10px] font-mono w-8 text-right" style={{ color: COLOR[r.level] }}>{r.score}</span>
        </div>
      ))}
      <div className={`p-2.5 rounded-lg text-[11px] ${m.permitted ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
        Overall {m.overall} (ceiling {m.ceilings.overall}) · worst {m.worst.label} {m.worst.score} (ceiling {m.ceilings.dimension})
        <br />{m.permitted ? 'Deployment permitted by the risk matrix.' : m.reason}
      </div>
    </div>
  );
}