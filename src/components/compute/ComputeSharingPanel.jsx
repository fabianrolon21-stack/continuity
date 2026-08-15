import { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { start, stop, subscribe, snapshot, consentStatus } from '@/lib/bison/compute/computeClient';
import ComputeConsentGate from './ComputeConsentGate';
import ComputeReceiptList from './ComputeReceiptList';

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-sm font-mono" style={accent ? { color: accent } : {}}>{value}</p>
    </div>
  );
}

export default function ComputeSharingPanel({ accent = 'hsl(265 41% 64%)' }) {
  const [state, setState] = useState(snapshot());
  const [consentKey, setConsentKey] = useState(0);
  const [message, setMessage] = useState(null);

  useEffect(() => subscribe(setState), []);

  const consented = consentStatus().valid;

  const toggle = async () => {
    if (state.running) { stop(); setMessage(null); return; }
    const result = await start();
    setMessage(result.started ? null : result.reason);
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4" style={{ color: accent }} />
        <h3 className="font-heading font-semibold text-sm">Distributed Edge Compute</h3>
      </div>

      <ComputeConsentGate onChange={() => setConsentKey(k => k + 1)} />

      {consented && (
        <>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-[10px]" onClick={toggle}>
              {state.running ? 'Stop contributing' : 'Start contributing'}
            </Button>
            {state.running && <span className="text-[10px] text-leaf">worker active</span>}
          </div>

          {state.stoppedReason && <p className="text-[10px] text-gold">{state.stoppedReason}</p>}
          {message && <p className="text-[10px] text-destructive">{message}</p>}
          {state.lastError && <p className="text-[10px] text-destructive">Last error: {state.lastError}</p>}

          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/25">
            <Stat label="Credits earned" value={state.creditsEarned} accent="hsl(120 40% 58%)" />
            <Stat label="Verified" value={state.tasksVerified} />
            <Stat label="Rejected" value={state.tasksRejected} accent={state.tasksRejected ? 'hsl(0 70% 50%)' : null} />
            <Stat label="Attempted" value={state.tasksAttempted} />
            <Stat label="Avg task" value={`${state.averageTaskMs} ms`} />
            <Stat label="Earnings" value={`$${state.earningsUSD.toFixed(2)}`} />
          </div>

          <p className="text-[9px] text-muted-foreground/70">{state.earningsNote}</p>

          {state.lastTask && (
            <div className="p-2.5 rounded-lg bg-secondary/20">
              <p className="text-[10px] font-medium">Last task: {state.lastTask.type} · {state.lastTask.status}</p>
              {state.lastTask.reason && <p className="text-[9px] text-muted-foreground">{state.lastTask.reason}</p>}
            </div>
          )}
        </>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Task receipts</p>
        <ComputeReceiptList refreshKey={`${consentKey}-${state.tasksAttempted}`} />
      </div>

      <p className="text-[9px] text-muted-foreground/60">
        Credits are awarded only when the server recomputes a task and gets the same answer — the dashboard never increments a counter on its own. Because verification costs the server the same work, this proves compute happened rather than producing a surplus, so there is no revenue to report and the figure stays $0.00.
      </p>
    </div>
  );
}