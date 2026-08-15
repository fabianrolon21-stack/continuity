import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { tick, status, subscribe, start, stop, restoreNormal, getActionLog, MEASURABLE, NOT_MEASURABLE } from '@/lib/bison/sustainability/resourceSteward';

const ROWS = [
  ['CPU', s => s.cpuPercent, '%'],
  ['GPU', s => s.gpuPercent, '%'],
  ['Memory (JS heap)', s => s.memoryMB, ' MB'],
  ['Storage', s => s.storageGB, ' GB'],
  ['Network', s => s.networkGB, ' GB'],
  ['Cores', s => s.cores, ''],
  ['Frame budget', s => s.frameMs, ' ms'],
  ['Battery', s => s.batteryLevel, '%'],
  ['Local storage', s => s.localStorageKB, ' KB'],
];

export default function ResourceDashboardView() {
  const [state, setState] = useState(status().last);
  const [running, setRunning] = useState(status().running);
  const [log, setLog] = useState(getActionLog());

  useEffect(() => {
    if (!state) tick().then(setState);
    return subscribe(s => { setState(s); setLog([...getActionLog()]); });
  }, [state]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => tick().then(setState)}>Measure now</Button>
        <Button size="sm" variant="outline" className="border-border text-xs"
          onClick={() => { running ? stop() : start(); setRunning(!running); }}
        >{running ? 'Stop steward' : 'Start steward'}</Button>
        <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => { restoreNormal('manual'); setLog([...getActionLog()]); }}>Restore normal</Button>
      </div>

      {state && (
        <>
          <div className="p-2.5 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium">Mode: {state.level.label} (level {state.level.level})</p>
              <p className="text-[10px] font-mono text-gold">strain {state.strain.score}%</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{state.level.describe}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Usage</p>
            {ROWS.map(([label, get, unit]) => {
              const v = get(state.snapshot);
              return (
                <div key={label} className="flex items-center justify-between text-[10px] py-0.5 border-b border-border/30">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono" style={v === null ? { color: 'hsl(268 8% 50%)' } : {}}>{v === null ? 'not obtainable' : `${v}${unit}`}</span>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">External cost this period</span>
              <span className="font-mono">${state.cost.estimatedPeriodCostUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-mono">{state.cost.budget.approvalStatus === 'UNCONFIGURED' ? 'not configured' : `$${state.cost.budget.monthlyComputeAllowanceUSD}/mo ceiling`}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{state.cost.note}</p>
          </div>
        </>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Autonomous actions ({log.length})</p>
        {log.length === 0 ? <p className="text-[10px] text-muted-foreground">None yet. Only reversible, non-financial local actions are ever applied without asking.</p> : log.slice(0, 8).map(a => (
          <div key={a.actionId} className="text-[10px] py-0.5 border-b border-border/30">
            <span className="font-mono text-gold">{a.type}</span>
            <span className="text-muted-foreground"> — {a.justification}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Available signals</p>
        {MEASURABLE.map(m => <p key={m} className="text-[10px] text-leaf">· {m}</p>)}
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1.5 mb-1">Not obtainable in a browser</p>
        {NOT_MEASURABLE.map(m => <p key={m} className="text-[10px] text-gold">· {m}</p>)}
      </div>
    </div>
  );
}