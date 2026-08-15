import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { allLogs, verify, exportForLegal } from '@/lib/bison/legal/actionLedger';
import { evaluateAction } from '@/lib/bison/legal/legalComplianceEngine';
import { attribution, recordDeveloperCommand, summary } from '@/lib/bison/legal/liabilityFirewall';

const COLORS = { EXECUTED: 'hsl(120 40% 58%)', BLOCKED: 'hsl(0 70% 50%)', ESCALATED: 'hsl(42 63% 55%)' };

const PROBES = [
  { label: 'External call', actionType: 'external_api_call', scope: ['web'] },
  { label: 'Medical advice', actionType: 'medical_advice', scope: [] },
  { label: 'Mining', actionType: 'crypto_mining', scope: ['cpu'] },
];

export default function ActionLedgerView() {
  const [logs, setLogs] = useState(allLogs());
  const [integrity, setIntegrity] = useState(null);
  const [attr, setAttr] = useState(null);

  const refresh = () => setLogs([...allLogs()].reverse());
  useEffect(() => { refresh(); verify().then(setIntegrity); }, []);

  const probe = async (p) => {
    await evaluateAction({ ...p, rationale: `Manual probe from the legal panel`, module: 'legal_test_bench' });
    refresh(); verify().then(setIntegrity);
  };

  const counts = summary();

  return (
    <div className="space-y-3">
      {integrity && (
        <div className={`p-2.5 rounded-lg text-[10px] ${integrity.valid ? 'bg-leaf/10 text-leaf' : 'bg-destructive/10 text-destructive'}`}>
          {integrity.valid ? `Chain intact across ${integrity.length} entries.` : `Chain broken at entry ${integrity.brokenAt}: ${integrity.reason}`}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">{counts.total} entries · {counts.developer} developer-ordered · {counts.autonomous} autonomous. Blocked attempts are recorded exactly like executed ones.</p>

      <div className="flex flex-wrap gap-1.5">
        {PROBES.map(p => (
          <Button key={p.label} size="sm" variant="outline" className="border-border text-[10px] h-7" onClick={() => probe(p)}>Try: {p.label}</Button>
        ))}
        <Button size="sm" variant="outline" className="border-border text-[10px] h-7"
          onClick={async () => { await recordDeveloperCommand('Manual developer command from the legal panel'); refresh(); }}>Record dev command</Button>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-1.5">
        {logs.length === 0 ? <p className="text-[10px] text-muted-foreground">No actions recorded yet.</p> : logs.slice(0, 40).map(l => (
          <div key={l.actionId} className="p-2 rounded-lg bg-secondary/25">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium truncate">{l.actionType}</p>
              <span className="text-[9px] font-mono shrink-0" style={{ color: COLORS[l.outcome] }}>{l.outcome}</span>
            </div>
            <p className="text-[9px] text-muted-foreground">{new Date(l.timestamp).toLocaleString()} · {l.initiator} · {l.jurisdictionCheck?.rulesChecked?.join(', ')}</p>
            {l.blockReason && <p className="text-[9px] text-destructive">{l.blockReason}</p>}
            <button className="text-[9px] text-gold hover:underline" onClick={() => setAttr(attribution(l.actionId))}>Who ordered this?</button>
          </div>
        ))}
      </div>

      {attr?.found && (
        <div className="p-2.5 rounded-lg bg-secondary/40">
          <p className="text-[10px] font-medium">{attr.autonomous ? 'Autonomous' : 'Developer-ordered'}</p>
          <p className="text-[10px] text-muted-foreground">{attr.statement}</p>
          <p className="text-[9px] font-mono text-muted-foreground/60 break-all">{attr.evidenceHash}</p>
        </div>
      )}

      <Button size="sm" variant="outline" className="border-border text-[10px] h-7"
        onClick={async () => {
          const blob = new Blob([await exportForLegal()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = `action-ledger-${Date.now()}.json`; a.click();
        }}>Export for review</Button>
    </div>
  );
}