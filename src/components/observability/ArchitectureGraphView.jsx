import { NODES, TRUST_BOUNDARIES, analyzeInteractions } from '@/lib/bison/observability/architecturalGraph';

const SEV = { high: 'hsl(0 70% 50%)', moderate: 'hsl(42 63% 55%)', low: 'hsl(268 8% 60%)' };

export default function ArchitectureGraphView() {
  const analysis = analyzeInteractions();

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">{analysis.nodeCount} nodes · {analysis.edgeCount} dependencies · graph derived from declared package metadata, so it updates as packages evolve.</p>

      {TRUST_BOUNDARIES.map(b => {
        const nodes = NODES.filter(n => n.boundary === b.id);
        if (!nodes.length) return null;
        return (
          <div key={b.id} className="p-2.5 rounded-lg border border-border/60 bg-secondary/20">
            <p className="text-[11px] font-medium">{b.label}</p>
            <p className="text-[10px] text-muted-foreground mb-1.5">{b.note}</p>
            <div className="space-y-1">
              {nodes.map(n => (
                <div key={n.id} className="text-[10px]">
                  <span className="text-foreground">{n.label}</span>
                  <span className="text-muted-foreground/70"> · {n.kind} · pkg {n.packages.join(', ')}</span>
                  {n.depends.length > 0 && (
                    <span className="text-muted-foreground"> → {n.depends.map(d => NODES.find(x => x.id === d)?.label || d).join(', ')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Package interaction analysis</p>
        {analysis.clean ? (
          <p className="text-[10px] text-leaf">No circular dependencies, unexpected coupling, contention, or unreachable functionality detected.</p>
        ) : analysis.findings.map((f, i) => (
          <div key={i} className="py-1 border-b border-border/30">
            <p className="text-[10px]" style={{ color: SEV[f.severity] }}>{f.type}</p>
            <p className="text-[10px] text-muted-foreground">{f.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}