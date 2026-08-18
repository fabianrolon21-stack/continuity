import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bisonRuntime } from '@/lib/bison/kernel/bisonRuntime';
import { BISON_FINAL_RULE, RUNTIME_MODES } from '@/lib/bison/kernel/kernelTypes';
import { Boxes, Lock } from 'lucide-react';

const STATUS_STYLE = { RUNNING: 'bg-leaf/15 text-leaf', DISABLED: 'bg-gold/15 text-gold', FAILED: 'bg-destructive/15 text-destructive', REFUSED_CIRCULAR: 'bg-destructive/15 text-destructive', REGISTERED: 'bg-secondary text-muted-foreground' };

export default function KernelPanel({ accent = 'hsl(0 70% 50%)' }) {
  const [snapshot, setSnapshot] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [showRule, setShowRule] = useState(false);

  const refresh = () => setSnapshot(bisonRuntime.snapshot());
  useEffect(() => { bisonRuntime.boot().then(refresh); const timer = setInterval(refresh, 10000); return () => clearInterval(timer); }, []);

  if (!snapshot) return null;

  const runTest = async () => {
    if (!testInput.trim()) return;
    const response = await bisonRuntime.process(testInput.trim());
    setTestResult(response);
    refresh();
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4" style={{ color: accent }} />
          <h3 className="font-heading font-semibold text-sm">Unified Cognitive Runtime — Kernel</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${snapshot.runtime.degraded ? 'bg-gold/15 text-gold' : 'bg-leaf/15 text-leaf'}`}>{snapshot.runtime.mode}{snapshot.runtime.degraded ? ' · degraded' : ''}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RUNTIME_MODES.map(mode => (
          <button key={mode} onClick={() => { bisonRuntime.setMode(mode); refresh(); }} className={`rounded-full px-2.5 py-1 text-[10px] no-tap-highlight ${snapshot.runtime.mode === mode ? 'bg-destructive/20 text-destructive' : 'bg-secondary/50 text-muted-foreground'}`}>{mode}</button>
        ))}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Registered packages (topological order)</p>
        <div className="flex flex-wrap gap-1.5">
          {snapshot.packages.map(pkg => (
            <span key={pkg.id} className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[pkg.status] || 'bg-secondary text-muted-foreground'}`} title={pkg.lastError || pkg.status}>{pkg.id}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Autonomy matrix</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {snapshot.permissions.map(({ capability, allowed, locked }) => (
            <div key={capability} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{capability}</span>
              <span className={`flex items-center gap-1 ${allowed ? 'text-leaf' : 'text-destructive/80'}`}>{allowed ? 'ON' : 'OFF'}{locked && <Lock className="w-2.5 h-2.5" />}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pipeline test</p>
        <div className="flex gap-2">
          <Input value={testInput} onChange={event => setTestInput(event.target.value)} placeholder="I am uncertain about an important decision." className="bg-secondary/40 border-border text-xs h-8" />
          <Button onClick={runTest} variant="outline" className="border-border text-xs h-8">Process</Button>
        </div>
        {testResult && (
          <div className="rounded-lg bg-secondary/30 p-2.5 text-[10px] text-muted-foreground">
            <p>Routes: {testResult.routes.join(', ')} · mode {testResult.mode}{testResult.awaitingUserSelection ? ' · AWAITING_USER_SELECTION' : ''}</p>
            <p className="mt-0.5 text-foreground/80">{testResult.summary}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Recent kernel events</p>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {snapshot.recentEvents.map(event => (
            <p key={event.id} className="text-[10px] text-muted-foreground"><span className="text-foreground/70">{event.type}</span> · {event.source} · {new Date(event.timestamp).toLocaleTimeString()}</p>
          ))}
        </div>
      </div>

      <button onClick={() => setShowRule(!showRule)} className="text-[10px] text-muted-foreground hover:text-foreground no-tap-highlight">{showRule ? 'Hide' : 'Show'} the Final Bison Rule</button>
      {showRule && <p className="whitespace-pre-line text-[10px] leading-relaxed text-muted-foreground">{BISON_FINAL_RULE}</p>}
    </div>
  );
}