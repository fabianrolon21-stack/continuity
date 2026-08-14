import { ethicalReview, CONSTITUTIONAL_LIMITS } from '@/lib/bison/policy/ethicsReview';
import { Scale, ShieldBan } from 'lucide-react';

export default function EthicsTradeoffPanel({ sim }) {
  return (
    <div className="space-y-3">
      {sim ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-accent" />
            <p className="text-xs font-medium">Ethical tradeoffs — reported, never decided for you</p>
          </div>
          {ethicalReview(sim).dimensions.map(d => (
            <div key={d.dimension} className="p-2.5 rounded-lg bg-secondary/30">
              <p className="text-[11px] font-medium text-purple-accent">{d.dimension}</p>
              <p className="text-[10px] text-muted-foreground">{d.tradeoff}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Run a simulation to see its ethical review.</p>
      )}
      <div className="p-3 rounded-lg border border-destructive/25 bg-destructive/5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ShieldBan className="w-3.5 h-3.5 text-destructive" />
          <p className="text-xs font-medium text-destructive">Constitutional limits (§16)</p>
        </div>
        <ul className="text-[10px] text-muted-foreground space-y-0.5">
          {CONSTITUTIONAL_LIMITS.map(l => <li key={l}>· {l}</li>)}
        </ul>
      </div>
    </div>
  );
}