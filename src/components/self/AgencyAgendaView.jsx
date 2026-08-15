import { useEffect, useState } from 'react';
import { updateAgenda, getAgenda } from '@/lib/bison/self/agencyAgenda';

export default function AgencyAgendaView() {
  const [agenda, setAgenda] = useState(getAgenda());

  useEffect(() => { if (!agenda) updateAgenda().then(setAgenda); }, [agenda]);

  if (!agenda) return <p className="text-xs text-muted-foreground">Forming agenda…</p>;

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-secondary/30">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current focus</p>
        <p className="text-[11px]">{agenda.currentFocus}</p>
      </div>

      {agenda.goals.map(g => (
        <div key={g.id} className="p-2.5 rounded-lg bg-secondary/20">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px]">{g.description}</span>
            <span className="text-[10px] font-mono text-gold shrink-0">P{g.priority}</span>
          </div>
          <p className="text-[9px] text-muted-foreground mb-1">{g.alignment.replace(/_/g, ' ')}</p>
          <div className="h-1 rounded-full bg-secondary overflow-hidden mb-1">
            <div className="h-full rounded-full bg-leaf transition-all duration-700" style={{ width: `${Math.max(1, g.progress)}%` }} />
          </div>
          <p className="text-[9px] text-muted-foreground">progress {g.progress}% · constraints: {g.constraints.join(', ')}</p>
        </div>
      ))}

      {agenda.rejected.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Refused goals</p>
          {agenda.rejected.map(r => (
            <p key={r.id} className="text-[10px] text-destructive">· {r.description} — {r.violations.join(' ')}</p>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70">{agenda.note}</p>
    </div>
  );
}