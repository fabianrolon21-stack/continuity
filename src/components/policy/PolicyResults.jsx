import { useState } from 'react';
import { EVIDENCE } from '@/lib/bison/policy/evidenceBase';
import { ChevronDown, AlertTriangle } from 'lucide-react';

const CONF_COLOR = { MEDIUM: 'hsl(120 40% 58%)', 'LOW-MEDIUM': 'hsl(42 63% 55%)', LOW: 'hsl(21 73% 69%)' };

export default function PolicyResults({ sim }) {
  const [open, setOpen] = useState(null);
  if (!sim) return null;

  return (
    <div className="space-y-2">
      {sim.results.map(r => {
        const good = r.lowerIsBetter ? r.expected < 0 : r.expected > 0;
        const expanded = open === r.id;
        return (
          <div key={r.id} className="p-3 rounded-lg bg-secondary/30">
            <button onClick={() => setOpen(expanded ? null : r.id)} className="w-full flex items-center justify-between gap-2 text-left">
              <span className="text-xs font-medium">{r.label}{r.disputedEvidence && <AlertTriangle className="w-3 h-3 inline ml-1 text-gold" />}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono" style={{ color: good ? 'hsl(120 40% 58%)' : 'hsl(21 73% 69%)' }}>
                  {r.expected > 0 ? '+' : ''}{r.expected}{r.unit === '%' ? '%' : ''}
                </span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              CI [{r.interval[0]}, {r.interval[1]}] · confidence <span style={{ color: CONF_COLOR[r.confidence] }}>{r.confidence}</span>
              {r.disputedEvidence && ' · rests partly on disputed evidence'}
            </p>
            {expanded && (
              <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground space-y-1">
                <p className="font-medium text-foreground/80">Why this result — most influential assumptions:</p>
                {r.drivers.map(d => (
                  <p key={d.assumption}>· Raising "{d.assumption.replace(/_/g, ' ')}" {d.direction} this metric (impact {d.impact.toFixed(1)})</p>
                ))}
                <p className="font-medium text-foreground/80 mt-1.5">Supporting evidence:</p>
                {r.evidence.length ? r.evidence.map(id => {
                  const e = EVIDENCE.find(x => x.id === id);
                  return <p key={id}>· {e.claim} <span className="opacity-60">({e.jurisdiction}, quality {e.quality}{e.disputed ? ', disputed' : ''}{e.generalized ? ', generalized from analogous substances' : ''})</span></p>;
                }) : <p>· No direct evidence in the base — model extrapolation only. Treat with low confidence.</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}