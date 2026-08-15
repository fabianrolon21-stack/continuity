import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listApprovals, decideApproval, revokeApproval, requestApproval, getBudget, setBudget } from '@/lib/bison/sustainability/resourceApprovals';

const COLORS = { APPROVED: 'hsl(120 40% 58%)', PENDING: 'hsl(42 63% 55%)', DECLINED: 'hsl(0 70% 50%)', REVOKED: 'hsl(0 70% 50%)', EXPIRED: 'hsl(268 8% 60%)' };

export default function ApprovalsView() {
  const [approvals, setApprovals] = useState([]);
  const [budget, setBudgetState] = useState(null);

  const refresh = () => { listApprovals().then(setApprovals); getBudget().then(setBudgetState); };
  useEffect(refresh, []);

  const demo = async () => {
    await requestApproval({
      category: 'api', serviceName: 'Example external API', capability: 'resource.external.paid',
      maximumCostUSD: 5, justification: 'Faster web lookups than the built-in path.',
      alternative: 'Continue in reduced-resource mode at no additional cost.',
    });
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg border border-leaf/25 bg-leaf/5">
        <p className="text-[10px] text-muted-foreground">Approvals are scoped, time-limited, and revocable — a boolean cannot say approved for what, how much, until when, or for which service. Expiry is checked at use time, so an approval lapses on its own. Nothing here charges anything: this app has no payment, subscription, or card code at all.</p>
      </div>

      {budget && (
        <div className="p-2.5 rounded-lg bg-secondary/25">
          <p className="text-[11px] font-medium mb-1">Budget ceiling</p>
          <div className="flex gap-1.5 items-center">
            <Input type="number" value={budget.monthlyComputeAllowanceUSD}
              onChange={async e => setBudgetState(await setBudget({ monthlyComputeAllowanceUSD: Number(e.target.value) }))}
              className="h-7 text-[11px] bg-secondary/40 border-border" />
            <span className="text-[10px] text-muted-foreground">USD/mo</span>
          </div>
          <p className="text-[9px] text-muted-foreground/70 mt-1">Status: {budget.approvalStatus}. A ceiling is not an authorization — spending still needs an approval record below.</p>
        </div>
      )}

      <Button size="sm" variant="outline" className="border-border text-xs" onClick={demo}>Simulate a paid-service request</Button>

      {approvals.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No approvals. Bison is running entirely on authorized local resources.</p>
      ) : approvals.map(a => (
        <div key={a.id} className="p-2.5 rounded-lg bg-secondary/25 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium">{a.service_name || a.category}</p>
            <span className="text-[10px] font-mono" style={{ color: COLORS[a.effectiveStatus] || 'inherit' }}>{a.effectiveStatus}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{a.justification}</p>
          <p className="text-[9px] text-muted-foreground/70">ceiling ${a.maximum_cost_usd}/{a.billing_period === 'monthly' ? 'mo' : 'once'} · {a.category} · expires {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—'}</p>
          {a.alternative_offered && <p className="text-[9px] text-leaf">alternative: {a.alternative_offered}</p>}
          <div className="flex gap-1.5 pt-0.5">
            {a.status === 'PENDING' && <>
              <Button size="sm" className="h-6 text-[10px]" onClick={async () => { await decideApproval(a.id, true); refresh(); }}>Approve ${a.maximum_cost_usd}/mo</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] border-border" onClick={async () => { await decideApproval(a.id, false); refresh(); }}>Continue without</Button>
            </>}
            {a.live && <Button size="sm" variant="outline" className="h-6 text-[10px] border-border" onClick={async () => { await revokeApproval(a.id); refresh(); }}>Revoke</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}