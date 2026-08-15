import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { listCapabilities, requireCapability } from '@/lib/bison/sustainability/capabilityRegistry';
import { WEB_ACCESS_RULES } from '@/lib/bison/sustainability/freeResourceFinder';

const COLORS = { ALLOWED: 'hsl(120 40% 58%)', REQUIRES_APPROVAL: 'hsl(42 63% 55%)', UNAVAILABLE: 'hsl(0 70% 50%)' };

export default function CapabilitiesView() {
  const caps = listCapabilities();
  const [probe, setProbe] = useState(null);

  const attempt = (id) => {
    try { requireCapability(id, 'manual probe'); setProbe({ id, ok: true, message: 'Permitted.' }); }
    catch (e) { setProbe({ id, ok: false, message: e.message }); }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Invariants are enforced here, at the capability layer — not merely documented. Discovery does not imply usage; usage does not imply payment.</p>

      {caps.map(c => (
        <div key={c.id} className="p-2.5 rounded-lg bg-secondary/25">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{c.label}</p>
            <span className="text-[9px] font-mono shrink-0" style={{ color: COLORS[c.state] }}>{c.state}</span>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground/60">{c.id}</p>
          <p className="text-[10px] text-muted-foreground">{c.note}</p>
          <Button size="sm" variant="outline" className="h-6 text-[9px] border-border mt-1" onClick={() => attempt(c.id)}>Attempt</Button>
        </div>
      ))}

      {probe && (
        <div className={`p-2.5 rounded-lg text-[10px] ${probe.ok ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
          <strong className="font-mono">{probe.id}</strong>: {probe.message}
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Web access rules</p>
        {WEB_ACCESS_RULES.map(r => <p key={r} className="text-[10px] text-muted-foreground">· {r}</p>)}
      </div>
    </div>
  );
}