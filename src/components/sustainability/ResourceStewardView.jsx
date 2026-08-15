import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { runStewardCycle, stewardStatus, subscribeSteward, startSteward, stopSteward, MEASURABLE, NOT_MEASURABLE } from '@/lib/bison/sustainability/resourceSteward';
import { watchdogStatus } from '@/lib/bison/sustainability/continuityWatchdog';

export default function ResourceStewardView() {
  const [state, setState] = useState(stewardStatus().last);
  const [running, setRunning] = useState(stewardStatus().running);
  const wd = watchdogStatus();

  useEffect(() => {
    if (!state) runStewardCycle().then(setState);
    return subscribeSteward(setState);
  }, [state]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => runStewardCycle().then(setState)}>Measure now</Button>
        <Button size="sm" variant="outline" className="border-border text-xs"
          onClick={() => { running ? stopSteward() : startSteward(); setRunning(!running); }}
        >{running ? 'Stop steward' : 'Start steward'}</Button>
      </div>

      {state && (
        <>
          <div className="p-2.5 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium">Mode: {state.strain.mode}</p>
              <p className="text-[10px] font-mono text-gold">strain {state.strain.score}%</p>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">from {state.strain.signals.length} measured signal(s): {state.strain.signals.map(s => `${s.name} ${Math.round(s.strain * 100)}%`).join(', ') || 'none available'}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Measured</p>
            {Object.entries(state.snapshot).filter(([k]) => k !== 'measuredAt').map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[10px] py-0.5 border-b border-border/30">
                <span className="text-muted-foreground">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                <span className="font-mono">{v === null ? 'unavailable' : String(v)}</span>
              </div>
            ))}
          </div>

          <div className="p-2 rounded-lg bg-secondary/20">
            <p className="text-[10px] text-muted-foreground">{state.cost.note}</p>
            <p className="text-[9px] text-muted-foreground/70 mt-1">Local footprint: {state.cost.localFootprint}</p>
          </div>
        </>
      )}

      <div className="p-2.5 rounded-lg bg-secondary/20">
        <p className="text-[11px] font-medium mb-1">Continuity watchdog</p>
        {wd.startupReport ? (
          <p className="text-[10px] text-muted-foreground">{wd.startupReport.firstRun ? 'First run on this device — no prior session to compare.' : wd.startupReport.detail}</p>
        ) : <p className="text-[10px] text-muted-foreground">Not started.</p>}
        {wd.cannotDo.map(c => <p key={c} className="text-[10px] text-gold">· cannot: {c}</p>)}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Available signals</p>
        {MEASURABLE.map(m => <p key={m} className="text-[10px] text-leaf">· {m}</p>)}
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1.5 mb-1">Not obtainable here</p>
        {NOT_MEASURABLE.map(m => <p key={m} className="text-[10px] text-gold">· {m}</p>)}
      </div>
    </div>
  );
}