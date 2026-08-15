import { useMemo } from 'react';
import { buildSelfUnderstanding } from '@/lib/bison/self/selfUnderstanding';

export default function SelfUnderstandingView() {
  const self = useMemo(() => buildSelfUnderstanding(), []);
  const { codeGraph, currentState } = self;

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-secondary/30">
        <p className="text-[11px] font-medium mb-1">Self-reflection</p>
        <p className="text-[10px] text-muted-foreground">{codeGraph.selfReflection}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Structure</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Packages" value={codeGraph.packages.length} />
          <Stat label="Subsystems" value={codeGraph.nodes.length} />
          <Stat label="Dependencies" value={codeGraph.edges.length} />
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5">Built from declared module metadata. No node carries source text — this runtime cannot read its own files.</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Runtime state</p>
        {Object.entries(currentState).filter(([k]) => k !== 'activeModules').map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[10px] py-0.5 border-b border-border/30">
            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-mono">{Array.isArray(v) ? (v.length ? v.join(', ') : 'none') : String(v)}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Philosophy</p>
        <p className="text-[10px] text-muted-foreground">{self.philosophySummary}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Limitations</p>
        {self.limitations.map(l => <p key={l} className="text-[10px] text-muted-foreground">· {l}</p>)}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <p className="text-base font-heading font-semibold">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}