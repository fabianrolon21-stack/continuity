import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { RotateCcw, CheckCircle, XCircle, BookOpen } from 'lucide-react';

const META = {
  VERIFIED_DEPLOYED: { icon: CheckCircle, color: 'hsl(120 40% 58%)', label: 'Verified & deployed' },
  REGRESSION_ROLLED_BACK: { icon: RotateCcw, color: 'hsl(42 63% 55%)', label: 'Rolled back automatically' },
  REJECTED_INVARIANT: { icon: XCircle, color: 'hsl(0 70% 50%)', label: 'Rejected — invariant' },
  REJECTED_RISK: { icon: XCircle, color: 'hsl(0 70% 50%)', label: 'Rejected — risk' },
  REJECTED_HUMANITY: { icon: XCircle, color: 'hsl(0 70% 50%)', label: 'Rejected — humanity board' },
  LEARNING_ONLY: { icon: BookOpen, color: 'hsl(199 56% 64%)', label: 'Learning only — production untouched' },
};

export default function DeploymentTimeline({ version }) {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    base44.entities.OptimizationDeployment.list('-created_date', 40).then(r => setRecords(r || [])).catch(() => setRecords([]));
  }, [version]);

  if (!records.length) return <p className="text-xs text-muted-foreground">No optimization runs recorded yet. Verify a proposal to build the timeline.</p>;

  const deployed = records.filter(r => r.outcome === 'VERIFIED_DEPLOYED');
  const accuracy = deployed.length
    ? Math.round(100 - (deployed.reduce((s, r) => s + Math.abs((r.observed_gain ?? 0) - (r.expected_gain ?? 0)), 0) / deployed.length) * 100)
    : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <Stat label="Deployments" value={deployed.length} />
        <Stat label="Rollbacks" value={records.filter(r => r.rolled_back).length} />
        <Stat label="Forecast accuracy" value={accuracy === null ? '—' : `${accuracy}%`} />
        <Stat label="Constitution score" value={`${Math.round(records.reduce((s, r) => s + (r.constitution_score || 0), 0) / records.length)}%`} />
      </div>

      <div className="space-y-1.5">
        {records.map(r => {
          const m = META[r.outcome] || META.LEARNING_ONLY;
          const Icon = m.icon;
          const expanded = open === r.id;
          return (
            <div key={r.id} className="p-2.5 rounded-lg bg-secondary/30">
              <button onClick={() => setOpen(expanded ? null : r.id)} className="w-full flex items-start gap-2 text-left">
                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: m.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] truncate">{r.title}</p>
                  <p className="text-[10px]" style={{ color: m.color }}>{m.label} · risk {r.risk_score} · humanity {r.humanity_score}</p>
                </div>
              </button>
              {expanded && (
                <div className="mt-2 pt-2 border-t border-border/40 space-y-0.5 text-[10px] text-muted-foreground">
                  <p>{r.forecast_summary}</p>
                  {r.rejection_reason && <p className="text-destructive">Rejected: {r.rejection_reason}</p>}
                  {r.root_cause && <p className="text-gold">Root cause: {r.root_cause}</p>}
                  <p className="text-foreground/80 mt-1">Verification trace:</p>
                  {JSON.parse(r.verification_trace || '[]').map((t, i) => (
                    <p key={i} style={{ color: t.pass ? 'hsl(120 40% 58%)' : 'hsl(0 70% 50%)' }}>· {t.stage}: {t.detail}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-sm font-mono text-gold">{value}</p>
    </div>
  );
}