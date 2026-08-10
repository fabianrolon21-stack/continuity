import { NEEDS, NEED_LABELS } from '@/lib/bison/simulation/needs';

export default function AgentInspector({ agent, trace }) {
  if (!agent) return null;
  const beliefs = Object.values(agent.beliefs).sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  const top = [...(trace?.predictions || [])].sort((a, b) => b.expectedValue - a.expectedValue).slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">{agent.name}</p>
        <p className="text-[11px] text-muted-foreground capitalize">{agent.type} · standing {Math.round(agent.standing)} · {agent.resources} resources</p>
        {agent.lastAction && <p className="text-xs text-gold mt-1">Last: {agent.lastAction.summary}</p>}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Needs</p>
        <div className="space-y-1.5">
          {NEEDS.map(n => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-20 shrink-0">{NEED_LABELS[n]}</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-leaf transition-all duration-700" style={{ width: `${agent.needs[n]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {top.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Predicted utility</p>
          <div className="space-y-1">
            {top.map(p => (
              <div key={p.action} className="flex items-center justify-between text-xs">
                <span className={p.action === trace?.choice?.action ? 'text-gold' : 'text-foreground/80'}>{p.action}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  EV {p.expectedValue.toFixed(2)} · risk {p.risk.toFixed(2)} · conf {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {beliefs.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Beliefs</p>
          <div className="space-y-1">
            {beliefs.map(b => (
              <div key={b.subjectId} className="flex items-center justify-between text-xs">
                <span className="text-foreground/80">{b.name}</span>
                <span className="text-[11px] text-muted-foreground">{b.label} · {b.band || 'unknown'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}