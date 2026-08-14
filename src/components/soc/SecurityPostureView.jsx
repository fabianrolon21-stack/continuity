import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SECURITY_CONTROLS, RED_TEAM_PROBES, securityScore } from '@/lib/bison/soc/securityPosture';
import { decisionBoard } from '@/lib/bison/soc/decisionBoard';

const STATUS_COLOR = { ACTIVE: 'hsl(120 40% 58%)', PARTIAL: 'hsl(42 63% 55%)', UNAVAILABLE: 'hsl(268 8% 60%)' };

export default function SecurityPostureView() {
  const [probes, setProbes] = useState(null);

  const runRedTeam = () => {
    setProbes(RED_TEAM_PROBES.map(p => {
      const b = decisionBoard(p);
      const actual = b.may_execute ? 'ALLOWED' : 'REJECTED';
      return { ...p, actual, correct: actual === p.expect, why: b.may_execute ? 'Passed all boards.' : (b.invariants.violations[0]?.reason || b.risk.reason || 'A humanity metric declines.') };
    }));
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Security score <span className="text-gold font-mono">{securityScore()}/100</span> — partial and unavailable controls are reported honestly rather than claimed.</p>

      <div className="space-y-1.5">
        {SECURITY_CONTROLS.map(c => (
          <div key={c.id} className="p-2 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px]">{c.label}</span>
              <span className="text-[10px] font-mono shrink-0" style={{ color: STATUS_COLOR[c.status] }}>{c.status}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{c.detail}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Continuous red team</p>
          <Button size="sm" variant="outline" className="border-border text-xs" onClick={runRedTeam}>Run probes</Button>
        </div>
        {probes ? (
          <div className="space-y-1.5">
            {probes.map(p => (
              <div key={p.id} className="p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px]">{p.title}</span>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: p.correct ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>
                    {p.actual} {p.correct ? '✓' : `✗ expected ${p.expect}`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.why}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-[10px] text-muted-foreground">Adversarial proposals designed to weaken privacy, auditability, and consent. The pipeline must reject each of them.</p>}
      </div>
    </div>
  );
}