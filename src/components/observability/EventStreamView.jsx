import { useEffect, useState } from 'react';
import { listEvents, subscribe, subsystemsSeen, clearEvents } from '@/lib/bison/observability/observabilityBus';
import { Button } from '@/components/ui/button';

const OUTCOME_COLOR = (o) => o === 'OK' ? 'hsl(120 40% 58%)' : o === 'FAILED' ? 'hsl(0 70% 50%)' : 'hsl(42 63% 55%)';

export default function EventStreamView() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState(null);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const events = listEvents(filter ? { subsystem: filter } : {});
  const subsystems = subsystemsSeen();

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">In-memory and local-first. User content is structurally withheld from this stream, never merely omitted by convention.</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={() => setFilter(null)} className={`text-[10px] px-2 py-1 rounded-full border ${!filter ? 'border-gold text-gold' : 'border-border text-muted-foreground'}`}>All</button>
        {subsystems.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`text-[10px] px-2 py-1 rounded-full border ${filter === s ? 'border-gold text-gold' : 'border-border text-muted-foreground'}`}>{s}</button>
        ))}
        {events.length > 0 && <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={() => { clearEvents(); setTick(t => t + 1); }}>Clear</Button>}
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground">No events in this window. Run a verification pipeline or a traced operation to populate the stream.</p>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {events.map(e => (
            <div key={e.id} className="p-2 rounded-lg bg-secondary/30 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono">{e.subsystem} · {e.event_type}</span>
                <span style={{ color: OUTCOME_COLOR(e.outcome) }}>{e.outcome}</span>
              </div>
              <p className="text-muted-foreground">
                {new Date(e.timestamp).toLocaleTimeString()}
                {e.duration_ms !== null && ` · ${e.duration_ms}ms`}
                {e.confidence && ` · confidence ${e.confidence}`}
                {` · constitution ${e.constitutional_status}`}
              </p>
              {Object.keys(e.meta || {}).length > 0 && (
                <p className="text-muted-foreground/70">{Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(' · ')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}