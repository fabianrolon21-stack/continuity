import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadIncidents, frozenModules, unfreeze } from '@/lib/bison/legal/legalComplianceEngine';

export default function IncidentReportView() {
  const [incidents, setIncidents] = useState(loadIncidents());
  const [frozen, setFrozen] = useState(frozenModules());

  return (
    <div className="space-y-3">
      {frozen.length > 0 && (
        <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10">
          <p className="text-[11px] font-medium text-destructive">Frozen: {frozen.join(', ')}</p>
          <p className="text-[10px] text-muted-foreground">Further attempts from these modules are refused and recorded until you clear the freeze.</p>
          <Button size="sm" variant="outline" className="h-6 text-[9px] border-border mt-1"
            onClick={() => { frozen.forEach(unfreeze); setFrozen(frozenModules()); }}>Clear freeze</Button>
        </div>
      )}

      {incidents.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No incidents. A blocked action raises one here, freezes the module that tried, and posts a high-severity flag to the FRROLON channel.</p>
      ) : incidents.map(i => (
        <div key={i.incidentId} className="p-2.5 rounded-lg bg-secondary/25 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-destructive truncate">{i.potentialViolation}</p>
            <span className="text-[9px] font-mono text-muted-foreground shrink-0">{new Date(i.timestamp).toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{i.recommendedResponse}</p>
          <p className="text-[9px] font-mono text-muted-foreground/60 break-all">froze {i.frozenModules.join(', ')} · evidence {i.evidenceHashes?.[0]?.slice(0, 20)}…</p>
        </div>
      ))}

      <Button size="sm" variant="outline" className="border-border text-[10px] h-7" onClick={() => { setIncidents(loadIncidents()); setFrozen(frozenModules()); }}>Refresh</Button>
    </div>
  );
}