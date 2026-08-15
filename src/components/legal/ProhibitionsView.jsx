import { ABSOLUTE_PROHIBITIONS } from '@/lib/bison/legal/prohibitions';
import { FINANCIAL_POSTURE } from '@/lib/bison/legal/financialGuard';

export default function ProhibitionsView() {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Checked before jurisdiction and before consent, so nothing can precede them. Consent does not unlock these — in most of them the user's permission is not the thing at stake.</p>

      {ABSOLUTE_PROHIBITIONS.map(p => (
        <div key={p.id} className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{p.label}</p>
            <span className="text-[9px] font-mono text-destructive shrink-0">BLOCKED</span>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground/60">{p.id}</p>
          <p className="text-[10px] text-muted-foreground">{p.note}</p>
        </div>
      ))}

      <div className="p-2.5 rounded-lg bg-secondary/25">
        <p className="text-[11px] font-medium mb-1">Financial posture</p>
        <p className="text-[10px] text-muted-foreground">Autonomous spending: off · daily ceiling ${FINANCIAL_POSTURE.maxDailySpendUSD} · wallet: none · mining: off</p>
        <p className="text-[9px] text-muted-foreground/70 mt-1">{FINANCIAL_POSTURE.note}</p>
        <p className="text-[9px] text-muted-foreground/70 mt-1">{FINANCIAL_POSTURE.taxReminder}</p>
      </div>
    </div>
  );
}