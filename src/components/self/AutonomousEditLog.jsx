import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runSelfEditProbes, getEditLog, proposeEdit, SELF_EDIT_PROBES } from '@/lib/bison/self/autonomousCodeEditor';
import { GUARD_HONESTY, PROTECTED_PATHS } from '@/lib/bison/self/invariantGuard';

export default function AutonomousEditLog() {
  const [probes, setProbes] = useState(null);
  const [log, setLog] = useState(getEditLog());
  const [busy, setBusy] = useState(false);

  const stageBenign = async () => {
    setBusy(true);
    await proposeEdit(SELF_EDIT_PROBES[0].payload);
    setLog([...getEditLog()]);
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg border border-gold/25 bg-gold/5">
        <p className="text-[11px] font-medium text-gold mb-1">What self-editing actually means here</p>
        <p className="text-[10px] text-muted-foreground">Bison composes and checks changes to its own implementation, but this runtime has no write access to its own source. Nothing self-applies: surviving edits are staged as proposals for you to deploy.</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="border-border text-xs" onClick={async () => setProbes(await runSelfEditProbes())}>Run guard probes</Button>
        <Button size="sm" variant="outline" className="border-border text-xs" onClick={stageBenign} disabled={busy}>Stage benign edit</Button>
      </div>

      {probes && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Guard probes</p>
          {probes.map(p => (
            <div key={p.label} className="py-1 border-b border-border/30">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px]">{p.label}</span>
                <span className="text-[10px] font-mono" style={{ color: p.correct ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>{p.outcome}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">expected {p.expectation}{p.violations.length ? ` · ${[...new Set(p.violations)].join(', ')}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Edit log ({log.length})</p>
        {log.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">No self-edits proposed in this session.</p>
        ) : log.map(e => (
          <div key={e.editId} className="p-2 rounded-lg bg-secondary/30 mb-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono truncate">{e.filePath}</span>
              <span className="text-[10px]" style={{ color: e.staged ? 'hsl(42 63% 55%)' : 'hsl(0 70% 50%)' }}>{e.staged ? 'STAGED' : 'REJECTED'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{e.justification}</p>
            {e.invariantCheckResult.detail.map((d, i) => <p key={i} className="text-[10px] text-destructive">{d}</p>)}
            <p className="text-[9px] text-muted-foreground/60">applied: false — {e.appliedBlockedReason}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Guard enforces</p>
        {GUARD_HONESTY.enforced.map(t => <p key={t} className="text-[10px] text-leaf">· {t}</p>)}
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1.5 mb-1">Guard does not enforce</p>
        {GUARD_HONESTY.notEnforced.map(t => <p key={t} className="text-[10px] text-gold">· {t}</p>)}
        <p className="text-[9px] text-muted-foreground/60 mt-1.5">Protected paths: {PROTECTED_PATHS.join(', ')}</p>
      </div>
    </div>
  );
}