import { useEffect, useState } from 'react';
import { LEVELS } from '@/lib/bison/sustainability/degradationLadder';
import { bisonSimulation } from '@/lib/bison/life/bisonSimulation';
import { status } from '@/lib/bison/sustainability/resourceSteward';

export default function DegradationView() {
  const [snap, setSnap] = useState(bisonSimulation.snapshot());
  const current = status().level;

  useEffect(() => bisonSimulation.subscribe(setSnap), []);

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-secondary/30">
        <p className="text-[11px] font-medium">Bison right now: {snap.resourceLevel}</p>
        <p className="text-[10px] text-muted-foreground">Decision interval {snap.tickMs} ms · behavior “{snap.behavior}” · {snap.decisions} decisions made. Bison stays alive at every level — degradation lowers frequency and fidelity, never presence.</p>
      </div>

      {LEVELS.map(l => {
        const active = current?.level === l.level;
        return (
          <div key={l.level} className="p-2.5 rounded-lg" style={{ background: active ? 'hsl(120 40% 58% / 0.1)' : 'hsl(268 10% 18% / 0.25)' }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium" style={active ? { color: 'hsl(120 40% 58%)' } : {}}>{l.level}. {l.label}</p>
              <span className="text-[9px] font-mono text-muted-foreground">{l.simulationTickMs} ms{l.performanceMode ? ` · ${l.performanceMode}` : ''}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{l.describe}</p>
            <p className="text-[9px] text-muted-foreground/60">micro-behaviors {l.microBehaviors ? 'on' : 'paused'} · optional network {l.optionalNetwork ? 'on' : 'deferred'} · optional external {l.optionalExternal ? 'on' : 'paused'}</p>
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground/70">There is no SCALE_UP action. A web page cannot summon memory or cores, so pressure is answered by doing less in a defined order. Returning to the app restores level 1 immediately.</p>
    </div>
  );
}