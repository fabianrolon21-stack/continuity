import { useEffect, useState } from 'react';
import { synthesize } from '@/lib/bison/observability/synthesisEngine';
import { loadDeployments } from '@/lib/bison/observability/calibration';

const SEV = { high: 'hsl(0 70% 50%)', moderate: 'hsl(42 63% 55%)', low: 'hsl(268 8% 60%)' };

export default function SynthesisReport() {
  const [report, setReport] = useState(null);

  useEffect(() => { loadDeployments().then(d => setReport(synthesize(d))); }, []);

  if (!report) return <p className="text-xs text-muted-foreground">Analyzing architecture…</p>;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Recurring design principles</p>
        {report.principles.map(p => (
          <div key={p.principle} className="py-1 border-b border-border/30">
            <p className="text-[10px] text-leaf">{p.principle}</p>
            <p className="text-[10px] text-muted-foreground">{p.seenIn}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Recommendations ({report.recommendations.length})</p>
        {report.recommendations.map((r, i) => (
          <div key={i} className="p-2 rounded-lg bg-secondary/30 mb-1.5">
            <p className="text-[10px]" style={{ color: SEV[r.severity] }}>{r.type}</p>
            <p className="text-[10px]">{r.finding}</p>
            <p className="text-[10px] text-muted-foreground">→ {r.recommendation}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Long-term architecture review</p>
        {Object.entries(report.review).map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 text-[10px] py-0.5 border-b border-border/30">
            <span className="text-muted-foreground capitalize shrink-0">{k.replace(/_/g, ' ')}</span>
            <span className="text-right">{v}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/70">{report.note}</p>
    </div>
  );
}